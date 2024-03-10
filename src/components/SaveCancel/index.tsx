import { Button, Pane, majorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';

interface SaveCancelProps {
  disabled: boolean;
  loading: boolean;
}

export const SaveCancel = ({ disabled, loading }: SaveCancelProps) => {
  const router = useRouter();
  return (
    <Pane
      display="flex"
      alignItems="center"
      justifyContent="center"
      columnGap={majorScale(2)}
    >
      <Button name="reset" type="reset" onClick={() => router.back()}>
        Cancel
      </Button>
      <Button
        appearance="primary"
        name="submit"
        type="submit"
        disabled={disabled}
        isLoading={loading}
      >
        Save
      </Button>
    </Pane>
  );
};
