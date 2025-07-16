"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
  </div>
);

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok)
          throw new Error("Failed to fetch tasks. Check backend & CORS.");
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (err) {
        if (err instanceof Error) {
          toast.error("Failed to load tasks", { description: err.message });
        } else {
          toast.error("An unknown error occurred while fetching tasks.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [API_BASE_URL]);

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.warning("Task title cannot be empty.");
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title: newTitle,
      description: newDescription,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDescription("");

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      if (!response.ok) throw new Error("Failed to add task.");

      const createdTask: Task = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((t) => (t.id === tempId ? createdTask : t))
      );

      toast.success("Task added successfully!");
    } catch (err) {
      setTasks((currentTasks) => currentTasks.filter((t) => t.id !== tempId));
      if (err instanceof Error) {
        toast.error("Failed to add task", { description: err.message });
      } else {
        toast.error("An unknown error occurred while adding the task.");
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const originalTasks = tasks;
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) throw new Error("Server failed to update task.");

      toast.success(`Task "${task.title}" updated!`);
    } catch (err) {
      setTasks(originalTasks);
      if (err instanceof Error) {
        toast.error("Failed to update task", { description: err.message });
      } else {
        toast.error("An unknown error occurred while updating the task.");
      }
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    const originalTasks = tasks;
    setTasks(tasks.filter((t) => t.id !== taskToDelete));
    setIsDeleteDialogOpen(false);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Server failed to delete task.");

      toast.success("Task deleted successfully.");
    } catch (err) {
      setTasks(originalTasks);
      if (err instanceof Error) {
        toast.error("Failed to delete task", { description: err.message });
      } else {
        toast.error("An unknown error occurred while deleting the task.");
      }
    } finally {
      setTaskToDelete(null);
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Task Board</h1>
          <p className="text-muted-foreground mt-2">
            Organize your work and life, finally.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add a New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="space-y-4">
              <Input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task Title (e.g., Finish project report)"
                required
              />
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={2}
              />
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Tasks</h2>
          {isLoading ? (
            <Spinner />
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all ${
                  task.completed ? "bg-muted/50" : ""
                }`}
              >
                <CardContent className="p-4 flex items-start space-x-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="mt-1"
                  />
                  <div className="flex-grow grid gap-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                      <p
                        className={`text-sm text-muted-foreground ${
                          task.completed ? "line-through" : ""
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(task.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  You have no tasks yet. Add one above!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
