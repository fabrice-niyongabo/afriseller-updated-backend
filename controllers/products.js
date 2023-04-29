const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const Markets = db.markets;
const Categories = db.categories;
const Products = db.products;
const ProductPrices = db.product_prices;
// models

const getAll = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: { isActive: true },
      order: [["pId", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      products,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getMine = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: { supplierId: req.user.supplierId },
      order: [["pId", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      products,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const products = await Products.findAll({ order: [["pId", "DESC"]] });
    return res.status(200).json({
      status: "success",
      products,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addProduct = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const io = req.app.get("socketio");
    const { categoryId, name, description, priceType, singlePrice } = req.body;

    // Validate user input
    if (!(categoryId && name && description && priceType && singlePrice)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //validate product
    const oldproduct = await Products.findOne({
      where: { supplierId: req.user.supplierId, categoryId, name },
    });
    if (oldproduct) {
      return res.status(400).send({
        success: false,
        msg: "Product name already exists in from this supplier",
      });
    }

    const product = await Products.create({
      supplierId: req.user.supplierId,
      categoryId,
      name,
      description,
      priceType,
      singlePrice,
      image: req.file.filename,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_PRODUCT,
      data: product.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Product added successfull!",
      product: product.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const {
      pId,
      supplierId,
      categoryId,
      name,
      description,
      priceType,
      singlePrice,
    } = req.body;
    // Validate user input
    if (
      !(
        pId &&
        supplierId &&
        categoryId &&
        name &&
        description &&
        priceType &&
        singlePrice === undefined
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }
    await Products.update(
      {
        categoryId,
        name,
        description,
        priceType,
        singlePrice,
      },
      { where: { pId, supplierId } }
    );
    await handleSocketDataUpdate(
      { where: { pId } },
      Products,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT
    );
    const product = await Products.findOne({ where: { pId, supplierId } });
    return res.status(200).json({
      status: "success",
      msg: "Product updated successfull!",
      product,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { pId, isActive } = req.body;
    // Validate user input
    if (pId === undefined || isActive === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }
    await Products.update(
      {
        isActive: !isActive,
      },
      { where: { pId, supplierId: req.user.supplierId } }
    );
    await handleSocketDataUpdate(
      { where: { pId } },
      Products,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT
    );
    const product = await Products.findOne({
      where: { pId, supplierId: req.user.supplierId },
    });
    return res.status(200).json({
      status: "success",
      msg: "Product updated successfull!",
      product,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const pId = req.params["id"];
    // Validate user input
    if (!pId) {
      res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const product = await Products.destroy({ where: { pId }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_PRODUCT,
      data: { pId },
    });
    return res.status(200).json({
      status: "success",
      msg: "Product deleted successfull!",
      product,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addPrice = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { productId, name, amount } = req.body;

    // Validate user input
    if (!(productId && name && amount)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //validate product
    const oldproduct = await ProductPrices.findOne({
      where: { productId, name, supplierId: req.user.supplierId },
    });
    if (oldproduct) {
      return res.status(400).send({
        success: false,
        msg: "Same Price name already exists for this product",
      });
    }

    const price = await ProductPrices.create({
      productId,
      name,
      amount,
      supplierId: req.user.supplierId,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_PRODUCT_PRICE,
      data: price.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Product price added successfull!",
      price: price.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getAllPrices = async (req, res) => {
  try {
    const supplierId = req.params["id"];
    const prices = await ProductPrices.findAll({ where: { supplierId } });
    return res.status(201).json({
      status: "success",
      prices,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getSingleProductPrices = async (req, res) => {
  try {
    const productId = req.params["id"];
    const prices = await ProductPrices.findAll({ where: { productId } });
    return res.status(201).json({
      status: "success",
      prices,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updatePrice = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { ppId, productId, name, amount } = req.body;
    // Validate user input
    if (!(ppId && productId && name && amount)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const price = await ProductPrices.update(
      {
        name,
        amount,
      },
      { where: { ppId, productId } }
    );
    await handleSocketDataUpdate(
      { where: { ppId, productId } },
      ProductPrices,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT_PRICE
    );
    return res.status(200).json({
      status: "success",
      msg: "Product price updated successfull!",
      price,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deletePrice = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const ppId = req.params["id"];
    // Validate user input
    if (!ppId) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const price = await ProductPrices.destroy({ where: { ppId }, force: true });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_PRODUCT_PRICE,
      data: { ppId },
    });
    return res.status(200).json({
      status: "success",
      msg: "Product price deleted successfull!",
      price,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateImage = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { pId } = req.body;
    if (!pId) {
      return res.status(400).json({
        msg: "Please provide correct info",
      });
    }
    await Products.update(
      {
        image: req.file.filename,
      },
      { where: { supplierId: req.user.supplierId, pId } }
    );
    const product = await Products.findOne({
      where: { supplierId: req.user.supplierId, pId },
    });
    return res.status(201).json({
      status: "success",
      msg: "Product Image Updated successfull!",
      product,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  updateImage,
  addProduct,
  getAll,
  adminAll,
  updateProduct,
  deleteProduct,
  addPrice,
  getAllPrices,
  getSingleProductPrices,
  deletePrice,
  updatePrice,
  getMine,
  updateProductStatus,
};
