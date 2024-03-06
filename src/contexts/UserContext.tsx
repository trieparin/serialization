import customFetch from '@/helpers/fetch.helper';
import { IUser } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { ReactNode, createContext, useMemo, useState } from 'react';

export const UserContext = createContext<UserContextType>(null!);

interface UserContextType {
  profile: IUser;
  checkLogin: (status: boolean) => void;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [profile, setProfile] = useState<IUser>({});

  const checkLogin = async (status: boolean) => {
    if (status) {
      const fch = customFetch();
      const res: any = await fch.get('/auth/check');
      if (res.message) {
        toaster.danger(res.message);
        router.reload();
      } else {
        const { uid, email, displayName, firstName, lastName, role } = res;
        setProfile({
          uid,
          email,
          displayName,
          firstName,
          lastName,
          role,
        });
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
