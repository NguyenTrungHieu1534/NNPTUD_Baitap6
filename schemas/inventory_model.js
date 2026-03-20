const mongoose = require('mongoose');

// Inventory Schema only - Product schema is defined in products.js
const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        unique: true
    },
    stock: { type: Number, min: 0, default: 0 },
    reserved: { type: Number, min: 0, default: 0 },
    soldCount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.inventory || mongoose.model('inventory', inventorySchema);
