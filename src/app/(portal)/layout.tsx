import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/portal/sidebar";
import { PortalHeader } from "@/components/portal/header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get("portal_branch")?.value;

  const branches = await prisma.branch.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans flex-col md:flex-row">
      <Sidebar 
        user={{
          name: session.user.name,
          role: session.user.role,
          branchName: session.user.branchName,
        }}
        modules={session.user.modules}
      />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <PortalHeader
          organizationName={session.user.organizationName}
          branchName={session.user.branchName}
          role={session.user.role}
          userName={session.user.name}
          branches={branches}
          initialBranchId={activeBranchCookie}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}


