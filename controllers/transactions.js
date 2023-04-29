const { Op } = require("sequelize");
const { eventNamesEnum } = require("../helpers");
const db = require("../models");

// models
const Orders = db.orders;
const Wallet = db.wallet;
const Transactions = db.transactions;
// models

const getAll = async (req, res) => {
  try {
    const transactions = await Transactions.findAll({
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      transactions,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const saveTransaction = async (req, res) => {
  const io = req.app.get("socketio");
  try {
    const { status, transactionId } = req.body;
    const transactions = await Transactions.create(req.body);

    if (status !== undefined && transactionId !== undefined) {
      await Orders.update(
        {
          paymentStatus: status,
        },
        {
          where: {
            transactionId,
          },
        }
      );
      await Wallet.update(
        {
          paymentStatus: status,
        },
        {
          where: {
            transactionId,
          },
        }
      );
    }

    //update data through the socket
    const order = await Orders.findOne({
      where: {
        transactionId,
      },
    });
    if (order) {
      io.emit(eventNamesEnum.NtumaClientEventNames, {
        type: eventNamesEnum.UPDATE_ORDER,
        data: order,
      });
      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.UPDATE_ORDER,
        data: order,
      });
    }
    const wallet = await Wallet.findOne({ where: { transactionId } });
    if (wallet) {
      io.emit(eventNamesEnum.NtumaClientEventNames, {
        type: eventNamesEnum.UPDATE_WALLET,
        data: wallet,
      });
    }
    //
    return res.status(201).json({
      status: "success",
      msg: "Transaction captured!",
      transactions: transactions.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, saveTransaction };
