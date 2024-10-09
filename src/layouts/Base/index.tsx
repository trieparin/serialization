import { UserContext } from '@/contexts/UserContext';
import { Pane } from 'evergreen-ui';
import { ReactNode, useContext } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { TopBar } from './TopBar';

export const BaseLayout = ({ children }: { children?: ReactNode }) => {
  const profile = useContext(UserContext);
  return (
    <Pane
      is="main"
      display="flex"
      flexFlow="column"
      minHeight="100vh"
    >
      <TopBar profile={profile} />
      <Header profile={profile} />
      <Pane
        is="section"
        className="container"
      >
        {children}
      </Pane>
      <Footer />
    </Pane>
  );
};
