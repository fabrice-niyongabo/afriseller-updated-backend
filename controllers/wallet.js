const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const db = require("../models");
const axios = require("axios");

// models
const Wallet = db.wallet;
const Users = db.users;
// models

const getOnlineTransactions = async () => {
  try {
    const transactions = await axios.get(
      "https://mobile-mers-backend.onrender.com/api/v3/transactions/"
    );
    for (let i = 0; i < transactions.data.transactions.length; i++) {
      await Wallet.update(
        {
          paymentStatus: transactions.data.transactions[i].status,
          // spTransactionId: transactions.data.transactions[i].spTransactionId,
        },
        {
          where: {
            transactionId: transactions.data.transactions[i].transactionId,
          },
        }
      );
    }
  } catch (error) {
    return error.message;
  }
};

const getAll = async (req, res) => {
  try {
    // await getOnlineTransactions();
    const transactions = await Wallet.findAll({
      where: { userId: req.user.userId },
      order: [["id", "DESC"]],
    });

    let depositTotal = 0;
    let withdrawTotal = 0;
    for (let i = 0; i < transactions.length; i++) {
      if (
        transactions[i].dataValues.transactionType === "deposit" &&
        transactions[i].dataValues.paymentStatus === "SUCCESS"
      ) {
        depositTotal += Number(transactions[i].dataValues.amount);
      }
      if (
        transactions[i].dataValues.transactionType === "withdraw" &&
        transactions[i].dataValues.paymentStatus === "SUCCESS"
      ) {
        withdrawTotal += Number(transactions[i].dataValues.amount);
      }
    }

    const walletAmounts = depositTotal - withdrawTotal;
    await Users.update(
      { walletAmounts },
      { where: { userId: req.user.userId } }
    );

    return res.status(200).json({
      status: "success",
      transactions,
      walletAmounts,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    // await getOnlineTransactions();
    const transactions = await Wallet.findAll({ order: [["id", "DESC"]] });
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

const deposit = async (req, res) => {
  try {
    const { amount, paymentPhoneNumber } = req.body;

    // Validate user input
    if (!(amount && paymentPhoneNumber)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const transactionId = uuidv4();
    const organizationId = process.env.ORGANISATION_ID;
    const description = "Ntuma app wallet deposit";
    const callbackUrl = process.env.CALL_BACK_URL;

    const pay = await axios.post(
      "https://opay-api.oltranz.com/opay/paymentrequest",
      {
        telephoneNumber: paymentPhoneNumber,
        amount: amount,
        organizationId: organizationId,
        description: description,
        callbackUrl: callbackUrl,
        transactionId: transactionId,
      }
    );
    if (pay) {
      const transaction = await Wallet.create({
        userId: req.user.userId,
        transactionType: "deposit",
        amount,
        paymentPhoneNumber,
        transactionId,
        paymentStatus: pay.data.status,
      });
      return res.status(201).json({
        msg: pay.data.description,
        success: true,
        transaction: transaction.dataValues,
      });
    }
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, deposit };
