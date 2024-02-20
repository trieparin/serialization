import { ILayout } from '@/models/Layout.model';
import { Pane } from 'evergreen-ui';
import { Footer } from './Footer';
import { Header } from './Header';

export const BaseLayout = ({ children }: ILayout) => {
  return (
    <>
      <Header />
      <Pane is="main" className="container">
        {children}
      </Pane>
      <Footer />
    </>
  );
};
