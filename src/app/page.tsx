
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlusCircle, XIcon, Filter } from 'lucide-react';
import { formatISO, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import AppHeader from '@/components/app-header';
import type { Task, TaskStatus, SortableTaskFields, TaskType } from '@/lib/types';
import { TASK_TYPES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  getTasks as fetchTasksFromFirestore, 
  addTask as addTaskToFirestore, 
  updateTask as updateTaskInFirestore, 
  deleteTask as deleteTaskFromFirestore, 
  updateTaskStatus as updateTaskStatusInFirestore,
  addMultipleTasks // For migration
} from '@/lib/firebase';
import type { Filters, SortConfig } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const REFERENCE_DATE = new Date(2025, 5, 1); // June 1, 2025, to ensure dates are in the future

// Expanded to 15 sample tasks
const sampleTasks: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    date: formatISO(subDays(REFERENCE_DATE, 1), { representation: 'date' }),
    entityName: 'Innovate Corp',
    taskType: 'Meeting',
    time: '10:00',
    contactPerson: 'Alice Wonderland',
    note: 'Discuss Q3 strategy and new product launch. Prepare presentation slides.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 2), { representation: 'date' }),
    entityName: 'Synergy Ltd',
    taskType: 'Call',
    time: '14:30',
    contactPerson: 'Bob The Builder',
    note: 'Follow up on proposal #123. Address any questions.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 3), { representation: 'date' }),
    entityName: 'Momentum Inc',
    taskType: 'Email',
    time: '09:15',
    contactPerson: 'Charlie Brown',
    note: 'Send updated contract draft. CC legal team.',
    status: 'closed',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 0), { representation: 'date' }),
    entityName: 'FutureTech',
    taskType: 'Demo',
    time: '11:00',
    contactPerson: 'Diana Prince',
    note: 'Showcase new AI platform features. Focus on scalability.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 4), { representation: 'date' }),
    entityName: 'Global Solutions',
    taskType: 'Proposal',
    time: '16:00',
    contactPerson: 'Edward Scissorhands',
    note: 'Finalize and send investment proposal. Deadline EOD.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 5), { representation: 'date' }),
    entityName: 'Alpha Omega Group',
    taskType: 'Site Visit',
    time: '13:00',
    contactPerson: 'Fiona Gallagher',
    note: 'Inspect new facility. Check safety compliance.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 6), { representation: 'date' }),
    entityName: 'Beta Test Co.',
    taskType: 'Follow-up',
    time: '10:30',
    contactPerson: 'George Jetson',
    note: 'Check in after last week\'s demo. Gather feedback.',
    status: 'closed',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 7), { representation: 'date' }),
    entityName: 'Creative Designs',
    taskType: 'Contract',
    time: '15:00',
    contactPerson: 'Harley Quinn',
    note: 'Review and sign the new service agreement.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 8), { representation: 'date' }),
    entityName: 'Dynamic Systems',
    taskType: 'Other',
    time: '17:00',
    contactPerson: 'Iris West',
    note: 'Team building activity planning.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 9), { representation: 'date' }),
    entityName: 'Evergreen Capital',
    taskType: 'Meeting',
    time: '09:00',
    contactPerson: 'Jack Sparrow',
    note: 'Annual investor relations meeting. Prepare financial reports.',
    status: 'closed',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 10), { representation: 'date' }),
    entityName: 'Pioneer Solutions',
    taskType: 'Call',
    time: '11:30',
    contactPerson: 'Kara Danvers',
    note: 'Initial contact with potential new client. Introduce services.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 11), { representation: 'date' }),
    entityName: 'Quantum Leap Inc.',
    taskType: 'Email',
    time: '14:00',
    contactPerson: 'Lex Luthor',
    note: 'Send marketing materials and case studies.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 12), { representation: 'date' }),
    entityName: 'Starlight Enterprises',
    taskType: 'Demo',
    time: '16:30',
    contactPerson: 'Maximus Decimus Meridius',
    note: 'Internal demo of the upcoming software update for the sales team.',
    status: 'closed',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 13), { representation: 'date' }),
    entityName: 'Tech Wizards',
    taskType: 'Proposal',
    time: '10:45',
    contactPerson: 'Neo Anderson',
    note: 'Draft proposal for Project Phoenix. Include revised budget.',
    status: 'open',
  },
  {
    date: formatISO(subDays(REFERENCE_DATE, 14), { representation: 'date' }),
    entityName: 'Vertex Innovations',
    taskType: 'Follow-up',
    time: '13:15',
    contactPerson: 'Optimus Prime',
    note: 'Follow up on the service inquiry from last month.',
    status: 'open',
  }
];


const initialFilters: Filters = {
  entityName: '',
  contactPerson: '',
  taskType: 'all',
  status: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  note: '',
};

const initialSortConfig: SortConfig = {
  field: 'date',
  direction: 'desc',
};

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);

  // For migration
  const [hasMigratedToFirestore, setHasMigratedToFirestore] = useState(false);
  const [isTasksEmptyInFirestore, setIsTasksEmptyInFirestore] = useState(false);
  const [isMigrating, setIsMigrating] = useState(true); // Start true to prevent UI flicker

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const migrated = localStorage.getItem('finstack-firestore-migrated') === 'true';
      setHasMigratedToFirestore(migrated);
    }
  }, []);

  const { data: tasks = [], isLoading: isLoadingTasks, isError: isTasksError } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const fetchedTasks = await fetchTasksFromFirestore();
      if (typeof window !== 'undefined' && !hasMigratedToFirestore && fetchedTasks.length === 0) {
        setIsTasksEmptyInFirestore(true);
      } else {
        setIsTasksEmptyInFirestore(false);
      }
       // If migration happened, we might want to ensure isMigrating is false
      if (localStorage.getItem('finstack-firestore-migrated') === 'true') {
        setIsMigrating(false);
      }
      return fetchedTasks;
    },
    onSuccess: (data) => {
      // This check is important to set isMigrating to false once we have data (either fetched or post-migration)
      if (data.length > 0 || localStorage.getItem('finstack-firestore-migrated') === 'true') {
        setIsMigrating(false);
      }
    },
    onError: () => {
        setIsMigrating(false); // Also stop migrating on error
    }
  });
  
  const migrationMutation = useMutation({
    mutationFn: async (tasksToMigrate: Omit<Task, 'id' | 'createdAt'>[]) => {
      setIsMigrating(true);
      await addMultipleTasks(tasksToMigrate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      localStorage.setItem('finstack-firestore-migrated', 'true');
      setHasMigratedToFirestore(true);
      setIsTasksEmptyInFirestore(false); // Firestore is no longer empty
      toast({ title: "Sample Data Migrated", description: "Initial tasks have been added to Firestore." });
      setIsMigrating(false);
    },
    onError: (error) => {
      console.error("Error migrating sample data:", error);
      toast({ title: "Migration Error", description: "Could not migrate sample tasks.", variant: "destructive" });
      setIsMigrating(false);
    },
  });

  useEffect(() => {
    // This effect runs after initial task fetch determines if Firestore is empty
    // and after we know if migration has already happened.
    if (!isLoadingTasks && !hasMigratedToFirestore && isTasksEmptyInFirestore && !migrationMutation.isPending && !isMigrating) {
      console.log("Attempting to migrate sample data...");
      migrationMutation.mutate(sampleTasks);
    } else if (!isLoadingTasks) {
        // If not migrating, and tasks are loaded (or migration already done), set migrating to false
        setIsMigrating(false);
    }
  }, [isLoadingTasks, hasMigratedToFirestore, isTasksEmptyInFirestore, migrationMutation, sampleTasks, isMigrating]);


  const addTaskMutation = useMutation({
    mutationFn: addTaskToFirestore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task Created", description: "A new task has been successfully created." });
      setIsFormOpen(false);
      setEditingTask(undefined);
    },
    onError: (error) => {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "There was an error creating the task.", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }: { id: string; taskData: Partial<Omit<Task, 'id' | 'createdAt'>> }) => 
      updateTaskInFirestore(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task Updated", description: "The task has been successfully updated." });
      setIsFormOpen(false);
      setEditingTask(undefined);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "There was an error updating the task.", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskFromFirestore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task Deleted", description: "The task has been successfully deleted.", variant: "destructive" });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "There was an error deleting the task.", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => 
      updateTaskStatusInFirestore(taskId, newStatus),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Status Updated", description: `Task marked as ${variables.newStatus}.` });
    },
    onError: (error) => {
      console.error("Error updating task status:", error);
      toast({ title: "Error", description: "There was an error updating the task status.", variant: "destructive" });
    },
  });


  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: any, id?: string) => {
    const taskData = {
      ...values,
      date: formatISO(values.date, { representation: 'date' }), // Ensure date is ISO string
      status: values.status || (id ? editingTask?.status : 'open') // Ensure status is set
    };

    if (id) {
      updateTaskMutation.mutate({ id, taskData });
    } else {
      // For new tasks, ensure 'status' is part of taskData if not already set by the form
      const newTaskData = { ...taskData, status: taskData.status || 'open' as TaskStatus };
      addTaskMutation.mutate(newTaskData);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, newStatus });
  };

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = useCallback((field: SortableTaskFields, direction?: 'asc' | 'desc') => {
    setSortConfig((prev) => {
      if (prev.field === field && direction === undefined) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: direction || 'asc' };
    });
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    toast({ title: "Filters Cleared", description: "All active filters have been removed."});
  }, [toast]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filters.entityName) {
      filtered = filtered.filter((task) =>
        task.entityName.toLowerCase().includes(filters.entityName.toLowerCase())
      );
    }
    if (filters.contactPerson) {
      filtered = filtered.filter((task) =>
        task.contactPerson.toLowerCase().includes(filters.contactPerson.toLowerCase())
      );
    }
     if (filters.note) {
      filtered = filtered.filter((task) =>
        task.note?.toLowerCase().includes(filters.note.toLowerCase())
      );
    }
    if (filters.taskType !== 'all') {
      filtered = filtered.filter((task) => task.taskType === filters.taskType);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }
    if (filters.dateFrom) {
      const startDate = startOfDay(filters.dateFrom);
      filtered = filtered.filter((task) => {
        try {
          return task.date ? parseISO(task.date) >= startDate : false;
        } catch (e) { return false; }
      });
    }
    if (filters.dateTo) {
      const endDate = endOfDay(filters.dateTo);
      filtered = filtered.filter((task) => {
         try {
          return task.date ? parseISO(task.date) <= endDate : false;
        } catch (e) { return false; }
      });
    }

    if (sortConfig.field) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.field!];
        const valB = b[sortConfig.field!];

        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
        } else if (valA > valB) {
            comparison = 1;
        } else if (valA < valB) {
            comparison = -1;
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return filtered;
  }, [tasks, filters, sortConfig]);

  const hasActiveFilters = useMemo(() => {
    return filters.entityName || 
           filters.contactPerson || 
           filters.taskType !== 'all' || 
           filters.status !== 'all' || 
           filters.dateFrom || 
           filters.dateTo ||
           filters.note;
  }, [filters]);

  if (isLoadingTasks || isMigrating) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <p className="text-xl text-muted-foreground">Loading tasks...</p>
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-8">
          FinStack &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  if (isTasksError) {
     return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <p className="text-xl text-red-500">Error loading tasks. Please try again later.</p>
        </main>
         <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-8">
          FinStack &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-4">
          <h2 className="text-3xl font-headline font-bold text-foreground mb-4 md:mb-0">Task Log</h2>
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} size="default">
                <XIcon className="mr-2 h-4 w-4" /> Clear All Filters
              </Button>
            )}
            <Button onClick={() => handleOpenForm()} variant="default" disabled={addTaskMutation.isPending || updateTaskMutation.isPending || isLoadingTasks || isMigrating}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4 flex items-center">
          <Filter className="h-4 w-4 mr-2 opacity-70" />
          Use the filter icon next to the table titles to apply filters.
        </div>

        <div className="mt-2">
          <TaskList
            tasks={filteredAndSortedTasks}
            onEdit={handleOpenForm}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </div>
      </main>

      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
      
      <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-8">
        FinStack &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}


    