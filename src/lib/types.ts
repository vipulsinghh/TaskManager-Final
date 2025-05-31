
export type TaskStatus = 'open' | 'closed';

export const TASK_STATUSES: TaskStatus[] = ['open', 'closed'];

export const TASK_TYPES = [
  "Call",
  "Email",
  "Meeting",
  "Follow-up",
  "Site Visit",
  "Demo",
  "Proposal",
  "Contract",
  "Other",
] as const;

export type TaskType = typeof TASK_TYPES[number];

export interface Task {
  id: string;
  date: string; // ISO string e.g. "2023-10-26"
  entityName: string;
  taskType: TaskType;
  time: string; // HH:mm format e.g. "14:30"
  contactPerson: string;
  note?: string;
  status: TaskStatus;
  createdAt?: any; // Or firebase.firestore.Timestamp if you have firebase types installed
}

export type SortableTaskFields = 'date' | 'entityName' | 'taskType' | 'time' | 'contactPerson' | 'status' | 'note';

export interface Filters {
  entityName: string;
  contactPerson: string;
  taskType: TaskType | 'all';
  status: TaskStatus | 'all';
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  note: string;
}

export interface SortConfig {
  field: SortableTaskFields | null; // Allow null for no sort
  direction: 'asc' | 'desc';
}
