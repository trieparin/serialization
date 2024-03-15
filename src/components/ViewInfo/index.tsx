import { Pane } from 'evergreen-ui';

export const ViewInfo = ({ info }: { info: Record<string, string | []> }) => {
  console.log(info);
  return <Pane></Pane>;
};
