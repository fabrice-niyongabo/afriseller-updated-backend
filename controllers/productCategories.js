const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Categories = db.product_categories;
const SubCategories = db.product_sub_categories;
// models

const getAll = async (req, res) => {
  try {
    const categories = [];
    const allCategories = await Categories.findAll({});
    for (let i = 0; i < allCategories.length; i++) {
      const subCategories = await SubCategories.findAll({
        where: { categoryId: allCategories[i].dataValues.id },
      });
      categories.push({ ...allCategories[i].dataValues, subCategories });
    }
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

const getOne = async (req, res) => {
  try {
    const id = req.params["id"];
    console.log({ id });
    const category = await Categories.findOne({ where: { id } });
    if (!category) {
      return res.status(400).send({
        msg: "Invalid category",
      });
    }
    return res.status(200).json({
      status: "success",
      category,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const io = req.app.get("socketio");
    // Validate user input
    if (!(name && icon)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const category = await Categories.create({
      name,
      icon,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_PRODUCT_CATEGORY,
      data: category.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Category added successfull!",
      category: { ...category.dataValues, subCategories: [] },
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
    const { name, icon, id } = req.body;
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
        icon,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      Categories,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT_CATEGORY
    );
    const subCategories = await SubCategories.findAll({
      where: { categoryId: id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Product Category updated successfull!",
      category: { ...category, subCategories },
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
      type: eventNamesEnum.DELETE_PRODUCT_CATEGORY,
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

const updateImage = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).send({ msg: req.fileValidationError.message });
    }
    if (!req.file) {
      return res.status(400).send({ msg: "No file was uploaded," });
    }
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ msg: "Invalid request" });
    }
    await Categories.update(
      {
        image: req.file.filename,
      },
      { where: { id } }
    );

    return res.status(200).json({
      msg: "Image updated successfull.",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateBanner = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ msg: "Invalid request" });
    }
    await Categories.update(
      {
        banner: req.file.filename,
      },
      { where: { id } }
    );
    return res.status(200).json({
      status: "success",
      msg: "Banner Updated successfull!",
      image: req.file.filename,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const toggleCategory = async (req, res) => {
  try {
    const { column, value, id } = req.body;
    if (!(column !== undefined && value !== undefined && id !== undefined)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Categories.update(
      {
        [column]: value,
      },
      { where: { id } }
    );

    return res.status(200).json({
      status: "success",
      msg: "Category updated successfull!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  addCategory,
  getAll,
  updateCategory,
  deleteCategory,
  getOne,
  updateImage,
  updateBanner,
  toggleCategory,
};
