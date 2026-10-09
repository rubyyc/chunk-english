import { MembershipStatus, Role, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import type { Viewer } from "@/lib/permission";

export async function getViewer(): Promise<Viewer> {
  const session = await readSession();
  if (!session) return { isAdmin: false, isMember: false };
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, role: true, status: true,
      memberships: { where: { status: MembershipStatus.ACTIVE, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: { id: true }, take: 1 },
    },
  });
  if (!user || user.status !== UserStatus.ACTIVE) return { isAdmin: false, isMember: false };
  return { id: user.id, isAdmin: user.role === Role.ADMIN, isMember: user.memberships.length > 0 };
}
