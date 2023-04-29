const { Op } = require("sequelize");
const { eventNamesEnum } = require("../helpers");
const db = require("../models");

// models
const Messages = db.messages;
const Agents = db.agents;
const Users = db.users;
// models

const getAll = async (req, res) => {
  try {
    const condition = req.user.agentId
      ? { agentId: req.user.agentId }
      : { userId: req.user.userId };
    const messages = await Messages.findAll({
      where: condition,
    });
    return res.status(200).json({
      status: "success",
      messages,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const sendFileMessage = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const io = req.app.get("socketio");
    if (req.user.agentId) {
      const { userId, message } = req.body;
      // Validate user input
      if (!userId) {
        return res.status(400).send({
          status: "Error",
          msg: "Provide correct info",
        });
      }
      //validate user
      const user = await Users.findOne({ where: { userId } });
      if (!user) {
        return res.status(400).send({
          msg: "Invalid User",
        });
      }
      const newMessage = await Messages.create({
        userId,
        agentId: req.user.agentId,
        senderId: req.user.agentId,
        messageType: "IMAGE",
        file: req.file.filename,
        textMessage: message !== undefined ? message : "",
      });
      io.emit(eventNamesEnum.NtumaClientEventNames, {
        type: eventNamesEnum.ADD_MESSAGE,
        data: newMessage.dataValues,
      });
      return res.status(201).json({
        msg: "Message sent!",
        message: newMessage,
      });
    } else {
      const { agentId, message } = req.body;
      // Validate user input
      if (!agentId) {
        return res.status(400).send({
          status: "Error",
          msg: "Provide correct info",
        });
      }
      //validate agent
      const agent = await Agents.findOne({ where: { agentId } });
      if (!agent) {
        return res.status(400).send({
          msg: "Invalid Agent",
        });
      }
      const newMessage = await Messages.create({
        agentId,
        userId: req.user.userId,
        senderId: req.user.userId,
        messageType: "IMAGE",
        file: req.file.filename,
        textMessage: message !== undefined ? message : "",
        senderType: "client",
      });
      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.ADD_MESSAGE,
        data: newMessage.dataValues,
      });
      return res.status(201).json({
        msg: "Message sent!",
        message: newMessage,
      });
    }
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const sendTextMessage = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    if (req.user.agentId) {
      const { userId, message } = req.body;
      // Validate user input
      if (!(userId && message)) {
        return res.status(400).send({
          status: "Error",
          msg: "Provide correct info",
        });
      }
      //validate user
      const user = await Users.findOne({ where: { userId } });
      if (!user) {
        return res.status(400).send({
          msg: "Invalid User",
        });
      }
      const newMessage = await Messages.create({
        userId,
        agentId: req.user.agentId,
        senderId: req.user.agentId,
        textMessage: message,
      });
      io.emit(eventNamesEnum.NtumaClientEventNames, {
        type: eventNamesEnum.ADD_MESSAGE,
        data: newMessage.dataValues,
      });
      return res.status(201).json({
        msg: "Message sent!",
        message: newMessage,
      });
    } else {
      const { agentId, message } = req.body;
      // Validate user input
      if (!(agentId && message)) {
        return res.status(400).send({
          status: "Error",
          msg: "Provide correct info",
        });
      }
      //validate agent
      const agent = await Agents.findOne({ where: { agentId } });
      if (!agent) {
        return res.status(400).send({
          msg: "Invalid Agent",
        });
      }
      const newMessage = await Messages.create({
        agentId,
        userId: req.user.userId,
        senderId: req.user.userId,
        textMessage: message,
        senderType: "client",
      });
      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.ADD_MESSAGE,
        data: newMessage.dataValues,
      });
      return res.status(201).json({
        msg: "Message sent!",
        message: newMessage,
      });
    }
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const id = req.params["id"];
    const io = req.app.get("socketio");
    const baseEventName = req.user.agentId
      ? eventNamesEnum.NtumaClientEventNames
      : eventNamesEnum.NtumaAgentEventNames;
    const condition = req.user.agentId
      ? { id, agentId: req.user.agentId }
      : { id, userId: req.user.userId };
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const message = await Messages.destroy({
      where: condition,
      force: true,
    });
    io.emit(baseEventName, {
      type: eventNamesEnum.DELETE_MESSAGE,
      data: { id },
    });
    return res.status(201).json({
      msg: "Message deleted!",
      message,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, sendFileMessage, sendTextMessage, deleteMessage };
