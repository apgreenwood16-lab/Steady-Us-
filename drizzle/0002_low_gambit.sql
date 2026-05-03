ALTER TABLE `sharedPlans` ADD `milestoneTarget` text NOT NULL;--> statement-breakpoint
ALTER TABLE `sharedPlans` ADD `reviewDateMs` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `sharedPlans` ADD `triggerConditions` json NOT NULL;--> statement-breakpoint
ALTER TABLE `sharedPlans` ADD `partnerNote` text;