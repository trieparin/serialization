import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { DialogAction, IFormDialog, IFormMessage } from '@/models/form.model';
import { Dialog, toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useContext } from 'react';

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
      onConfirm={(close) => handleAction(close)}
      onCloseComplete={reset}
    >
      {message}
    </Dialog>
  );
};
