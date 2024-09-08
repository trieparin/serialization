import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { DIALOG_ACTION, IFormDialog, IFormMessage } from '@/models/form.model';
import { Dialog, toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useContext } from 'react';

interface ConfirmDialogProps extends IFormDialog {
  update: () => void;
  reset: () => void;
}

export const ConfirmDialog = ({
  update,
  reset,
  action,
  open,
  path,
  message,
  confirm,
  change,
  redirect,
}: ConfirmDialogProps) => {
  const router = useRouter();
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);

  const handleAction = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      if (action === DIALOG_ACTION.CREATE) {
        const { message }: IFormMessage = await fch.post(path, change!);
        toaster.success(message);
      } else if (action === DIALOG_ACTION.UPDATE) {
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
    stopLoading();
  };

  return (
    <Dialog
      isShown={open}
      hasClose={false}
      title="Confirmation"
      intent={confirm ? 'success' : 'danger'}
      confirmLabel={confirm ? 'Confirm' : 'Delete'}
      isConfirmLoading={loading}
      onConfirm={(close) => handleAction(close)}
      onCloseComplete={reset}
    >
      {message}
    </Dialog>
  );
};
