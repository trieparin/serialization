import { Button, Pane, minorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';

export const SaveCancel = () => {
  const router = useRouter();

  return (
    <Pane
      display="flex"
      alignItems="center"
      justifyContent="center"
      columnGap={minorScale(3)}
    >
      <Button size="large" onClick={() => router.back()}>
        Cancel
      </Button>
      <Button type="submit" appearance="primary" size="large">
        Save
      </Button>
    </Pane>
  );
};
