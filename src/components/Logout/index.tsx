import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import customFetch from '@/helpers/fetch.helper';
import { Button, Menu } from 'evergreen-ui';
import { useContext, useEffect } from 'react';

export const Logout = () => {
  const { stopLoading } = useContext(LoadingContext);
  const { setUserInfo } = useContext(UserContext);

  useEffect(() => {
    stopLoading();
  }, []);

  const handleLogout = async () => {
    try {
      const fch = customFetch();
      const { data }: any = await fch.get('/api/auth/logout');
      setUserInfo(data, data);
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
