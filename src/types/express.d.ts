export {};

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` after valid JWT. */
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}
