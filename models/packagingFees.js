module.exports = (sequelize, DataTypes) => {
  const PackagingFees = sequelize.define(
    "packaging_fees",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return PackagingFees;
};
