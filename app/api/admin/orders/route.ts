import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET(){const auth=await requireAdmin();if(auth.response)return auth.response;const data=await prisma.order.findMany({include:{user:{select:{email:true,nickname:true}},plan:{select:{name:true,code:true}}},orderBy:{createdAt:"desc"},take:200});return NextResponse.json({data})}
