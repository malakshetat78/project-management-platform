import { downloadDocument } from '@/lib/supabase-storage';
import {safe,requireUser,one,fail} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:any){return safe(async()=>{await requireUser(req);const {id}=await params;const d=await one('SELECT * FROM documents WHERE id=?',id);if(!d)fail(404,'Document not found');const body=await downloadDocument(d.object_key);if(!body)fail(404,'File unavailable');return new Response(body,{headers:{'Content-Type':d.mime,'Content-Disposition':`attachment; filename="${d.name.replace(/["\r\n]/g,'_')}"; filename*=UTF-8''${encodeURIComponent(d.name)}`,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}});});}
