import { getCookie, setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { IUser } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { ReactNode, createContext, useMemo, useState } from 'react';

interface UserContextType {
  profile: IUser;
  checkLogin: () => void;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<IUser>({ uid: '' });

  const userProfile = useMemo(() => {
    const checkLogin = async () => {
      try {
        const fch = customFetch();
        const res: IUser = await fch.get('/auth/check');
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
        setCookie('token', '');
        toaster.danger('Invalid email or password');
      }
    };

    const token = getCookie('token');
    if (token && !profile.uid) checkLogin();

    return {
      profile,
      checkLogin,
    };
  }, [profile]);

  return (
    <UserContext.Provider value={userProfile}>{children}</UserContext.Provider>
  );
};
