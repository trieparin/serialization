import { auth } from '@/firebase/config';
import { getUser } from '@/firebase/users';
import { Role } from '@/models/user.model';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useMemo, useState } from 'react';

interface UserContextType {
  auth: Auth;
  user: User | null;
  role: Role | null;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const userInfo = useMemo(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const data = await getUser(user.uid);
        if (data) setRole(data.role);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return {
      auth,
      user,
      role,
    };
  }, [user, role]);

  return (
    <UserContext.Provider value={userInfo}>{children}</UserContext.Provider>
  );
};
