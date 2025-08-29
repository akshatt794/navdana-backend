const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image:{
        type: String,
        default: ''
    },    
    image_public_id: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Banner', bannerSchema);
