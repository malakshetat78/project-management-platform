import {safe,json,origin,requireUser} from '@/lib/server';
import {mutate,remove} from '@/lib/mutations';
export const dynamic='force-dynamic';
export async function PATCH(req:Request,{params}:any){return safe(async()=>{origin(req);const u=await requireUser(req);if(u.must_change)return json({error:'Change your temporary password first'},403);const {type,id}=await params;return json(await mutate(u,type,id,await req.json()));});}
export async function DELETE(req:Request,{params}:any){return safe(async()=>{origin(req);const u=await requireUser(req,true);const {type,id}=await params;return json(await remove(u,type,id));});}
