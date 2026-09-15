import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "subscrr_token";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // No authentication cookie
  if (!token) {
    redirect("/login");
  }

  // Verify JWT
  const payload = await verifyToken(token);

  // Invalid / expired JWT
  if (!payload?.userId) {
    redirect("/login");
  }

  // User is authenticated
  return <>{children}</>;
}