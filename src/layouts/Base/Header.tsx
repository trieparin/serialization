import { Logo, NavLink } from '@/components';
import { IUser, ROLE } from '@/models/user.model';
import { Pane, Text, majorScale } from 'evergreen-ui';

export const Header = ({ profile }: { profile: IUser }) => {
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
        paddingY={majorScale(1)}
        className="container"
      >
        <Logo />
        <Pane
          is="nav"
          display="flex"
          alignItems="center"
          columnGap={majorScale(1)}
        >
          {profile.role === ROLE.ADMIN ? (
            <>
              <NavLink href="/inventory">Inventory</NavLink>
              <Text color="muted">|</Text>
              <NavLink href="/user">User</NavLink>
            </>
          ) : (
            <>
              <NavLink href="/product">Product</NavLink>
              <Text color="muted">|</Text>
              <NavLink href="/serialize">Serialize</NavLink>
              <Text color="muted">|</Text>
              <NavLink href="/distribute">Distribute</NavLink>
              {profile.role === ROLE.SUPERVISOR && (
                <>
                  <Text color="muted">|</Text>
                  <NavLink href="/summary">Summary</NavLink>
                </>
              )}
            </>
          )}
        </Pane>
      </Pane>
    </Pane>
  );
};
