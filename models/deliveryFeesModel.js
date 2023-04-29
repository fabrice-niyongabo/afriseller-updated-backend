module.exports = (sequelize, DataTypes) => {
  const DeliveryFees = sequelize.define(
    "deliveryFees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vehicleType: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: {
          args: true,
          msg: "Fee name already in use!",
        },
      },
      amountPerKilometer: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      defaultPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return DeliveryFees;
};
