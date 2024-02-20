import { ILayout } from '@/models/layout.model';
import { Footer } from './Footer';
import { Header } from './Header';

export const BaseLayout = ({ children }: ILayout) => {
  return (
    <>
      <Header></Header>
      <main>{children}</main>
      <Footer></Footer>
    </>
  );
};
