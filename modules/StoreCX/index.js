require('dotenv').config();

const expressSession = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(expressSession);

const environment = process.env.VANILLA_ENV || "production";

const store = new MongoDBStore({
    uri: process.env.COSMOS_CONNECTION_STRING, 
    databaseName: process.env.SESSION_DATABASE,
    collection: process.env.SESSION_COLLECTION,
    
    // Change the expires key name
    expiresKey: `_ts`,
    // This controls the life of the document - set to same value as expires / 1000
    expiresAfterSeconds: 60 * 60 * 24 * 14 
})

const sessionOptions = {
    secret: process.env.STORE_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false
    },
    store: store,
    saveUninitialized: false,
    resave: false,
    
}

if(environment === "production"){
    sessionOptions.cookie.secure = true;
    sessionOptions.cookie.domain = process.env.STORE_COOKIE_DOMAIN;
}

class StoreCX {
    constructor(req, store){
        // Create new store
        if(!req.session[store]){
            req.session[store] = {};
        }
        
        this.req = req;
        this.session = this.req.session[store];
    }

    async set(key, value) {
        this.session[key] = value;
        await StoreCX.save(this.req);
    }

    get(key) {
        return this.session[key];
    }

    static session = expressSession(sessionOptions)

    static async save(req){
        const promise = new Promise((resolve, reject) => {
            if(!req.session){
                reject(new Error("NO_SESSION"))
            } else {
                req.session.save((error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve();
                    }
                })
            }

        })

        return promise;
    }

    static async regenerateSessionID(req){
        const promise = new Promise((resolve, reject) => {
            if(!req.session){
                reject(new Error("NO_SESSION"))
            } else {
                req.session.regenerate((error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve();
                    }
                })
            }
        })

        return promise;
    }

    static async killSession(req){
        const promise = new Promise((resolve, reject) => {
            if(!req.session){
                reject(new Error("NO_SESSION"))
            } else {
                req.session.destroy((error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve();
                    }
                })
            }
        })
    }

    /**
     * Example how to set a session var:
     *      try {
     *          const userData = new StoreCX(req, "userData");
     *          await userData.set("name", "Lee");
     *      } catch(error) {
     *          // Handle Error
     *      }
     * 
     * 
     * Example how to get a session var:
     *      try {
     *          const userData = new StoreCX(req, "userData");
     *          const name = userData.get("name");
     *      } catch(error) {
     *          // Handle Error
     *      }
     * 
     * 
     * Example how to regenerate new session ID:
     *      try {
     *          await StoreCX.regenerateSessionID(req);
     *      } catch(error) {
     *          // Handle Error
     *      }
     * 
     * 
     * Example how to save session without initialising new StoreCX class instance:
     *      try {
     *          await StoreCX.save(req);
     *      } catch(error) {
     *          // Handle Error
     *      }
     */
    
    
}

class Session {
    constructor(){}
}

module.exports = { StoreCX }