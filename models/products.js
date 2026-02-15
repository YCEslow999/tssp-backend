import mongoose from "mongoose";


const variantSchema = new mongoose.Schema({
    size_ml: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
}, { _id: false });


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        brand: String,
        price: Number,
        stock: Number,
        image_url: String,
        image: {
            type: String,
            default: ""
        },
        variants: [variantSchema],
        is_active: Boolean
    }
)

export default mongoose.model("products", productSchema);