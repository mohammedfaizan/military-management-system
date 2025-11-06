import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

// Get MongoDB connection string from environment variables
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};
export default connectDB

