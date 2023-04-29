const { v4: uuidv4 } = require("uuid");
const { Op, json } = require("sequelize");
const db = require("../models");
const {
  eventNamesEnum,
  statusEnum,
  saveNotification,
  userTypesEnum,
} = require("../helpers");

// models
const Orders = db.orders;
const Agents = db.agents;
const Markets = db.markets;
const SuppliersPaymentDetails = db.suppliers_payment_details;
// models

const getAll = async (req, res) => {
  try {
    const paymentDetails = await SuppliersPaymentDetails.findAll({
      where: { agentId: req.user.agentId },
    });

    const parsedData = paymentDetails.map((item) => ({
      ...item.dataValues,
      productsList: JSON.parse(item.dataValues.productsList),
    }));
    return res.status(200).json({
      status: "success",
      paymentDetails: parsedData,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const result = [];
    const paymentDetails = await SuppliersPaymentDetails.findAll({
      order: [["id", "DESC"]],
    });
    for (let i = 0; i < paymentDetails.length; i++) {
      const agent = await Agents.findOne({
        where: { agentId: paymentDetails[i].dataValues.agentId },
      });
      const market = await Markets.findOne({
        where: { mId: paymentDetails[i].dataValues.marketId },
      });
      result.push({
        ...paymentDetails[i].dataValues,
        productsList: JSON.parse(paymentDetails[i].dataValues.productsList),
        agent,
        market,
      });
    }
    return res.status(200).json({
      status: "success",
      paymentDetails: result,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAllFromApp = async (req, res) => {
  try {
    const result = [];
    const paymentDetails = await SuppliersPaymentDetails.findAll({
      where: { paymentStatus: "PENDING" },
      order: [["id", "DESC"]],
    });
    for (let i = 0; i < paymentDetails.length; i++) {
      const agent = await Agents.findOne({
        where: { agentId: paymentDetails[i].dataValues.agentId },
      });
      const market = await Markets.findOne({
        where: { mId: paymentDetails[i].dataValues.marketId },
      });
      result.push({
        ...paymentDetails[i].dataValues,
        productsList: JSON.parse(paymentDetails[i].dataValues.productsList),
        agent,
        market,
      });
    }
    return res.status(200).json({
      status: "success",
      paymentDetails: result,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const submitPaymentRequest = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { marketId, orderId, productsList, supplierMOMOCode, supplierNames } =
      req.body;

    // Validate user input
    if (
      !(
        marketId &&
        orderId &&
        productsList &&
        supplierMOMOCode &&
        supplierNames
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //validate order id
    const exists = Orders.findOne({ where: { id: orderId } });
    if (!exists) {
      return res.status(400).send({
        status: "Error",
        msg: "Opps! The order that your are trying to initiate a payment from does not exit.",
      });
    }
    //validate order id

    let totalAmount = 0;
    for (let i = 0; i < productsList.length; i++) {
      totalAmount +=
        Number(productsList[i].price) * Number(productsList[i].quantity);
    }

    const payment = await SuppliersPaymentDetails.create({
      marketId,
      orderId,
      productsList: JSON.stringify(productsList),
      supplierMOMOCode,
      supplierNames,
      totalAmount,
      agentId: req.user.agentId,
    });

    const agent = await Agents.findOne({
      where: { agentId: payment.dataValues.agentId },
    });
    const market = await Markets.findOne({
      where: { mId: payment.dataValues.marketId },
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_SUPPLIERS_PAYMENT_DETAILS,
      data: {
        ...payment.dataValues,
        productsList: JSON.parse(payment.dataValues.productsList),
        agent,
        market,
      },
    });
    return res.status(201).json({
      msg: "Payment request initiated successfull",
      success: true,
      payment,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const id = req.params["id"];
    const io = req.app.get("socketio");
    const paymentDetails = await SuppliersPaymentDetails.destroy({
      where: {
        id,
        agentId: req.user.agentId,
        paymentStatus: "FAILED",
      },
      force: true,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.DELETE_SUPPLIERS_PAYMENT_DETAILS,
      data: { id },
    });
    return res.status(200).json({
      status: "success",
      paymentDetails,
      msg: "Supplier Details Deleted successfull, You can now add new supplier.",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const { id, reason } = req.body;
    const io = req.app.get("socketio");
    await SuppliersPaymentDetails.update(
      { paymentStatus: statusEnum.FAILED, failureReason: reason },
      {
        where: {
          id,
        },
      }
    );
    //socket
    const payment = await SuppliersPaymentDetails.findOne({
      where: {
        id,
      },
    });
    if (payment) {
      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.UPDATE_SUPPLIERS_PAYMENT_DETAILS,
        data: {
          ...payment.dataValues,
          productsList: JSON.parse(payment.dataValues.productsList),
        },
      });
      await saveNotification(
        payment.agentId,
        userTypesEnum.AGENT,
        "Supplier Payment request rejected",
        payment.failureReason,
        io
      );
    }
    return res.status(200).json({
      status: "success",
      msg: "Supplier payment Details rejected.",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const approvePayment = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const io = req.app.get("socketio");
    const { id } = req.body;

    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    await SuppliersPaymentDetails.update(
      { paymentStatus: statusEnum.SUCCESS, payementProof: req.file.filename },
      {
        where: {
          id,
        },
      }
    );
    //socket & updates
    const payment = await SuppliersPaymentDetails.findOne({
      where: {
        id,
      },
    });
    if (payment) {
      //update prices
      let paidAmount = 0;
      const order = await Orders.findOne({ where: { id: payment.orderId } });
      if (order) {
        const details = await SuppliersPaymentDetails.findAll({
          where: {
            orderId: order.id,
          },
        });
        for (let i = 0; i < details.length; i++) {
          paidAmount += Number(details[i].dataValues.totalAmount);
        }
        if (paidAmount >= Number(order.cartTotalAmount)) {
          await Orders.update(
            {
              areAllSuppliersPaid: true,
            },
            { where: { id: payment.orderId } }
          );
        }
      }

      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.UPDATE_SUPPLIERS_PAYMENT_DETAILS,
        data: {
          ...payment.dataValues,
          productsList: JSON.parse(payment.dataValues.productsList),
        },
      });
      await saveNotification(
        payment.agentId,
        userTypesEnum.AGENT,
        "Supplier Payment request approved!",
        "Payment request for order #" + order.id + "has been approved",
        io
      );
    }
    return res.status(200).json({
      status: "success",
      msg: "Supplier payment approved.",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  adminGetAll,
  deletePayment,
  submitPaymentRequest,
  rejectPayment,
  approvePayment,
  adminGetAllFromApp,
};
