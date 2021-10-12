const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Auth Endpoints", () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("POST /api/auth/login", () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    const requiredFields = ["email", "password"];

    for (const field of requiredFields) {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    }

    it("responds 400 'Invalid email or password' when bad email", () => {
      const userInvalidEmail = { email: "invalid", password: testUser.password };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidEmail)
        .expect(400, { error: "Invalid email or password" });
    });

    it("responds 400 'Invalid email or password' when bad password", () => {
      const userInvalidPassword = {
        email: testUser.email,
        password: "invalid"
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidPassword)
        .expect(400, { error: "Invalid email or password" });
    });

    it("responds 200 and JWT auth token using secret when valid credentials", () => {
      const userValidCredentials = {
        email: testUser.email,
        password: testUser.password
      };
      console.log(process.env.JWT_SECRET, "test");
      const expectedToken = jwt.sign({ user_id: testUser.id }, process.env.JWT_SECRET, {
        subject: testUser.email,
        algorithm: "HS256"
      });
      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCredentials)
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});
