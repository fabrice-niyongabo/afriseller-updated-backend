const { verificationStatusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const RequestedServices = sequelize.define(
    "requested_services",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: verificationStatusEnum.UNDER_REVIEW,
      },
    },
    {
      timestamps: true,
    }
  );

  return RequestedServices;
};
