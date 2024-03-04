import { Role } from '@/models/user.model';
import { User } from 'firebase/auth';
import { ReactNode, createContext, useMemo, useState } from 'react';

interface UserContextType {
  user: User | null;
  role: Role | null;
  setUserInfo: (user: User | null, role: Role | null) => void;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const setUserInfo = (user: User | null, role: Role | null) => {
    setUser(user);
    setRole(role);
  };

  const userInfo = useMemo(() => ({ user, role, setUserInfo }), [user, role]);

  return (
    <UserContext.Provider value={userInfo}>{children}</UserContext.Provider>
  );
};
