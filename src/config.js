module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN || "0737341d-7ee1-4af7-ad62-800cad6208d4",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://pleaseUpdateMe",
  JWT_SECRET: process.env.JWT_SECRET || "41f3fd9e-edd6-484e-b92e-ee0d5bb97769",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "5h"
};
