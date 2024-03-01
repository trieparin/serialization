import { auth } from '@/firebase/config';
import { getUser } from '@/firebase/users';
import { IsEmptyObject } from '@/helpers/validate.helper';
import { IUser } from '@/models/user.model';
import { User, onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useMemo, useState } from 'react';

export const UserInfoContext = createContext<IUser>({});

export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  const [loginUser, setLoginUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState({});

  useMemo(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoginUser(user);
      } else {
        setLoginUser(null);
      }
    });

    const setInfo = async () => {
      if (loginUser && IsEmptyObject(userInfo)) {
        const data = await getUser(loginUser.uid);
        if (data) {
          setUserInfo({
            uid: loginUser.uid,
            email: loginUser.email,
            displayName: loginUser.displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          });
        }
      } else {
        setUserInfo({});
      }
    };

    setInfo();
  }, [loginUser]);

  return (
    <UserInfoContext.Provider value={userInfo}>
      {children}
    </UserInfoContext.Provider>
  );
};
