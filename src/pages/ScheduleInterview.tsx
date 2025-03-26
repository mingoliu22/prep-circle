
// Import necessary components and hooks
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth"; // Direct import from the source

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import InterviewQuestionSelector from "@/components/InterviewQuestionSelector";

// Define the ScheduleInterview component
const ScheduleInterview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables for form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error("You must be logged in to schedule an interview.");
      return;
    }

    // Validate form inputs
    if (!title || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Prepare the interview data to be inserted into the database
    const interviewData = {
      title: title,
      description: description,
      user_id: user.id, // Changed from candidate_id to user_id to match database schema
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };

    // Call the mutation to insert the interview
    insertInterviewMutation.mutate();
  };

  // Function to insert the interview data into the database
  const insertInterview = async () => {
    if (!user) throw new Error("User not authenticated");

    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        title: title,
        description: description,
        user_id: user.id,
        status: 'scheduled',
      });

    if (interviewError) {
      console.error("Error creating interview:", interviewError);
      throw interviewError;
    }

    // Get the newly created interview ID
    const { data: newInterviews, error: fetchError } = await supabase
      .from('interviews')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching new interview:", fetchError);
      throw fetchError;
    }

    if (!newInterviews || newInterviews.length === 0) {
      throw new Error("Failed to retrieve the created interview");
    }

    const interviewId = newInterviews[0].id;

    // Add selected questions to the interview
    if (selectedQuestions.length > 0) {
      const questionInserts = selectedQuestions.map(questionId => ({
        interview_id: interviewId,
        question_id: questionId
      }));

      const { error: questionsError } = await supabase
        .from('interview_questions')
        .insert(questionInserts);

      if (questionsError) {
        console.error("Error adding questions to interview:", questionsError);
        throw questionsError;
      }
    }

    return interviewId;
  };

  // useMutation hook for handling the interview scheduling
  const insertInterviewMutation = useMutation({
    mutationFn: insertInterview,
    onSuccess: (interviewId) => {
      toast.success("Interview scheduled successfully!");
      navigate("/dashboard"); // Redirect to the dashboard after successful scheduling
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to schedule interview.");
    },
  });

  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Schedule New Interview</CardTitle>
            <CardDescription>
              Fill out the form below to schedule a new interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Interview Title</Label>
              <Input
                id="title"
                placeholder="Technical Interview"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Interview Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the interview details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Separator className="my-4" />

            {/* Pass the interviewId prop conditionally */}
            <InterviewQuestionSelector 
              interviewId=""  // Initially empty, questions will be added after interview creation
              onQuestionsSelected={setSelectedQuestions}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={insertInterviewMutation.isPending}>
              {insertInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ScheduleInterview;
