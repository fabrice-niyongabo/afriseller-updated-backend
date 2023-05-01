const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const ProductImages = db.product_images;
// models

const addImage = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const productImage = await ProductImages.create({
      productId,
      image: req.file.filename,
    });
    return res.status(201).json({
      status: "success",
      msg: "Image added successfull!",
      productImage: productImage.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const id = req.params["id"];
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const productImage = await ProductImages.destroy({
      where: { id },
      force: true,
    });

    return res.status(200).json({
      status: "success",
      msg: "image deleted successfull!",
      productImage,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { addImage, deleteProductImage };
