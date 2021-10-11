process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRY = "3m";
process.env.TEST_DATABSE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://example-test";

require("dotenv").config();
const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
