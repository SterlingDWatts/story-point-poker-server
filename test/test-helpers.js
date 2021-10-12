const bcrypt = require("bcryptjs");

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        poker_users
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE poker_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('poker_users_id_seq', 0)`)
        ])
      )
  );
}

function makeUsersArray() {
  return [
    {
      id: 1,
      name: "Bob",
      email: "bob@gmail.com",
      role: "Front End Dev",
      password: "aAbB1!2@"
    },
    {
      id: 2,
      name: "Joe",
      email: "joe@gmail.com",
      role: "Team Lead",
      password: "aAbB1!2@"
    },
    {
      id: 3,
      name: "Sally",
      email: "sally@gmail.com",
      role: "QAE",
      password: "aAbB1!2@"
    },
    {
      id: 4,
      name: "Sue",
      email: "sue@gmail.com",
      role: "Front End Dev",
      password: "aAbB1!2@"
    }
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("poker_users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('poker_users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

module.exports = {
  cleanTables,
  makeUsersArray,
  seedUsers
};
