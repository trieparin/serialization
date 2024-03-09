import { Logo, NavLink } from '@/components';
import { IUser, Role } from '@/models/user.model';
import { Pane, Text, majorScale } from 'evergreen-ui';

export const Header = ({ profile }: { profile: IUser }) => {
  return (
    <Pane
      is="header"
      elevation={1}
      background="tint2"
      position="sticky"
      top={0}
      zIndex={1}
    >
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingY={majorScale(1)}
        className="container"
      >
        <Logo />
        <Pane
          is="nav"
          display="flex"
          alignItems="center"
          columnGap={majorScale(2)}
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
