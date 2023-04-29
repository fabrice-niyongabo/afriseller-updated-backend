module.exports = (sequelize, DataTypes) => {
  const DishesProducts = sequelize.define(
    "dishProducts",
    {
      dpId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      marketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dishId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: "dishes",
        //   key: "id",
        // },
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return DishesProducts;
};
