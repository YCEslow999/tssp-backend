import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("categories", categorySchema);