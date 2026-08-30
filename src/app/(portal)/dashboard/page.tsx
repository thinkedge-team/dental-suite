import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Selamat datang, {session.user.name}
      </p>
      <pre className="mt-6 rounded-lg bg-zinc-900 p-4 text-xs text-zinc-100">
        {JSON.stringify(
          {
            role: session.user.role,
            organizationId: session.user.organizationId,
            branchId: session.user.branchId,
            email: session.user.email,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
