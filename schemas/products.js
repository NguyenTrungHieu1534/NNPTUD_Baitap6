let mongoose = require('mongoose');
const Inventory = require('./inventory_model')
let productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        price: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ""
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
            required: true
        },
        images: {
            type: [String],
            default: ["https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png"]
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
    timestamps: true
})

productSchema.post('save', async function (doc) {
    try {
        await Inventory.create({
            product: doc._id,
            stock: 0,
            reserved: 0,
            soldCount: 0
        });
        console.log(`Đã tạo kho cho sản phẩm: ${doc.title}`);
    } catch (error) {
        console.error("Lỗi tạo Inventory:", error.message);
    }
});
module.exports = mongoose.models.product || mongoose.model('product', productSchema);