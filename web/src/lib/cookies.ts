import { cookies } from "next/headers";

export const REFRESH_TOKEN_COOKIE = '_x_c_rt';
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export const ACCESS_TOKEN_COOKIE = '_x_c_at';
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

export const LOGGED_IN_COOKIE = 'loggedIn';

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
    sameSite: 'strict',
  });
  cookieStore.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
    sameSite: 'strict',
  });
  cookieStore.set({
    name: LOGGED_IN_COOKIE,
    value: 'true',
    httpOnly: false,
    path: '/',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export const deleteAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(LOGGED_IN_COOKIE);
}
