const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const SubCategories = db.product_sub_categories;
// models

const getAll = async (req, res) => {
  try {
    const subcategories = await SubCategories.findAll({});
    return res.status(200).json({
      status: "success",
      subcategories,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const io = req.app.get("socketio");
    // Validate user input
    if (!(name && categoryId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    //validate
    const subCat = await SubCategories.findOne({
      where: { categoryId, name },
    });
    if (subCat) {
      return res.status(400).send({
        status: "Error",
        msg: "This sub category already exists",
      });
    }
    const subcategory = await SubCategories.create({
      name,
      categoryId,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_PRODUCT_CATEGORY,
      data: subcategory.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Sub Category added successfull!",
      subcategory: subcategory.dataValues,
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
    const subcategory = await SubCategories.update(
      {
        name,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      SubCategories,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT_CATEGORY
    );
    return res.status(200).json({
      status: "success",
      msg: "Product Category updated successfull!",
      subcategory,
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
    const subcategory = await SubCategories.destroy({
      where: { id },
      force: true,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_PRODUCT_CATEGORY,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Category deleted successfull!",
      subcategory,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { addCategory, getAll, updateCategory, deleteCategory };
