const jwt = require('jsonwebtoken');

function generateResetToken(email) {
    const payload = { email };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' }; // Token expires in 1 hour

    return jwt.sign(payload, secret, options);
}

function verifyResetToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

module.exports = { generateResetToken, verifyResetToken };
