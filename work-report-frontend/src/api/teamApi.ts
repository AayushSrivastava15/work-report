import { request } from './apiClient';
import type { Team, TeamRequest, UserResponse } from '../types';

export const teamApi = {
  // Get all teams in caller's organization
  getAllTeams(): Promise<Team[]> {
    return request<Team[]>('/teams');
  },

  // Get team by id
  getTeamById(id: number): Promise<Team> {
    return request<Team>(`/teams/${id}`);
  },

  // Create a new team (Admin only)
  createTeam(data: TeamRequest): Promise<Team> {
    return request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a team (Admin only)
  updateTeam(id: number, data: TeamRequest): Promise<Team> {
    return request<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a team (Admin only)
  deleteTeam(id: number): Promise<void> {
    return request<void>(`/teams/${id}`, {
      method: 'DELETE',
    });
  },

  // Assign user to team
  addMember(teamId: number, userId: number): Promise<void> {
    return request<void>(`/teams/${teamId}/members/${userId}`, {
      method: 'POST',
    });
  },

  // Remove user from team
  removeMember(teamId: number, userId: number): Promise<void> {
    return request<void>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  // Assign team manager
  assignManager(teamId: number, managerUserId: number): Promise<void> {
    return request<void>(`/teams/${teamId}/manager/${managerUserId}`, {
      method: 'PUT',
    });
  },

  // Get team members
  getTeamMembers(teamId: number): Promise<UserResponse[]> {
    return request<UserResponse[]>(`/teams/${teamId}/members`);
  },
};
