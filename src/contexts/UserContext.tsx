import customFetch from '@/helpers/fetch.helper';
import { IUser } from '@/models/user.model';
import { ReactNode, createContext, useMemo, useState } from 'react';

export const UserContext = createContext<UserContextType>(null!);

interface UserContextType {
  profile: IUser;
  checkLogin: (status: boolean) => void;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<IUser>({});

  const checkLogin = async (status: boolean) => {
    if (status) {
      const fch = customFetch();
      const { uid, displayName, role }: any = await fch.get('/auth/check');
      setProfile({
        uid: uid,
        displayName: displayName,
        role: role,
      });
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
