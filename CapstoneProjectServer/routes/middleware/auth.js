const router = require("express").Router();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=> {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    try {
        const decoded = jwt.verify(token, "JWT_PRIVATE_KEY");
        req.user = decoded;
        next();
    } catch {
        res.status(400).send("Invalid token");
    }
//   try {
//         const token = req.headers.authorization.split(' ')[1];
//         const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
//         const userId = decodedToken.userId;
//         if (req.body.userId && req.body.userId !== userId) {
//             throw 'Invalid user ID';
//         } else {
//             next();
//         }
//     } catch {
//         res.status(401).json({
//             error: new Error('Invalid request!')
//         });
//     }
};

module.exports = router;