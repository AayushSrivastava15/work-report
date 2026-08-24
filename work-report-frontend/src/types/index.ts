export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  designation?: string;
  bio?: string;
  avatarUrl?: string;
  employeeId?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  organizationId?: number;
  organizationName?: string;
  organizationCode?: string;
  organizationType?: string;
  teamId?: number;
  teamName?: string;
  isManager?: boolean;
}

export interface UserProfileUpdateRequest {
  name: string;
  department?: string;
  designation?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OrganizationDetailsResponse {
  id: number;
  name: string;
  code: string;
  type: string;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  totalMembers: number;
  totalTeams: number;
  totalProjects: number;
  totalReports: number;
  plan: string;
  createdAt: string;
}

export interface OrganizationUpdateRequest {
  name: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  role?: string;
  status?: string;
  accountType?: string;
  companyName?: string;
  organizationCode?: string;
  registrationMode?: string;
  teamId?: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  organizationName?: string;
  managerId?: number;
  managerName?: string;
  managerEmail?: string;
  memberCount: number;
  createdAt: string;
}

export interface TeamRequest {
  name: string;
  description?: string;
  managerId?: number | null;
}

export interface EffectivePermissionsResponse {
  userId: number;
  name: string;
  email: string;
  role: string;
  status: string;
  organizationId: number;
  organizationName: string;
  organizationCode: string;
  teamId?: number;
  teamName?: string;
  isManager: boolean;
  managedTeamId?: number;
  managedTeamName?: string;
  permissions: string[];
}

export interface AdminUserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  rejectedUsers: number;
  organizationName?: string;
  organizationCode?: string;
  organizationType?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
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
  userId?: number;
  userName?: string;
  userEmail?: string;
  teamId?: number;
  teamName?: string;
  submittedAt?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface KpiMetrics {
  totalWorkEntries: number;
  totalProjects: number;
  activeProjects: number;
  completedWork: number;
  completedPercentage: number;
  inProgressWork: number;
  inProgressPercentage: number;
  draftWork: number;
  rejectedWork: number;
  technologiesUsed: number;
  previousPeriodEntries: number;
  growthPercentage: number;
}

export interface ActivityTrendItem {
  period: string;
  date: string;
  totalEntries: number;
  completedEntries: number;
  inProgressEntries: number;
  draftEntries: number;
}

export interface ProjectAnalyticsItem {
  projectId: number | null;
  projectName: string;
  workCount: number;
  completedCount: number;
  inProgressCount: number;
  percentage: number;
}

export interface CategoryAnalyticsItem {
  category: string;
  workCount: number;
  completedCount: number;
  inProgressCount: number;
  percentage: number;
}

export interface TechnologyAnalyticsItem {
  technology: string;
  workCount: number;
  projectCount: number;
  projects: string[];
  percentage: number;
}

export interface StatusAnalyticsItem {
  status: string;
  label: string;
  workCount: number;
  percentage: number;
  color: string;
}

export interface WorkDistributionItem {
  projectId: number | null;
  projectName: string;
  totalCount: number;
  categoryCounts: Record<string, number>;
}

export interface DashboardAnalyticsResponse {
  kpis: KpiMetrics;
  activityTrends: ActivityTrendItem[];
  projects: ProjectAnalyticsItem[];
  categories: CategoryAnalyticsItem[];
  technologies: TechnologyAnalyticsItem[];
  statuses: StatusAnalyticsItem[];
  workDistribution: WorkDistributionItem[];
  recentEntries: WorkEntryResponse[];
}

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  projectId?: number;
  category?: string;
  technology?: string;
  status?: string;
  keyword?: string;
  aggregation?: 'DAY' | 'WEEK' | 'MONTH';
  teamMemberId?: number;
}

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  projectId?: number;
  category?: string;
  technology?: string;
  status?: string;
  keyword?: string;
}

export interface ReportPreviewResponse {
  userId: number;
  userName: string;
  userEmail: string;
  startDate?: string;
  endDate?: string;
  totalEntries: number;
  totalProjects: number;
  entries: WorkEntryResponse[];
}

export interface ApiError {
  status?: number;
  error?: string;
  message: string;
  timestamp?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
