const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const db = require("../models");
const axios = require("axios");

// models
const RidersWallet = db.riders_wallet;
const Riders = db.riders;
// models

const getOnlineTransactions = async () => {
  try {
    const transactions = await axios.get(
      "https://mobile-mers-backend.onrender.com/api/v3/transactions/"
    );
    for (let i = 0; i < transactions.data.transactions.length; i++) {
      await RidersWallet.update(
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

const updateRiderBalances = async (riderId) => {
  const transactions = await RidersWallet.findAll({
    where: { riderId },
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
  await Riders.update({ walletAmounts }, { where: { riderId } });
};

const getAll = async (req, res) => {
  try {
    // await getOnlineTransactions();
    const transactions = await RidersWallet.findAll({
      where: { riderId: req.user.riderId },
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
    await Riders.update(
      { walletAmounts },
      { where: { riderId: req.user.riderId } }
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
    const transactions = [];
    const allTransactions = await RidersWallet.findAll({
      order: [["id", "DESC"]],
    });
    for (let i = 0; i < allTransactions.length; i++) {
      const rider = await Riders.findOne({
        where: { riderId: allTransactions[i].dataValues.riderId },
      });
      transactions.push({ ...allTransactions[i].dataValues, rider });
    }
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

const withdraw = async (req, res) => {
  //also send a notification to the client whenever
  //deposit request failed
  try {
    const { amount } = req.body;

    // Validate user input
    if (!amount || amount < 0) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //update rider balances
    await updateRiderBalances(req.user.riderId);

    const riderDetails = await Riders.findOne({
      where: { riderId: req.user.riderId },
    });

    if (!riderDetails) {
      return res.status(400).send({
        status: "Error",
        msg: "Invalid rider. Please try again with collect information. If logged in, you can try loging out and try again",
      });
    }

    //check balance
    if (riderDetails.walletAmounts < amount) {
      return res.status(400).send({
        status: "Error",
        msg: "Insufient balance found on your wallet. Please process much orders as posible to increase your earnings.",
      });
    }

    const transactionId = uuidv4();
    const organizationId = process.env.ORGANISATION_ID;
    const description = "Ntuma app wallet deposit";
    const callbackUrl = process.env.CALL_BACK_URL;

    // const pay = await axios.post(
    //   "https://opay-api.oltranz.com/opay/paymentrequest",
    //   {
    //     telephoneNumber: paymentPhoneNumber,
    //     amount: amount,
    //     organizationId: organizationId,
    //     description: description,
    //     callbackUrl: callbackUrl,
    //     transactionId: transactionId,
    //   }
    // );
    // if (pay) {
    //   const transaction = await RidersWallet.create({
    //     riderId: req.user.riderId,
    //     transactionType: "withdraw",
    //     amount,
    //     paymentPhoneNumber: req.user.phone,
    //     transactionId,
    //     paymentStatus: pay.data.status,
    //   });
    //   return res.status(201).json({
    //     msg: pay.data.description,
    //     success: true,
    //     transaction: transaction.dataValues,
    //   });
    // }

    //static success response
    const transaction = await RidersWallet.create({
      riderId: req.user.riderId,
      transactionType: "withdraw",
      amount,
      paymentPhoneNumber: req.user.phone,
      paymentStatus: "PENDING",
    });
    return res.status(201).json({
      msg:
        "Your withdraw request of " +
        amount +
        " RWF is being processed. You will be notified shortly. For any help, Please call 0788712248.",
      success: true,
      transaction: transaction.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const earn = async (req, res) => {
  //specify the order id for future reporting
  //also send a notification to rider
};

module.exports = { getAll, withdraw, adminGetAll };