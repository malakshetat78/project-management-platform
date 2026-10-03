import {safe,json,origin,requireUser} from '@/lib/server';
import {mutate} from '@/lib/mutations';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:any){return safe(async()=>{origin(req);const u=await requireUser(req);if(u.must_change)return json({error:'Change your temporary password first'},403);const {type}=await params;return json(await mutate(u,type,null,await req.json()),201);});}
