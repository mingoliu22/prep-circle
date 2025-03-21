
import React, { useState } from "react";
import { Check, Search, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface Question {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
  } | null;
  difficulty: string | null;
  isAssigned?: boolean;
}

interface InterviewQuestionSelectorProps {
  interviewId: string;
}

const InterviewQuestionSelector = ({ interviewId }: InterviewQuestionSelectorProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all questions
  const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`*, category:category_id(id, name)`)
        .order("title");

      if (error) {
        toast.error("Failed to load questions");
        throw error;
      }

      return data as Question[];
    },
    enabled: isOpen,
  });

  // Fetch questions assigned to this interview
  const { data: assignedQuestions = [], isLoading: isLoadingAssigned } = useQuery({
    queryKey: ["interviewQuestions", interviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_questions")
        .select(`
          question_id,
          question:question_id(id, title, content, category:category_id(id, name), difficulty)
        `)
        .eq("interview_id", interviewId);

      if (error) {
        toast.error("Failed to load assigned questions");
        throw error;
      }

      return data.map((item) => ({
        ...item.question,
        isAssigned: true,
      })) as Question[];
    },
  });

  // Combine questions and mark assigned ones
  const questions = React.useMemo(() => {
    if (!allQuestions.length) return [];
    
    const assignedIds = new Set(assignedQuestions.map(q => q.id));
    
    return allQuestions.map(question => ({
      ...question,
      isAssigned: assignedIds.has(question.id)
    }));
  }, [allQuestions, assignedQuestions]);

  // Filter questions based on search term
  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add question to interview mutation
  const assignQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("interview_questions")
        .insert({
          interview_id: interviewId,
          question_id: questionId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewQuestions", interviewId] });
      toast.success("Question added to interview");
    },
    onError: (error) => {
      console.error("Error assigning question:", error);
      toast.error("Failed to add question to interview");
    },
  });

  // Remove question from interview mutation
  const removeQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("interview_questions")
        .delete()
        .eq("interview_id", interviewId)
        .eq("question_id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewQuestions", interviewId] });
      toast.success("Question removed from interview");
    },
    onError: (error) => {
      console.error("Error removing question:", error);
      toast.error("Failed to remove question from interview");
    },
  });

  // Format difficulty for display
  const formatDifficulty = (difficulty: string | null) => {
    if (!difficulty) return "N/A";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // Toggle question assignment
  const toggleQuestionAssignment = (question: Question) => {
    if (question.isAssigned) {
      removeQuestion.mutate(question.id);
    } else {
      assignQuestion.mutate(question.id);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Manage Questions
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Add Questions to Interview</SheetTitle>
            <SheetDescription>
              Select questions to include in this interview. Click a question to add or remove it.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Separator className="my-4" />
            
            {isLoadingQuestions || isLoadingAssigned ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                No questions match your search criteria.
              </div>
            ) : (
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow 
                        key={question.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => toggleQuestionAssignment(question)}
                      >
                        <TableCell className="font-medium">{question.title}</TableCell>
                        <TableCell>{question.category?.name || "Uncategorized"}</TableCell>
                        <TableCell>{formatDifficulty(question.difficulty)}</TableCell>
                        <TableCell>
                          <Button
                            variant={question.isAssigned ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                          >
                            {question.isAssigned && <Check className="mr-2 h-4 w-4" />}
                            {question.isAssigned ? "Added" : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Interview Questions</h3>
        {isLoadingAssigned ? (
          <div className="text-center py-8">Loading assigned questions...</div>
        ) : assignedQuestions.length === 0 ? (
          <div className="text-gray-500 italic">No questions assigned to this interview yet.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell>{question.category?.name || "Uncategorized"}</TableCell>
                    <TableCell>{formatDifficulty(question.difficulty)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion.mutate(question.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default InterviewQuestionSelector;
