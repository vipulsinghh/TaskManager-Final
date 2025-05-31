// This component is no longer used and can be safely deleted.
// The filtering and sorting UI has been integrated directly into the TaskList component.
// Keeping the file for now in case of rollback or reference, but it's not imported or used.
/*
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import type { TaskStatus, TaskType, SortableTaskFields } from '@/lib/types';
import { TASK_TYPES, TASK_STATUSES } from '@/lib/types';
import { XIcon } from 'lucide-react';

export interface Filters {
  entityName: string;
  contactPerson: string;
  taskType: TaskType | 'all';
  status: TaskStatus | 'all';
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export interface SortConfig {
  field: SortableTaskFields | null;
  direction: 'asc' | 'desc';
}

interface TaskFiltersProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  sortConfig: SortConfig;
  onSortChange: (field: SortableTaskFields, direction?: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

const sortableFields: { label: string; value: SortableTaskFields }[] = [
  { label: 'Date', value: 'date' },
  { label: 'Entity Name', value: 'entityName' },
  { label: 'Task Type', value: 'taskType' },
  { label: 'Time', value: 'time' },
  { label: 'Contact Person', value: 'contactPerson' },
  { label: 'Status', value: 'status' },
];

export function TaskFilters({ filters, onFilterChange, sortConfig, onSortChange, onClearFilters }: TaskFiltersProps) {
  const handleSortFieldChange = (value: string) => {
    onSortChange(value as SortableTaskFields);
  };

  const handleSortDirectionChange = (value: 'asc' | 'desc') => {
    if (sortConfig.field) {
      onSortChange(sortConfig.field, value);
    }
  };
  
  const hasActiveFilters = React.useMemo(() => {
    return filters.entityName || filters.contactPerson || filters.taskType !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo;
  }, [filters]);

  return (
    <Card className="mb-6 p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <Label htmlFor="entityNameFilter">Entity Name</Label>
          <Input
            id="entityNameFilter"
            placeholder="Filter by entity name..."
            value={filters.entityName}
            onChange={(e) => onFilterChange('entityName', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactPersonFilter">Contact Person</Label>
          <Input
            id="contactPersonFilter"
            placeholder="Filter by contact..."
            value={filters.contactPerson}
            onChange={(e) => onFilterChange('contactPerson', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="taskTypeFilter">Task Type</Label>
          <Select
            value={filters.taskType}
            onValueChange={(value) => onFilterChange('taskType', value as TaskType | 'all')}
          >
            <SelectTrigger id="taskTypeFilter">
              <SelectValue placeholder="Filter by task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TASK_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="statusFilter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange('status', value as TaskStatus | 'all')}
          >
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Filter by status" />
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
        </div>
        <div className="space-y-1">
          <Label htmlFor="dateFromFilter">Date From</Label>
          <DatePicker
            date={filters.dateFrom}
            setDate={(date) => onFilterChange('dateFrom', date)}
            placeholder="Start date"
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dateToFilter">Date To</Label>
          <DatePicker
            date={filters.dateTo}
            setDate={(date) => onFilterChange('dateTo', date)}
            placeholder="End date"
            className="w-full"
            calendarProps={{
                disabled: (date) => filters.dateFrom ? date < filters.dateFrom : false
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sortByFilter">Sort By</Label>
          <Select
            value={sortConfig.field || ''}
            onValueChange={handleSortFieldChange}
          >
            <SelectTrigger id="sortByFilter">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortableFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <div className="space-y-1 flex-grow">
            <Label htmlFor="sortOrderFilter" className={!sortConfig.field ? "text-muted-foreground" : ""}>Order</Label>
            <Select
                value={sortConfig.direction}
                onValueChange={(value) => handleSortDirectionChange(value as 'asc' | 'desc')}
                disabled={!sortConfig.field}
            >
                <SelectTrigger id="sortOrderFilter">
                <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="h-10 px-3">
              <XIcon className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("bg-card text-card-foreground rounded-lg border", className)}>{children}</div>
);

const Label = ({ htmlFor, className, children }: { htmlFor?: string, className?: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</label>
);

import { cn } from "@/lib/utils";
*/
