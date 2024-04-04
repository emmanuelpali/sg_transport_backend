require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = process.env.MONGO_URL;

let dbInstance = null;

const dbName = process.env.MONGO_DB;

const connectDB = async () => {
    if (dbInstance){
        return dbInstance;
    };

    const client = new MongoClient(url);
    // Use connect method to connect to the database
    await client.connect();

    //return the database instance
    dbInstance = client.db(dbName);
    return dbInstance;
}

module.exports = connectDB;