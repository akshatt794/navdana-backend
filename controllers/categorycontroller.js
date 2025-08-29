require("dotenv").config();
const cloudinary = require('../utils/cloudinary');
const Category = require("../models/Category.js");
const { slugify } = require("../utils/createSlug.js");
const addCategory = async (req, res) => {
    let imageUrl = "", imagePublicId = "";

    try {
        const {
            name,
            slug,
            description,
            isActive
        } = req.body;

        console.log(req.body);
        const categorySlug = slug ? slugify(slug) : slugify(name);
        if (req.files['image']) {
            const result = await cloudinary.uploader.upload(req.files['image'][0].path, {
                folder: "navdana/categories/image",
            });
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const category = new Category({
            name,
            slug: categorySlug,
            description,
            image: imageUrl,
            image_public_id: imagePublicId,
            isActive,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const savedCategory = await category.save();

        res.status(201).json({
            status: true,
            message: "Category added successfully",
            data: savedCategory
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

const getAllCategories = async (req, res) => {
    try {
        const responseCategories = await Category.find().sort({ created_at: -1 });

        if (!responseCategories || responseCategories.length === 0) {
            return res.status(404).json({ status: false, message: "No categories found" });
        }

        // const data = await Promise.all(
        //     responseCategories.map(async (category, index) => {
        //         const parentId = category.parent_id;
        //         const categoryObject = category.toObject();

        //         if (parentId !== null) {
        //             const responseParentCategory = await Category.findOne({ id: parentId });
        //             categoryObject.parent = responseParentCategory;
        //         } else {
        //             categoryObject.parent = null;
        //         }

        //         categoryObject.DT_RowIndex = index;
        //         return categoryObject;
        //     })
        // );

        return res.status(200).json({
            draw: "1",
            status: true,
            recordsTotal: responseCategories.length,
            recordsFiltered: responseCategories.length,
            data: responseCategories
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, message: err.message });
    }
};

const getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log("Fetching category with ID:", id);
        console.log(id);
        const responseCategory = await Category.findById(id);

        if (!responseCategory) {
            return res.status(404).json({ message: "No category found" });
        }

        const categoryObject = responseCategory.toObject();

        return res.status(200).json({ status: true, category: categoryObject });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const updateCategory = async (req, res) => {
    let newImagePublicId = "";

    try {
        const { id } = req.params;

        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ error: "The category doesn't exist" });
        }

        const {
            name,
            slug,
            description,
            isActive
        } = req.body;

        let imageUrl = existingCategory.image;

        if (req.files?.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: "navdana/categories/image"
            });
            imageUrl = result.secure_url;
            newImagePublicId = result.public_id;
            if (existingCategory.image_public_id) {
                await cloudinary.uploader.destroy(existingCategory.image_public_id);
            }
        }

        const categorySlug = slug ? slugify(slug) : slugify(name);

        const updatedData = {
            name,
            slug: categorySlug,
            description,
            isActive,
            image: imageUrl,
            image_public_id: newImagePublicId || existingCategory.image_public_id,
            updated_at: Date.now()
        };
        const updatedResponse = await Category.findByIdAndUpdate(
            id,
            { $set: updatedData },
            {
                runValidators: true, // ensure schema validations run
                new: true,           // return the updated document
            }
        );

        res.status(200).json({ status: true, message: `Category updated successfully.`, data: updatedResponse });
    } catch (err) {
        if (newImagePublicId) await cloudinary.uploader.destroy(newImagePublicId);
        // if (newOgImagePublicId) await cloudinary.uploader.destroy(newOgImagePublicId);

        res.status(500).json({ error: `Failed to update category: ${err.message}` });
    }
};

const deleteCategory = async (req, res) => {
    try {
        console.log(req.params)
        const { id } = req.params;

        const responseCategory = await Category.findOneAndDelete(id);
        if (!responseCategory) {
            return res.status(404).json({ message: "No category found" });
        }

        const publicIds = [
            responseCategory.image_public_id,
        ];

        for (let publicId of publicIds) {
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                // console.log(`Deleted from Cloudinary: ${publicId}`);
            }
        }

        return res.status(200).json({ message: "Category deleted successfully" });

    } catch (err) {
        // console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addCategory, getAllCategories, getCategory, updateCategory, deleteCategory };