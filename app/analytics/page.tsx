import {headers} from 'next/headers';
import {currentUser} from '@/lib/server';
import Workspace from '@/components/workspace';
export const dynamic='force-dynamic';
export default async function Page(){const h=await headers();const user=await currentUser(new Request('https://workspace.invalid',{headers:new Headers(h)}));if(user&&user.role!=='ADMIN')return <main className="denied"><h1>Access Denied</h1><p>This page is only available to workspace administrators.</p><a href="/">Return to dashboard</a></main>;return <Workspace/>;}
