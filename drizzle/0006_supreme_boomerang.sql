CREATE TABLE `stock_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`supplier_company` text NOT NULL,
	`batch_no` text NOT NULL,
	`initial_quantity` integer NOT NULL,
	`quantity` integer NOT NULL,
	`retail_price` real NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`cost_price` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_model_unique` ON `products` (`model`);