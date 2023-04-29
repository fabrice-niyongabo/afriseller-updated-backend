module.exports = (sequelize, DataTypes) => {
  const AppTokens = sequelize.define(
    "app_tokens",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(20),
      },
      appType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "CLIENT",
      },
      fbToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return AppTokens;
};
