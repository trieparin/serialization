import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { IFormMessage } from '@/models/form.model';
import { Dialog, toaster } from 'evergreen-ui';
import { useContext } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  approve: boolean;
  message: string;
  path: string;
  update: () => void;
  reset: () => void;
  status?: string;
}

export const ConfirmDialog = ({
  open,
  approve,
  message,
  path,
  update,
  reset,
  status,
}: ConfirmDialogProps) => {
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const handleApprove = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.patch(path, {
        status,
      });
      toaster.success(message);
      update();
    } catch (e) {
      toaster.danger('An error occurred');
    }
    close();
    stopLoading();
  };

  const handleDelete = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.del(path);
      toaster.success(message);
      update();
    } catch (e) {
      toaster.danger('An error occurred');
    }
    close();
    stopLoading();
  };

  return (
    <Dialog
      isShown={open}
      hasClose={false}
      title="Confirmation"
      intent={approve ? 'success' : 'danger'}
      confirmLabel={approve ? 'Approve' : 'Delete'}
      isConfirmLoading={loading}
      onConfirm={(close) => {
        approve ? handleApprove(close) : handleDelete(close);
      }}
      onCloseComplete={reset}
    >
      {message}
    </Dialog>
  );
};
