module.exports = (sequelize, DataTypes) => {
  const Riders = sequelize.define(
    "riders",
    {
      riderId: {
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
      vehicleType: { type: DataTypes.STRING(10), allowNull: false },
      image: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      walletAmounts: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
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
        defaultValue: "In Review",
      },
      verificationMessage: {
        type: DataTypes.STRING,
      },
      lat: {
        type: DataTypes.STRING,
        defaultValue: 0,
        allowNull: false,
      },
      lng: {
        type: DataTypes.STRING,
        defaultValue: 0,
        allowNull: false,
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

  return Riders;
};
