const { verificationStatusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const Shops = sequelize.define(
    "shops",
    {
      shopId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        unique: {
          args: true,
          msg: "You already own a shop",
        },
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      shopName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone1: {
        type: DataTypes.STRING(15),
        unique: {
          args: true,
          msg: "Phone number already in use!",
        },
        allowNull: false,
      },
      phone2: {
        type: DataTypes.STRING(15),
      },
      phone3: {
        type: DataTypes.STRING(15),
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      open: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      close: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      shopImage: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      shopBanner: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationStatus: {
        type: DataTypes.STRING(10),
        defaultValue: verificationStatusEnum.UNDER_REVIEW,
      },
      verificationMessage: {
        type: DataTypes.STRING,
      },
      isDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Shops;
};
