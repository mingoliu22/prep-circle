
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-sonner";
import { useAuth } from "@/hooks/useAuth";

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
import MainLayout from "@/components/layout/MainLayout";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import QuestionForm from "@/components/QuestionForm";

// Define types for our data
interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Question {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  difficulty: string | null;
  created_at: string;
  created_by: string | null;
  category?: Category;
}

const QuestionBank = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Redirect if not authenticated or not an admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/dashboard");
      toast.error("Only administrators can access the question bank");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`*, category:category_id(id, name, description)`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
        throw error;
      }

      return data as Question[];
    },
  });

  // Delete question mutation
  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    },
  });

  // Filter questions based on search term
  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format difficulty for display
  const formatDifficulty = (difficulty: string | null) => {
    if (!difficulty) return "N/A";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // Handle the edit button click
  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsAddingQuestion(true);
  };

  // Handle the delete button click
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteQuestion.mutate(id);
    }
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <Sheet open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
            <SheetTrigger asChild>
              <Button onClick={() => setSelectedQuestion(null)}>
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>
                  {selectedQuestion ? "Edit Question" : "Add New Question"}
                </SheetTitle>
                <SheetDescription>
                  Fill in the details below to {selectedQuestion ? "update the" : "create a new"} question.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Separator className="my-4" />
                <QuestionForm
                  question={selectedQuestion}
                  onSuccess={() => {
                    setIsAddingQuestion(false);
                    queryClient.invalidateQueries({ queryKey: ["questions"] });
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading questions...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm
              ? "No questions match your search criteria."
              : "No questions found. Add your first question!"}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell>{question.category?.name || "Uncategorized"}</TableCell>
                    <TableCell>{formatDifficulty(question.difficulty)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default QuestionBank;
