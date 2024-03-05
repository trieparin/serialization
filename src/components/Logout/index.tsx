import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { Button, Menu } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

export const Logout = () => {
  const router = useRouter();
  const { stopLoading } = useContext(LoadingContext);

  useEffect(() => {
    stopLoading();
  }, []);

  const handleLogout = async () => {
    try {
      const fch = customFetch();
      await fch.get('/api/auth/logout');
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
