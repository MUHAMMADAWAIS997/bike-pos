CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`mobile` text NOT NULL,
	`address` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `products` ADD `cost_price` real DEFAULT 0 NOT NULL;