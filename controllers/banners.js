const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Banners = db.banners;
// models

const getAll = async (req, res) => {
  try {
    const banners = await Banners.findAll({ where: { isActive: true } });
    return res.status(200).json({
      banners,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addBanner = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const io = req.app.get("socketio");
    const { urlOrComponentValue, hasUrl, hasScreenComponent } = req.body;

    // Validate user input
    if (hasUrl === undefined || hasScreenComponent === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const banner = await Banners.create({
      hasUrl,
      hasScreenComponent,
      urlOrComponentValue: urlOrComponentValue ? urlOrComponentValue : "",
      image: req.file.filename,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_BANNERS,
      data: banner.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Banner added successfull!",
      banner: banner.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateBanner = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { urlOrComponentValue, hasUrl, hasScreenComponent, isActive, id } =
      req.body;
    // Validate user input
    if (
      hasUrl === undefined ||
      hasScreenComponent === undefined ||
      urlOrComponentValue === undefined ||
      isActive === undefined ||
      id === undefined
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const banner = await Banners.update(
      {
        urlOrComponentValue,
        hasUrl,
        hasScreenComponent,
        isActive,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      Banners,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_BANNERS
    );
    return res.status(200).json({
      status: "success",
      msg: "Banner updated successfull!",
      banner,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteBanner = async (req, res) => {
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
    const banner = await Banners.destroy({ where: { id }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_BANNERS,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Banner deleted successfull!",
      banner,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { addBanner, getAll, updateBanner, deleteBanner };
