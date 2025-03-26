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
      candidate_id: user.id, // Assuming the current user is the candidate
      questions: selectedQuestions,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };

    // Function to insert the interview data into the database
    const insertInterview = async () => {
      const { data, error } = await supabase
        .from('interviews')
        .insert([interviewData]);

      if (error) {
        throw error;
      }

      return data;
    };

    // Use useMutation to handle the asynchronous operation
    insertInterviewMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Interview scheduled successfully!");
        navigate("/dashboard"); // Redirect to the dashboard after successful scheduling
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to schedule interview.");
      },
    });
  };

  // useMutation hook for handling the interview scheduling
  const insertInterviewMutation = useMutation(insertInterview);

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

            <InterviewQuestionSelector onQuestionsSelected={setSelectedQuestions} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSubmit} disabled={insertInterviewMutation.isLoading}>
              {insertInterviewMutation.isLoading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ScheduleInterview;
