import { UserContext } from '@/contexts/UserContext';
import customFetch from '@/helpers/fetch.helper';
import { Button, Menu } from 'evergreen-ui';
import { useContext } from 'react';

export const Logout = () => {
  const { checkLogin } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const fch = customFetch();
      await fch.get('/auth/logout');
      const date = new Date();
      document.cookie = `token=; path=/; expires=${date.toUTCString()};`;
      checkLogin(false);
    } catch (err) {
      throw err;
    }
  };

  return (
    <Button
      appearance="minimal"
      width="100%"
      justifyContent="flex-start"
      paddingX={0}
      onClick={handleLogout}
    >
      <Menu.Item>Logout</Menu.Item>
    </Button>
  );
};
