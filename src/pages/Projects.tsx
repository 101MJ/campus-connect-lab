
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, List, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const projectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  deadline: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
    },
  });

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProject = async (values: ProjectFormValues) => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
          created_by: user.id,
        })
        .select();
      
      if (error) throw error;
      
      setProjects([...(data || []), ...projects]);
      toast.success('Project created successfully');
      form.reset();
      setProjectDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const onSubmitTask = async (values: any) => {
    if (!user || !selectedProject) return;
    
    setIsCreatingTask(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: values.title,
          description: values.description || null,
          deadline: values.deadline || null,
          notes: values.notes || null,
          project_id: selectedProject,
          created_by: user.id,
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Task created successfully');
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      setProjects(projects.filter(project => project.project_id !== projectId));
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
      
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId === selectedProject ? null : projectId);
  };

  const getProjectById = (projectId: string) => {
    return projects.find(project => project.project_id === projectId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Projects</h1>
          
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-collabCorner-purple">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add the details for your new project
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProject)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Project name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Project details"
                            className="resize-none min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects List - Left Column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Your Projects</h2>
            
            {isLoading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <Card 
                    key={project.project_id} 
                    className={`cursor-pointer transition-all hover:border-collabCorner-purple 
                              ${selectedProject === project.project_id ? 'border-collabCorner-purple shadow-md' : ''}`}
                    onClick={() => handleProjectClick(project.project_id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-2 pt-0 flex justify-between">
                      <CardDescription className="text-xs">
                        {formatDate(project.deadline)}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.project_id);
                        }}
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No projects yet. Click "New Project" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Project Details & Tasks - Right Column */}
          <div className="lg:col-span-3">
            {selectedProject ? (
              <>
                <div className="mb-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{getProjectById(selectedProject)?.title}</CardTitle>
                          <CardDescription>
                            Created {format(new Date(getProjectById(selectedProject)?.created_at), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                        
                        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="mr-2 h-4 w-4" /> Add Task
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                              <DialogTitle>Create New Task</DialogTitle>
                              <DialogDescription>
                                Add details for your new task
                              </DialogDescription>
                            </DialogHeader>
                            
                            <TaskForm 
                              projectId={selectedProject}
                              onSubmit={onSubmitTask}
                              isSubmitting={isCreatingTask}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {getProjectById(selectedProject)?.description || 'No description provided'}
                      </p>
                      {getProjectById(selectedProject)?.deadline && (
                        <div className="mt-4 text-sm">
                          <span className="font-medium">Deadline: </span>
                          <span className="text-muted-foreground">
                            {formatDate(getProjectById(selectedProject)?.deadline)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Tabs defaultValue="tasks">
                    <TabsList className="mb-4">
                      <TabsTrigger value="tasks">
                        <List className="h-4 w-4 mr-2" />
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Completed
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="tasks">
                      <TaskList projectId={selectedProject} />
                    </TabsContent>
                    <TabsContent value="completed">
                      <p className="text-center py-4 text-muted-foreground">
                        Completed tasks will be shown here
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <p className="text-muted-foreground">
                    Select a project to see details and manage tasks
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
