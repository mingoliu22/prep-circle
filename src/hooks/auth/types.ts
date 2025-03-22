
import { Session, User } from '@supabase/supabase-js';

// Define the types for profiles to match our database schema
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  phone?: string | null; 
  position?: string | null;
  resume_url?: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadResume: (file: File) => Promise<string | null>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCandidate: boolean;
}
