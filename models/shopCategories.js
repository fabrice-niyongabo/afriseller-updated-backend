module.exports = (sequelize, DataTypes) => {
  const ShopCategories = sequelize.define(
    "shop_categories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          args: true,
          msg: "Category name already in use!",
        },
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ShopCategories;
};
