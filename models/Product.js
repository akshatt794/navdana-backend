const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: null
    },
    imagesPublicId: {
        type: [String],
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    ratings: {
        average: { type: Number, default: 0 }, // avg rating (1–5)
        count: { type: Number, default: 0 }, // number of reviews
    },
    color: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},
    {
        timestamps: true, // adds createdAt and updatedAt
    }
)

const Product = mongoose.model("product", productSchema);

module.exports = Product;