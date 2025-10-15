export interface User {
  _id: string;
  name: string;
  discordId: string;
  created_at: Date;
}

export interface Category {
  _id: string;
  name: string;
  isSpecial?: boolean;
  isDeletable?: boolean;
  created_at: Date;
}

export interface Task {
  _id: string;
  taskName: string;
  dueDate: Date;
  priority: 'Easy' | 'Medium' | 'Hard';
  assignedUser: User | string;
  category: Category;
  status?: 'active' | 'completed' | 'deleted';
  repeatInterval?: 'none' | 'daily' | 'weekly' | 'monthly';
  lastNotified?: Date;
  created_at: Date;
}