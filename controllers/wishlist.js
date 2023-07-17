const { Op } = require("sequelize");
const db = require("../models");

// models
const Wishlist = db.wishlist;
const Products = db.products;
const ProductImages = db.product_images;
// models

const getAll = async (req, res) => {
  try {
    const products = [];
    const allWishes = await Wishlist.findAll({
      where: { userId: req.user.userId },
      order: [["id", "DESC"]],
    });

    for (let i = 0; i < allWishes.length; i++) {
      const prod = await Products.findOne({
        where: { pId: allWishes[i].dataValues.productId },
      });
      if (prod) {
        const images = await ProductImages.findAll({
          where: { productId: allWishes[i].dataValues.productId },
        });
        products.push({ ...prod.dataValues, images });
      }
    }

    return res.status(200).json({
      list: products,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addTowishList = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate user input
    if (!productId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const exists = await Wishlist.findOne({
      where: { productId, userId: req.user.userId },
    });

    if (exists) {
      return res.status(400).json({
        msg: "Product already exists from your wishlist",
      });
    }

    await Wishlist.create({ productId, userId: req.user.userId });
    return res.status(201).json({
      msg: "Product has been added to your wishlist!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const removeFromwishList = async (req, res) => {
  try {
    const productId = req.params["id"];

    // Validate user input
    if (!productId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    await Wishlist.destroy({
      where: { productId, userId: req.user.userId },
      force: true,
    });
    return res.status(201).json({
      msg: "Product has been added to your wishlist!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, addTowishList, removeFromwishList };
