import { getCookie, setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { IUser } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { ReactNode, createContext, useMemo, useState } from 'react';

export const UserContext = createContext<UserContextType>(null!);

interface UserContextType {
  profile: IUser;
  checkLogin: () => void;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<IUser>({});

  const userProfile = useMemo(() => {
    const checkLogin = async () => {
      if (getCookie('token')) {
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
          setCookie('token', '');
          toaster.danger('Invalid email or password');
        }
      } else {
        setProfile({});
      }
    };
    return {
      profile,
      checkLogin,
    };
  }, [profile]);

  return (
    <UserContext.Provider value={userProfile}>{children}</UserContext.Provider>
  );
};
