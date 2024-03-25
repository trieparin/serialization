import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { DialogAction, IFormDialog, IFormMessage } from '@/models/form.model';
import { Dialog, toaster } from 'evergreen-ui';
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
  approve,
  change,
}: ConfirmDialogProps) => {
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
      stopLoading();
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <Dialog
      isShown={open}
      hasClose={false}
      title="Confirmation"
      intent={approve ? 'success' : 'danger'}
      confirmLabel={approve ? 'Approve' : 'Delete'}
      isConfirmLoading={loading}
      onConfirm={(close) => handleAction(close)}
      onCloseComplete={reset}
    >
      {message}
    </Dialog>
  );
};
