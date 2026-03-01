const express = require('express');
const router = express.Router();
const maintController = require('../controllers/maintController');

router.get('/', maintController.getAllMaintenance);
router.post('/', maintController.addMaintenanceRecord);
router.get('/:assetId', maintController.getMaintenanceHistory);
router.put('/:id/status', maintController.updateStatus);

module.exports = router;
