export type UserRole = 'ingenieur' | 'chef_chantier' | 'conducteur' | 'ouvrier' | 'sous_traitant';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  lot: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'pending' | 'done' | 'not_done';

export interface Task {
  _id?: string;
  title: string;
  description: string;
  lot: string;
  createdBy: string;
  createdAt: Date;
  scheduledDate: Date;
  status: TaskStatus;
  comments?: Comment[];
  updatedAt: Date;
}

export interface Comment {
  _id?: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  photoUrl?: string;
  createdAt: Date;
}

export interface Lot {
  _id?: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
}