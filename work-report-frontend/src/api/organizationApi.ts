import { request } from './apiClient';
import type { OrganizationDetailsResponse, OrganizationUpdateRequest } from '../types';

export const organizationApi = {
  getOrganizationDetails: (): Promise<OrganizationDetailsResponse> => {
    return request<OrganizationDetailsResponse>('/admin/organization');
  },

  updateOrganization: (data: OrganizationUpdateRequest): Promise<OrganizationDetailsResponse> => {
    return request<OrganizationDetailsResponse>('/admin/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  rotateOrganizationCode: (): Promise<OrganizationDetailsResponse> => {
    return request<OrganizationDetailsResponse>('/admin/organization/rotate-code', {
      method: 'POST',
    });
  },
};
