import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { DialogAction, IFormDialog, IFormMessage } from '@/models/form.model';
import {
  Dialog,
  majorScale,
  Pane,
  Text,
  TextInputField,
  toaster,
} from 'evergreen-ui';
import { useRouter } from 'next/router';
import { FocusEvent, useContext, useState } from 'react';

interface DistributeDialogProps extends IFormDialog {
  update: () => void;
  reset: () => void;
}

export const DistributeDialog = ({
  update,
  reset,
  action,
  open,
  path,
  message,
  change,
  redirect,
}: DistributeDialogProps) => {
  const router = useRouter();
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const [receiver, setReceiver] = useState('');

  const handleAction = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      if (action === DialogAction.CREATE) {
        const { message }: IFormMessage = await fch.post(path, change!);
        toaster.success(message);
      } else if (action === DialogAction.UPDATE) {
        const { message }: IFormMessage = await fch.patch(path, change!);
        toaster.success(message);
      } else {
        const { message }: IFormMessage = await fch.del(path);
        toaster.success(message);
      }
      update();
      close();
      redirect && router.push(redirect);
    } catch (e) {
      toaster.danger('An error occurred');
    }
    setReceiver('');
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
      isConfirmDisabled={!receiver}
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
          id="receiver"
          required
          value={receiver}
          onChange={(e: FocusEvent<HTMLInputElement>) => {
            setReceiver(e.currentTarget.value.trim());
          }}
        />
      </Pane>
    </Dialog>
  );
};
