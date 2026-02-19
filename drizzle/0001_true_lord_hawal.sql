CREATE TABLE `ai_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256),
	`messages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`version` varchar(64),
	`environment` enum('production','staging','development') NOT NULL DEFAULT 'development',
	`status` enum('pending','building','deploying','success','failed','rolled_back') NOT NULL DEFAULT 'pending',
	`triggeredBy` varchar(128),
	`commitHash` varchar(64),
	`commitMessage` text,
	`duration` int,
	`logs` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`language` varchar(64),
	`framework` varchar(64),
	`category` varchar(64),
	`features` json,
	`popularity` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`category` varchar(64),
	`version` varchar(32) DEFAULT '1.0.0',
	`enabled` boolean NOT NULL DEFAULT false,
	`config` json,
	`author` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`),
	CONSTRAINT `plugins_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`owner` varchar(128),
	`team` varchar(128),
	`language` varchar(64),
	`framework` varchar(64),
	`repoUrl` varchar(512),
	`status` enum('healthy','degraded','down','unknown') NOT NULL DEFAULT 'unknown',
	`tier` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
