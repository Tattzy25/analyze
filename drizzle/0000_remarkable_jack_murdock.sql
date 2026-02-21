CREATE TABLE "colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "colors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_colors" (
	"product_id" integer NOT NULL,
	"color_id" integer NOT NULL,
	CONSTRAINT "product_colors_product_id_color_id_pk" PRIMARY KEY("product_id","color_id")
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"product_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(10) NOT NULL,
	"handle" varchar(255),
	"filename" text NOT NULL,
	"image_url" text NOT NULL,
	"title" text NOT NULL,
	"short_description" text,
	"body_html" text,
	"generated_prompt" text,
	"mood" text,
	"style" text,
	"subject" text,
	"dimensions" text,
	"vendor" varchar(100) DEFAULT 'TaTTTy',
	"product_type" varchar(100) DEFAULT 'Digital Tattoo Art',
	"published" boolean DEFAULT true,
	"price" numeric(10, 2) DEFAULT '5.00',
	"seo_title" text,
	"seo_description" text,
	"image_alt_text" text,
	"shopify_synced" boolean DEFAULT false,
	"shopify_product_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "colors_name_idx" ON "colors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_colors_product_id_idx" ON "product_colors" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_colors_color_id_idx" ON "product_colors" USING btree ("color_id");--> statement-breakpoint
CREATE INDEX "product_tags_product_id_idx" ON "product_tags" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_tags_tag_id_idx" ON "product_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "handle_idx" ON "products" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "title_idx" ON "products" USING btree ("title");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");