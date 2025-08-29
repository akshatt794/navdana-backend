require("dotenv").config();
const cloudinary = require('../utils/cloudinary');
const Product = require("../models/Product.js");
const Category = require("../models/Category.js");

const addProduct = async (req, res) => {

    try {
        const {
            name,
            description,
            category,
            price,
            stock,
            color,
            size,
        } = req.body;

        const ratings = {
            average: Number(req.body?.ratings?.average || 0),
            count: Number(req.body?.ratings?.count || 0),
        };

        console.log(req.body);
        let images = [];
        let imagesPublicId = [];
        if (req.files?.images && req.files.images.length > 0) {
            for (const file of req.files.images) {
                const result = await cloudinary.uploader.upload(file.path, {
                folder: "navdana/products/images"
                });

                images.push(result.secure_url);
                imagesPublicId.push(result.public_id,);
            }
        }

        const product = new Product({
            name,
            description,
            images,
            imagesPublicId,
            category,
            price,
            stock,
            ratings,
            color,
            size,
            created_at: new Date(),
            updated_at: new Date(),
        });

        const savedProduct = await product.save();

        res.status(201).json({
            status: true,
            message: "Product added successfully",
            data: savedProduct
        });
    } catch (error) {
        res.status(400).json({ status: false, error: error.message });
        console.log(error);
    }
};


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
                                  .populate("category")
                                  .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      status: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);
    console.log(product);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: false,
        message: "Invalid product ID format",
      });
    }

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // ----------- Handle Image Replacement ------------
    let newImages = [];
    let newPublicIds = [];

    if (req.files?.images && req.files.images.length > 0) {
      // Delete old images from Cloudinary
      if (product.imagesPublicId && product.imagesPublicId.length > 0) {
        for (const publicId of product.imagesPublicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Cloudinary deletion failed for:", publicId, err.message);
          }
        }
      }

      // Upload new images
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "navdana/products/images",
        });
        newImages.push(result.secure_url);
        newPublicIds.push(result.public_id);
      }
    } else {
      // keep old images if no new uploaded
      newImages = product.images;
      newPublicIds = product.imagesPublicId;
    }

    // ----------- Prepare Updated Data ------------
    const updatedData = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      category: req.body.categoryId || product.category,
      price: req.body.price || product.price,
      stock: req.body.stock || product.stock,
      ratings: {
        average: req.body.ratings?.average || product.ratings.average,
        count: req.body.ratings?.count || product.ratings.count,
      },
      color: req.body.color || product.color,
      size: req.body.size || product.size,
      images: newImages,
      imagesPublicId: newPublicIds,
    };

    // ----------- Update in DB ------------
    product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: false,
        message: "Invalid product ID format",
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.imagesPublicId && product.imagesPublicId.length > 0) {
      for (const publicId of product.imagesPublicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary deletion failed for:", publicId, err.message);
        }
      }
    }

    // Delete product from DB
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Product and its images deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };