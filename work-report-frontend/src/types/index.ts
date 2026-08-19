export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  userId: number;
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
}

export interface WorkEntryResponse {
  id: number;
  date: string;
  title: string;
  description: string;
  category: string;
  technology: string;
  status: string;
  projectId: number;
  projectName: string;
}

export interface WorkEntryRequest {
  date: string;
  title: string;
  description: string;
  category: string;
  technology: string;
  status: string;
}

export interface DashboardWorkCountResponse {
  userId: number;
  workCount: number;
}

export interface DashboardProjectCountResponse {
  userId: number;
  projectCount: number;
}

export interface DashboardProjectResponse {
  projectId: number;
  projectName: string;
  workCount: number;
}

export interface DashboardCategoryResponse {
  category: string;
  workCount: number;
}

export interface DashboardTechnologyResponse {
  technology: string;
  workCount: number;
}

export interface DashboardStatusResponse {
  status: string;
  workCount: number;
}

export interface ApiError {
  status?: number;
  message: string;
  timestamp?: string;
  path?: string;
}
