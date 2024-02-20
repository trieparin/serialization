import { CombineLink as Link, Logo } from '@/components';
import { Pane } from 'evergreen-ui';

export const Header = () => {
  return (
    <Pane is="header" elevation={1} background="tint1">
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className="container"
      >
        <Logo />
        <nav>
          <Link href="/batch">Batch</Link>
          <Link href="/serial">Serial</Link>
          <Link href="/user">User</Link>
        </nav>
      </Pane>
    </Pane>
  );
};
