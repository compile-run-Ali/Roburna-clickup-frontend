import { requirePerformanceAccess } from "@/lib/auth-utils";
import PerformanceClient from "./PerformanceClient";

export default async function PerformancePage() {
  // Server-side authentication and authorization check
  const user = await requirePerformanceAccess();

  return <PerformanceClient user={user} />;
}