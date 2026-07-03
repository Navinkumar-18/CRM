import api from './axios';
import type { ApiResponse } from '../types';

export interface GstDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export const verifyGst = async (gstNumber: string): Promise<GstDetails> => {
  const response = (await api.get(`/companies/verify-gst/${gstNumber}`)) as ApiResponse<GstDetails>;
  // Assuming the axios interceptor unwraps the response and returns data
  // But actually the interceptor returns `toCamelCase(response.data)`.
  // And response.data in controller is { success: true, data: details }
  // So response here is { success: true, data: details }
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error('Failed to verify GST');
};
