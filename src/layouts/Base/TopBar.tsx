import { Logout } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import {
  Avatar,
  CaretDownIcon,
  Menu,
  Pane,
  Popover,
  Position,
  TextDropdownButton,
  majorScale,
  minorScale,
} from 'evergreen-ui';
import Link from 'next/link';
import { useContext, useMemo } from 'react';

export const TopBar = () => {
  const { profile, checkLogin } = useContext(UserContext);

  useMemo(() => {
    if (!profile.uid) checkLogin();
  }, [profile.uid, checkLogin]);

  return (
    <Pane background="dark">
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        paddingY={majorScale(1)}
        className="container"
      >
        <Avatar name={profile.displayName} size={minorScale(5)} />
        <Popover
          position={Position.BOTTOM_RIGHT}
          content={
            <Menu>
              <Menu.Group>
                <Link href={`/user/info/${profile.uid}`}>
                  <Menu.Item>Edit Info</Menu.Item>
                </Link>
              </Menu.Group>
              <Menu.Divider />
              <Menu.Group>
                <Logout />
              </Menu.Group>
            </Menu>
          }
        >
          <TextDropdownButton
            size="small"
            color="white"
            icon={<CaretDownIcon fill="white" />}
            marginLeft={minorScale(1)}
          >
            {profile.displayName}
          </TextDropdownButton>
        </Popover>
      </Pane>
    </Pane>
  );
};
