import axios from 'axios';
import {
  AuthResponse,
  DashboardStats,
  PaginatedScans,
  ScanCompareResponse,
  ScanDetail,
  SystemHealth,
  ThreatIndicator,
  AnalystNote
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phishguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const scanService = {
  scanUrl: async (url: string): Promise<ScanDetail> => {
    const res = await api.post<ScanDetail>('/scan', { url });
    return res.data;
  },
  getScanById: async (id: number): Promise<ScanDetail> => {
    const res = await api.get<ScanDetail>(`/scan/${id}`);
    return res.data;
  },
  getScans: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    classification?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedScans> => {
    const res = await api.get<PaginatedScans>('/scans', { params });
    return res.data;
  },
  compareUrls: async (url_a: string, url_b: string): Promise<ScanCompareResponse> => {
    const res = await api.post<ScanCompareResponse>('/compare', { url_a, url_b });
    return res.data;
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

export const notesService = {
  addNote: async (scanId: number, note: string): Promise<AnalystNote> => {
    const res = await api.post<AnalystNote>('/notes', { scan_id: scanId, note });
    return res.data;
  },
  getScanNotes: async (scanId: number): Promise<AnalystNote[]> => {
    const res = await api.get<AnalystNote[]>(`/notes/${scanId}`);
    return res.data;
  },
};

export const threatIntelService = {
  getThreatIndicators: async (params?: {
    search?: string;
    indicator_type?: string;
  }): Promise<ThreatIndicator[]> => {
    const res = await api.get<ThreatIndicator[]>('/threat-intelligence', { params });
    return res.data;
  },
};

export const reportService = {
  generateReport: async (scanId: number, analystSignature?: string) => {
    const res = await api.post('/reports', {
      scan_id: scanId,
      analyst_signature: analystSignature || 'PhishGuard Automated SOC Agent',
    });
    return res.data;
  },
  getExportUrl: (scanId: number, format: 'json' | 'html' = 'html') => {
    return `/api/reports/${scanId}/export?format=${format}`;
  },
};

export const healthService = {
  getHealth: async (): Promise<SystemHealth> => {
    const res = await api.get<SystemHealth>('/health');
    return res.data;
  },
};

export default api;
