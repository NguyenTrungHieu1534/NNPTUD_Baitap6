const Inventory = require('../schemas/inventory_model');

const InventoryController = {

    // GET /api/v1/inventory - Get all inventories joined with product info
    getAll: async (req, res) => {
        try {
            const data = await Inventory.find().populate('product');
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // GET /api/v1/inventory/:id - Get one inventory by inventory _id, joined with product
    getById: async (req, res) => {
        try {
            const data = await Inventory.findById(req.params.id).populate('product');
            if (!data) return res.status(404).json({ message: 'Không tìm thấy kho' });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // GET /api/v1/inventory/product/:productId - Get inventory by product _id, joined with product
    getByProductId: async (req, res) => {
        try {
            const data = await Inventory.findOne({ product: req.params.productId }).populate('product');
            if (!data) return res.status(404).json({ message: 'Không tìm thấy kho cho sản phẩm này' });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // POST /api/v1/inventory/add-stock
    // Body: { product: <productId>, quantity: <number> }
    // Tăng stock theo quantity
    addStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
            }
            const inventory = await Inventory.findOneAndUpdate(
                { product },
                { $inc: { stock: quantity } },
                { new: true }
            ).populate('product');
            if (!inventory) return res.status(404).json({ message: 'Không tìm thấy inventory cho sản phẩm này' });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // POST /api/v1/inventory/remove-stock
    // Body: { product: <productId>, quantity: <number> }
    // Giảm stock theo quantity (không được âm)
    removeStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
            }
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true }
            ).populate('product');
            if (!inventory) return res.status(400).json({ message: 'Không đủ tồn kho để trừ' });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // POST /api/v1/inventory/reservation
    // Body: { product: <productId>, quantity: <number> }
    // Giảm stock và tăng reserved
    reservation: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
            }
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } },
                { $inc: { stock: -quantity, reserved: quantity } },
                { new: true }
            ).populate('product');
            if (!inventory) return res.status(400).json({ message: 'Hết hàng, không thể đặt trước' });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // POST /api/v1/inventory/sold
    // Body: { product: <productId>, quantity: <number> }
    // Giảm reserved và tăng soldCount
    sold: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
            }
            const inventory = await Inventory.findOneAndUpdate(
                { product, reserved: { $gte: quantity } },
                { $inc: { reserved: -quantity, soldCount: quantity } },
                { new: true }
            ).populate('product');
            if (!inventory) return res.status(400).json({ message: 'Số lượng đặt trước không đủ' });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = InventoryController;
