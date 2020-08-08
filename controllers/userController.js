const User = require('../mongooseSchemas/userSchema');
const Collection = require('../mongooseSchemas/collectionSchema');
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

        return user;

    } catch (error) {
        console.log(error);
    }
};

exports.getUser = async req => {
    try {
        const user = req._id ? 
            await User.findById(req._id) : 
            await User.findOne({name: req.name});

        return user
    } catch (error) {
        console.log(error);
    }
};

exports.addUser = async req => {
    try { 
        const ifEmailExists = await User.findOne({ email: req.email });
        const ifUserExists = await User.findOne({ name: req.name });

        if (ifEmailExists || ifUserExists) // TODO: заменить на две независимые проверки
            return null;

        const user = new User(req);
        const newUser = await user.save();
        return newUser;
    } catch (error) {
        console.log(error);
    }
};

exports.updateUser = async (req, _id) => {
    try {
        if (req.passwordNew) {
            const user = await User.findById(_id); // TODO: throw specific error

            if (user.password != req.password)
                return null;
        }

        if (req.passwordNew) {
            req.password = req.passwordNew;
            delete req.passwordNew;
        }

        return await User.findByIdAndUpdate(_id, req);
    } catch (error) {
        console.log(error);
    }
};

exports.getCollections = async (req, _id) => {
    try {
        let collections = await Collection.find({ owner: req._id }, {__v: 0});

        if (_id != req._id)
            collections = collections.filter(collection => collection.private);

        return collections;
    } catch (error) {
        console.log(error);
        return [];
    }
};

exports.getBookmarks = async (req, _id) => {
    try {
        let collections = await Collection.find({ _id: {
            $in: req.bookmarks
        } }, {__v: 0});

        return collections;
    } catch (error) {
        console.log(error);
        return [];
    }
};


exports.resetAuth = async _id => {
    try {
        await User.findByIdAndUpdate(_id, { $inc: { count: 1 } });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};