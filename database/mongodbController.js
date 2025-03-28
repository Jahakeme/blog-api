/**
 * MongoDB Database Connection Utility
 * 
 * Establishes a connection to the MongoDB database using the connection
 * string provided in the MONGODB environment variable.
 * 
 * @returns {Promise<void>} - Resolves when connected or logs error on failure
 */
const mongoose = require('mongoose');

const connect_database = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log('MongoDB connected successfully');
    } catch (error) {
        return console.error(error);
    }
};

module.exports = connect_database;