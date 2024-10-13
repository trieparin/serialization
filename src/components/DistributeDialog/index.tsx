import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { connectWallet } from '@/helpers/wallet.helpers';
import { IDistributeInfo, ROLE } from '@/models/distribute.model';
import { IFormAction, IFormDialog, IFormMessage } from '@/models/form.model';
import { SERIALIZE_STATUS } from '@/models/serialize.model';
import Traceability from '@/Traceability.json';
import { Contract, ContractFactory, hashMessage } from 'ethers';
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
    const { accounts } = await connectWallet();
    const factory = new ContractFactory(
      Traceability.abi,
      Traceability.data.bytecode,
      accounts[0]
    );
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
        hashMessage(JSON.stringify(productData)),
        hashMessage(JSON.stringify(serializeData)),
        hashMessage(JSON.stringify(serializeData.serials)),
      ]);
      const { manufacturer } = productData;
      const contract = await factory.deploy(
        productHash,
        serializeHash,
        catalogHash
      );
      const address = await contract.getAddress();
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
      console.log({
        contract: address,
      });
      contract.waitForDeployment();
      const distribute = {
        label: serializeData.label,
        contract: address,
        product: change?.product,
        serialize: change?.serial,
        catalogs: { [accounts[0].address]: [] },
        info: {
          sender: {
            address: accounts[0].address,
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
        hashMessage(
          JSON.stringify(
            (distributeData?.catalogs as Record<string, string[]>)[
              accounts[0].address
            ]
          )
        ),
        hashMessage(
          JSON.stringify((distributeData?.distributes as IDistributeInfo[])[0])
        ),
      ]);
      const distribution = new Contract(address, Traceability.abi, accounts[0]);
      const shipment = await distribution.shipmentRequest(
        productHash,
        serializeHash,
        catalogHash,
        updateHash,
        state.address,
        ROLE.DISTRIBUTOR
      );
      // TODO Update contract distribute
      console.log({
        catalog: {
          data: (distributeData?.catalogs as Record<string, string[]>)[
            accounts[0].address
          ],
          hash: updateHash,
        },
        distribute: {
          data: (distributeData?.distributes as IDistributeInfo[])[0],
          hash: distributeHash,
        },
      });
      console.log(shipment);
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
      <Text
        display="inline-block"
        marginBottom={majorScale(1)}
      >
        {message}
      </Text>
      <Pane
        is="fieldset"
        border="none"
        disabled={loading}
      >
        <TextInputField
          label="Receiver Address"
          type="text"
          id="address"
          required
          defaultValue={state.address}
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
          defaultValue={state.company}
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
