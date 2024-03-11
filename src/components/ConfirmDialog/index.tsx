import customFetch from '@/helpers/fetch.helper';
import { IFormMessage } from '@/models/form.model';
import { Dialog, toaster } from 'evergreen-ui';

interface ConfirmDialogProps {
  open: boolean;
  approve: boolean;
  loading: boolean;
  message: string;
  path: string;
  update: () => void;
  reset: () => void;
  status?: string;
}

export const ConfirmDialog = ({
  open,
  approve,
  loading,
  message,
  path,
  update,
  reset,
  status,
}: ConfirmDialogProps) => {
  const handleApprove = async (close: () => void) => {
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.patch(path, {
        status,
      });
      toaster.success(message);
      update();
    } catch (error) {
      toaster.danger('An error occurred');
    }
    close();
  };

  const handleDelete = async (close: () => void) => {
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.del(path);
      toaster.success(message);
      update();
    } catch (error) {
      toaster.danger('An error occurred');
    }
    close();
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
