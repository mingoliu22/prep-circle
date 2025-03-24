
// This file is kept for backward compatibility
// It re-exports everything from the new module structure
import useAuth, { useAuth as useAuthHook } from './auth/useAuth';
import { AuthProvider } from './auth/AuthProvider';

export { AuthProvider, useAuthHook as useAuth };
export default useAuth;
