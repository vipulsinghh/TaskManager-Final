
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlusCircle, XIcon, Filter } from 'lucide-react';
import { formatISO, parseISO, startOfDay, endOfDay } from 'date-fns';
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
} from '@/lib/firebase';
import type { Filters, SortConfig } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

  const { data: tasks = [], isLoading: isLoadingTasks, isError: isTasksError } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: fetchTasksFromFirestore,
  });

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
      date: formatISO(values.date, { representation: 'date' }), 
      status: values.status || (id ? editingTask?.status : 'open') 
    };

    if (id) {
      updateTaskMutation.mutate({ id, taskData });
    } else {
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

  if (isLoadingTasks) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto p-2 md:p-4 flex justify-center items-center">
          <p className="text-lg text-muted-foreground">Loading tasks...</p>
        </main>
        <footer className="text-center p-4 text-muted-foreground text-xs border-t mt-6">
          FinStack &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  if (isTasksError) {
     return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto p-2 md:p-4 flex justify-center items-center">
          <p className="text-lg text-red-500">Error loading tasks. Please try again later.</p>
        </main>
         <footer className="text-center p-4 text-muted-foreground text-xs border-t mt-6">
          FinStack &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-2 md:p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pt-2">
          <h2 className="text-2xl font-headline font-bold text-foreground mb-3 md:mb-0">Task Log</h2>
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} size="sm">
                <XIcon className="mr-1.5 h-3.5 w-3.5" /> Clear Filters
              </Button>
            )}
            <Button onClick={() => handleOpenForm()} variant="default" size="sm" disabled={addTaskMutation.isPending || updateTaskMutation.isPending || isLoadingTasks }>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3 flex items-center">
          <Filter className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          Use the filter icon next to table titles for filtering. Click titles to sort.
        </div>

        <div className="mt-1">
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
      
      <footer className="text-center p-4 text-muted-foreground text-xs border-t mt-6">
        FinStack &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
    

    
