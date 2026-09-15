import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

const secret = new TextEncoder().encode(JWT_SECRET);

const COOKIE_NAME = "subscrr_token";

const TOKEN_EXPIRATION = "7d";

/**
 * Hash a user's password before storing it in MongoDB.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plain-text password with the stored password hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Create a signed JWT containing the user's ID.
 */
export async function createToken(userId: string): Promise<string> {
  return new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secret);
}

/**
 * Verify a JWT and return the user ID stored inside it.
 */
export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}

/**
 * Set the authentication cookie after successful login/register.
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

/**
 * Remove the authentication cookie during logout.
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Get the currently authenticated user's ID from a NextRequest.
 *
 * This is useful inside API route handlers.
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  return payload?.userId ?? null;
}