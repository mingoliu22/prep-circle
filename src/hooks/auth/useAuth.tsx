
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log("useAuth hook called, isAdmin:", context.isAdmin, "profile:", context.profile);
  return context;
};

export default useAuth;
