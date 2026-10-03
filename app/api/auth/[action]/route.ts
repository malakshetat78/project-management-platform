import { env } from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import { z } from 'zod';
import {safe,json,origin,stmt,one,db,uid,now,str,passwordHash,verify,currentUser,session,digest,requireUser,audit,equal,fail} from '@/lib/server';
export const dynamic='force-dynamic';
const password=z.string().min(12,'Use at least 12 characters').max(128);
export async function GET(req:Request){return safe(async()=>json({user:await currentUser(req)}));}
export async function POST(req:Request,{params}:any){return safe(async()=>{origin(req);const {action}=await params;const body=await req.json();
if(action==='login'){
 const b=z.object({login:str(254),password:z.string().min(1).max(128),remember:z.boolean().optional()}).parse(body);const login=b.login.toLowerCase();
 const rateId=await digest(`${req.headers.get('cf-connecting-ip')||'local'}:${login}`);const limit=await one('SELECT * FROM login_attempts WHERE id=?',rateId);if(limit&&limit.until>now()&&limit.count>=8)fail(429,'Too many attempts. Try again in 15 minutes.');
 const u=await one('SELECT * FROM users WHERE (lower(username)=? OR lower(email)=?) AND active=1',login,login);const valid=await verify(b.password,u?.password_hash||'dummy');
 if(!u||!valid){await stmt('INSERT INTO login_attempts (id,count,until) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN until<? THEN 1 ELSE count+1 END,until=excluded.until',rateId,new Date(Date.now()+900000).toISOString(),now()).run();fail(401,'Email/username or password is incorrect.');}
 await db().batch([stmt('DELETE FROM login_attempts WHERE id=?',rateId),audit(u,'Logged in','user',u.id,u.name)]);return json({ok:true},200,{'Set-Cookie':await session(u,b.remember,req)});
}
if(action==='logout'){const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('icvsp_session='))?.slice(14);if(token)await stmt('DELETE FROM sessions WHERE id=?',await digest(token)).run();return json({ok:true},200,{'Set-Cookie':'icvsp_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Secure'});}
if(action==='password'){const u=await requireUser(req);const b=z.object({current:z.string().max(128),password}).parse(body);const row=await one('SELECT password_hash FROM users WHERE id=?',u.id);if(!await verify(b.current,row.password_hash))fail(400,'Current password is incorrect');await db().batch([stmt('UPDATE users SET password_hash=?,must_change=0 WHERE id=?',await passwordHash(b.password),u.id),stmt('DELETE FROM sessions WHERE user_id=?',u.id),audit(u,'Changed password','user',u.id,u.name)]);return json({ok:true},200,{'Set-Cookie':await session(u,false,req)});}
if(action==='bootstrap'){
 const b=z.object({token:z.string().max(200).default(''),malakEmail:z.string().email(),shahyEmail:z.string().email(),malakPassword:password,shahyPassword:password}).parse(body);const expected=(env as any).BOOTSTRAP_TOKEN||'';
 const identity=await getChatGPTUser();const owner=(env as any).BOOTSTRAP_OWNER_EMAIL;const isOwner=!!owner&&identity?.email.toLowerCase()===String(owner).toLowerCase();if(!isOwner&&(!expected||!equal(b.token,expected)))fail(403,'Workspace activation is restricted to its owner');if(b.malakEmail.toLowerCase()===b.shahyEmail.toLowerCase())fail(400,'Use a different email for each admin');
 const settings=await one('SELECT * FROM project_settings WHERE id=?','project');if(settings?.bootstrapped)fail(409,'Admin accounts have already been activated');
 const malak=uid(),shahy=uid(),time=now();const [hash1,hash2]=await Promise.all([passwordHash(b.malakPassword),passwordHash(b.shahyPassword)]);
 const results=await db().batch([
 stmt('INSERT INTO project_settings (id,name,overview,phase,start_date,deadline,bootstrapped) VALUES (?,?,?,?,?,?,1)', 'project','Intelligent Connected Vehicle Safety Platform','A connected vehicle safety platform combining Edge AI, cooperative hazard verification, targeted driver alerts, and a separate AWS lakehouse for analytics.','Research & requirements','2026-09-01','2027-01-31'),
 stmt('INSERT INTO users (id,name,username,email,password_hash,role,active,locked_admin,created_at) VALUES (?,?,?,?,?, ?,1,1,?)',malak,'Malak','malak',b.malakEmail.toLowerCase(),hash1,'ADMIN',time),
 stmt('INSERT INTO users (id,name,username,email,password_hash,role,active,locked_admin,created_at) VALUES (?,?,?,?,?, ?,1,1,?)',shahy,'Shahy','shahy',b.shahyEmail.toLowerCase(),hash2,'ADMIN',time)
 ]);
 const u={id:malak,name:'Malak'};await audit(u,'Activated workspace','project','project','Admin accounts activated').run();return json({ok:true},200,{'Set-Cookie':await session(u,false,req)});
}
return json({error:'Unknown operation'},404);
});}
