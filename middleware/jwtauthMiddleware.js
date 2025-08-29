const jwt = require("jsonwebtoken");

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 21600 });
}

const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Authorization Header not found" })
        }

        // extracting the token from authorization header
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token not found" })
        }

        const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);

        //attaching decoded info to the request object;
        req.myUserPayload = decodedJWT;

        next(); //move forward to the expected route by the client

    } catch (err) {
        // console.log(err);
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = { verifyJWT, generateToken }