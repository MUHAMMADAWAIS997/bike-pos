CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`model` text NOT NULL,
	`category` text DEFAULT 'E-Bike' NOT NULL,
	`color` text NOT NULL,
	`battery_type` text NOT NULL,
	`volt` text NOT NULL,
	`manufacturing_year` integer NOT NULL,
	`initial_quantity` integer DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`initial_discount` real DEFAULT 0 NOT NULL,
	`retail_price` real NOT NULL,
	`incentive` real,
	`others` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
