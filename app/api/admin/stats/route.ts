import { MembershipStatus, OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET(){const auth=await requireAdmin();if(auth.response)return auth.response;const now=new Date();const [users,members,published,paidOrders,redeemed,totalCodes,usedCodes]=await Promise.all([prisma.user.count(),prisma.membership.count({where:{status:MembershipStatus.ACTIVE,OR:[{expiresAt:null},{expiresAt:{gt:now}}]}}),prisma.episode.count({where:{published:true}}),prisma.order.count({where:{status:OrderStatus.PAID}}),prisma.order.count({where:{status:OrderStatus.PAID,payMethod:"REDEEM"}}),prisma.redeemCode.count(),prisma.redeemCode.count({where:{usedBy:{not:null}}})]);return NextResponse.json({data:{users,members,published,paidOrders,redeemed,totalCodes,usedCodes}})}
