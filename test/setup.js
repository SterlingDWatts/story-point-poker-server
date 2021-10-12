require("dotenv").config();
const { expect } = require("chai");
const supertest = require("supertest");

process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET;
process.env.JWT_EXPIRY = "3m";
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://sterling.watts@localhost/poker-test";

global.expect = expect;
global.supertest = supertest;
