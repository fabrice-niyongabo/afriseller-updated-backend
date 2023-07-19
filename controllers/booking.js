const { Op } = require("sequelize");
const db = require("../models");

// models
const Booking = db.booking;
const Products = db.products;
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
      booking.push({ ...allBooking[i].dataValues, product });
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
    const { quantity, from, to, description, productId } = req.body;
    // Validate user input
    if (!(quantity && from && to && description && productId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
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
      quantity,
      from,
      to,
      description,
      productId,
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
    const io = req.app.get("socketio");
    const { quantity, from, to, description, id } = req.body;
    // Validate user input
    if (!(quantity && from && to && description && id)) {
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
};
