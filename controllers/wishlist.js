const { Op } = require("sequelize");
const db = require("../models");

// models
const Wishlist = db.wishlist;
const Products = db.products;
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
        products.push(prod);
      }
    }

    return res.status(200).json({
      products,
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
      return res
        .status(400)
        .json({ msg: exists.name + " already exists from your wishlist" });
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
    const id = req.params["id"];

    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    await Wishlist.destroy({
      where: { id, userId: req.userId },
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
