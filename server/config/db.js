const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillmarket";

    if (mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost")) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.log("Local MongoDB server is not running. Starting MongoMemoryServer as fallback...");
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
