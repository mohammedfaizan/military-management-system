import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Get MongoDB connection string from environment variables
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
    console.error('❌ MongoDB connection string is not defined in environment variables');
    console.error('Please set MONGODB_URI or MONGO_URI in your environment variables');
    process.exit(1);
}

// Remove the deprecation warnings
mongoose.set('strictQuery', true);

// Connection events
mongoose.connection.on('connecting', () => {
    console.log('🔌 Connecting to MongoDB...');});

mongoose.connection.on('connected', () => {
    console.log('✅ Successfully connected to MongoDB');});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.name === 'MongoNetworkError') {
        console.error('Network error - make sure MongoDB is running and accessible');
    }
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');});

// Handle process termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

const connectDB = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });
        
        console.log('✅ MongoDB connection established successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        if (error.name === 'MongoParseError') {
            console.error('Please check your MongoDB connection string format');
        } else if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any servers in your MongoDB Atlas cluster');
            console.error('Please check your network connection and MongoDB Atlas whitelist settings');
        }
        process.exit(1);
    }
};

export default connectDB;

