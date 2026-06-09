const express = require('express');
const router = express.Router();
const cccdService = require('../services/cccd.service');
const apiKeyMiddleware = require('../middlewares/apiKey.middleware');

/**
 * POST /api/cccd/check
 * Validates the CCCD format and returns structural metadata.
 */
router.post('/check', apiKeyMiddleware, (req, res) => {
  const { cccd } = req.body;
  
  // Validate using the CCCD service
  const result = cccdService.validateCCCD(cccd);

  if (!result.valid) {
    // Return HTTP 400 Bad Request for format validation failures
    return res.status(400).json(result);
  }

  // Return HTTP 200 OK for successful validation
  return res.json(result);
});

module.exports = router;
