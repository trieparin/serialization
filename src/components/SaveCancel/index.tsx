import { Button, Pane, minorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';

export const SaveCancel = ({ loading }: { loading: boolean }) => {
  const router = useRouter();

  return (
    <Pane
      display="flex"
      alignItems="center"
      justifyContent="center"
      columnGap={minorScale(3)}
    >
      <Button type="reset" size="large" onClick={() => router.back()}>
        Cancel
      </Button>
      <Button
        type="submit"
        appearance="primary"
        size="large"
        isLoading={loading}
      >
        Save
      </Button>
    </Pane>
  );
};
