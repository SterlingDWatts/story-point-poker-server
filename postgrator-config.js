require("dotenv").config();

module.exports = {
  migrationDirectory: "migrations",
  driver: "pg",
  password: "pass",
  connectionString: process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
  ssl: !!process.env.SSL
};
