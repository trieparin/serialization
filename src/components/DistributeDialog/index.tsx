import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { IFormAction, IFormDialog, IFormMessage } from '@/models/form.model';
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
      const distribute = { ...change, receiver: state };
      const { message, data }: IFormMessage = await fch.post(path, distribute);
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
