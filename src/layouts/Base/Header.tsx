import { Logo, NavLink } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { Role } from '@/models/user.model';
import { Pane, Text, minorScale } from 'evergreen-ui';
import { useContext } from 'react';

export const Header = () => {
  const { profile } = useContext(UserContext);
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
          {profile.role === Role.ADMIN ? (
            <NavLink href="/user">Users</NavLink>
          ) : (
            <>
              <NavLink href="/product">Products</NavLink>
              <Text color="muted">|</Text>
              <NavLink href="/serial">Serials</NavLink>
            </>
          )}
        </Pane>
      </Pane>
    </Pane>
  );
};
