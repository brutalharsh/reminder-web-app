export interface User {
  _id: string;
  name: string;
  discordId: string;
  created_at: string;
}

export interface Category {
  _id: string;
  name: string;
  isSpecial: boolean;
  isDeletable: boolean;
  created_at: string;
}

export interface Task {
  _id: string;
  taskName: string;
  dueDate: string;
  priority: 'Easy' | 'Medium' | 'Hard';
  assignedUser: User;
  category: Category;
  status: 'active' | 'completed' | 'deleted';
  repeatInterval: 'none' | 'daily' | 'weekly' | 'monthly';
  lastNotified: string | null;
  created_at: string;
}

export interface FilterState {
  priority: string;
  date: string;
}