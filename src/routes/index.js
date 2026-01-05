const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API Preventiva Habilitacion — servicio activo' });
});

module.exports = router;
