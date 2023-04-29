module.exports = (sequelize, DataTypes) => {
  const AgentsMarketSubscriptions = sequelize.define(
    "agents_market_subscriptions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      marketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return AgentsMarketSubscriptions;
};
