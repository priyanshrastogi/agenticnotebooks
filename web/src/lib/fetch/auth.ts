import { instance } from '@/lib/axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  source?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  id: string;
  code: string;
  password: string;
}

export interface VerifyEmailData {
  verificationId: string;
  code: string;
}

export interface GoogleAuthData {
  code: string;
}

export interface RegistrationResponse {
  message: string;
  verificationId: string;
}

export interface ForgotPasswordResponse {
  message: string;
  verificationId: string;
}

export interface LoginErrorResponse {
  message: string;
  verificationId?: string;
}

export interface MessageResponse {
  message: string;
}

// Auth API functions
export const authApi = {
  login: async (data: LoginData): Promise<TokenResponse | LoginErrorResponse> => {
    try {
      const response = await instance.post<TokenResponse>('/auth/login', data);
      return response.data;
    } catch (error: unknown) {
      // If this is a "not verified" error, it will include a verificationId
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'verificationId' in error.response.data
      ) {
        throw error;
      }
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<RegistrationResponse> => {
    const response = await instance.post<RegistrationResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<MessageResponse> => {
    const response = await instance.post<MessageResponse>('/auth/logout', {
      refreshToken,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await instance.post<TokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    const response = await instance.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<MessageResponse> => {
    const response = await instance.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData): Promise<TokenResponse> => {
    const response = await instance.get<TokenResponse>(
      `/auth/verify-email/${data.verificationId}/${data.code}`
    );
    return response.data;
  },

  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await instance.get<string>('/auth/google');
    return response.data;
  },

  googleExchangeToken: async (data: GoogleAuthData): Promise<TokenResponse> => {
    const response = await instance.post<TokenResponse>('/auth/google/callback', data);
    return response.data;
  },
};
