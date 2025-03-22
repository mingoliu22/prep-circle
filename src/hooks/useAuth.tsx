import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-sonner';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

// Define the types for profiles to match our database schema
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  // Adding fields that were missing in the error
  phone?: string | null; 
  position?: string | null;
  resume_url?: string | null;
}

interface AuthContextType {
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

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log("Profile data:", data);
      return data as Profile; // Cast to our Profile type
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };
  
  // Check if the user is already logged in on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setIsLoading(true);
        
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          
          const profileData = await fetchProfile(currentSession.user.id);
          if (profileData) {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Initial session check
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        setUser(initialSession.user);
        setSession(initialSession);
        
        const profileData = await fetchProfile(initialSession.user.id);
        if (profileData) {
          setProfile(profileData);
        }
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        if (profileData) {
          setProfile(profileData);
        }
        
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function - only for candidates
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function - update to match the interface return type
  const logout = async (): Promise<void> => {
    try {
      console.log("Attempting to logout...");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast.success('Logged out successfully');
      navigate('/login');
      console.log("Logout successful, user state cleared");
    } catch (error: any) {
      console.error("Logout failed with error:", error);
      toast.error(error?.message || 'Logout failed');
      throw error;
    }
  };
  
  // Update profile function
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Upload resume function
  const uploadResume = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
        
      // Update user profile with resume URL
      await updateProfile({ resume_url: data.publicUrl });
      
      toast.success('Resume uploaded successfully');
      return data.publicUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resume');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check user roles - explicitly log the role value for debugging
  const isAdmin = profile?.role === 'admin';
  const isCandidate = profile?.role === 'candidate';
  
  console.log("Profile role:", profile?.role);
  console.log("Is admin check:", isAdmin);
  
  const value = {
    user,
    profile,
    session,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    uploadResume,
    isAuthenticated,
    isAdmin,
    isCandidate
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
