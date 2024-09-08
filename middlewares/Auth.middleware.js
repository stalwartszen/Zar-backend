const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('req.user', req.user)
        next();
    } catch (err) {
        return res.status(409).json({message : "Unauthorized access. Please try after sometime"})
    }
};

module.exports = authenticateToken;
