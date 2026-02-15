import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image_url: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

export default mongoose.model("brands", brandSchema);
