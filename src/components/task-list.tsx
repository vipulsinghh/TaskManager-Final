
"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit3, Trash2, MoreVertical, CheckCircle, XCircle, Filter, ArrowUp, ArrowDown, CalendarIcon } from 'lucide-react';

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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';

import type { Task, TaskStatus, TaskType, SortableTaskFields, Filters, SortConfig } from '@/lib/types';
import { TASK_TYPES, TASK_STATUSES } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'open' | 'closed') => void;
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  sortConfig: SortConfig;
  onSortChange: (field: SortableTaskFields, direction?: 'asc' | 'desc') => void;
}

export function TaskList({ 
  tasks, 
  onEdit, 
  onDelete, 
  onStatusChange,
  filters,
  onFilterChange,
  sortConfig,
  onSortChange 
}: TaskListProps) {
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

  const renderSortIcon = (field: SortableTaskFields) => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
    }
    return null;
  };

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No tasks found. Create a new task or adjust your filters.</div>;
  }

  return (
    <>
      <div className="rounded-md border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('date')}>
                    Date {renderSortIcon('date')}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3 space-y-2">
                      <Label className="text-xs font-medium">Filter by Date Range</Label>
                       <DatePicker
                          date={filters.dateFrom}
                          setDate={(date) => onFilterChange('dateFrom', date)}
                          placeholder="Start date"
                          className="w-full h-9"
                        />
                        <DatePicker
                          date={filters.dateTo}
                          setDate={(date) => onFilterChange('dateTo', date)}
                          placeholder="End date"
                          className="w-full h-9"
                          calendarProps={{
                            disabled: (date) => filters.dateFrom ? date < filters.dateFrom : false
                          }}
                        />
                      {(filters.dateFrom || filters.dateTo) && (
                        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { onFilterChange('dateFrom', undefined); onFilterChange('dateTo', undefined); }}>
                          <XCircle className="mr-1 h-3 w-3" /> Clear Dates
                        </Button>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('entityName')}>
                    Entity Name {renderSortIcon('entityName')}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                       <Input
                        placeholder="Filter entity..."
                        value={filters.entityName}
                        onChange={(e) => onFilterChange('entityName', e.target.value)}
                        className="h-9 text-sm"
                      />
                      {filters.entityName && (
                        <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={() => onFilterChange('entityName', '')}>
                          <XCircle className="mr-1 h-3 w-3" /> Clear
                        </Button>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('taskType')}>
                    Task Type {renderSortIcon('taskType')}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Select
                        value={filters.taskType}
                        onValueChange={(value) => onFilterChange('taskType', value as TaskType | 'all')}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Filter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {TASK_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.taskType !== 'all' && (
                         <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={() => onFilterChange('taskType', 'all')}>
                           <XCircle className="mr-1 h-3 w-3" /> Clear
                         </Button>
                       )}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('time')}>
                    Time {renderSortIcon('time')}
                  </span>
                  {/* No filter for time in this iteration */}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('contactPerson')}>
                    Contact Person {renderSortIcon('contactPerson')}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                        <Filter className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Input
                        placeholder="Filter contact..."
                        value={filters.contactPerson}
                        onChange={(e) => onFilterChange('contactPerson', e.target.value)}
                        className="h-9 text-sm"
                      />
                       {filters.contactPerson && (
                        <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={() => onFilterChange('contactPerson', '')}>
                           <XCircle className="mr-1 h-3 w-3" /> Clear
                        </Button>
                       )}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                 <div className="flex items-center">
                    <span className="cursor-pointer hover:text-accent-foreground" onClick={() => onSortChange('status')}>
                        Status {renderSortIcon('status')}
                    </span>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                            <Filter className="h-3 w-3" />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                        <Select
                            value={filters.status}
                            onValueChange={(value) => onFilterChange('status', value as TaskStatus | 'all')}
                        >
                            <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {TASK_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        {filters.status !== 'all' && (
                            <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={() => onFilterChange('status', 'all')}>
                            <XCircle className="mr-1 h-3 w-3" /> Clear
                            </Button>
                        )}
                        </PopoverContent>
                    </Popover>
                </div>
              </TableHead>
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
                         className={task.status === 'open' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}>
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
