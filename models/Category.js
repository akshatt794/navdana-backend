const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String, // Store image URL or path
        default: ''
    },
    image_public_id: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true
    },
})

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;