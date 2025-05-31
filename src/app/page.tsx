
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle, XIcon } from 'lucide-react';
import { formatISO, parseISO, startOfDay, endOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
// TaskFilters component is removed
import AppHeader from '@/components/app-header';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Task, TaskStatus, SortableTaskFields, TaskType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type { Filters, SortConfig } from '@/lib/types'; // Adjusted to import from types


const initialFilters: Filters = {
  entityName: '',
  contactPerson: '',
  taskType: 'all',
  status: 'all',
  dateFrom: undefined,
  dateTo: undefined,
};

const initialSortConfig: SortConfig = {
  field: 'date',
  direction: 'desc',
};

const sampleTasks: Task[] = [
  { id: '1', date: formatISO(new Date(2024, 6, 15), { representation: 'date' }), entityName: 'Acme Corp', taskType: 'Call', time: '10:00', contactPerson: 'John Doe', status: 'open', note: 'Initial discussion about new project.' },
  { id: '2', date: formatISO(new Date(2024, 6, 16), { representation: 'date' }), entityName: 'Beta Solutions', taskType: 'Email', time: '14:30', contactPerson: 'Jane Smith', status: 'open', note: 'Send follow-up email with proposal.' },
  { id: '3', date: formatISO(new Date(2024, 6, 14), { representation: 'date' }), entityName: 'Gamma Inc', taskType: 'Meeting', time: '11:00', contactPerson: 'Robert Brown', status: 'closed', note: 'Client onboarding meeting completed.' },
];


export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', sampleTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const { toast } = useToast();

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: any, id?: string) => {
    const taskData = {
      ...values,
      date: formatISO(values.date, { representation: 'date' }), 
    };

    if (id) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? { ...task, ...taskData } : task))
      );
      toast({ title: "Task Updated", description: "The task has been successfully updated." });
    } else {
      setTasks((prevTasks) => [
        ...prevTasks,
        { ...taskData, id: crypto.randomUUID(), status: 'open' as TaskStatus },
      ]);
      toast({ title: "Task Created", description: "A new task has been successfully created." });
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    toast({ title: "Task Deleted", description: "The task has been successfully deleted.", variant: "destructive" });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast({ title: "Status Updated", description: `Task marked as ${newStatus}.`});
  };

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = useCallback((field: SortableTaskFields, direction?: 'asc' | 'desc') => {
    setSortConfig((prev) => {
      if (prev.field === field && direction === undefined) { // If same field clicked, toggle direction
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: direction || 'asc' }; // Otherwise, set new field/direction
    });
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    // Optionally reset sort config as well, or keep it separate
    // setSortConfig(initialSortConfig); 
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
    if (filters.taskType !== 'all') {
      filtered = filtered.filter((task) => task.taskType === filters.taskType);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }
    if (filters.dateFrom) {
      const startDate = startOfDay(filters.dateFrom);
      filtered = filtered.filter((task) => parseISO(task.date) >= startDate);
    }
    if (filters.dateTo) {
      const endDate = endOfDay(filters.dateTo);
      filtered = filtered.filter((task) => parseISO(task.date) <= endDate);
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
           filters.dateTo;
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6 pt-4">
          <h2 className="text-2xl font-semibold text-foreground">Task Log</h2>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} size="default">
                <XIcon className="mr-2 h-4 w-4" /> Clear All Filters
              </Button>
            )}
            <Button onClick={() => handleOpenForm()} variant="default">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
            </Button>
          </div>
        </div>

        {/* TaskFilters component is removed */}

        <div className="mt-2"> {/* Reduced margin-top as filters are gone */}
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
        TaskMaster &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
