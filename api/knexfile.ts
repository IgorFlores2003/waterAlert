import type { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL as string,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL as string,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: "./dist/src/database/migrations",
      extension: "js",
    },
  },
};

export default config;
