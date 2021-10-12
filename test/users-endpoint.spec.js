const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", () => {
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

  describe("POST /api/users", () => {
    context("User Validation", () => {
      beforeEach("insert user", () => {
        return helpers.seedUsers(db, testUsers);
      });

      requiredFields = ["email", "password", "name", "role"];

      for (const field of requiredFields) {
        const registerAttemptBody = {
          email: "test email",
          password: "test password",
          name: "test name",
          role: "Front End Dev"
        };

        it(`responds with 400 required error when '${field}' is missing.`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      }

      it("responds 400 'Password must be at least 8 characters' when password is too short.", () => {
        const userShortPassword = {
          email: "test email",
          password: "short",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userShortPassword)
          .expect(400, { error: "Password must be at least 8 characters" });
      });

      it("responds 400 'Password must be less than 72 characters' when password is too long.", () => {
        const userLongPassword = {
          email: "test email",
          password: new Array(73).fill("a").join(""),
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, { error: "Password must be less than 72 characters" });
      });

      it("responds 400 error when password starts with spaces", () => {
        const userPasswordStartsSpaces = {
          email: "test email",
          password: " 1Aa!2Bb@",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userPasswordStartsSpaces)
          .expect(400, { error: "Password must not start or end with empty spaces" });
      });

      it("responds 400 error when password ends with spaces", () => {
        const userPasswordEndsSpaces = {
          email: "test email",
          password: "1Aa!2Bb@ ",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userPasswordEndsSpaces)
          .expect(400, { error: "Password must not start or end with empty spaces" });
      });

      it("responds 400 error when password isn't complex enough", () => {
        const userPasswordNotComplex = {
          email: "test email",
          password: "11AAaabb",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userPasswordNotComplex)
          .expect(400, {
            error: "Password must contain one upper case, lower case, number, and special character"
          });
      });

      it("responds 400 error when password contains a space", () => {
        const userPasswordContainsSpace = {
          email: "test email",
          password: "11 Aa!2Bb@",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(userPasswordContainsSpace)
          .expect(400, { error: "Password must not contain empty spaces" });
      });

      it("responds 400 error when email is not unique", () => {
        const duplicateUser = {
          email: testUser.email,
          password: "11Aa!2Bb@",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, { error: "Email already in use" });
      });
    });

    context("Happy path", () => {
      it("responds 201, serialized user, storing bcryped password", () => {
        const newUser = {
          email: "test@test.gmail",
          password: "11Aa!2Bb@",
          name: "test name",
          role: "Front End Dev"
        };

        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body.name).to.eql(newUser.name);
            expect(res.body.role).to.eql(newUser.role);
            expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            const expectedDate = new Date().toLocaleString("en", { timeZone: "UTC" });
            const actualDate = new Date(res.body.date_created).toLocaleString("en", { timeZone: "UTC" });
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res => {
            db.from("poker_users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.email).to.eql(newUser.email);
                expect(row.name).to.eql(newUser.name);
                expect(row.role).to.eql(newUser.role);
                const expectedDate = new Date().toLocaleString("en", { timeZone: "UTC" });
                const actualDate = new Date(row.date_created).toLocaleString("en", { timeZone: "UTC" });
                expect(actualDate).to.eql(expectedDate);

                bcrypt.compare(newUser.password, row.password).then(compareMatch => {
                  expect(compareMatch).to.be.true;
                });
              });
          });
      });
    });
  });
});
