import { requireCEOAccess } from "@/lib/auth-utils";
import ClientManagementClient from "./ClientManagementClient";

export default async function ClientManagementPage() {
  // Server-side authentication and CEO authorization check
  const user = await requireCEOAccess();

  return <ClientManagementClient user={user} />;
}