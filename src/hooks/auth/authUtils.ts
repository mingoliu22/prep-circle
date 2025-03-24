
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";

// Fetch user profile from Supabase
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log("Fetching profile for user ID:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    if (!data) {
      console.log("No profile found for user ID:", userId);
      return null;
    }
    
    console.log("Profile fetched successfully:", data);
    return data as Profile;
  } catch (error) {
    console.error("Error in fetchProfile:", error);
    return null;
  }
};

// Upload resume to Supabase Storage
export const uploadResumeToStorage = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `resumes/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('user_files')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error("Resume upload error:", uploadError);
      return null;
    }
    
    const { data } = await supabase.storage
      .from('user_files')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadResumeToStorage:", error);
    return null;
  }
};
