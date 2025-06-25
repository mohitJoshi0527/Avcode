import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URL).then((data)=>{
      console.log(`Mongodb connect with :${data.connection.host}`)
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}