import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'waiter' | 'kitchen' | 'manager' | null;

interface User {
  name: string;
  role: UserRole;
  employeeId: string;
  avatar?: string;
  roles?: UserRole[];
}

interface AuthContextType {
  user: User | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, User> = {
  '1111': { name: 'Muhammad Mustafa', role: 'waiter', employeeId: 'EMP-0772' },
  '2222': { name: 'Ahmad Khan', role: 'kitchen', employeeId: 'EMP-0885' },
  '3333': { name: 'Sarah Ahmed', role: 'manager', employeeId: 'EMP-0654' },
  '4444': { name: 'Ibad Ali', role: null, employeeId: 'EMP-0923', roles: ['waiter', 'manager'] },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (pin: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers[pin];
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const selectRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, selectRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
