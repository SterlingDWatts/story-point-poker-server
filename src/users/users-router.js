const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post("/", jsonBodyParser, async (req, res, next) => {
  const { password, email, name, role } = req.body;

  for (const field of ["email", "password", "name", "role"]) {
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
    }
  }

  const passwordError = UsersService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  try {
    const hasUserWithEmail = await UsersService.hasUserWithEmail(req.app.get("db"), email);
    if (hasUserWithEmail) {
      return res.status(400).json({ error: `Email already in use` });
    }

    const hashedPassword = await UsersService.hashPassword(password);
    const newUser = { email, password: hashedPassword, name, role, date_created: "now()" };

    const user = await UsersService.insertUser(req.app.get("db"), newUser);
    if (user) {
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(UsersService.serializeUser(user));
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
