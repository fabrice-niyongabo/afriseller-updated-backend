const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const DeliveryFees = db.delivery_fees;
// models

const getAll = async (req, res) => {
  try {
    const fees = await DeliveryFees.findAll({});
    return res.status(200).json({
      status: "success",
      fees,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addFees = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { vehicleType, amountPerKilometer, defaultPrice } = req.body;

    // Validate user input
    if (!(vehicleType && amountPerKilometer && defaultPrice)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const fees = await DeliveryFees.create({
      vehicleType,
      amountPerKilometer,
      defaultPrice,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_DELIVERY_FEES,
      data: fees.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Fees added successfull!",
      fees: fees.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateFees = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { vehicleType, amountPerKilometer, defaultPrice, id } = req.body;
    // Validate user input
    if (!(vehicleType && amountPerKilometer && id && defaultPrice)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const fee = await DeliveryFees.update(
      {
        vehicleType,
        amountPerKilometer,
        defaultPrice,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      DeliveryFees,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_DELIVERY_FEES
    );
    return res.status(200).json({
      status: "success",
      msg: "Fees updated successfull!",
      fee,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteFee = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const fee = await DeliveryFees.destroy({ where: { id }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_DELIVERY_FEES,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Fee deleted successfull!",
      fee,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, updateFees, deleteFee, addFees };
