const apiKeyMiddleware = (req, res, next) => {
  const configuredApiKey = process.env.API_KEY;

  // If API_KEY is not set, allow requests for local development
  if (!configuredApiKey) {
    return next();
  }

  const clientApiKey = req.headers['x-api-key'];

  if (!clientApiKey || clientApiKey !== configuredApiKey) {
    return res.status(401).json({
      valid: false,
      message: "Unauthorized"
    });
  }

  next();
};

module.exports = apiKeyMiddleware;
