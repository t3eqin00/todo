import jwt from 'jsonwebtoken';
import { jwtSecret } from './db.js';

const authorizationRequired = "Authorization required";
const invalidCredentials = "Invalid credentials";

const auth = (req, res, next) => {
    if (!req.headers.authorization) {
        res.statusMessage = authorizationRequired;
        return res.status(401).json({ message: authorizationRequired });
    }
        try {
            const token = req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization;
            
                console.log("Token received for verification:", token);

            jwt.verify(token, jwtSecret);
            next();
        } catch (err) {
            res.statusMessage = invalidCredentials;
            return res.status(403).json({ message: invalidCredentials });
        }
};

export default auth;
