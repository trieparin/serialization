import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { IDistributeInfo, ROLE } from '@/models/distribute.model';
import { IFormAction, IFormDialog, IFormMessage } from '@/models/form.model';
import { SERIALIZE_STATUS } from '@/models/serialize.model';
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
  reset: () => void;
}

export const DistributeDialog = ({
  reset,
  open,
  path,
  message,
  change,
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
      const [{ data: productData }, { data: serializeData }] =
        await Promise.all([
          await fch.get(`/products/${change?.product}`),
          await fch.get(`/serials/${change?.serial}`),
        ]);
      const [productHash, serializeHash, catalogHash] = await Promise.all([
        ethers.hashMessage(JSON.stringify(productData)),
        ethers.hashMessage(JSON.stringify(serializeData)),
        ethers.hashMessage(JSON.stringify(serializeData.serials)),
      ]);
      const { manufacturer } = productData;
      // TODO Deploy smart contract
      console.log({
        product: {
          data: productData,
          hash: productHash,
        },
        serialize: {
          data: serializeData,
          hash: serializeHash,
        },
        catalog: {
          data: serializeData.serials,
          hash: catalogHash,
        },
      });
      const distribute = {
        label: serializeData.label,
        contract: '0x123',
        product: change?.product,
        serialize: change?.serial,
        info: {
          sender: {
            address: '0x456',
            company: manufacturer,
            role: ROLE.MANUFACTURER,
          },
          receiver: { ...state, role: ROLE.DISTRIBUTOR },
          shipment: serializeData.serials,
        },
      };
      const { message, data }: IFormMessage = await fch.post(path, distribute);
      const { data: distributeData }: IFormMessage = await fch.get(
        `/distributes/${data?.id}`
      );
      const [updateHash, distributeHash] = await Promise.all([
        ethers.hashMessage(
          JSON.stringify(
            (distributeData?.catalogs as Record<string, string[]>)['0x456']
          )
        ),
        ethers.hashMessage(
          JSON.stringify((distributeData?.distributes as IDistributeInfo[])[0])
        ),
      ]);
      // TODO Update contract distribute
      console.log({
        catalog: {
          data: (distributeData?.catalogs as Record<string, string[]>)['0x456'],
          hash: updateHash,
        },
        distribute: {
          data: (distributeData?.distributes as IDistributeInfo[])[0],
          hash: distributeHash,
        },
      });
      toaster.success(message);
      close();
      dispatch({ type: 'RESET', payload: '' });
      router.push('/distribute');
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
      isConfirmDisabled={!state.address || !state.company}
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
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
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
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
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
