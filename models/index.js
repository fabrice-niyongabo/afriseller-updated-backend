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

db.orders = require("./ordersModel")(sequelize, DataTypes);
db.notifications = require("./nofications")(sequelize, DataTypes);
db.transactions = require("./transactions")(sequelize, DataTypes);
db.banners = require("./banners")(sequelize, DataTypes);
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
db.requested_services_files = require("./requestedServicesFiles")(
  sequelize,
  DataTypes
);
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
