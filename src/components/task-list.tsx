"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'open' | 'closed') => void;
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const [deleteDialogState, setDeleteDialogState] = React.useState<{isOpen: boolean, taskId: string | null}>({isOpen: false, taskId: null});

  const openDeleteDialog = (taskId: string) => {
    setDeleteDialogState({isOpen: true, taskId});
  }

  const closeDeleteDialog = () => {
    setDeleteDialogState({isOpen: false, taskId: null});
  }

  const handleDeleteConfirm = () => {
    if(deleteDialogState.taskId) {
      onDelete(deleteDialogState.taskId);
    }
    closeDeleteDialog();
  }

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No tasks found. Create a new task to get started!</div>;
  }

  return (
    <>
      <div className="rounded-md border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity Name</TableHead>
              <TableHead>Task Type</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{format(parseISO(task.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{task.entityName}</TableCell>
                <TableCell>{task.taskType}</TableCell>
                <TableCell>{task.time}</TableCell>
                <TableCell>{task.contactPerson}</TableCell>
                <TableCell>
                  <Badge variant={task.status === 'open' ? 'secondary' : 'default'} 
                         className={task.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(task.id, task.status === 'open' ? 'closed' : 'open')}
                      >
                        {task.status === 'open' ? (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                        Mark as {task.status === 'open' ? 'Closed' : 'Open'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(task.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteDialogState.isOpen} onOpenChange={(isOpen) => !isOpen && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
