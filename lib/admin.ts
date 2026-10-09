import { NextResponse } from "next/server";
import { getViewer } from "@/lib/viewer";
export async function requireAdmin(){const viewer=await getViewer();if(!viewer.isAdmin)return {viewer:null,response:NextResponse.json({error:"需要管理员权限。"},{status:403})};return {viewer,response:null};}
