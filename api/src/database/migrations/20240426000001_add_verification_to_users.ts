import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.boolean("is_verified").defaultTo(false);
    table.string("verification_code").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("is_verified");
    table.dropColumn("verification_code");
  });
}
