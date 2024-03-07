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
import { useContext, useEffect } from 'react';

export const TopBar = () => {
  const { profile, checkLogin } = useContext(UserContext);

  useEffect(() => {
    if (!profile.uid) checkLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.uid]);

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
