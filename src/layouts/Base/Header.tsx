import { Logo, NavLink } from '@/components';
import { Pane, Text, minorScale } from 'evergreen-ui';

export const Header = () => {
  return (
    <Pane
      is="header"
      elevation={1}
      background="tint1"
      position="sticky"
      top={0}
      zIndex={1}
    >
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingY={minorScale(3)}
        className="container"
      >
        <Logo />
        <Pane
          is="nav"
          display="flex"
          alignItems="center"
          columnGap={minorScale(3)}
        >
          <NavLink href="/product">All Products</NavLink>
          <Text color="muted">|</Text>
          <NavLink href="/serial">All Serials</NavLink>
          <Text color="muted">|</Text>
          <NavLink href="/user">Manage Users</NavLink>
        </Pane>
      </Pane>
    </Pane>
  );
};
