dotenv.config() ;

import mongoose from 'mongoose' ;
import dotenv from 'dotenv' ;
import app from './app.js' ;




mongoose.connect(process.env.MONGODB_CONNECT_URI).then(() => {
    console.log("Database Connected") ;

    app.listen(process.env.PORT || 3300 , () => {
        console.log("Hey the server is running now") ;
    }) ;
}).catch((err) => {
    console.error(err.message)
}) ;