import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`mongodb connected : ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1); // code 1 means error
  }
};
export default connectMongoDB;
