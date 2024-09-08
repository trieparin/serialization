import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { ROLE } from '@/models/distribute.model';
import { IFormAction, IFormDialog, IFormMessage } from '@/models/form.model';
import { IProduct } from '@/models/product.model';
import { ISerialize, SERIALIZE_STATUS } from '@/models/serialize.model';
import { ethers } from 'ethers';
import {
  Dialog,
  majorScale,
  Pane,
  Text,
  TextInputField,
  toaster,
} from 'evergreen-ui';
import { useRouter } from 'next/router';
import { FocusEvent, useContext, useReducer } from 'react';

interface DistributeDialogProps extends IFormDialog {
  update: () => void;
  reset: () => void;
}

export const DistributeDialog = ({
  update,
  reset,
  open,
  path,
  message,
  change,
  redirect,
}: DistributeDialogProps) => {
  const router = useRouter();
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const formReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'SET_ADDRESS':
        return {
          ...state,
          address: payload,
        };
      case 'SET_COMPANY':
        return {
          ...state,
          company: payload,
        };
      case 'RESET':
        return {
          address: '',
          company: '',
        };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(formReducer, {});

  const handleAction = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      await fch.patch(`/serials/${change?.serial}`, {
        status: SERIALIZE_STATUS.DISTRIBUTED,
      });
      const [productData, serializeData] = await Promise.all([
        (await fch.get(`/products/${change?.product}`)) as IProduct,
        (await fch.get(`/serials/${change?.serial}`)) as ISerialize,
      ]);
      const [productHash, serializeHash] = await Promise.all([
        ethers.hashMessage(JSON.stringify(productData)),
        ethers.hashMessage(JSON.stringify(serializeData)),
      ]);
      const { manufacturer } = productData;
      // TODO Deploy smart contract
      console.log({ productHash, serializeHash });
      const distribute = {
        contract: '',
        product: change?.product,
        serialize: change?.serial,
        info: {
          sender: {
            address: '',
            company: manufacturer,
            role: ROLE.MANUFACTURER,
          },
          receiver: { ...state, role: ROLE.DISTRIBUTOR },
          shipment: serializeData.serials,
        },
      };
      const { message, data }: IFormMessage = await fch.post(path, distribute);
      // TODO Update contract distribute
      console.log(data);
      toaster.success(message);
      update();
      close();
      dispatch({ type: 'RESET', payload: '' });
      redirect && router.push(redirect);
    } catch (e) {
      toaster.danger('An error occurred');
    }
    stopLoading();
  };

  return (
    <Dialog
      isShown={open}
      hasClose={false}
      title="Confirmation"
      intent="success"
      confirmLabel="Confirm"
      isConfirmLoading={loading}
      isConfirmDisabled={!state.address && !state.company}
      onConfirm={(close) => handleAction(close)}
      onCloseComplete={reset}
    >
      <Text display="inline-block" marginBottom={majorScale(1)}>
        {message}
      </Text>
      <Pane is="fieldset" border="none" disabled={loading}>
        <TextInputField
          label="Receiver Address"
          type="text"
          id="address"
          required
          value={state.address}
          onChange={(event: FocusEvent<HTMLInputElement>) => {
            dispatch({
              type: 'SET_ADDRESS',
              payload: event.currentTarget.value.trim(),
            });
          }}
        />
        <TextInputField
          label="Receiver Company"
          type="text"
          id="company"
          required
          value={state.company}
          onChange={(event: FocusEvent<HTMLInputElement>) => {
            dispatch({
              type: 'SET_COMPANY',
              payload: event.currentTarget.value.trim(),
            });
          }}
        />
      </Pane>
    </Dialog>
  );
};
