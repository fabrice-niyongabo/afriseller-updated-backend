const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const db = require("../models");
const axios = require("axios");
const {
  getCurrentDateTime,
  getRandomNumber,
  statusEnum,
  saveNotification,
  userTypesEnum,
  agentsEarningTypesEnum,
  transactionTypeEnum,
  saveAdminNotification,
} = require("../helpers");

// models
const Orders = db.orders;
const Users = db.users;
const Agents = db.agents;
const Riders = db.riders;
const Wallet = db.wallet;
const AgentsWallet = db.agents_wallet;
const RidersWallet = db.riders_wallet;
const AgentsMarketSubscriptions = db.agents_market_subscriptions;
const AgentsEarningType = db.agents_earning_type;
// models

const upadateUsersWallet = async (userId) => {
  try {
    const transactions = await Wallet.findAll({
      where: { userId },
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
    await Users.update({ walletAmounts }, { where: { userId } });
  } catch (error) {}
};

const getOnlineTransactions = async () => {
  try {
    const transactions = await axios.get(
      "https://mobile-mers-backend.onrender.com/api/v3/transactions/"
    );
    for (let i = 0; i < transactions.data.transactions.length; i++) {
      await Orders.update(
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
    const orders = await Orders.findAll({
      where: { userId: req.user.userId },
      order: [["id", "DESC"]],
    });

    const parsedData = orders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.dataValues.cartItems),
      deliveryAddress: JSON.parse(item.dataValues.deliveryAddress),
    }));
    return res.status(200).json({
      status: "success",
      orders: parsedData,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const parsedData = [];
    const orders = await Orders.findAll({ order: [["id", "DESC"]] });
    for (let i = 0; i < orders.length; i++) {
      const client = await Users.findOne({
        where: { userId: orders[i].dataValues.userId },
      });
      const rider = await Riders.findOne({
        where: { riderId: orders[i].dataValues.riderId },
      });
      parsedData.push({
        ...orders[i].dataValues,
        cartItems: JSON.parse(orders[i].dataValues.cartItems),
        deliveryAddress: JSON.parse(orders[i].dataValues.deliveryAddress),
        client,
        rider,
      });
    }
    return res.status(200).json({
      status: "success",
      orders: parsedData,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const agentsGetPendingOrders = async (req, res) => {
  try {
    let orders = [];
    const subscriptions = await AgentsMarketSubscriptions.findAll({
      where: { agentId: req.user.agentId },
      order: [["id", "DESC"]],
    });
    if (subscriptions.length > 0) {
      const marketIds = subscriptions.map((item) => item.marketId);
      const allOrders = await Orders.findAll({
        where: {
          marketId: { [Op.in]: marketIds },
          agentId: null,
          paymentStatus: "SUCCESS",
        },
      }).catch((err) => {
        console.log(err);
      });
      orders = allOrders.map((item) => ({
        ...item.dataValues,
        cartItems: JSON.parse(item.cartItems),
        deliveryAddress: JSON.parse(item.deliveryAddress),
      }));
    }

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const ridersGetPendingOrders = async (req, res) => {
  try {
    let orders = [];
    const allOrders = await Orders.findAll({
      where: {
        riderId: req.user.riderId,
        isRiderConfirmed: true,
        paymentStatus: "SUCCESS",
        deliveryStatus: { [Op.not]: statusEnum.COMPLETED },
      },
      order: [["id", "DESC"]],
    }).catch((err) => {
      console.log(err);
    });
    orders = allOrders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.cartItems),
      deliveryAddress: JSON.parse(item.deliveryAddress),
    }));

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const agentsGetAcceptedOrders = async (req, res) => {
  try {
    let orders = [];
    const allOrders = await Orders.findAll({
      where: {
        agentId: req.user.agentId,
        riderId: null,
        paymentStatus: "SUCCESS",
      },
      order: [["id", "DESC"]],
    }).catch((err) => {
      console.log(err);
    });
    orders = allOrders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.cartItems),
      deliveryAddress: JSON.parse(item.deliveryAddress),
    }));

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const ridersGetWaitingOrders = async (req, res) => {
  try {
    let orders = [];
    const allOrders = await Orders.findAll({
      where: {
        riderId: null,
        confirmationRiderId: req.user.riderId,
        isRiderConfirmed: false,
        paymentStatus: "SUCCESS",
        areAllSuppliersPaid: true,
      },
      order: [["id", "DESC"]],
    }).catch((err) => {
      console.log(err);
    });
    orders = allOrders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.cartItems),
      deliveryAddress: JSON.parse(item.deliveryAddress),
    }));

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const ridersGetCompletedOrders = async (req, res) => {
  try {
    let orders = [];
    const allOrders = await Orders.findAll({
      where: {
        riderId: req.user.riderId,
        isRiderConfirmed: true,
        paymentStatus: "SUCCESS",
        deliveryStatus: statusEnum.COMPLETED,
      },
      order: [["id", "DESC"]],
    }).catch((err) => {
      console.log(err);
    });
    orders = allOrders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.cartItems),
      deliveryAddress: JSON.parse(item.deliveryAddress),
    }));

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const agentsGetCompletedOrders = async (req, res) => {
  try {
    let orders = [];
    const allOrders = await Orders.findAll({
      where: {
        agentId: req.user.agentId,
        riderId: { [Op.not]: null },
        isRiderConfirmed: true,
        paymentStatus: statusEnum.SUCCESS,
        deliveryStatus: statusEnum.COMPLETED,
      },
      order: [["id", "DESC"]],
    }).catch((err) => {
      console.log(err);
    });
    orders = allOrders.map((item) => ({
      ...item.dataValues,
      cartItems: JSON.parse(item.cartItems),
      deliveryAddress: JSON.parse(item.deliveryAddress),
    }));

    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const submitOrder = async (req, res) => {
  try {
    const {
      agentfees,
      systemfees,
      packagingfees,
      cartItems,
      cartTotalAmount,
      distance,
      deliveryFees,
      deliveryAddress,
      paymentMethod,
      paymentPhoneNumber,
      marketId,
    } = req.body;

    // Validate user input
    if (
      !(
        agentfees &&
        systemfees &&
        packagingfees &&
        cartItems &&
        cartTotalAmount &&
        distance &&
        deliveryFees &&
        deliveryAddress &&
        paymentMethod &&
        paymentPhoneNumber &&
        marketId
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const amount =
      Number(deliveryFees) +
      Number(cartTotalAmount) +
      Number(systemfees) +
      Number(packagingfees) +
      Number(agentfees);

    if (paymentMethod === "MOBILE_MONEY") {
      const transactionId = uuidv4();
      const organizationId = process.env.ORGANISATION_ID;
      const description = "Ntuma app order Payment";
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
        const order = await Orders.create({
          marketId,
          agentFees: agentfees,
          systemFees: systemfees,
          packagingFees: packagingfees,
          userId: req.user.userId,
          cartItems,
          cartTotalAmount,
          distance,
          paymentMethod,
          paymentPhoneNumber,
          deliveryAddress: deliveryAddress,
          deliveryFees: deliveryFees,
          transactionId,
          deliveryCode: req.user.userId + getRandomNumber(),
          paymentStatus: pay.data.status,
          failureReason: pay.data.description,
        });
        return res
          .status(201)
          .json({ msg: pay.data.description, success: true, order });
      } else {
        return res.status(500).json({
          msg: "Something went wrong while initiating payment, try again later after some time.",
        });
      }
    } else {
      await upadateUsersWallet(req.user.userId);
      const user = await Users.findOne({
        where: {
          userId: req.user.userId,
        },
      });
      if (user) {
        if (user.walletAmounts >= amount) {
          const order = await Orders.create({
            marketId,
            agentFees: agentfees,
            systemFees: systemfees,
            packagingFees: packagingfees,
            userId: req.user.userId,
            cartItems,
            cartTotalAmount,
            distance,
            paymentMethod,
            deliveryCode: req.user.userId + getRandomNumber(),
            paymentPhoneNumber,
            deliveryAddress: deliveryAddress,
            deliveryFees: deliveryFees,
            paymentStatus: "SUCCESS",
          });
          await Wallet.create({
            userId: req.user.userId,
            transactionType: "withdraw",
            amount,
            paymentPhoneNumber: "-",
            paymentStatus: "SUCCESS",
          });
          await Users.update(
            {
              walletAmounts: user.walletAmounts - amount,
            },
            {
              where: {
                userId: req.user.userId,
              },
            }
          );
          //record wallet transaction
          //
          return res.status(201).json({
            msg: "Thank you for using Ntuma app. Your order has been placed successfully",
            success: true,
            order,
          });
        } else {
          // const order = await Orders.create({
          //   marketId,
          //   agentFees: 0,
          //   systemFees: 0,
          //   packagingFees: 0,
          //   userId: req.user.userId,
          //   cartItems,
          //   cartTotalAmount,
          //   distance,
          //   paymentMethod,
          //   paymentPhoneNumber,
          //   deliveryAddress: deliveryAddress,
          //   deliveryFees: deliveryFees,
          //   deliveryCode: 0,
          //   paymentStatus: "FAILED",
          //   failureReason: "Insuficient funds on your wallet",
          // });
          return res.status(400).json({
            msg: "Insuficient funds on your wallet",
            success: false,
            // order,
          });
        }
      } else {
        return res.status(401).json({
          msg: "User not found",
        });
      }
    }
  } catch (err) {
    console.log({ err });
    res.status(400).send({
      msg: err.message,
    });
  }
};

const acceptPendingOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const isValid = await Orders.findOne({
      where: { id: orderId, agentId: null },
    });
    if (!isValid) {
      return res.status(400).send({
        msg: "This order is no longer available.",
      });
    }

    const orderBeingProcessed = await Orders.findAll({
      where: { riderId: null, agentId: req.user.agentId },
    });
    if (orderBeingProcessed.length > 1) {
      return res.status(400).send({
        msg: "Sorry, You have an other order which is pending to be processed. Please complete it first and try again.",
      });
    }

    await Orders.update(
      { agentId: req.user.agentId, acceptedAt: getCurrentDateTime() },
      {
        where: { id: orderId },
      }
    );
    return res.status(200).json({
      msg: "You are now allowed to process this older!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const agentSendAcceptedOrder = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;
    const isValid = await Orders.findOne({
      where: {
        id: orderId,
        agentId: req.user.agentId,
        confirmationRiderId: null,
        isRiderConfirmed: false,
      },
    });
    if (!isValid) {
      return res.status(400).send({
        msg: "This order is no longer able to be assigned to a different driver.",
      });
    }

    await Orders.update(
      { confirmationRiderId: riderId },
      {
        where: { id: orderId, agentId: req.user.agentId },
      }
    );
    return res.status(200).json({
      msg: "Delivery request has been sent to the deriver successfully. Make sure he/she confirm this request before delivering it.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const acceptWaitingForDeliveryOrder = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { orderId } = req.body;
    const isValid = await Orders.findOne({
      where: {
        id: orderId,
        riderId: null,
        isRiderConfirmed: false,
        confirmationRiderId: req.user.riderId,
      },
    });
    if (!isValid) {
      return res.status(400).send({
        msg: "This order is no longer available for delivery.",
      });
    }

    // const orderBeingProcessed = await Orders.findAll({
    //   where: { deliveryStatus: statusEnum.PENDING, riderId: req.user.riderId },
    // });
    // if (orderBeingProcessed.length > 1) {
    //   return res.status(400).send({
    //     msg: "Sorry, You have an other order which is pending to be processed. Please complete it first and try again.",
    //   });
    // }

    await Orders.update(
      {
        riderId: req.user.riderId,
        sentAt: getCurrentDateTime(),
        isRiderConfirmed: true,
        deliveryStatus: statusEnum.PENDING,
      },
      {
        where: { id: orderId },
      }
    );
    //send notifications
    await saveNotification(
      isValid.agentId,
      userTypesEnum.AGENT,
      "Rider accepted delivery request for order ID: #" + isValid.id,
      "Good Job!. Rider accepted to delivery the order. you will get your earnings for this order whenever the rider delivery it to the client. stay in touch!",
      io
    );
    await saveNotification(
      isValid.userId,
      userTypesEnum.CLIENT,
      "Driver has picked your order #" + isValid.id,
      "Your order #" +
        isValid.id +
        " is being delivered to the location you specified.",
      io
    );
    await saveNotification(
      req.user.riderId,
      userTypesEnum.RIDER,
      "Accepted delivery request for order ID: #" + isValid.id,
      "Dear Driver, please delivery the order to the client as soon as possible! Safe journey!",
      io
    );
    //send notifications
    return res.status(200).json({
      msg: "You are now allowed to deliver this older!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const rejectWaitingForDeliveryOrder = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { orderId } = req.body;
    const isValid = await Orders.findOne({
      where: {
        id: orderId,
        riderId: null,
        isRiderConfirmed: false,
        confirmationRiderId: req.user.riderId,
      },
    });
    if (!isValid) {
      return res.status(400).send({
        msg: "This order is no longer available for delivery.",
      });
    }

    // const orderBeingProcessed = await Orders.findAll({
    //   where: { deliveryStatus: statusEnum.PENDING, riderId: req.user.riderId },
    // });
    // if (orderBeingProcessed.length > 1) {
    //   return res.status(400).send({
    //     msg: "Sorry, You have an other order which is pending to be processed. Please complete it first and try again.",
    //   });
    // }

    await Orders.update(
      {
        riderId: null,
        confirmationRiderId: null,
        isRiderConfirmed: false,
      },
      {
        where: { id: orderId },
      }
    );
    //send notifications
    await saveNotification(
      isValid.agentId,
      userTypesEnum.AGENT,
      "Rider rejected delivery request for order ID: #" + isValid.id,
      "Dear agent, Please find on other rider to deliver this orders because the one you choosen has rejected your request.",
      io
    );
    await saveNotification(
      req.user.riderId,
      userTypesEnum.RIDER,
      "Confirmation for order ID: #" + isValid.id,
      "You have rejected delivery request.",
      io
    );
    //send notifications
    return res.status(200).json({
      msg: "Rejection request approved!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const finishOrderDelivery = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { orderId, deliveryCode } = req.body;
    if (!(orderId && deliveryCode)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const isValid = await Orders.findOne({
      where: {
        id: orderId,
        riderId: req.user.riderId,
        isRiderConfirmed: true,
        confirmationRiderId: req.user.riderId,
        deliveryCode,
      },
    });
    if (!isValid) {
      return res.status(400).send({
        msg: "Invalid Delivery Code. Please ask client to share with you correct delivery code in order to get your earnings.",
      });
    }

    await Orders.update(
      {
        riderId: req.user.riderId,
        deliveredAt: getCurrentDateTime(),
        deliveryStatus: statusEnum.COMPLETED,
      },
      {
        where: { id: orderId },
      }
    );
    //send notifications
    await saveNotification(
      isValid.agentId,
      userTypesEnum.AGENT,
      "Rider completed delivery for order ID: #" + isValid.id,
      "Congratulations!. the order that you have processed has been delivered to the client.",
      io
    );
    await saveNotification(
      isValid.userId,
      userTypesEnum.CLIENT,
      "Delivery for order #" + isValid.id + " has been completed",
      "Thank you for shooping with Ntuma APP",
      io
    );
    await saveNotification(
      req.user.riderId,
      userTypesEnum.RIDER,
      "Order #" + isValid.id + " delivered successfully!",
      "Dear Driver, thank you for delivering this order, Your earnings will be credited to your wallet very shortly.",
      io
    );
    //send notifications

    //give earnings
    //agent
    const earnings = await AgentsEarningType.findAll({});
    if (earnings.length > 0) {
      const earning = earnings[0].dataValues;
      if (earning.earningType == agentsEarningTypesEnum.AMOUNT) {
        await AgentsWallet.create({
          agentId: isValid.agentId,
          orderId: isValid.id,
          transactionType: transactionTypeEnum.DEPOSIT,
          amount: earning.value,
          paymentStatus: statusEnum.SUCCESS,
        });
        await saveAdminNotification(
          "Agent Wallet Credited",
          "Agent #" +
            isValid.agentId +
            "has been credited amount of " +
            earning.value +
            " RWF upon successfull completing order process. Order ID: #" +
            isValid.id,
          io
        );
        await saveNotification(
          userTypesEnum.AGENT,
          "Your Wallet Has Been Credited",
          "Dear Agent, your wallet has been credited amount of " +
            earning.value +
            " RWF upon successfull completing order process. Order ID: #" +
            isValid.id,
          io
        );
      } else {
        const percentage =
          Number(earning.value) * Number(isValid.cartTotalAmount) === 0
            ? 0
            : (Number(earning.value) * Number(isValid.cartTotalAmount)) / 100;
        await AgentsWallet.create({
          agentId: isValid.agentId,
          orderId: isValid.id,
          transactionType: transactionTypeEnum.DEPOSIT,
          amount: percentage,
          paymentStatus: statusEnum.SUCCESS,
        });
        await saveAdminNotification(
          "Agent Wallet Credited",
          "Agent #" +
            isValid.agentId +
            "has been credited amount of " +
            percentage +
            " RWF upon successfull completing order process. Order ID: #" +
            isValid.id,
          io
        );
        await saveNotification(
          userTypesEnum.AGENT,
          "Your Wallet Has Been Credited",
          "Dear Agent, your wallet has been credited amount of " +
            percentage +
            " RWF upon successfull completing order process. Order ID: #" +
            isValid.id,
          io
        );
      }
    } else {
      //default amount
      const amount = 300;
      await AgentsWallet.create({
        agentId: isValid.agentId,
        orderId: isValid.id,
        transactionType: transactionTypeEnum.DEPOSIT,
        amount: amount,
        paymentStatus: statusEnum.SUCCESS,
      });
      await saveAdminNotification(
        "Agent Wallet Credited",
        "Agent #" +
          isValid.agentId +
          "has been credited amount of " +
          amount +
          " RWF upon successfull completing order process. Order ID: #" +
          isValid.id,
        io
      );
      await saveNotification(
        userTypesEnum.AGENT,
        "Your Wallet Has Been Credited",
        "Dear Agent, your wallet has been credited amount of " +
          amount +
          " RWF upon successfull completing order process. Order ID: #" +
          isValid.id,
        io
      );
    }
    //agent
    //rider
    const amount = Number(isValid.deliveryFees);
    await RidersWallet.create({
      riderId: isValid.riderId,
      orderId: isValid.id,
      transactionType: transactionTypeEnum.DEPOSIT,
      amount: amount,
      paymentStatus: statusEnum.SUCCESS,
    });
    await saveAdminNotification(
      "Rider's Wallet Credited",
      "Rider #" +
        isValid.riderId +
        "has been credited amount of " +
        amount +
        " RWF upon successfull delivering an order. Order ID: #" +
        isValid.id,
      io
    );
    await saveNotification(
      userTypesEnum.RIDER,
      "Your Wallet Has Been Credited",
      "Dear Driver, your wallet has been credited amount of " +
        amount +
        " RWF upon successfull delivering an order. Order ID: #" +
        isValid.id,
      io
    );
    //rider
    //give earnings
    return res.status(200).json({
      msg: "Order delivered to the client successfull!. Your wallet will be credited very shortly. Call 0788712248 for any query.",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  submitOrder,
  agentsGetPendingOrders,
  acceptPendingOrder,
  agentsGetAcceptedOrders,
  acceptWaitingForDeliveryOrder,
  ridersGetPendingOrders,
  ridersGetWaitingOrders,
  rejectWaitingForDeliveryOrder,
  ridersGetCompletedOrders,
  finishOrderDelivery,
  agentSendAcceptedOrder,
  agentsGetCompletedOrders,
  adminGetAll,
};
