const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Markets = db.markets;
// models

const getAll = async (req, res) => {
  try {
    const markets = await Markets.findAll({ where: { isActive: true } });
    return res.status(200).json({
      status: "success",
      markets,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const markets = await Markets.findAll({});
    return res.status(200).json({
      status: "success",
      markets,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addMarket = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const io = req.app.get("socketio");
    const { name, address, lat, long, bikeMaximumKm, open, close } = req.body;

    // Validate user input
    if (!(name && address && lat && long && open && close)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const market = await Markets.create({
      name,
      address,
      lat,
      long,
      image: req.file.filename,
      bikeMaximumKm,
      open,
      close,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_MARKET,
      data: market.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Market registered successfull!",
      market: market.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateMarket = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const {
      name,
      address,
      lat,
      long,
      isActive,
      open,
      close,
      mId,
      bikeMaximumKm,
    } = req.body;
    // Validate user input
    if (!(name && address && lat && long && isActive && mId && open && close)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const market = await Markets.update(
      {
        name,
        address,
        lat,
        long,
        isActive,
        bikeMaximumKm,
        open,
        close,
      },
      { where: { mId } }
    );
    await handleSocketDataUpdate(
      { where: { mId } },
      Markets,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_MARKET
    );
    return res.status(200).json({
      status: "success",
      msg: "Market updated successfull!",
      market,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteMarket = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const mId = req.params["id"];
    // Validate user input
    if (!mId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const market = await Markets.destroy({ where: { mId }, force: true });
    if (market) {
      io.emit(eventNamesEnum.CyizereEventNames, {
        type: eventNamesEnum.DELETE_MARKET,
        data: { mId },
      });
    }
    return res.status(200).json({
      status: "success",
      msg: "Market deleted successfull!",
      market,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { addMarket, getAll, adminAll, updateMarket, deleteMarket };
