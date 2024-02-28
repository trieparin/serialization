import { Pane } from 'evergreen-ui';
import { ReactNode } from 'react';

export const BlankLayout = ({ children }: { children?: ReactNode }) => {
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
