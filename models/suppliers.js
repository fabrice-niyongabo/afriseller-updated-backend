const { verificationStatusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const Suppliers = sequelize.define(
    "suppliers",
    {
      supplierId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idNumber: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: {
          args: true,
          msg: "ID Number already in use!",
        },
      },
      idNumberDocument: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        unique: {
          args: true,
          msg: "Phone number already in use!",
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shopName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shopAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shopCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shopLat: {
        type: DataTypes.TEXT,
      },
      shopLong: {
        type: DataTypes.TEXT,
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
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

  return Suppliers;
};
