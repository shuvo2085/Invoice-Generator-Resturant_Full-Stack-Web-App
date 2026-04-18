const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/itemController');

router.get('/', ctrl.getAllItems);
router.post('/', ctrl.createItem);
router.get('/:id', ctrl.getItem);
router.put('/:id', ctrl.updateItem);
router.delete('/:id', ctrl.deleteItem);

module.exports = router;
