import { CommonApiCall, fastapi_backend_url } from '@/commonFunctions';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id?: string;
  email: string;
  username?: string;
  password: string;
  user_cost?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  me: ({ }) => Promise<User>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await me()
      setIsLoading(false);
    })()
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser: User = { email, password };
    const response = await CommonApiCall({ url: fastapi_backend_url + "/login", type: "post", payload: mockUser, publicPage: true })
    await me()
    return response;
  };

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser: User = {
      email,
      username,
      password,
    };

    const response = await CommonApiCall({ url: fastapi_backend_url + "/register", type: "post", payload: mockUser })
    await me()
    return response;
  };

  const me = async (): Promise<User> => {
    const response = await CommonApiCall({ url: fastapi_backend_url + "/get/user", type: "get" })
    setUser(response?.data)
    return response?.data;
  };

  const logout = async () => {
    const response = await CommonApiCall({ url: fastapi_backend_url + "/logout", type: "get" })
    setUser(null);
    return response?.success;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, me }}>
      {children}
    </AuthContext.Provider>
  );
};
