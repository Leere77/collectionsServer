const jwt = require('jsonwebtoken');
const User = require('./mongooseSchemas/userSchema');

const REFRESH_SECRET = '123';
const ACCESS_SECRET = '1234';

function createTokens({ _id, count }) {
    const refreshToken = jwt.sign({ _id, count }, REFRESH_SECRET, { expiresIn: "50min" });
    const accessToken = jwt.sign({ _id }, ACCESS_SECRET, { expiresIn: "30min" });

    return { refreshToken, accessToken };
};

exports.authMiddleware = async function (req, res, next) {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    let tokenData;

    if (!accessToken && !refreshToken)
        return next();

    try {
        tokenData = jwt.verify(accessToken, ACCESS_SECRET);
        req._id = tokenData._id;
        return next();
    } catch (error) {
        console.log('access token expired');
    }

    if (!refreshToken) 
        return next();

    try {
        tokenData = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (error) {
        console.log('refresh token expired');
        return next();
    }

    const user = await User.findById(tokenData._id);

    if (!user || user.count != tokenData.count)
        return next(); 

    const { accessToken: newToken } = createTokens(user);

    res.cookie('access-token', newToken);

    req._id = tokenData._id;
    return next();
};

exports.createTokens = createTokens;