
"use client";

import React, { useEffect, useState } from 'react';
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
// Removed: import { getTasks } from '@/lib/firebase'; // No longer needed as tasks are passed as props

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'open' | 'closed') => void;
  onSortChange: (field: SortableTaskFields, direction?: 'asc' | 'desc') => void;
  onFilterChange: (field: keyof Filters, value: any) => void;
  sortConfig: SortConfig;
  filters: Filters;
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
  onEdit, 
  onDelete, 
  onStatusChange,
  onFilterChange,
  filters,
  sortConfig,
  onSortChange,
  tasks,
}: TaskListProps) {
  const [isLoading, setIsLoading] = useState(true); // Retained for consistency, though tasks are now props
  const [deleteDialogState, setDeleteDialogState] = React.useState<{isOpen: boolean, taskId: string | null}>({isOpen: false, taskId: null});
  
  useEffect(() => { setIsLoading(false); }, [tasks]);

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
    return <div className="w-3 h-3 ml-1 shrink-0"></div>; 
  };

  const getColumnTitle = (field: SortableTaskFields) => {
    const titles: Record<SortableTaskFields, string> = {
        date: 'Date',
        entityName: 'Entity Name',
        taskType: 'Task Type',
        time: 'Time',
        contactPerson: 'Contact',
        note: 'Notes',
        status: 'Status',
    };
    return titles[field];
  }

  const renderFilterPopover = (field: Extract<keyof Filters, SortableTaskFields | 'dateFrom' | 'dateTo'>) => {
    const isDateRange = field === 'dateFrom' || field === 'dateTo'; 
    const filterValue = isDateRange ? undefined : filters[field as Exclude<keyof Filters, 'dateFrom' | 'dateTo'>];

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-0.5 h-5 w-5">
            <FilterIcon className="h-3 w-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2.5 space-y-1.5" align="start">
          <Label className="text-xs font-medium">Filter by {getColumnTitle(field as SortableTaskFields)}</Label>
          {isDateRange ? (
            <>
              <DatePicker
                date={filters.dateFrom}
                setDate={(date) => onFilterChange('dateFrom', date)}
                placeholder="Start date"
                className="w-full h-8 text-xs"
              />
              <DatePicker
                date={filters.dateTo}
                setDate={(date) => onFilterChange('dateTo', date)}
                placeholder="End date"
                className="w-full h-8 text-xs"
                calendarProps={{
                  disabled: (d) => filters.dateFrom ? d < filters.dateFrom : false
                }}
              />
              {(filters.dateFrom || filters.dateTo) && (
                <Button variant="ghost" size="xs" className="w-full text-xs" onClick={() => { onFilterChange('dateFrom', undefined); onFilterChange('dateTo', undefined); }}>
                  <XCircle className="mr-1 h-3 w-3" /> Clear Dates
                </Button>
              )}
            </>
          ) : field === 'taskType' ? (
             <Select
                value={filters.taskType}
                onValueChange={(value) => onFilterChange('taskType', value as TaskType | 'all')}
              >
                <SelectTrigger className="h-8 text-xs">
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
                <SelectTrigger className="h-8 text-xs">
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
              className="h-8 text-xs"
            />
          )}
          {(filterValue && filterValue !== 'all' && !isDateRange) && (
             <Button variant="ghost" size="xs" className="mt-1 w-full text-xs" onClick={() => onFilterChange(field as Extract<keyof Filters, string>, field === 'taskType' || field === 'status' ? 'all' : '')}>
               <XCircle className="mr-1 h-3 w-3" /> Clear
             </Button>
           )}
        </PopoverContent>
      </Popover>
    );
  };

 if (isLoading) { // Though tasks are props, this handles initial visual state
    return <div className="text-center text-muted-foreground py-8">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No tasks found. Create one or adjust filters.</div>;
  }
  
  const columns: { field: SortableTaskFields; header: string; filterable: boolean; className?: string }[] = [
    { field: 'date', header: 'Date', filterable: true, className: "w-[110px]"},
    { field: 'entityName', header: 'Entity Name', filterable: true, className: "w-[160px] min-w-[140px]" },
    { field: 'taskType', header: 'Task Type', filterable: true, className: "w-[140px] min-w-[120px]" },
    { field: 'time', header: 'Time', filterable: false, className: "w-[80px]" },
    { field: 'contactPerson', header: 'Contact', filterable: true, className: "w-[150px] min-w-[130px]" },
    { field: 'note', header: 'Notes', filterable: true, className: "min-w-[200px]"},
    { field: 'status', header: 'Status', filterable: true, className: "w-[100px]" },
  ];

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border shadow-sm bg-card">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.field} className={`px-2 py-2 h-10 ${col.className}`}>
                  <div className="flex items-center -ml-1">
                    <Button variant="ghost" onClick={() => onSortChange(col.field)} className="px-1 h-auto hover:bg-accent/50">
                      <span className="text-xs font-semibold">{col.header}</span>
                      {renderSortIcon(col.field)}
                    </Button>
                    {col.filterable && renderFilterPopover(col.field as Extract<keyof Filters, SortableTaskFields | 'dateFrom' | 'dateTo'>)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="sticky right-0 bg-card z-10 px-2 py-2 h-10 min-w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const TaskIcon = taskTypeIcons[task.taskType] || AlignLeft;
              let formattedDate = 'Invalid Date';
              try {
                if (task.date) { // Ensure task.date is not null, undefined, or empty string
                    formattedDate = format(parseISO(task.date), 'MMM d, yy');
                } else {
                    formattedDate = '-'; // Or some placeholder for missing dates
                }
              } catch (error) {
                console.warn(`Error parsing date for task ${task.id}: ${task.date}`, error);
                // formattedDate remains 'Invalid Date' or you can set it to task.date or '-'
              }
              return (
                <TableRow key={task.id}>
                  <TableCell className="px-2 py-1.5">{formattedDate}</TableCell>
                  <TableCell className="font-medium px-2 py-1.5">{task.entityName}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center">
                      <TaskIcon className="mr-1.5 h-3.5 w-3.5 opacity-80 shrink-0" />
                      {task.taskType}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">{task.time}</TableCell>
                  <TableCell className="px-2 py-1.5">{task.contactPerson}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="truncate max-w-[200px]" title={task.note}>{task.note || '-'}</div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <Badge variant={task.status === 'open' ? 'secondary' : 'default'} 
                           className={`text-[10px] px-1.5 py-0.5 ${task.status === 'open' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-card z-10 px-2 py-1.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit3 className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStatusChange(task.id, task.status === 'open' ? 'closed' : 'open')}
                        >
                          {task.status === 'open' ? (
                              <CheckCircle className="mr-2 h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="mr-2 h-3.5 w-3.5" />
                            )}
                          Mark as {task.status === 'open' ? 'Closed' : 'Open'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(task.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
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

