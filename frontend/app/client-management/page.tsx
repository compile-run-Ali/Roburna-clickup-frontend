import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import ClientManagementClient from "./ClientManagementClient";

export default async function ClientManagementPage() {
  // Server-side authentication check
  const user = await requireAuth();
  
  // Check if user has permission to access client management
  const canAccessClients = user.role.toLowerCase() === "ceo" || user.role.toLowerCase() === "manager";
  
  if (!canAccessClients) {
    redirect("/unauthorized");
  }

  return <ClientManagementClient user={user} />;
}