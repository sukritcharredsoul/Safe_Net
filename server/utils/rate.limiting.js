import expressRateLimit from 'express-rate-limit'

const limiter = expressRateLimit({
    windowMs : 15 * 60 * 1000 ,
    max : 100,
    message: {
        status: 429,
        error: "Too Many Requests",
        message: "Try again after some time"
    },
    standardHeaders : true,
    legacyHeaders : false
}) ;

const authLimiter = expressRateLimit({
    windowMs : 10 * 60 * 1000,
    max : 5,
    message: {
    status: 429,
        error: "Too Many Requests",
    },
    standardHeaders : true,
    legacyHeaders : false
})

export {authLimiter,limiter} ;