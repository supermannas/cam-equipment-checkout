#!/usr/bin/env node

/**
 * Push the local Prisma schema to the CAM Equipment Checkout Neon database
 * and then attempt to seed it.
 *
 * Usage:
 *
 *   NEON_DATABASE_URL='postgresql://neondb_owner:REAL_PASSWORD@ep-young-lake-b813zvpt-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' \
 *   node scripts/push-neon-schema.js
 *
 * Run this from the project root containing package.json and prisma/schema.prisma.
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = process.cwd();
const PRISMA_SCHEMA = path.join(PROJECT_ROOT, "prisma", "schema.prisma");

function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      ...options.env,
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

// -----------------------------------------------------------------------------
// Validate project
// -----------------------------------------------------------------------------

if (!fs.existsSync(PRISMA_SCHEMA)) {
  fail(
    `Prisma schema not found at ${PRISMA_SCHEMA}. ` +
      "Run this script from the CAM Equipment Checkout project root."
  );
}

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  fail(
    "No database connection string supplied. Set NEON_DATABASE_URL " +
      "or DATABASE_URL before running this script."
  );
}

if (!databaseUrl.startsWith("postgresql://")) {
  fail("The supplied database URL does not appear to be a PostgreSQL URL.");
}

// Never print the connection string/password.
console.log("CAM Equipment Checkout - Neon Schema Setup");
console.log(`Project: ${PROJECT_ROOT}`);
console.log(`Schema:  ${PRISMA_SCHEMA}`);
console.log("Database URL: configured (credentials hidden)");

const env = {
  DATABASE_URL: databaseUrl,
};

// -----------------------------------------------------------------------------
// Push Prisma schema
// -----------------------------------------------------------------------------

console.log("\nPushing Prisma schema to Neon...");

const pushStatus = run(
  "npx",
  [
    "prisma",
    "db",
    "push",
    "--force-reset",
    "--skip-generate",
  ],
  { env }
);

if (pushStatus !== 0) {
  fail(`prisma db push failed with exit code ${pushStatus}.`);
}

console.log("\nPrisma schema successfully pushed to Neon.");

// -----------------------------------------------------------------------------
// Generate Prisma client
// -----------------------------------------------------------------------------

console.log("\nGenerating Prisma client...");

const generateStatus = run(
  "npx",
  ["prisma", "generate"],
  { env }
);

if (generateStatus !== 0) {
  fail(`prisma generate failed with exit code ${generateStatus}.`);
}

// -----------------------------------------------------------------------------
// Seed database
// -----------------------------------------------------------------------------

console.log("\nAttempting to seed the database...");

const seedStatus = run(
  "npx",
  ["prisma", "db", "seed"],
  { env }
);

if (seedStatus !== 0) {
  console.warn(
    "\nWARNING: Schema creation succeeded, but Prisma seeding did not."
  );
  console.warn(
    "Check package.json / prisma.config.ts for the project's Prisma seed configuration."
  );
  process.exitCode = 2;
} else {
  console.log("\nDatabase seed completed successfully.");
}

console.log("\nCAM Equipment Checkout database setup complete.");
