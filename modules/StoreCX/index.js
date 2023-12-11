require('dotenv').config();

const expressSession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(expressSession);

class StoreCX {
    static store = new MongoDBStore({
        uri: process.env.SESSIONCX_CONNECTION_STRING, 
        databaseName: process.env.SESSIONCX_DATABASE,
        collection: process.env.SESSIONCX_COLLECTION,
        
        // Change the expires key name
        expiresKey: `_ts`,
        // This controls the life of the document - set to same value as expires / 1000
        expiresAfterSeconds: 60 * 60 * 24 * 14 
    })
    
    static session = expressSession({
        secret: process.env.STORECX_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        },
        store: StoreCX.store,
        // Boilerplate options, see:
        // * https://www.npmjs.com/package/express-session#resave
        // * https://www.npmjs.com/package/express-session#saveuninitialized
        resave: true,
        saveUninitialized: true
    })
    
    
}

module.exports = { StoreCX }