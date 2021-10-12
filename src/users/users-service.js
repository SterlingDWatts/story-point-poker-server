const bcrypt = require("bcryptjs");
const xss = require("xss");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  hasUserWithEmail(db, email) {
    return db("poker_users")
      .where({ email })
      .first()
      .then(user => !!user);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("poker_users")
      .returning("*")
      .then(([user]) => user);
  },

  serializeUser(user) {
    const { id, name, email, role, date_created } = user;

    return {
      id,
      name: xss(name),
      email: xss(email),
      role: xss(role),
      date_created: new Date(date_created)
    };
  },

  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    } else if (password.length > 72) {
      return "Password must be less than 72 characters";
    } else if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    } else if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain one upper case, lower case, number, and special character";
    } else if (password.includes(" ")) {
      return "Password must not contain empty spaces";
    }
    return null;
  }
};

module.exports = UsersService;
