import { ILayout } from '@/models/Layout.model';
import { Pane } from 'evergreen-ui';
import { Footer } from './Footer';
import { Header } from './Header';
import { TopBar } from './TopBar';

export const BaseLayout = ({ children }: ILayout) => {
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
