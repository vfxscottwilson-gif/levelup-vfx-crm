import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../utils/initialData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string) => boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  createUser: (name: string, email: string, role: 'admin' | 'employee') => { success: boolean; error?: string };
  updateUser: (user: Partial<User> & { id: string }) => void;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  resetPassword: (userId: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('teamlog_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedId = localStorage.getItem('teamlog_current_user_id');
    return savedId || 'user-admin'; // Default to Admin Portal
  });

  useEffect(() => {
    localStorage.setItem('teamlog_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('teamlog_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId && u.isActive) || users[0] || null;

  const login = (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.isActive);
    if (found) {
      setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId && u.isActive);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const logout = () => {
    // For demo/team portal convenience, allow logging out to a clean login screen
    setCurrentUserId('');
  };

  const createUser = (name: string, email: string, role: 'admin' | 'employee') => {
    const trimmedEmail = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      role,
      isActive: true,
      forcedPasswordChange: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = (updatedFields: Partial<User> & { id: string }) => {
    setUsers(prev =>
      prev.map(u => (u.id === updatedFields.id ? { ...u, ...updatedFields } : u))
    );
  };

  const deleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    // Prevent removing the last admin
    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin account.' };
      }
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      const fallback = users.find(u => u.id !== userId && u.isActive);
      if (fallback) setCurrentUserId(fallback.id);
    }
    return { success: true };
  };

  const resetPassword = (userId: string) => {
    const tempPassword = `VFX-${Math.random().toString(36).slice(-6).toUpperCase()}!`;
    updateUser({ id: userId, forcedPasswordChange: true });
    return tempPassword;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        switchUser,
        logout,
        createUser,
        updateUser,
        deleteUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
