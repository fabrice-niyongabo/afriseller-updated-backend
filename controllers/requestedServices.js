const { Op } = require("sequelize");
const db = require("../models");

// models
const Services = db.services;
const RequestedServices = db.requested_services;
const RequestedServicesFiles = db.requested_services_files;
const Users = db.users;
// models

const getAll = async (req, res) => {
  try {
    const requestedServices = [];
    const allRequestedServices = await RequestedServices.findAll({
      where: { userId: req.user.userId },
    });
    for (let i = 0; i < allRequestedServices.length; i++) {
      const service = await Services.findOne({
        where: { id: allRequestedServices[i].dataValues.serviceId },
      });
      requestedServices.push({
        ...allRequestedServices[i].dataValues,
        service,
      });
    }
    return res.status(200).json({
      requestedServices,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getRequestedServicesFiles = async (req, res) => {
  try {
    const requestId = req.params["id"];
    const files = await RequestedServicesFiles.findAll({
      where: { requestId },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      files,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const requestedServices = [];
    const allRequestedServices = await RequestedServices.findAll({});
    for (let i = 0; i < allRequestedServices.length; i++) {
      const service = await Services.findOne({
        where: { id: allRequestedServices[i].dataValues.serviceId },
      });
      const user = await Users.findOne({
        where: { userId: allRequestedServices[i].dataValues.userId },
      });
      requestedServices.push({
        ...allRequestedServices[i].dataValues,
        service,
        user,
      });
    }
    return res.status(200).json({
      requestedServices,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addRequestedServices = async (req, res) => {
  try {
    const { serviceId, description } = req.body;
    // Validate user input
    if (!(description && serviceId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const service = await Services.findOne({ where: { id: serviceId } });

    if (!service) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }

    const request = await RequestedServices.create({
      serviceId,
      price: service.dataValues.price,
      currency: service.dataValues.currency,
      description,
      userId: req.user.userId,
    });
    return res.status(201).json({
      status: "success",
      msg: "Request submitted successful!",
      request,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addRequestedServiceFiles = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).send({ msg: req.fileValidationError.message });
    }
    if (!req.file) {
      return res.status(400).send({ msg: "No file was uploaded." });
    }
    const { serviceId, requestId, fileType, comment } = req.body;
    // Validate user input
    if (!(serviceId && requestId && fileType && comment)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const request = await RequestedServicesFiles.create({
      serviceId,
      requestId,
      fileType,
      comment,
      file: req.file.filename,
      addedByuserId: req.user.userId,
    });
    return res.status(201).json({
      status: "success",
      msg: "Request File submitted!",
      request,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateRequestedServices = async (req, res) => {
  try {
    const { status, id } = req.body;
    // Validate user input
    if (!(status && id)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await RequestedServices.update(
      {
        status,
      },
      { where: { id } }
    );
    return res.status(200).json({
      status: "success",
      msg: "Information updated successfull!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteRequestedServices = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await RequestedServices.destroy({ where: { id }, force: true });

    return res.status(200).json({
      status: "success",
      msg: "RequestedServices cancelled successfull!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteRequestedServicesFile = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await RequestedServicesFiles.destroy({ where: { id }, force: true });

    return res.status(200).json({
      status: "success",
      msg: "RequestedServices File deleted!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  adminAll,
  addRequestedServices,
  updateRequestedServices,
  deleteRequestedServices,
  addRequestedServiceFiles,
  deleteRequestedServicesFile,
  getRequestedServicesFiles,
};
