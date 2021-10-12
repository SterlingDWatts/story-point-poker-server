const express = require("express");
const AuthService = require("./auth-service");

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post("/login", jsonBodyParser, async (req, res, next) => {
  const { email, password } = req.body;
  const loginUser = { email, password };

  for (const [key, value] of Object.entries(loginUser)) {
    if (!value) {
      return res.status(400).json({ error: `Missing '${key}' in request body` });
    }
  }

  try {
    const dbUser = await AuthService.getUserWithEmail(req.app.get("db"), email);
    if (!dbUser) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await AuthService.comparePasswords(password, dbUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const sub = dbUser.email;
    const payload = { user_id: dbUser.id };
    res.send({
      authToken: AuthService.createJwt(sub, payload)
    });
  } catch (error) {
    next(error);
  }
  res.status(200).send();
});

module.exports = authRouter;
