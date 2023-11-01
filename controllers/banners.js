const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Banners = db.banners;
// models

const getAll = async (req, res) => {
  try {
    // const banners = await Banners.findAll({ where: { isActive: true } });
    const banners = await Banners.findAll({});
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
    const { url } = req.body;

    const banner = await Banners.create({
      url: url ? url : "",
      image: req.file.filename,
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
    const { url, id } = req.body;
    // Validate user input
    if (id === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const banner = await Banners.update(
      {
        url,
      },
      { where: { id } }
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
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const banner = await Banners.destroy({ where: { id }, force: true });

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
