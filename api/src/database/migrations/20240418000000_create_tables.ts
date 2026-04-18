import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.float("weight").notNullable();
    table.float("height").notNullable();
    table.integer("age").notNullable();
    table.string("gender").nullable();
    table.integer("water_goal_ml").notNullable();
    table.timestamps(true, true);
  }).createTable("intake_history", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
    table.integer("amount_ml").notNullable();
    table.timestamp("consumed_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("intake_history").dropTable("users");
}
