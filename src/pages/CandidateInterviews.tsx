
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import InterviewCard, { Interview } from '@/components/ui/interview/InterviewCard';
import { toast } from '@/hooks/use-sonner';
import { Calendar, User } from 'lucide-react';

const CandidateInterviews = () => {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If not logged in, redirect to login page
    if (!isAuthLoading && !user) {
      navigate('/login');
      return;
    }
    
    const fetchInterviews = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get interviews where the current user is the candidate
        const { data, error } = await supabase
          .from('interviews')
          .select(`
            id,
            title,
            description,
            date,
            duration,
            type,
            status,
            meeting_link,
            notes,
            profiles!interviews_interviewer_id_fkey(id, full_name)
          `)
          .eq('candidate_id', user.id)
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        // Transform data to match our Interview interface
        const formattedInterviews: Interview[] = (data || []).map(interview => ({
          id: interview.id,
          candidateId: user.id,
          candidateName: profile?.full_name || 'Unknown',
          position: profile?.position || '',
          date: new Date(interview.date),
          duration: interview.duration,
          status: interview.status as Interview['status'],
          interviewers: interview.profiles ? [interview.profiles.full_name] : [],
          type: interview.type as Interview['type'],
          feedbackSubmitted: false, // We could check this with another query in a real app
          notes: interview.notes
        }));
        
        setInterviews(formattedInterviews);
      } catch (error: any) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviews();
  }, [user, profile, isAuthLoading, navigate]);
  
  // Split interviews into upcoming and past
  const now = new Date();
  const upcomingInterviews = interviews.filter(interview => new Date(interview.date) > now);
  const pastInterviews = interviews.filter(interview => new Date(interview.date) <= now);
  
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">My Interviews</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingInterviews.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastInterviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {upcomingInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingInterviews.map(interview => (
                    <InterviewCard key={interview.id} interview={interview} showNotesPreview={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Upcoming Interviews</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You don't have any interviews scheduled. When an administrator schedules an interview with you, it will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-6">
              {pastInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastInterviews.map(interview => (
                    <InterviewCard key={interview.id} interview={interview} showNotesPreview={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Past Interviews</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You haven't participated in any interviews yet. Past interviews will be displayed here after they occur.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default CandidateInterviews;
