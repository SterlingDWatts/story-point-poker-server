const AuthService = require("../auth/auth-service");

const requireAuth = async (req, res, next) => {
  const authToken = req.get("Authorization") || "";

  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    const bearerToken = authToken.slice(7, authToken.length);
    const payload = AuthService.verifyJwt(bearerToken);

    const user = await AuthService.getUser(req.app.get("db"), payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized request" });
  }
};

module.exports = {
  requireAuth
};
