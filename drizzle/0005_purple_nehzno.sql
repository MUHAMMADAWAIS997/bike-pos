CREATE TABLE `stock_batch_items` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_model` text NOT NULL,
	`category` text NOT NULL,
	`quantity` integer NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`retail_price` real NOT NULL,
	`cost_price` real NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `stock_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_no` text NOT NULL,
	`supplier_company` text NOT NULL,
	`total_items` integer NOT NULL,
	`total_quantity` integer NOT NULL,
	`total_value` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
