import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { Loader2, ChevronsUpDown, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { User } from "@/lib/types/user";
import { Project } from "@/lib/types/project";
import { useInfiniteProjects } from "@/lib/hooks/use-projects";
import { useCreateAdmin, useUpdateAdmin } from "@/lib/hooks/use-admins";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "SUB_ADMIN"]),
  projectIds: z.array(z.string()),
});

const updateSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["SUPER_ADMIN", "SUB_ADMIN"]),
  projectIds: z.array(z.string()),
  password: z.string().optional().or(z.literal("")),
});

type FormValues = {
  email: string;
  password?: string;
  role: "SUPER_ADMIN" | "SUB_ADMIN";
  projectIds: string[];
};

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const isEditing = !!user;

  const [search, setSearch] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  
  const { 
    data: projectsData, 
    isLoading: projectsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProjects(10, debouncedSearch);
  const projects = projectsData?.pages.flatMap((page) => page?.items || []) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "SUB_ADMIN",
      projectIds: [],
    },
  });

  const role = useWatch({ control: form.control, name: "role" }) || "SUB_ADMIN";

  useEffect(() => {
    if (user && open) {
      form.reset({
        email: user.email,
        password: "",
        role: (user.role as "SUPER_ADMIN" | "SUB_ADMIN") || "SUB_ADMIN",
        projectIds: user.projectIds || [],
      });
    } else if (!open) {
      form.reset({
        email: "",
        password: "",
        role: "SUB_ADMIN",
        projectIds: [],
      });
    }
  }, [user, open, form]);

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin(user?.id || "");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      email: values.email,
      password: values.password || undefined,
      role: values.role,
      projectIds: values.role === "SUPER_ADMIN" ? [] : values.projectIds,
    };

    if (isEditing) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Sub-admin updated successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Failed to update sub-admin.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Sub-admin created successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Failed to create sub-admin.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Admin" : "Add Admin"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the admin details." : "Create a new admin account."}
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
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <div className="flex flex-row items-center space-x-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-4">
                  <Checkbox
                    id="is-super-admin"
                    checked={field.value === "SUPER_ADMIN"}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? "SUPER_ADMIN" : "SUB_ADMIN");
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="is-super-admin" className="cursor-pointer font-normal">
                      Make this user a Super Admin?
                    </Label>
                  </div>
                </div>
              )}
            />
          </div>

          {role !== "SUPER_ADMIN" && (
            <div className="space-y-2">
              <Label>Project Assignments</Label>
              <Controller
                control={form.control}
                name="projectIds"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between font-normal")} role="combobox" aria-expanded={comboboxOpen}>
                        {field.value?.length > 0
                          ? `${field.value.length} project(s) selected`
                          : "Select projects..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-[375px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search projects..."
                            value={search}
                            onValueChange={setSearch}
                          />
                          <CommandList
                            onScroll={(e) => {
                              const target = e.target as HTMLDivElement;
                              if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
                                if (hasNextPage && !isFetchingNextPage) {
                                  fetchNextPage();
                                }
                              }
                            }}
                          >
                            <CommandEmpty>
                              {projectsLoading ? "Searching..." : "No projects found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {projects.map((project: Project) => {
                                const isSelected = field.value?.includes(project.id);
                                return (
                                  <CommandItem
                                    key={project.id}
                                    value={project.id}
                                    onSelect={() => {
                                      if (isSelected) {
                                        field.onChange(
                                          field.value?.filter((val) => val !== project.id)
                                        );
                                      } else {
                                        field.onChange([...(field.value || []), project.id]);
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {project.name}
                                  </CommandItem>
                                );
                              })}
                              {isFetchingNextPage && (
                                <div className="p-4 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                </div>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((id) => {
                          const project = projects.find((p: Project) => p.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                              {project ? project.name : id}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full ml-1 hover:bg-transparent"
                                onClick={(e) => {
                                  e.preventDefault();
                                  field.onChange(field.value.filter((val) => val !== id));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              />
              {form.formState.errors.projectIds && (
                <p className="text-sm text-red-500">{form.formState.errors.projectIds.message}</p>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
