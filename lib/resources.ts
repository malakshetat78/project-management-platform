import {z} from 'zod';
import {str,optionalText,date,reference} from './server';
const task=z.object({title:str(240),description:optionalText(),assignee_id:reference,start_date:date,deadline:date,duration:z.coerce.number().min(.25).max(10000),priority:z.enum(['Low','Medium','High','Critical']),status:z.enum(['To Do','In Progress','Blocked','Completed','Delayed']),progress:z.coerce.number().int().min(0).max(100),delay_reason:optionalText(),result:optionalText(),week_id:reference,month_id:reference,milestone_id:reference,stage_id:reference});
export const resources:Record<string,{table:string,schema:any,admin:boolean,dates?:boolean}>={
 tasks:{table:'tasks',schema:task,admin:true,dates:true},
 weeks:{table:'weekly_plans',schema:z.object({title:str(200),goal:optionalText(),start_date:date,deadline:date,month_id:reference}),admin:true,dates:true},
 months:{table:'monthly_plans',schema:z.object({title:str(200),goal:str(12000),start_date:date,deadline:date,stage_id:reference}),admin:true,dates:true},
 milestones:{table:'milestones',schema:z.object({title:str(240),description:optionalText(),deadline:date,month_id:reference,stage_id:reference,status:z.enum(['Planned','In Progress','Completed','Delayed'])}),admin:true},
 stages:{table:'stages',schema:z.object({title:str(200),description:optionalText(),position:z.coerce.number().int().min(1).max(100),status:z.enum(['Planned','In Progress','Completed','Delayed'])}),admin:true},
 meetings:{table:'meetings',schema:z.object({title:str(240),date:z.string().min(10).max(30).refine(v=>!isNaN(Date.parse(v))),agenda:optionalText(),discussion:optionalText(),decisions:optionalText(),problems:optionalText(),next_meeting:z.string().max(30).nullable().optional(),milestone_id:reference,stage_id:reference}),admin:true},
 actions:{table:'meeting_actions',schema:z.object({meeting_id:z.string().uuid(),title:str(500),assignee_id:reference,deadline:date,status:z.enum(['To Do','In Progress','Completed'])}),admin:true},
 updates:{table:'weekly_updates',schema:z.object({week_id:z.string().uuid(),task_id:reference,description:str(12000)}),admin:false},
 reviews:{table:'weekly_reviews',schema:z.object({week_id:z.string().uuid(),lessons:optionalText(),delay_reason:optionalText(),carry_forward:optionalText()}),admin:true},
 comments:{table:'comments',schema:z.object({task_id:z.string().uuid(),body:str(12000)}),admin:false},
 settings:{table:'project_settings',schema:z.object({name:str(240),overview:optionalText(),phase:str(200),start_date:date,deadline:date}),admin:true,dates:true},
};
