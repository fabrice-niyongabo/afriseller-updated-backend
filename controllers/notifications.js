const { Op } = require("sequelize");
const { userTypesEnum } = require("../helpers");
const db = require("../models");
const fbAdmin = require("firebase-admin");

// models
const Notifications = db.notifications;
// const Users = db.users;
// models

const getAgentNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      where: { userType: userTypesEnum.AGENT, userId: req.user.agentId },
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      notifications,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getRiderNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      where: { userType: userTypesEnum.RIDER, userId: req.user.riderId },
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      notifications,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      where: { userType: userTypesEnum.ADMIN, userId: req.user.userId },
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      notifications,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getClientNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.findAll({
      where: { userType: userTypesEnum.CLIENT, userId: req.user.userId },
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      status: "success",
      notifications,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteAgentNotification = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const notification = await Notifications.destroy({
      where: { id, userId: req.user.agentId, userType: userTypesEnum.AGENT },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notification deleted successfull!",
      notification,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteRiderNotification = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const notification = await Notifications.destroy({
      where: { id, userId: req.user.riderId, userType: userTypesEnum.RIDER },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notification deleted successfull!",
      notification,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteAdminNotification = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const notification = await Notifications.destroy({
      where: { id, userId: req.user.userId, userType: userTypesEnum.ADMIN },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notification deleted successfull!",
      notification,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteClientNotification = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const notification = await Notifications.destroy({
      where: { id, userId: req.user.userId, userType: userTypesEnum.CLIENT },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notification deleted successfull!",
      notification,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const agentsClearAll = async (req, res) => {
  try {
    await Notifications.destroy({
      where: { userId: req.user.agentId, userType: userTypesEnum.AGENT },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notifications cleared!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const riderClearAll = async (req, res) => {
  try {
    await Notifications.destroy({
      where: { userId: req.user.riderId, userType: userTypesEnum.RIDER },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notifications cleared!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminClearAll = async (req, res) => {
  try {
    await Notifications.destroy({
      where: { userId: req.user.userId, userType: userTypesEnum.ADMIN },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notifications cleared!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const clientClearAll = async (req, res) => {
  try {
    await Notifications.destroy({
      where: { userId: req.user.userId, userType: userTypesEnum.CLIENT },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Notifications cleared!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const readNotifications = async (req, res) => {
  try {
    const query =
      req.user?.userId !== undefined
        ? { userId: req.user.userId, userType: userTypesEnum.CLIENT }
        : req.user?.agentId !== undefined
        ? { userId: req.user.agentId, userType: userTypesEnum.AGENT }
        : { userType: userTypesEnum.RIDER, userId: req.user.riderId };
    await Notifications.update({ isViewed: true }, { where: query });
    return res.status(200).json({
      status: "success",
      msg: "Notifications read!",
    });
  } catch (error) {
    return res.status(400).send({
      msg: error.message,
    });
  }
};

const sendNotification = async (req, res) => {
  await fbAdmin.messaging().sendMulticast({
    tokens: [
      "d9avdSJLSEOOtjnWgFUMXQ:APA91bFcpbHh9meJE_9-o0J1XXBHH5UbU_-oLCw7nXsqiqXeXsrwIcTSwVMiTk91DNqAFprOzr25F25F2w_sL05NQxUg5GS2N8u2nZHK7ZHEBB3k2v0pETenvrlE0G8EcdBZwNVWwTFe",
    ], // ['token_1', 'token_2', ...]
    notification: {
      title: "Basic Notification",
      body: "This is a basic notification sent from the server!",
      imageUrl: "https://my-cdn.com/app-logo.png",
    },
  });
  res.json({ message: "sent message" });
};

const sendToAllDevices = async (req, res) => {
  await fbAdmin.messaging().sendMulticast({
    // tokens: [
    //   "d9avdSJLSEOOtjnWgFUMXQ:APA91bFcpbHh9meJE_9-o0J1XXBHH5UbU_-oLCw7nXsqiqXeXsrwIcTSwVMiTk91DNqAFprOzr25F25F2w_sL05NQxUg5GS2N8u2nZHK7ZHEBB3k2v0pETenvrlE0G8EcdBZwNVWwTFe",
    // ], // ['token_1', 'token_2', ...]
    topic: "broadcast",
    notification: {
      title: "Basic Notification to all groups",
      body: "This is a basic notification sent from the server!",
      imageUrl: "https://my-cdn.com/app-logo.png",
    },
  });
  res.json({ message: "sent message" });
};

module.exports = {
  getAgentNotifications,
  getRiderNotifications,
  getAdminNotifications,
  getClientNotifications,
  agentsClearAll,
  riderClearAll,
  adminClearAll,
  clientClearAll,
  deleteAgentNotification,
  deleteRiderNotification,
  deleteAdminNotification,
  deleteClientNotification,
  readNotifications,
};
