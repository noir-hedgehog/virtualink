import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PassportDashboard } from "@/components/passport/PassportDashboard";
import { sessionUserFromToken } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const cookieStore = await cookies();
  if (!sessionUserFromToken(cookieStore.get("virtualink_session")?.value)) {
    redirect("/");
  }
  return <PassportDashboard />;
}
