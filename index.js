const express = require("express");
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger");
const errorMiddleware = require("./middleware/error");
const connectDB = require("./config/connectDB");

const numCPUs = os.cpus().length;

// Initialize dotenv configuration
require("dotenv").config();

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    process.exit(1);
  });
} else {
  const app = express();

  // Connect to MongoDB
  connectDB();

  const allowedOrigins = [process.env.LINK_FE, process.env.LINK_FE_ADMIN, process.env.LINK_FE_2, process.env.LINK_FE_ADMIN_DEV];

  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  // Define a simple route
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(fileUpload());
  app.use(express.json({ limit: "50mb" }));

  // Thiết lập Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Route Imports
  const user = require("./routes/userRoute");
  const categories = require("./routes/categoriesRoute");
  const brand = require("./routes/brandRoute");
  const product = require("./routes/productRoute");
  const orders = require("./routes/orderRouter");
  const agency = require("./routes/agnecyRoute");
  const liveChat = require("./routes/configLiveChatRoute");
  const logoHeader = require("./routes/logoHeaderRoute");
  const logoFooter = require("./routes/logoFooterRoute");
  const banner = require("./routes/bannerRoute");
  const wallet = require("./routes/walletRoute");
  const bank = require("./routes/bankRoute");
  const addressUser = require("./routes/addressUserRoute");
  const autoTranslate = require("./utils/translate");
  const chat = require("./routes/chatRoute");
  const message = require("./routes/messageRoute");
  const configSetting = require("./routes/configWebsiteRoute");

  app.use("/api/v1", user);
  app.use("/api/v1", categories);
  app.use("/api/v1", brand);
  app.use("/api/v1", product);
  app.use("/api/v1", orders);
  app.use("/api/v1", agency);
  app.use("/api/v1", liveChat);
  app.use("/api/v1", logoHeader);
  app.use("/api/v1", logoFooter);
  app.use("/api/v1", banner);
  app.use("/api/v1", wallet);
  app.use("/api/v1", bank);
  app.use("/api/v1", addressUser);
  app.use("/api/v1", chat);
  app.use("/api/v1", message);
  app.use("/api/v1", configSetting);
  app.use(errorMiddleware);
  app.use("/api/v1/translate", autoTranslate);

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running on port ${PORT}.`);
  });
}
