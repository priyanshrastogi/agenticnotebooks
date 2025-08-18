import { instance } from '@/lib/axios';

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

export interface UserUpdateRequest {
  name?: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export const userApi = {
  getCurrentUser: async (accessToken: string): Promise<UserResponse> => {
    const response = await instance.get<UserResponse>('/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  updateProfile: async (data: UserUpdateRequest, accessToken: string): Promise<UserResponse> => {
    const response = await instance.patch<UserResponse>('/users/me', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  updatePassword: async (
    data: PasswordUpdateRequest,
    accessToken: string
  ): Promise<MessageResponse> => {
    const response = await instance.post<MessageResponse>('/users/password', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};
