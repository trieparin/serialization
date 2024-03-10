import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { IUser } from '@/models/user.model';
import {
  Avatar,
  Button,
  Menu,
  Pane,
  Popover,
  Position,
  Text,
  TextDropdownButton,
  majorScale,
  minorScale,
  toaster,
} from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const TopBar = ({ profile }: { profile: IUser }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const fch = customFetch();
      await fch.get('/auth');
      setCookie('token', '');
      router.push('/');
    } catch (error) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <Pane background="dark">
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingY={majorScale(1)}
        className="container"
      >
        <Text color="white" size={300} textTransform="uppercase">
          DPU | WE 670 Project
        </Text>
        <Pane display="flex" alignItems="center">
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
                  <Button
                    appearance="minimal"
                    type="button"
                    name="logout"
                    textAlign="left"
                    display="block"
                    width="100%"
                    paddingX={0}
                    border={0}
                    borderRadius={0}
                    onClick={handleLogout}
                  >
                    <Menu.Item>Logout</Menu.Item>
                  </Button>
                </Menu.Group>
              </Menu>
            }
          >
            <TextDropdownButton
              color="white"
              size="small"
              marginLeft={minorScale(1)}
              className="user-menu"
            >
              {profile.displayName}
            </TextDropdownButton>
          </Popover>
        </Pane>
      </Pane>
    </Pane>
  );
};
