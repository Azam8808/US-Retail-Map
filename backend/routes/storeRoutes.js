const express = require('express');
const router = express.Router();
const storeService = require('../services/storeService');

router.get('/stores', async (req, res) => {
  try {
    const { neLat, neLng, swLat, swLng, zoom, brand, state, status } = req.query;

    const bounds = {
      ne: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
      sw: { lat: parseFloat(swLat), lng: parseFloat(swLng) }
    };

    const data = await storeService.getStores(bounds, parseInt(zoom), { brand, state, status });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
