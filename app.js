require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json({ limit: "50mb" }));

app.use(cors());
app.set("socketio", io);

//static
app.use("/uploads", express.static("./uploads"));

//socket
io.on("connection", (socket) => {
  console.log("A user connected");

  //take connected user's id
  socket.on("addUser", (userObj) => {
    console.log("user added");
    console.log({ userObj });
    console.log("Socket ID", socket.id);
  });

  //send to all users
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // removeUser(socket.id);
    // io.emit("getAllOnlineUsers", connectedUsers);
  });
});
//socket

//home route
app.get("/", (req, res) => {
  res.json({ message: "server is running" });
});

const usersRoute = require("./routes/users");
const shopCategoriesRoute = require("./routes/shopCategories");
const productCategoriesRoute = require("./routes/productCategories");
const productSubCategoriesRoute = require("./routes/productSubCategories");
const productsRoute = require("./routes/products");
const ordersRoute = require("./routes/orders");
const notificationsRoute = require("./routes/notifications");
const transactionsRoute = require("./routes/transactions");
const bannersRoute = require("./routes/banners");
const suppliersRoute = require("./routes/suppliers");

const shopsRoute = require("./routes/shops");
const productImagesRoute = require("./routes/productImages");
const countriesRoute = require("./routes/countries");
const shippingEstimationsRoute = require("./routes/shippingEstimations");
const wishlistRoute = require("./routes/wishlist");
const bookingRoute = require("./routes/booking");
const servicesRoute = require("./routes/services");
const requestedServicesRoute = require("./routes/requestedServices");

app.use("/api/users/", usersRoute);
app.use("/api/shopcategories/", shopCategoriesRoute);
app.use("/api/productcategories/", productCategoriesRoute);
app.use("/api/productsubcategories/", productSubCategoriesRoute);
app.use("/api/shops/", shopsRoute);
app.use("/api/productimages/", productImagesRoute);

app.use("/api/products/", productsRoute);
app.use("/api/orders/", ordersRoute);
app.use("/api/notifications/", notificationsRoute);
app.use("/api/transactions/", transactionsRoute);
app.use("/api/banners/", bannersRoute);
app.use("/api/suppliers/", suppliersRoute);
app.use("/api/countries/", countriesRoute);
app.use("/api/estimation/", shippingEstimationsRoute);
app.use("/api/wishlist/", wishlistRoute);
app.use("/api/booking/", bookingRoute);
app.use("/api/services/", servicesRoute);
app.use("/api/reqservices/", requestedServicesRoute);

//404 route
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    msg: "The page does not exist on the server.",
    error: {
      statusCode: 404,
      message: "The page does not exist on the server.",
    },
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
