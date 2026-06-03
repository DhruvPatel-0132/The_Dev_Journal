import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    console.log(`\n=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`=================================\n`);

    app.listen(PORT, () => {
      console.log(`
🚀 Server Running
🌐 Port: ${PORT}
      `);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();