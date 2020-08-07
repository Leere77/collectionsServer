const User = require('../mongooseSchemas/userSchema');
const { createTokens } = require('../auth');

exports.validateUser = async (args, res) => {
    try {
        const user = await User.findOne({email: args.email});

        if (!user)
            return user;

        const { _id, password } = user;

        if (!_id || password != args.password) 
            return null;

        const { accessToken, refreshToken } = createTokens(user);

        res.cookie('access-token', accessToken);
        res.cookie('refresh-token', refreshToken);

        return user

    } catch (error) {
        console.log(error);
    }
};

exports.getUser = async req => {
    try {
        const user = req._id ? await User.findById(req._id) : await User.findOne({name: req.name});
        return user
    } catch (error) {
        console.log(error);
    }
};

exports.addUser = async req => {
    try { 
        const user = new User(req);
        const newUser = await user.save();
        return newUser;
    } catch (error) {
        console.log(error);
    }
};

exports.updateUser = async req => {
    try {
        return await User.findOneAndUpdate({name: req.name}, req.params);
    } catch (error) {
        console.log(error);
    }
};