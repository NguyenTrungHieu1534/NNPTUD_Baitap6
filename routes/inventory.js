var express = require('express');
var router = express.Router();
const InventoryController = require('../controllers/inventoryController');

// GET /api/v1/inventory - Get all inventories (joined with product)
router.get('/', InventoryController.getAll);

// POST /api/v1/inventory/add-stock - Increase stock
router.post('/add-stock', InventoryController.addStock);

// POST /api/v1/inventory/remove-stock - Decrease stock
router.post('/remove-stock', InventoryController.removeStock);

// POST /api/v1/inventory/reservation - Reserve stock (decrease stock, increase reserved)
router.post('/reservation', InventoryController.reservation);

// POST /api/v1/inventory/sold - Mark as sold (decrease reserved, increase soldCount)
router.post('/sold', InventoryController.sold);

// GET /api/v1/inventory/product/:productId - Get inventory by product ID (joined with product)
router.get('/product/:productId', InventoryController.getByProductId);

// GET /api/v1/inventory/:id - Get inventory by its own _id (joined with product)
// Must be LAST to avoid catching named routes above
router.get('/:id', InventoryController.getById);

module.exports = router;