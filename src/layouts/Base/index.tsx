import { Pane } from 'evergreen-ui';
import { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { TopBar } from './TopBar';

export const BaseLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <Pane is="main" display="flex" flexDirection="column" minHeight="100vh">
      <TopBar />
      <Header />
      <Pane is="section" className="container">
        {children}
      </Pane>
      <Footer />
    </Pane>
  );
};
