const { Op } = require("sequelize");
const { handleSocketDataUpdate, eventNamesEnum } = require("../helpers");
const db = require("../models");

// models
const Dishes = db.dishes;
const DishProducts = db.dish_products;
// models

const getAll = async (req, res) => {
  try {
    const dishes = [];
    const allDishes = await Dishes.findAll({
      where: { isActive: true },
    });
    for (let i = 0; i < allDishes.length; i++) {
      const products = await DishProducts.findAll({
        where: { dishId: allDishes[i].dataValues.id },
      });
      dishes.push({ ...allDishes[i].dataValues, products });
    }
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

const getDishProducts = async (req, res) => {
  try {
    const dishId = req.params["id"];
    const dishProducts = await DishProducts.findAll({ where: { dishId } });
    return res.status(200).json({
      status: "success",
      dishProducts,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const dishes = await Dishes.findAll({});
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

const addDish = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { marketId, name, utubeLink } = req.body;
    // Validate user input
    if (!(marketId && name)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const exists = await Dishes.findOne({ where: { marketId, name } });
    if (exists) {
      return res.status(400).send({
        msg: "Dish name already exists in this market",
      });
    }

    const dish = await Dishes.create({
      marketId,
      name,
      utubeLink: utubeLink ? utubeLink : "",
      image: req.file.filename,
    });
    return res.status(201).json({
      status: "success",
      msg: "Dish added successfull!",
      dish: dish.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addDishProduct = async (req, res) => {
  try {
    const { marketId, dishId, productId } = req.body;
    // Validate user input
    if (!(marketId, dishId, productId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const exists = await DishProducts.findOne({
      where: { marketId, dishId, productId },
    });
    if (exists) {
      return res.status(400).send({
        msg: "Product already exists on this dish",
      });
    }
    const dishProduct = await DishProducts.create({
      marketId,
      dishId,
      productId,
    });
    return res.status(201).json({
      status: "success",
      msg: "Product added successfull!",
      dishProduct: dishProduct.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateDish = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { marketId, name, utubeLink, isActive, id } = req.body;
    // Validate user input
    if (!(marketId && name && isActive && id)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const dish = utubeLink
      ? await Dishes.update(
          {
            marketId,
            name,
            utubeLink,
            isActive,
          },
          { where: { id } }
        )
      : await Dishes.update(
          {
            marketId,
            name,
            isActive,
          },
          { where: { id } }
        );
    await handleSocketDataUpdate(
      { where: { id } },
      Dishes,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_DISHES
    );
    return res.status(200).json({
      status: "success",
      msg: "Dish updated successfull!",
      dish,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteDish = async (req, res) => {
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
    const dish = await Dishes.destroy({ where: { id }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_DISHES,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      msg: "Dish deleted successfull!",
      dish,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteDishProduct = async (req, res) => {
  try {
    const dpId = req.params["id"];
    // Validate user input
    if (!dpId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const product = await DishProducts.destroy({
      where: { dpId },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Product removed successfull!",
      product,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  addDish,
  getAll,
  adminAll,
  updateDish,
  deleteDish,
  getDishProducts,
  addDishProduct,
  deleteDishProduct,
};
