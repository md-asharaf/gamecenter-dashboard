"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api/axios";
import { User, RegisterAdminRequest, UpdateAdminRequest } from "@/lib/types/user";
import { Project } from "@/lib/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";

const baseSchema = z.object({
  email: z.string().email("Valid email is required"),
  projectIds: z.array(z.string()).default([]),
});

const createSchema = baseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateSchema = baseSchema.extend({
  password: z.string().optional().or(z.literal("")),
});

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const isEditing = !!user;
  const queryClient = useQueryClient();

  const { data: projectData } = useQuery<{ data: Project[] }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data;
    },
    enabled: open,
  });

  const projects = projectData?.data || [];

  const form = useForm<z.infer<typeof createSchema> | z.infer<typeof updateSchema>>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      projectIds: [],
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        email: user.email,
        password: "",
        projectIds: user.projectIds || [],
      });
    } else if (!open) {
      form.reset({
        email: "",
        password: "",
        projectIds: [],
      });
    }
  }, [user, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (isEditing) {
        const payload: UpdateAdminRequest = {
          email: values.email,
          projectIds: values.projectIds,
        };
        if (values.password) {
          payload.password = values.password;
        }
        const res = await api.put(`/admins/${user.id}`, payload);
        return res.data;
      } else {
        const payload: RegisterAdminRequest = {
          email: values.email,
          password: values.password,
          projectIds: values.projectIds,
        };
        const res = await api.post("/admins", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isEditing ? "Admin updated successfully" : "Admin created successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(isEditing ? "Failed to update admin" : "Failed to create admin", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Sub-Admin" : "Add Sub-Admin"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the admin details." : "Create a new sub-admin account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing && <span className="text-muted-foreground text-xs font-normal">(Leave blank to keep current)</span>}
            </Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Project Assignments</Label>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4">
              <ScrollArea className="h-40">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects available.</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <Controller
                        key={project.id}
                        control={form.control}
                        name="projectIds"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(project.id);
                          return (
                            <div className="flex flex-row items-start space-x-3">
                              <Checkbox
                                id={project.id}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), project.id]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter((value: string) => value !== project.id)
                                    );
                                  }
                                }}
                              />
                              <div className="space-y-1 leading-none">
                                <Label htmlFor={project.id} className="cursor-pointer font-normal">
                                  {project.name}
                                </Label>
                              </div>
                            </div>
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            {form.formState.errors.projectIds && (
              <p className="text-sm text-red-500">{form.formState.errors.projectIds.message as string}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
