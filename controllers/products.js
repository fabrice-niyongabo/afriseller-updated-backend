const { Op, JSON } = require("sequelize");
const {
  eventNamesEnum,
  handleSocketDataUpdate,
  parseData,
} = require("../helpers");
const db = require("../models");

// models
const Users = db.users;
const Products = db.products;
const ProductPrices = db.product_prices;
const ProductImages = db.product_images;
const Shops = db.shops;
// models

const getAll = async (req, res) => {
  try {
    const { country } = req.query;
    const products = [];
    const allProducts = country
      ? await Products.findAll({
          include: { model: Shops, as: "shop", where: { country } },
          where: { isActive: true },
          order: [["pId", "DESC"]],
        })
      : await Products.findAll({
          where: { isActive: true },
          order: [["pId", "DESC"]],
        });

    for (let i = 0; i < allProducts.length; i++) {
      const images = await ProductImages.findAll({
        where: { productId: allProducts[i].dataValues.pId },
      });
      if (allProducts[i].dataValues.priceType === "many") {
        const prices = await ProductPrices.findAll({
          where: { productId: allProducts[i].dataValues.pId },
          order: [["amount", "ASC"]],
        });
        products.push({
          ...allProducts[i].dataValues,
          prices,
          variations: parseData(allProducts[i].variations),
          images,
        });
      } else {
        products.push({
          ...allProducts[i].dataValues,
          prices: [],
          variations: parseData(allProducts[i].variations),
          images,
        });
      }
    }

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

const getMySingleProduct = async (req, res) => {
  try {
    const pId = req.params["id"];
    if (!pId) {
      return res.status(200).json({
        status: "Invalid request",
      });
    }

    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Something went wrong",
      });
    }

    const product = await Products.findOne({
      where: { pId, shopId: user.dataValues.shopId },
    });

    if (!product) {
      return res.status(400).send({
        status: "Error",
        msg: "Unable to find product specified",
      });
    }

    const images = await ProductImages.findAll({
      where: { productId: product.dataValues.pId },
    });
    let prices = [];
    if (product.dataValues.priceType === "many") {
      prices = await ProductPrices.findAll({
        where: { productId: product.dataValues.pId },
      });
    }

    return res.status(200).json({
      status: "success",
      product: {
        ...product.dataValues,
        variations: parseData(product.variations),
        images,
        prices,
      },
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getMine = async (req, res) => {
  try {
    const products = [];

    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Please login again to continue",
      });
    }

    const allProducts = await Products.findAll({
      where: { shopId: user.dataValues.shopId },
      order: [["pId", "DESC"]],
    });

    for (let i = 0; i < allProducts.length; i++) {
      const images = await ProductImages.findAll({
        where: { productId: allProducts[i].dataValues.pId },
      });
      if (allProducts[i].dataValues.priceType === "many") {
        const prices = await ProductPrices.findAll({
          where: { productId: allProducts[i].dataValues.pId },
        });
        products.push({
          ...allProducts[i].dataValues,
          variations: parseData(allProducts[i].variations),
          prices,
          images,
        });
      } else {
        products.push({
          ...allProducts[i].dataValues,
          prices: [],
          variations: parseData(allProducts[i].variations),
          images,
        });
      }
    }

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
    const products = [];
    const allProducts = await Products.findAll({
      order: [["pId", "DESC"]],
    });

    for (let i = 0; i < allProducts.length; i++) {
      const images = await ProductImages.findAll({
        where: { productId: allProducts[i].dataValues.pId },
      });
      if (allProducts[i].dataValues.priceType === "many") {
        const prices = await ProductPrices.findAll({
          where: { productId: allProducts[i].dataValues.pId },
        });
        products.push({ ...allProducts[i].dataValues, prices, images });
      } else {
        products.push({ ...allProducts[i].dataValues, prices: [], images });
      }
    }

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
  try {
    const io = req.app.get("socketio");
    const {
      subCategoryId,
      categoryId,
      name,
      description,
      priceType,
      singlePrice,
      brandName,
      productId,
      variations,
      currency,
    } = req.body;

    // Validate user input
    if (
      !(
        categoryId &&
        name &&
        description &&
        priceType &&
        subCategoryId &&
        currency
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //validate product
    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Something went wrong",
      });
    }

    const oldproduct = await Products.findOne({
      where: {
        shopId: user.dataValues.shopId,
        categoryId,
        subCategoryId,
        name,
      },
    });
    if (oldproduct) {
      return res.status(400).send({
        success: false,
        msg: "Product name already exists",
      });
    }

    const product = await Products.create({
      shopId: user.dataValues.shopId,
      subCategoryId,
      categoryId,
      name,
      description,
      priceType,
      brandName,
      productId,
      variations,
      currency,
    });
    // io.emit(eventNamesEnum.CyizereEventNames, {
    //   type: eventNamesEnum.ADD_PRODUCT,
    //   data: product.dataValues,
    // });
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
      subCategoryId,
      categoryId,
      name,
      description,
      priceType,
      currency,
      brandName,
      productId,
      variations,
    } = req.body;
    // Validate user input
    if (
      !(
        pId &&
        subCategoryId &&
        categoryId &&
        name &&
        description &&
        priceType &&
        currency
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }

    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Something went wrong",
      });
    }

    await Products.update(
      {
        subCategoryId,
        categoryId,
        name,
        description,
        priceType,
        currency,
        brandName,
        productId,
        variations,
      },
      { where: { pId, shopId: user.dataValues.shopId } }
    );
    await handleSocketDataUpdate(
      { where: { pId, shopId: user.dataValues.shopId } },
      Products,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PRODUCT
    );
    const product = await Products.findOne({
      where: { pId, shopId: user.dataValues.shopId },
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

    const { shopId, productId, name, amount } = req.body;

    // Validate user input
    if (!(productId && name && amount)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Something went wrong",
      });
    }

    //validate product
    const oldproduct = await ProductPrices.findOne({
      where: { productId, name, shopId: user.dataValues.shopId },
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
      shopId: user.dataValues.shopId,
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

const addProductImage = async (req, res) => {
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

    const user = await Users.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!user) {
      return res.status(401).send({
        status: "Error",
        msg: "Something went wrong",
      });
    }

    await ProductImages.create({ productId: pId, image: req.file.filename });
    return res.status(201).json({
      status: "success",
      msg: "Product Image added successfull!",
      image: req.file.filename,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const id = req.params["id"];
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await ProductImages.destroy({ where: { id }, force: true });

    return res.status(200).json({
      status: "success",
      msg: "Image deleted successfull!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const toggleProduct = async (req, res) => {
  try {
    const { column, value, pId } = req.body;
    if (!(column !== undefined && value !== undefined && pId !== undefined)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Products.update(
      {
        [column]: value,
      },
      { where: { pId } }
    );

    return res.status(200).json({
      status: "success",
      msg: "Product updated!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  addProductImage,
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
  getMySingleProduct,
  deleteProductImage,
  toggleProduct,
};
