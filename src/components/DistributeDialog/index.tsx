import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { ROLE } from '@/models/distribute.model';
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
    startLoading();
    try {
      // Get raw product and serial data
      const fch = customFetch();
      await fch.patch(`/serials/${change?.serial}`, {
        status: SERIALIZE_STATUS.DISTRIBUTED,
      });
      const [{ data: productData }, { data: serializeData }] =
        await Promise.all([
          await fch.get(`/products/${change?.product}`),
          await fch.get(`/serials/${change?.serial}`),
        ]);
      const { manufacturer } = productData;

      // Connect to wallet eg. MetaMask
      const provider = await connectWallet();
      let signer;
      if (checkWallet()) {
        signer = await provider.getSigner();
      } else {
        const idx = parseInt(prompt('Signer account?')!);
        signer = await provider.getSigner(idx);
      }

      // Create and deploy smart contract
      const factory = new ContractFactory(
        Traceability.abi,
        Traceability.data.bytecode,
        signer
      );
      const [productHash, serializeHash, catalogHash] = await Promise.all([
        hashMessage(JSON.stringify(productData)),
        hashMessage(JSON.stringify(serializeData)),
        hashMessage(JSON.stringify(serializeData.serials)),
      ]);
      const contract = await factory.deploy(
        productHash,
        serializeHash,
        catalogHash
      );
      const address = await contract.getAddress();
      contract.waitForDeployment();

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
        contract: address,
      });

      // Hash and update data in smart contract
      const updateHash = hashMessage(JSON.stringify([]));
      const distribution = new Contract(address, Traceability.abi, signer);
      const transaction = await distribution.shipmentRequest(
        productHash,
        serializeHash,
        catalogHash,
        updateHash,
        state.address,
        ROLE.DISTRIBUTOR
      );

      console.log({
        catalog: {
          data: [],
          hash: updateHash,
        },
        transaction,
      });

      // Update distribute data in database
      const distribute = {
        label: serializeData.label,
        contract: address,
        product: change?.product,
        serialize: change?.serial,
        catalogs: { [signer.address]: [] },
        info: {
          sender: {
            address: signer.address,
            company: manufacturer,
            role: ROLE.MANUFACTURER,
          },
          receiver: { ...state, role: ROLE.DISTRIBUTOR },
          shipment: serializeData.serials,
        },
      };
      const { message }: IFormMessage = await fch.post(path, distribute);
      close();
      toaster.success(message);
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
