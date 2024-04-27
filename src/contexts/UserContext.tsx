import { auth } from '@/firebase/config';
import { IUserContext, Role } from '@/models/user.model';
import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useEffect, useState } from 'react';

export const UserContext = createContext<IUserContext>({});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<IUserContext>({});

  useEffect(() => {
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
        setProfile({});
      }
    });
  }, []);

  return (
    <UserContext.Provider value={profile}>{children}</UserContext.Provider>
  );
};
