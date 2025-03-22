
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";

// Fetch user profile data
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
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
    return data as Profile;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

// Upload resume to Supabase storage
export const uploadResumeToStorage = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
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
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    return null;
  }
};
