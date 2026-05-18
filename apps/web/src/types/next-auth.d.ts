import type { UserRole } from '@dazzling/types';

/**
 * Type augmentations for session/auth.
 * Extend this file when integrating NextAuth.js or a custom auth solution.
 */
declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

export {};
