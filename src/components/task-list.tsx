
"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Edit3, Trash2, MoreVertical, CheckCircle, XCircle, Filter as FilterIcon, ArrowUp, ArrowDown,
  Phone, Mail, Users, ArrowRightCircle, MapPin, Presentation, FileText, FileSignature, Info, AlignLeft
} from 'lucide-react';

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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


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

const taskTypeIcons: Record<TaskType, React.ElementType> = {
  "Call": Phone,
  "Email": Mail,
  "Meeting": Users,
  "Follow-up": ArrowRightCircle,
  "Site Visit": MapPin,
  "Demo": Presentation,
  "Proposal": FileText,
  "Contract": FileSignature,
  "Other": Info,
};

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
      return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 shrink-0" /> : <ArrowDown className="ml-1 h-3 w-3 shrink-0" />;
    }
    return <div className="w-3 h-3 ml-1 shrink-0"></div>; // Placeholder for alignment
  };

  const getColumnTitle = (field: SortableTaskFields) => {
    const titles: Record<SortableTaskFields, string> = {
        date: 'Date',
        entityName: 'Entity Name',
        taskType: 'Task Type',
        time: 'Time',
        contactPerson: 'Contact Person',
        note: 'Notes',
        status: 'Status',
    };
    return titles[field];
  }

  const renderFilterPopover = (field: Extract<keyof Filters, SortableTaskFields | 'dateFrom' | 'dateTo'>) => {
    const isDateRange = field === 'date'; // Special handling for date range
    const filterValue = isDateRange ? undefined : filters[field as Exclude<keyof Filters, 'dateFrom' | 'dateTo'>];


    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
            <FilterIcon className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-2" align="start">
          <Label className="text-xs font-medium">Filter by {getColumnTitle(field as SortableTaskFields)}</Label>
          {isDateRange ? (
            <>
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
                  disabled: (d) => filters.dateFrom ? d < filters.dateFrom : false
                }}
              />
              {(filters.dateFrom || filters.dateTo) && (
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { onFilterChange('dateFrom', undefined); onFilterChange('dateTo', undefined); }}>
                  <XCircle className="mr-1 h-3 w-3" /> Clear Dates
                </Button>
              )}
            </>
          ) : field === 'taskType' ? (
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
          ) : field === 'status' ? (
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
          ) : (
            <Input
              placeholder={`Filter ${getColumnTitle(field as SortableTaskFields).toLowerCase()}...`}
              value={filterValue as string || ''}
              onChange={(e) => onFilterChange(field as Extract<keyof Filters, string>, e.target.value)}
              className="h-9 text-sm"
            />
          )}
          {(filterValue && filterValue !== 'all' && !isDateRange) && (
             <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={() => onFilterChange(field as Extract<keyof Filters, string>, field === 'taskType' || field === 'status' ? 'all' : '')}>
               <XCircle className="mr-1 h-3 w-3" /> Clear
             </Button>
           )}
        </PopoverContent>
      </Popover>
    );
  };


  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No tasks found. Create a new task or adjust your filters.</div>;
  }
  
  const columns: { field: SortableTaskFields; header: string; filterable: boolean; className?: string, cellClassName?: string }[] = [
    { field: 'date', header: 'Date', filterable: true, className: "w-[130px]"},
    { field: 'entityName', header: 'Entity Name', filterable: true, className: "w-[200px]" },
    { field: 'taskType', header: 'Task Type', filterable: true, className: "w-[160px]" },
    { field: 'time', header: 'Time', filterable: false, className: "w-[100px]" },
    { field: 'contactPerson', header: 'Contact Person', filterable: true, className: "w-[180px]" },
    { field: 'note', header: 'Notes', filterable: true, className: "min-w-[250px]"},
    { field: 'status', header: 'Status', filterable: true, className: "w-[120px]" },
  ];


  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.field} className={col.className}>
                  <div className="flex items-center -ml-1"> {/* Negative margin to align with popover trigger */}
                    <Button variant="ghost" onClick={() => onSortChange(col.field)} className="px-1 h-auto hover:bg-accent/50">
                      <span className="text-xs font-medium">{col.header}</span>
                      {renderSortIcon(col.field)}
                    </Button>
                    {col.filterable && renderFilterPopover(col.field as Extract<keyof Filters, SortableTaskFields | 'dateFrom' | 'dateTo'>)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const TaskIcon = taskTypeIcons[task.taskType] || AlignLeft;
              return (
                <TableRow key={task.id}>
                  <TableCell className="py-2.5">{format(parseISO(task.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium py-2.5">{task.entityName}</TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center">
                      <TaskIcon className="mr-2 h-4 w-4 opacity-80 shrink-0" />
                      {task.taskType}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">{task.time}</TableCell>
                  <TableCell className="py-2.5">{task.contactPerson}</TableCell>
                  <TableCell className={`py-2.5 ${columns.find(c => c.field === 'note')?.cellClassName || ''}`}>
                    <div className="truncate max-w-xs" title={task.note}>{task.note || '-'}</div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant={task.status === 'open' ? 'secondary' : 'default'} 
                           className={`text-xs ${task.status === 'open' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
