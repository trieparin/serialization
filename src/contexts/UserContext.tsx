import { auth } from '@/firebase/config';
import { IUser, Role } from '@/models/user.model';
import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useMemo, useState } from 'react';

export const UserContext = createContext<IUser>({ uid: '' });

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<IUser>({ uid: '' });

  useMemo(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const result = await user.getIdTokenResult();
        setProfile({
          uid: user.uid,
          displayName: user.displayName!,
          role: result.claims.role as Role,
          token,
        });
      } else {
        setProfile({ uid: '' });
      }
    });
  }, []);

  return (
    <UserContext.Provider value={profile}>{children}</UserContext.Provider>
  );
};
