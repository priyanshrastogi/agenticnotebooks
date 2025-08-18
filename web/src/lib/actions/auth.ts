'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';

import {
  authApi,
  ForgotPasswordData,
  GoogleAuthData,
  LoginData,
  RegisterData,
  ResetPasswordData,
  TokenResponse,
  VerifyEmailData,
} from '@/lib/fetch/auth';

import {
  ACCESS_TOKEN_COOKIE,
  deleteAuthCookies,
  LOGGED_IN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '../cookies';

// Type for error response
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      attemptsRemaining?: number;
      verificationId?: string;
    };
  };
}

export async function getGoogleAuthUrl(): Promise<{ url: string; error?: string }> {
  try {
    const url = await authApi.getGoogleAuthUrl();
    return { url };
  } catch (error) {
    console.error('Error getting Google auth URL:', error);
    const err = error as ErrorResponse;
    return {
      url: '',
      error: err.response?.data?.message || 'Failed to get Google auth URL',
    };
  }
}

export async function googleAuthCallback(data: {
  code: string;
}): Promise<{ success: boolean; error?: string; accessToken?: string }> {
  try {
    const googleAuthDto: GoogleAuthData = {
      code: data.code,
    };

    const response = await authApi.googleExchangeToken(googleAuthDto);
    if ('accessToken' in response && 'refreshToken' in response) {
      const { refreshToken, accessToken } = response;
      await setAuthCookies(accessToken, refreshToken);
      return { success: true, accessToken };
    }

    return {
      success: false,
      error: 'Unexpected response format',
    };
  } catch (error: unknown) {
    console.error('Google auth callback error:', error);
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || 'Google authentication failed',
    };
  }
}

export async function login(
  data: LoginData
): Promise<{ success: boolean; error?: string; accessToken?: string; verificationId?: string }> {
  try {
    const response = await authApi.login(data);
    // Check if the response has accessToken and refreshToken properties
    if ('accessToken' in response && 'refreshToken' in response) {
      const { refreshToken, accessToken } = response;
      await setAuthCookies(accessToken, refreshToken);
      return { success: true, accessToken };
    }
    // This should never happen, but added for type safety
    return {
      success: false,
      error: 'Unexpected response format',
    };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    // Check if the error response contains a verificationId (for unverified emails)
    if (err.response?.data?.verificationId) {
      return {
        success: false,
        error: err.response?.data?.message || 'Email not verified',
        verificationId: err.response.data.verificationId,
      };
    }
    return {
      success: false,
      error: err.response?.data?.message || 'Login failed',
    };
  }
}

export async function register(
  data: RegisterData
): Promise<{ success: boolean; error?: string; verificationId?: string }> {
  try {
    const response = await authApi.register(data);
    return {
      success: true,
      verificationId: response.verificationId,
    };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || 'Registration failed',
    };
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      await authApi.logout(refreshToken);
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
      cookieStore.delete(ACCESS_TOKEN_COOKIE);
      cookieStore.delete(LOGGED_IN_COOKIE);
    }
    return { success: true };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || 'Logout failed',
    };
  }
}

export async function refreshToken(): Promise<{
  success: boolean;
  error?: string;
  tokens?: TokenResponse;
}> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (accessToken && refreshToken) {
      return {
        success: true,
        tokens: { accessToken, refreshToken, tokenType: 'Bearer' },
      };
    }
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token found',
      };
    }
    const response = await authApi.refreshToken(refreshToken);
    await setAuthCookies(response.accessToken, response.refreshToken);
    return {
      success: true,
      tokens: response,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        deleteAuthCookies();
      }
    }
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || 'Token refresh failed',
    };
  }
}

export async function forgotPassword(
  data: ForgotPasswordData
): Promise<{ success: boolean; error?: string; verificationId?: string }> {
  try {
    const response = await authApi.forgotPassword(data);
    return {
      success: true,
      verificationId: response.verificationId,
    };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || 'Password reset request failed',
    };
  }
}

export async function resetPassword(
  data: ResetPasswordData
): Promise<{ success: boolean; error?: string; message?: string; attemptsRemaining?: number }> {
  try {
    const response = await authApi.resetPassword(data);
    return {
      success: true,
      message: response.message || 'Password reset successful',
    };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    return {
      success: false,
      error: err.response?.data?.message || err.response?.data?.error || 'Password reset failed',
      attemptsRemaining: err.response?.data?.attemptsRemaining,
    };
  }
}

export async function verifyEmail(
  data: VerifyEmailData
): Promise<{ success: boolean; error?: string; accessToken?: string; attemptsRemaining?: number }> {
  try {
    const response = await authApi.verifyEmail(data);
    const { refreshToken, accessToken } = response;
    await setAuthCookies(accessToken, refreshToken);
    return { success: true, accessToken };
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    return {
      success: false,
      error:
        err.response?.data?.message || err.response?.data?.error || 'Email verification failed',
      attemptsRemaining: err.response?.data?.attemptsRemaining,
    };
  }
}
