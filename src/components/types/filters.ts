export interface DateFilter {
  startDate: string | null;
  endDate: string | null;
}

export interface TagFilter {
  tag: string;
  operator: 'AND' | 'OR';
}

export interface Filters {
  dateFilter: DateFilter;
  tagFilters: TagFilter[];
} 