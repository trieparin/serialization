import { ILayout } from '@/models/layout.model';
import { Pane } from 'evergreen-ui';

export const BlankLayout = ({ children }: ILayout) => {
  return (
    <main>
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        {children}
      </Pane>
    </main>
  );
};
