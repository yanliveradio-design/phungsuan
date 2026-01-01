// If you need to udpate this type, make sure to also update
// components/ProtectedRoute
// endpoints/auth/login_with_password_POST
// endpoints/auth/register_with_password_POST
// endpoints/auth/session_GET
// helpers/getServerUserSession
// together with this in one toolcall.

import { AdminRole } from "./schema";

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
  adminRole: AdminRole | null;
  // Optional fields from the database schema
  province?: string | null;
  district?: string | null;
  isTrustedMember?: boolean;
  isActive?: boolean;
}