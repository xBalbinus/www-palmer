/**
 * XORS API Client
 * Handles communication with the XORS user management API
 */

const XORS_API_URL = process.env.XORS_API_URL || "https://api.xors.app";

interface XORSUser {
  id: string;
  email: string;
  key: string;
  level: string;
  verified: number;
}

interface CreateUserResponse {
  user: XORSUser;
  existing: boolean;
  emailed?: boolean;
}

interface AuthenticateResponse {
  user: XORSUser;
  existing: boolean;
}

export class XORSAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "XORSAPIError";
  }
}

/**
 * Create a new user in the XORS system
 * This is called when Palmer adds a new client
 */
export async function createXORSUser(
  email: string,
  password: string
): Promise<CreateUserResponse> {
  const response = await fetch(`${XORS_API_URL}/api/users/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      source: "coachpalmer.org",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new XORSAPIError(response.status, error.message || "Failed to create user");
  }

  return response.json();
}

/**
 * Verify a user's credentials
 * Used for client login
 */
export async function authenticateXORSUser(
  email: string,
  password: string
): Promise<AuthenticateResponse> {
  const response = await fetch(`${XORS_API_URL}/api/users/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      source: "coachpalmer.org",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new XORSAPIError(response.status, error.message || "Authentication failed");
  }

  return response.json();
}

/**
 * Generate a secure random password for new clients
 */
export function generateClientPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + "!";
}

