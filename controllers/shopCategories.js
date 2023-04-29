const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Categories = db.shop_categories;
// models

const getAll = async (req, res) => {
  try {
    const categories = await Categories.findAll({});
    return res.status(200).json({
      status: "success",
      categories,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addCategory = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { name } = req.body;
    const io = req.app.get("socketio");
    // Validate user input
    if (!name) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const category = await Categories.create({
      name,
      image: req.file.filename,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_SHOP_CATEGORY,
      data: category.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Category added successfull!",
      category: category.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { name, id } = req.body;
    // Validate user input
    if (!(name && id)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const category = await Categories.update(
      {
        name,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      Categories,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_SHOP_CATEGORY
    );
    return res.status(200).json({
      status: "success",
      msg: "Product Category updated successfull!",
      category,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params["id"];
    const io = req.app.get("socketio");
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const category = await Categories.destroy({ where: { id }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_SHOP_CATEGORY,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Category deleted successfull!",
      category,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { addCategory, getAll, updateCategory, deleteCategory };
