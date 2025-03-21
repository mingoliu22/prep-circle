
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

interface QuestionFormProps {
  question: Question | null;
  onSuccess: () => void;
}

const QuestionForm = ({ question, onSuccess }: QuestionFormProps) => {
  const { user } = useAuth();

  // Form definition
  const form = useForm({
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      category_id: question?.category_id || "",
      difficulty: question?.difficulty || "",
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["questionCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_categories")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Failed to load categories");
        throw error;
      }

      return data as Category[];
    },
  });

  // Create or update question mutation
  const saveQuestion = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      if (question) {
        // Update existing question
        const { error } = await supabase
          .from("questions")
          .update(values)
          .eq("id", question.id);

        if (error) throw error;
        return { ...question, ...values };
      } else {
        // Create new question
        const { data, error } = await supabase
          .from("questions")
          .insert({ ...values, created_by: user?.id })
          .select();

        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      toast.success(
        question ? "Question updated successfully" : "Question created successfully"
      );
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    },
  });

  const onSubmit = (values: Record<string, any>) => {
    saveQuestion.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a concise title for the question"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the full question text"
                  className="min-h-[120px]"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saveQuestion.isPending}>
            {saveQuestion.isPending ? "Saving..." : question ? "Update Question" : "Create Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;
