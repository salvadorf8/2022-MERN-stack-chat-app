const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // if token is expired, .verify will throw an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.body.userId = decoded.userId;

        next();
    } catch (error) {
        // error is then caught from .verify
        res.send({ message: error.message, success: false });
    }
};
