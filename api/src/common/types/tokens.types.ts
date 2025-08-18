export interface JwtPayloadBase {
  sub: string;
  tokenType: string;
}

// Access token payload
export interface AccessTokenPayload extends JwtPayloadBase {
  name: string;
  email: string;
  roles: string[];
  activePlan: string;
}

// Refresh token payload
export interface RefreshTokenPayload extends JwtPayloadBase {
  sid: string;
}

// Union type for both payload types
export type JwtPayload = AccessTokenPayload | RefreshTokenPayload;

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  roles: string[];
  activePlan: string;
}
