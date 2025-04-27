const express = require('express');
const router = express.Router();

// Example of how you might store the setting (in-memory or database)
let recaptchaEnabled = true;  // Default is 'enabled'

// Admin API to toggle reCAPTCHA
router.post('/api/admin/toggle-recaptcha', (req, res) => {
  const { isEnabled } = req.body;
  
  // Only allow admin users to toggle reCAPTCHA
  if (req.user && req.user.role === 'admin') {
    recaptchaEnabled = isEnabled;
    return res.json({ success: true, recaptchaEnabled });
  }

  return res.status(403).json({ success: false, message: 'Access denied' });
});

// Endpoint to get the current reCAPTCHA setting
router.get('/api/get-recaptcha-status', (req, res) => {
  res.json({ recaptchaEnabled });
});

module.exports = router;