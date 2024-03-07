import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { Button, Menu, toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';

export const Logout = () => {
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
