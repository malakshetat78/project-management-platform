import { env } from 'cloudflare:workers';
import { z } from 'zod';
export function db():D1Database {const binding=(env as any).DB;if(!binding)throw new Error('Database unavailable');return binding;}
export function bucket():R2Bucket {const binding=(env as any).BUCKET;if(!binding)throw new Error('File storage unavailable');return binding;}
export const now=()=>new Date().toISOString();
export const uid=()=>crypto.randomUUID();
export const stmt=(sql:string,...args:any[])=>db().prepare(sql).bind(...args);
export const all=async(sql:string,...args:any[])=>(await stmt(sql,...args).all()).results as any[];
export const one=async(sql:string,...args:any[])=>await stmt(sql,...args).first<any>();
export function fail(status:number,message:string):never {throw Object.assign(new Error(message),{status});}
export function json(data:any,status=200,headers:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
export async function safe(fn:()=>Promise<Response>){try{return await fn();}catch(e:any){if(e instanceof z.ZodError)return json({error:e.issues.map((i:any)=>`${i.path.join('.')}: ${i.message}`).join('; ')},400);if(!e.status)console.error('Workspace request failed',e);return json({error:e.status?e.message:'The workspace is temporarily unavailable. Please try again.'},e.status||503);}}
export function origin(req:Request){const requestOrigin=req.headers.get('origin');if(!requestOrigin||requestOrigin!==new URL(req.url).origin)fail(403,'Invalid request origin');}
export const str=(max=500)=>z.string().trim().min(1).max(max);
export const optionalText=(max=12000)=>z.string().max(max).default('');
export const reference=z.string().uuid().nullable().optional();
export const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v)),'Invalid date');
export async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('');}
export function secretToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function passwordHash(password:string,salt=secretToken()){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);return `pbkdf2$100000$${salt}$${Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('')}`;}
export async function verify(password:string,hash:string){const parts=hash.split('$');const candidate=await passwordHash(password,parts.length===4?parts[2]:'dummy');return parts.length===4&&equal(candidate,hash);}
export function equal(a:string,b:string){let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0;}
export async function currentUser(req:Request){const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('icvsp_session='))?.slice(14);if(!token)return null;return await one('SELECT u.id,u.name,u.username,u.email,u.role,u.avatar,u.must_change,u.locked_admin,u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND u.active=1',await digest(token),now());}
export async function requireUser(req:Request,admin=false){const u=await currentUser(req);if(!u)fail(401,'Please log in');if(admin&&u.role!=='ADMIN')fail(403,'Access Denied');return u;}
export async function session(u:any,remember=false,request?:Request){const token=secretToken(),time=now(),days=remember?30:1;await stmt('INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)',await digest(token),u.id,new Date(Date.now()+days*86400000).toISOString(),time).run();return `icvsp_session=${token}; HttpOnly; SameSite=Strict; Path=/; ${request&&new URL(request.url).protocol==='http:'?'':'Secure; '}${remember?'Max-Age='+days*86400+'; ':''}`;}
export function audit(u:any,action:string,type:string,id:string,title:string,details=''){return stmt('INSERT INTO activity_logs (id,actor_id,action,object_type,object_id,title,details,created_at) VALUES (?,?,?,?,?,?,?,?)',uid(),u.id,action,type,id,title,details,now());}
export function notify(userId:string,title:string,type:string,id:string){return stmt('INSERT INTO notifications (id,user_id,title,object_type,object_id,created_at) VALUES (?,?,?,?,?,?)',uid(),userId,title,type,id,now());}
export async function taskAccess(u:any,id:string,write=false){const t=await one('SELECT * FROM tasks WHERE id=? AND deleted_at IS NULL',id);if(!t)fail(404,'Task not found');if(write&&u.role!=='ADMIN'&&t.assignee_id!==u.id)fail(403,'You can update only your own assigned tasks');return t;}
