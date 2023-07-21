export interface Concern {
  id?: number
  createdAt: number
  text: string
}

export interface NextAction {
  id?: number
  createdAt: number
  title: string
  description: string
  minutesEstimate?: number
  effort: Effort
  priority: Priority
  tags: string[]
  completedAt?: number
  // Concern may be deleted, but we track the originating concern ID
  concernId?: number
  dependencies: number[]
}

export enum Effort {
  Low,
  Medium,
  High,
}

export enum Priority {
  Highest,
  High,
  Medium,
  Low,
  Lowest,
}

export interface Tag {
  id?: number
  name: string
  category?: string
  usedCount: number
  filteredCount: number
}

export interface Option<T> {
  value: T
  text: string
}
