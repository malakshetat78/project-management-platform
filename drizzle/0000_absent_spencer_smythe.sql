CREATE TABLE `meeting_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`title` text NOT NULL,
	`assignee_id` text,
	`deadline` text NOT NULL,
	`status` text DEFAULT 'To Do' NOT NULL,
	`task_id` text,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`title` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activity_object` ON `activity_logs` (`object_type`,`object_id`);--> statement-breakpoint
CREATE TABLE `meeting_attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`category` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`family_id` text NOT NULL,
	`author_id` text NOT NULL,
	`task_id` text,
	`week_id` text,
	`milestone_id` text,
	`stage_id` text,
	`meeting_id` text,
	`review_id` text,
	`update_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`week_id`) REFERENCES `weekly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`review_id`) REFERENCES `weekly_reviews`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`update_id`) REFERENCES `weekly_updates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`until` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`agenda` text DEFAULT '' NOT NULL,
	`discussion` text DEFAULT '' NOT NULL,
	`decisions` text DEFAULT '' NOT NULL,
	`problems` text DEFAULT '' NOT NULL,
	`next_meeting` text,
	`milestone_id` text,
	`stage_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`deadline` text NOT NULL,
	`month_id` text,
	`stage_id` text,
	`status` text DEFAULT 'Planned' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`month_id`) REFERENCES `monthly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `monthly_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`goal` text NOT NULL,
	`start_date` text NOT NULL,
	`deadline` text NOT NULL,
	`stage_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notifications_user` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `weekly_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`week_id` text NOT NULL,
	`author_id` text NOT NULL,
	`lessons` text DEFAULT '' NOT NULL,
	`delay_reason` text DEFAULT '' NOT NULL,
	`carry_forward` text DEFAULT '' NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`week_id`) REFERENCES `weekly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `project_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`overview` text DEFAULT '' NOT NULL,
	`phase` text DEFAULT 'Research & planning' NOT NULL,
	`start_date` text NOT NULL,
	`deadline` text NOT NULL,
	`bootstrapped` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`position` integer NOT NULL,
	`status` text DEFAULT 'Planned' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`assignee_id` text,
	`start_date` text NOT NULL,
	`deadline` text NOT NULL,
	`duration` real DEFAULT 1 NOT NULL,
	`priority` text DEFAULT 'Medium' NOT NULL,
	`status` text DEFAULT 'To Do' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`delay_reason` text DEFAULT '' NOT NULL,
	`result` text DEFAULT '' NOT NULL,
	`week_id` text,
	`month_id` text,
	`milestone_id` text,
	`stage_id` text,
	`completed_at` text,
	`deleted_at` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`week_id`) REFERENCES `weekly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`month_id`) REFERENCES `monthly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tasks_assignee` ON `tasks` (`assignee_id`);--> statement-breakpoint
CREATE INDEX `tasks_week` ON `tasks` (`week_id`);--> statement-breakpoint
CREATE INDEX `tasks_deadline` ON `tasks` (`deadline`);--> statement-breakpoint
CREATE TABLE `weekly_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`week_id` text NOT NULL,
	`task_id` text,
	`description` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`week_id`) REFERENCES `weekly_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`locked_admin` integer DEFAULT 0 NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`must_change` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `weekly_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`start_date` text NOT NULL,
	`deadline` text NOT NULL,
	`month_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`month_id`) REFERENCES `monthly_plans`(`id`) ON UPDATE no action ON DELETE no action
);
