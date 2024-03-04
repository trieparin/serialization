import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { Button, Menu } from 'evergreen-ui';
import { signOut } from 'firebase/auth';
import { useContext, useEffect } from 'react';

export const Logout = () => {
  const { stopLoading } = useContext(LoadingContext);
  const { auth } = useContext(UserContext);

  useEffect(() => {
    stopLoading();
  }, []);

  return (
    <Button
      appearance="minimal"
      width="100%"
      justifyContent="flex-start"
      paddingX={0}
      onClick={() => signOut(auth)}
    >
      <Menu.Item>Logout</Menu.Item>
    </Button>
  );
};
