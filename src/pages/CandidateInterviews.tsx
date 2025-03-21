
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, FileText } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Interview {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  slots: {
    id: string;
    start_time: string;
    end_time: string;
    location: string | null;
    meeting_link: string | null;
  }[];
  questions: {
    id: string;
    question: {
      id: string;
      title: string;
      content: string;
      difficulty: string | null;
      category: {
        name: string;
      } | null;
    };
  }[];
}

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate } = useAuth();
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  
  // Redirect if not authenticated or not a candidate
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!isCandidate) {
      navigate("/dashboard");
      toast.error("This page is only for candidates");
    }
  }, [isAuthenticated, isCandidate, navigate]);

  // Fetch interviews
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["candidateInterviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("interview_participants")
        .select(`
          interview:interview_id(
            id, 
            title, 
            description, 
            status, 
            created_at,
            slots:interview_slots(id, start_time, end_time, location, meeting_link),
            questions:interview_questions(
              id,
              question:question_id(
                id, 
                title, 
                content, 
                difficulty, 
                category:category_id(name)
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .eq("role", "candidate");

      if (error) {
        toast.error("Failed to load interviews");
        throw error;
      }

      return data.map(item => item.interview) as Interview[];
    },
    enabled: !!user,
  });

  const getInterviewStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">My Interviews</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading your interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">You don't have any interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <Card key={interview.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{interview.title}</CardTitle>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${getInterviewStatusColor(interview.status)}`}
                    >
                      {interview.status}
                    </span>
                  </div>
                  <CardDescription>
                    {formatDate(interview.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {interview.description && (
                    <p className="text-sm text-gray-600 mb-4">{interview.description}</p>
                  )}
                  
                  {interview.slots.length > 0 && (
                    <div className="space-y-2">
                      {interview.slots.map((slot) => (
                        <div key={slot.id} className="flex items-start space-x-2 text-sm">
                          <div className="flex-shrink-0 mt-0.5">
                            <Calendar className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div>{formatDate(slot.start_time)}</div>
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                            {slot.location && (
                              <div className="text-gray-500 mt-1">Location: {slot.location}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <div className="w-full flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{interview.questions.length}</span> questions
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Questions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedInterview?.title}</DialogTitle>
                          <DialogDescription>
                            Review the questions for this interview
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto py-4">
                          {selectedInterview?.questions.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                              No questions have been added to this interview yet.
                            </p>
                          ) : (
                            <div className="space-y-6">
                              {selectedInterview?.questions.map((item, index) => (
                                <div key={item.id} className="space-y-2">
                                  <h3 className="text-lg font-medium flex items-start">
                                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                      {index + 1}
                                    </span>
                                    {item.question.title}
                                  </h3>
                                  <div className="ml-8">
                                    <p className="text-gray-700">{item.question.content}</p>
                                    <div className="flex mt-2 space-x-2">
                                      {item.question.category && (
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                          {item.question.category.name}
                                        </span>
                                      )}
                                      {item.question.difficulty && (
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                          {item.question.difficulty.charAt(0).toUpperCase() + 
                                            item.question.difficulty.slice(1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {index < (selectedInterview?.questions.length || 0) - 1 && (
                                    <Separator className="mt-4" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CandidateInterviews;
