import { UserContext } from '@/contexts/UserContext';
import customFetch from '@/helpers/fetch.helper';
import { Button, Menu, toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useContext } from 'react';

export const Logout = () => {
  const router = useRouter();
  const { checkLogin } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const fch = customFetch();
      await fch.get('/auth');
      const date = new Date();
      document.cookie = `token=; path=/; expires=${date.toUTCString()};`;
      checkLogin(false);
      router.replace('/');
    } catch (error) {
      toaster.danger('An Error Occurred');
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
