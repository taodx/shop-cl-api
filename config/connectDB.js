const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB Connection Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected. Attempting to reconnect...");
      setTimeout(connectDB, 5000); // Thử kết nối lại sau 5 giây
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB Connection Closed");
      process.exit(0);
    });
  } catch (err) {
    console.error("MongoDB Connection Failed", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
