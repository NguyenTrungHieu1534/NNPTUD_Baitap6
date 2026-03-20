const Inventory = require('../schemas/inventory_model');

const InventoryController = {
    getAll: async (req, res) => {
        try {
            const data = await (Inventory.find().populate('product'));
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const data = await Inventory.findById(req.params.id).populate('product');
            if (!data) return res.status(404).json({ message: "Không tìm thấy kho" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            const inventory = await Inventory.findOneAndUpdate(
                { product },
                { $inc: { stock: quantity } },
                { new: true, upsert: true }
            );
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    removeStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true }
            );
            if (!inventory) return res.status(400).json({ message: "Không đủ tồn kho để trừ" });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    reservation: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } },
                { $inc: { stock: -quantity, reserved: quantity } },
                { new: true }
            );
            if (!inventory) return res.status(400).json({ message: "Hết hàng, không thể đặt trước" });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    sold: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            const inventory = await Inventory.findOneAndUpdate(
                { product, reserved: { $gte: quantity } },
                { $inc: { reserved: -quantity, soldCount: quantity } },
                { new: true }
            );
            if (!inventory) return res.status(400).json({ message: "Số lượng đặt trước không khớp" });
            res.status(200).json(inventory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};


module.exports = InventoryController;