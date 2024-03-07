import customFetch from '@/helpers/fetch.helper';
import { ValidateCookie } from '@/helpers/validate.helper';
import { IUser } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { LoadingContext } from './LoadingContext';

export const UserContext = createContext<UserContextType>(null!);

interface UserContextType {
  profile: IUser;
  checkLogin: () => void;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { stopLoading } = useContext(LoadingContext);
  const [profile, setProfile] = useState<IUser>({});

  const checkLogin = async () => {
    const token = ValidateCookie('token');
    if (token && !profile.uid) {
      try {
        const fch = customFetch();
        const res: any = await fch.get('/auth/check');
        const { uid, email, displayName, firstName, lastName, role } = res;
        setProfile({
          uid,
          email,
          displayName,
          firstName,
          lastName,
          role,
        });
      } catch (error) {
        const date = new Date();
        document.cookie = `token=; path=/; expires=${date.toUTCString()};`;
        toaster.danger('User has been deleted');
        stopLoading();
      }
    } else {
      setProfile({});
    }
  };

  const userInfo = useMemo(() => {
    return {
      profile,
      checkLogin,
    };
  }, [profile]);

  return (
    <UserContext.Provider value={userInfo}>{children}</UserContext.Provider>
  );
};
