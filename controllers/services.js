const db = require("../models");

// models
const Services = db.services;
// models

const getAll = async (req, res) => {
  try {
    const services = await Services.findAll({});
    return res.status(200).json({
      status: "success",
      services,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const id = req.params["id"];
    const service = await Services.findOne({ where: { id } });
    if (!service) {
      return res.status(400).send({
        msg: "Invalid service",
      });
    }
    return res.status(200).json({
      status: "success",
      service,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addService = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    const { name, description } = req.body;
    const io = req.app.get("socketio");
    // Validate user input
    if (!name && !description) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const service = await Services.create({
      name,
      description,
      image: req.file.filename,
    });

    return res.status(201).json({
      status: "success",
      msg: "Service added successfull!",
      service: service.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};
const updateService = async (req, res) => {
  try {
    const { name, description, id, isActive } = req.body;
    // Validate user input
    if (!(name && description && id && isActive !== undefined)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Services.update(
      {
        name,
        description,
        isActive,
      },
      { where: { id } }
    );

    return res.status(200).json({
      status: "success",
      msg: "Service updated!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    await Services.destroy({ where: { id }, force: true });

    return res.status(200).json({
      status: "success",
      msg: "Service deleted!",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateImage = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).send({ msg: req.fileValidationError.message });
    }
    if (!req.file) {
      return res.status(400).send({ msg: "No file was uploaded," });
    }
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ msg: "Invalid request" });
    }
    await Services.update(
      {
        image: req.file.filename,
      },
      { where: { id } }
    );

    return res.status(200).json({
      msg: "Image updated successfull.",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  getOne,
  updateImage,
  addService,
  updateService,
  deleteService,
};
