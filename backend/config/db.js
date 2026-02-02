const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 segundos timeout
            socketTimeoutMS: 45000, // 45 segundos timeout
            bufferMaxEntries: 0, // Desabilitar buffering
            bufferCommands: false, // Desabilitar buffering de comandos
            maxPoolSize: 10, // Máximo de conexões no pool
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;