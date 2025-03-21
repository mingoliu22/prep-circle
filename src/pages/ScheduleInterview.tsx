import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Calendar, Clock, User, MessageSquare } from 'lucide-react';

const ScheduleInterview = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate') || '';
  
  const [candidates, setCandidates] = useState<Array<{ id: string; full_name: string; position: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('technical');
  const [selectedCandidate, setSelectedCandidate] = useState<string>(candidateId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState(''); // Added notes field
  
  // Fetch candidates with role 'candidate' when component mounts
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, position')
          .eq('role', 'candidate');
          
        if (error) throw error;
        
        setCandidates(data || []);
        
        // If a candidate ID was provided, select that candidate
        if (candidateId) {
          setSelectedCandidate(candidateId);
        }
      } catch (error: any) {
        console.error('Error fetching candidates:', error);
        toast.error('Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCandidates();
  }, [candidateId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can schedule interviews');
      return;
    }
    
    if (!title || !selectedCandidate || !date || !time || !type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Combine date and time
    const interviewDateTime = new Date(`${date}T${time}`);
    
    // Validate date is in the future
    if (interviewDateTime < new Date()) {
      toast.error('Interview date must be in the future');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create interview in Supabase
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          title,
          description,
          candidate_id: selectedCandidate,
          interviewer_id: user?.id,
          date: interviewDateTime.toISOString(),
          duration: parseInt(duration),
          type,
          status: 'scheduled',
          meeting_link: meetingLink,
          notes: notes // Add notes to the database
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      toast.success('Interview scheduled successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      toast.error(error.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect if not admin
  if (!isLoading && !isAdmin) {
    toast.error('Only administrators can schedule interviews');
    navigate('/dashboard');
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Schedule New Interview</h1>
        </div>
        
        <Card className="max-w-3xl mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Interview Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Technical Interview Round 1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="candidate">Candidate</Label>
                    <Select 
                      value={selectedCandidate} 
                      onValueChange={setSelectedCandidate}
                      disabled={isLoading || candidates.length === 0}
                      required
                    >
                      <SelectTrigger id="candidate">
                        <SelectValue placeholder="Select a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.full_name} {candidate.position ? `(${candidate.position})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Interview Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="cultural-fit">Cultural Fit</SelectItem>
                        <SelectItem value="initial">Initial Screening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link (optional)</Label>
                  <Input
                    id="meetingLink"
                    placeholder="e.g., https://zoom.us/j/123456789"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the interview..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Notes for Candidate
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes for the candidate..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    These notes will be visible to the candidate
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ScheduleInterview;
