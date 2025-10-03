import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  permissions?: string[];
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage for existing user session
      const storedUser = localStorage.getItem('auth_user');
      const storedSession = localStorage.getItem('auth_session');
      
      if (storedUser && storedSession) {
        const session = JSON.parse(storedSession);
        
        // Check if session is expired
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_session');
          toast.error('Session expired. Please sign in again.');
        } else {
          const user = JSON.parse(storedUser);
          setUser(user);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Try Supabase authentication first
      try {
        // This would be the actual Supabase auth call
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        // if (error) throw error;
        
        // For now, we'll use enhanced mock authentication with better user profiles
        const demoUsers = [
          { 
            email: 'admin@demo.school', 
            password: 'admin123', 
            name: 'System Administrator', 
            role: 'admin', 
            id: '1',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            department: 'Administration',
            permissions: ['all']
          },
          { 
            email: 'principal@demo.school', 
            password: 'principal123', 
            name: 'Dr. Sarah Johnson', 
            role: 'principal', 
            id: '2',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=principal',
            department: 'Administration',
            permissions: ['academic', 'staff', 'students', 'reports']
          },
          { 
            email: 'teacher@demo.school', 
            password: 'teacher123', 
            name: 'Prof. Michael Davis', 
            role: 'teacher', 
            id: '3',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
            department: 'Science',
            permissions: ['students', 'attendance', 'grades']
          },
          { 
            email: 'student@demo.school', 
            password: 'student123', 
            name: 'Aarav Sharma', 
            role: 'student', 
            id: '4',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
            department: 'Class 10A',
            permissions: ['profile', 'grades', 'library']
          },
          { 
            email: 'accountant@demo.school', 
            password: 'account123', 
            name: 'Mr. Robert Brown', 
            role: 'accountant', 
            id: '5',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=accountant',
            department: 'Finance',
            permissions: ['fees', 'accounts', 'reports']
          },
        ];

        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        
        if (demoUser) {
          const userData = {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            avatar: demoUser.avatar,
            department: demoUser.department,
            permissions: demoUser.permissions,
            lastLogin: new Date().toISOString(),
          };
          
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          localStorage.setItem('auth_session', JSON.stringify({ 
            token: 'demo_token_' + Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          }));
          
          toast.success(`Welcome back, ${userData.name}!`);
        } else {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
      } catch (authError: any) {
        // If Supabase auth fails, fallback to demo auth
        throw new Error(authError.message || 'Authentication failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'student') => {
    try {
      setLoading(true);
      await api.signup({ email, password, name, role });
      toast.success('Account created successfully. Please sign in.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
      // Clear any cached data
      sessionStorage.clear();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};