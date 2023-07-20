const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("connected..");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//modles
db.users = require("./usersModel")(sequelize, DataTypes);
db.markets = require("./marketsModel")(sequelize, DataTypes);
db.shop_categories = require("./shopCategories")(sequelize, DataTypes);
db.product_sub_categories = require("./productSubCategories")(
  sequelize,
  DataTypes
);
db.product_categories = require("./productCategories")(sequelize, DataTypes);
db.shops = require("./shops")(sequelize, DataTypes);
db.products = require("./productsModel")(sequelize, DataTypes);
db.product_prices = require("./productPricesModel")(sequelize, DataTypes);
db.product_images = require("./productImages")(sequelize, DataTypes);

db.delivery_fees = require("./deliveryFeesModel")(sequelize, DataTypes);
db.orders = require("./ordersModel")(sequelize, DataTypes);
db.wallet = require("./walletModel")(sequelize, DataTypes);
db.dishes = require("./dishes")(sequelize, DataTypes);
db.dish_products = require("./dishProducts")(sequelize, DataTypes);
db.agents = require("./agents")(sequelize, DataTypes);
db.agents_market_subscriptions = require("./agentsMarketSubscriptions")(
  sequelize,
  DataTypes
);
db.suppliers_payment_details = require("./suppliersPaymentDetails")(
  sequelize,
  DataTypes
);

db.messages = require("./messages")(sequelize, DataTypes);
db.agents_wallet = require("./agentsWallet")(sequelize, DataTypes);
db.agents_fees = require("./agentsFees")(sequelize, DataTypes);
db.notifications = require("./nofications")(sequelize, DataTypes);
db.riders = require("./riders")(sequelize, DataTypes);
db.riders_wallet = require("./ridersWallet")(sequelize, DataTypes);
db.transactions = require("./transactions")(sequelize, DataTypes);
db.banners = require("./banners")(sequelize, DataTypes);
db.app_tokens = require("./appTokens")(sequelize, DataTypes);
db.system_fees = require("./systemFees")(sequelize, DataTypes);
db.packaging_fees = require("./packagingFees")(sequelize, DataTypes);
db.suppliers = require("./suppliers")(sequelize, DataTypes);
db.countries = require("./countries")(sequelize, DataTypes);
db.shipping_estimations = require("./shippingEstimations")(
  sequelize,
  DataTypes
);
db.wishlist = require("./wishlist")(sequelize, DataTypes);
db.booking = require("./booking")(sequelize, DataTypes);
db.services = require("./services")(sequelize, DataTypes);
db.requested_services = require("./requestedServices")(sequelize, DataTypes);
//modles

db.sequelize.sync({ force: false }).then(() => {
  console.log("DB re-sync done!");
});

// 1 to Many Relation
// db.products.hasMany(db.reviews, {
//   foreignKey: "product_id",
//   as: "review",
// });
// db.reviews.belongsTo(db.products, {
//   foreignKey: "product_id",
//   as: "product",
// });
// 1 to Many Relation

// db.dishes.hasMany(db.dish_products, { foreignKey: "dishId", as: "products" });
// db.dish_products.belongsTo(db.dishes, { foreignKey: "dishId", as: "dish" });

db.shops.hasMany(db.products, { foreignKey: "shopId" });
db.products.belongsTo(db.shops, { foreignKey: "shopId" });

module.exports = db;
