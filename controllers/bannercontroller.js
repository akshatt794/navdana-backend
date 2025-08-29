require("dotenv").config();
const cloudinary = require('../utils/cloudinary');
const Banner = require("../models/Banner.js");

const addBanner = async (req, res) => {
    let imageUrl = "", imagePublicId = "";

    try {
        const {
            title
        } = req.body;

        console.log(req.body);
        if (req.files['image']) {
            const result = await cloudinary.uploader.upload(req.files['image'][0].path, {
                folder: "navdana/banner/image",
            });
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const banner = new Banner({
            title,
            image: imageUrl,
            image_public_id: imagePublicId,
        });

        const savedBanner = await banner.save();

        res.status(201).json({
            status: true,
            message: "Banner added successfully",
            data: savedBanner
        });
    } catch (error) {
        const idsToDelete = [imagePublicId].filter(Boolean);
        for (const id of idsToDelete) {
            try {
                await cloudinary.uploader.destroy(id);
            } catch (err) {
                console.error("Failed to rollback image:", id);
            }
        }
        res.status(400).json({ status: false, error: error.message });
    }
};

const getAllBanners = async (req, res) => {
    try {
        const responseBanners = await Banner.find().sort({ created_at: -1 });

        if (!responseBanners || responseBanners.length === 0) {
            return res.status(404).json({ status: false, message: "No banners found" });
        }

        return res.status(200).json({
            draw: "1",
            status: true,
            recordsTotal: responseBanners.length,
            recordsFiltered: responseBanners.length,
            data: responseBanners
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, message: err.message });
    }
};

const getBanner = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const responseBanner = await Banner.findById(id);

        if (!responseBanner) {
            return res.status(404).json({ message: "No banner found" });
        }

        return res.status(200).json({ status: true, data:responseBanner });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const updateBanner = async (req, res) => {
    let newImagePublicId = "";

    try {
        const { id } = req.params;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({ error: "The banner doesn't exist" });
        }

        const {
            title
        } = req.body;

        let imageUrl = existingBanner.image;

        if (req.files?.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: "navdana/banner/image"
            });
            imageUrl = result.secure_url;
            newImagePublicId = result.public_id;
            if (existingBanner.image_public_id) {
                await cloudinary.uploader.destroy(existingBanner.image_public_id);
            }
        }

        const updatedData = {
            title,
            image: imageUrl,
            image_public_id: newImagePublicId,
        };
        const updatedResponse = await Banner.findByIdAndUpdate(
            id,
            { $set: updatedData },
            {
                runValidators: true, // ensure schema validations run
                new: true,           // return the updated document
            }
        );

        res.status(200).json({ status: true, message: `Banner updated successfully.`, data: updatedResponse });
    } catch (err) {
        if (newImagePublicId) await cloudinary.uploader.destroy(newImagePublicId);
        // if (newOgImagePublicId) await cloudinary.uploader.destroy(newOgImagePublicId);

        res.status(500).json({ error: `Failed to update banner: ${err.message}` });
    }
};

const deleteBanner = async (req, res) => {
    try {
        console.log(req.params)
        const { id } = req.params;

        const responseBanner = await Banner.findOneAndDelete(id);
        if (!responseBanner) {
            return res.status(404).json({ message: "No banner found" });
        }

        const publicIds = [
            responseBanner.image_public_id,
        ];

        for (let publicId of publicIds) {
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                // console.log(`Deleted from Cloudinary: ${publicId}`);
            }
        }

        return res.status(200).json({ message: "Banner deleted successfully" });

    } catch (err) {
        // console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addBanner, getAllBanners, getBanner, updateBanner, deleteBanner };