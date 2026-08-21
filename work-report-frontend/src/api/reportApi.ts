import { request, requestBlob, type BlobResponse } from './apiClient';
import type { ReportFilterParams, ReportPreviewResponse } from '../types';

function buildQueryString(filters: ReportFilterParams): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.projectId) params.append('projectId', filters.projectId.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.technology) params.append('technology', filters.technology);
  if (filters.status) params.append('status', filters.status);
  if (filters.keyword && filters.keyword.trim()) params.append('keyword', filters.keyword.trim());

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const reportApi = {
  getReportPreview: (userId: number, filters: ReportFilterParams = {}): Promise<ReportPreviewResponse> => {
    const qs = buildQueryString(filters);
    return request<ReportPreviewResponse>(`/reports/user/${userId}${qs}`);
  },

  exportPdf: (userId: number, filters: ReportFilterParams = {}): Promise<BlobResponse> => {
    const qs = buildQueryString(filters);
    return requestBlob(`/reports/user/${userId}/export/pdf${qs}`);
  },

  exportDocx: (userId: number, filters: ReportFilterParams = {}): Promise<BlobResponse> => {
    const qs = buildQueryString(filters);
    return requestBlob(`/reports/user/${userId}/export/docx${qs}`);
  },

  exportExcel: (userId: number, filters: ReportFilterParams = {}): Promise<BlobResponse> => {
    const qs = buildQueryString(filters);
    return requestBlob(`/reports/user/${userId}/export/excel${qs}`);
  },
};
