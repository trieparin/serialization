import { auth } from '@/firebase/config';
import { getUser } from '@/firebase/users';
import { IUser } from '@/models/user.model';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { ReactNode, createContext, useEffect, useState } from 'react';

export const UserInfoContext = createContext<IUser>({});

export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getUser(user.uid);
        if (data) {
          setUserInfo({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          });
        }
      } else {
        setUserInfo({});
      }
    });
  }, []);
  return (
    <UserInfoContext.Provider value={userInfo}>
      {children}
    </UserInfoContext.Provider>
  );
};
