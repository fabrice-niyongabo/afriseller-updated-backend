const { Op } = require("sequelize");
const db = require("../models");

// models
const Booking = db.booking;
const Products = db.products;
const ProductImages = db.product_images;
const Users = db.users;
// models

const getAll = async (req, res) => {
  try {
    const booking = [];
    const allBooking = await Booking.findAll({
      where: { userId: req.user.userId },
    });
    for (let i = 0; i < allBooking.length; i++) {
      const product = await Products.findOne({
        where: { pId: allBooking[i].dataValues.productId },
      });
      const images = await ProductImages.findAll({
        where: { productId: allBooking[i].dataValues.productId },
      });
      booking.push({
        ...allBooking[i].dataValues,
        product: { ...product.dataValues, images },
      });
    }
    return res.status(200).json({
      booking,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getMine = async (req, res) => {
  try {
    const shopId = req.params["id"];
    const booking = [];
    const allBooking = await Booking.findAll({
      where: { shopId },
    });
    for (let i = 0; i < allBooking.length; i++) {
      const product = await Products.findOne({
        where: { pId: allBooking[i].dataValues.productId },
      });
      const images = await ProductImages.findAll({
        where: { productId: allBooking[i].dataValues.productId },
      });
      const user = await Users.findOne({
        where: { userId: allBooking[i].dataValues.userId },
      });
      booking.push({
        ...allBooking[i].dataValues,
        product: { ...product.dataValues, images },
        user,
      });
    }
    return res.status(200).json({
      booking,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const dishes = await Booking.findAll({});
    return res.status(200).json({
      status: "success",
      dishes,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addBooking = async (req, res) => {
  try {
    const { quantity, from, to, description, productId, shippingCountry } =
      req.body;
    // Validate user input
    if (
      !(quantity && from && to && description && productId && shippingCountry)
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const prod = await Products.findOne({ where: { pId: productId } });

    if (!prod) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }

    const exists = await Booking.findOne({
      where: { quantity, from, to, description, productId },
    });
    if (exists) {
      return res.status(400).send({
        msg: "Product already booked",
      });
    }

    const book = await Booking.create({
      shippingCountry,
      quantity,
      from,
      to,
      description,
      productId,
      shopId: prod.shopId,
      userId: req.user.userId,
    });
    return res.status(201).json({
      status: "success",
      msg: "Product booked!",
      book,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { quantity, from, to, description, shippingCountry, id } = req.body;
    // Validate user input
    if (!(quantity && from && to && description && id && shippingCountry)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Booking.update(
      {
        quantity,
        from,
        to,
        description,
        shippingCountry,
      },
      { where: { id } }
    );
    return res.status(200).json({
      status: "success",
      msg: "Information updated successfull!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Booking.destroy({ where: { id }, force: true });

    return res.status(200).json({
      status: "success",
      msg: "Booking cancelled successfull!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  adminAll,
  addBooking,
  updateBooking,
  deleteBooking,
  getMine,
};
