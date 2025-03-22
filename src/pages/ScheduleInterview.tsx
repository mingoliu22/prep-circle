import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import InterviewQuestionSelector from "@/components/InterviewQuestionSelector";

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Redirect if not authenticated or not an admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!isAdmin) {
      navigate("/dashboard");
      toast.error("Only administrators can schedule interviews");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Create interview mutation
  const createInterview = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          title,
          description,
          user_id: user?.id,
          status: "scheduled"
        })
        .select();

      if (error) {
        console.error("Error creating interview:", error);
        throw error;
      }
      return data[0];
    },
    onSuccess: (data) => {
      toast.success("Interview created successfully");
      setInterviewId(data.id);
      setStep(2);
    },
    onError: (error) => {
      console.error("Error creating interview:", error);
      toast.error("Failed to create interview");
    },
  });

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an interview title");
      return;
    }
    createInterview.mutate();
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Schedule New Interview</h1>
        
        <div className="flex mb-8">
          <div className={`flex-1 border-b-2 pb-2 ${step >= 1 ? "border-primary" : "border-gray-200"}`}>
            <span className={`font-medium ${step >= 1 ? "text-primary" : "text-gray-500"}`}>
              1. Basic Information
            </span>
          </div>
          <div className={`flex-1 border-b-2 pb-2 ${step >= 2 ? "border-primary" : "border-gray-200"}`}>
            <span className={`font-medium ${step >= 2 ? "text-primary" : "text-gray-500"}`}>
              2. Add Questions
            </span>
          </div>
        </div>
        
        {step === 1 && (
          <form onSubmit={handleCreateInterview} className="space-y-4 max-w-xl">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Interview Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Frontend Developer Interview"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this interview"
                rows={4}
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={createInterview.isPending}>
                {createInterview.isPending ? "Creating..." : "Continue to Questions"}
              </Button>
            </div>
          </form>
        )}
        
        {step === 2 && interviewId && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-md">
              <h2 className="font-medium">Interview Details</h2>
              <p className="text-sm mt-1">{title}</p>
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
            </div>
            
            <Separator />
            
            <InterviewQuestionSelector interviewId={interviewId} />
            
            <div className="pt-4">
              <Button onClick={handleFinish}>
                Finish Setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ScheduleInterview;
