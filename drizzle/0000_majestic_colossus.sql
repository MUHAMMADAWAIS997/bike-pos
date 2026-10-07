CREATE TABLE `bikes` (
	`id` text PRIMARY KEY NOT NULL,
	`model_name` text NOT NULL,
	`sku` text NOT NULL,
	`partner_id` text,
	`cost_price` real NOT NULL,
	`selling_price` real NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'in_stock' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bikes_sku_unique` ON `bikes` (`sku`);--> statement-breakpoint
CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`color_key` text NOT NULL,
	`equity_share` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`bike_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bike_id`) REFERENCES `bikes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_number` text NOT NULL,
	`customer_name` text,
	`subtotal` real NOT NULL,
	`tax_amount` real NOT NULL,
	`total_amount` real NOT NULL,
	`partner_id` text,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_transaction_number_unique` ON `sales` (`transaction_number`);