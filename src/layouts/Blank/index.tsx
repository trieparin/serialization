import { ILayout } from '@/models/Layout.model';
import { Pane } from 'evergreen-ui';

export const BlankLayout = ({ children }: ILayout) => {
  return (
    <Pane
      is="main"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background="dark"
      minHeight="100vh"
    >
      {children}
    </Pane>
  );
};
