const User = require('../mongooseSchemas/userSchema');
const Collection = require('../mongooseSchemas/collectionSchema');
const { createTokens } = require('../auth');
const ContentError = require('../error');

const generalErrorHandler = err => 
    new Error(err instanceof ContentError ? 
        err.message : 
        'Internal error');

exports.validateUser = async (args, res) => {
    try {
        const user = await User.findOne({email: args.email});

        if (!user)
            throw new ContentError('WRONG_CREDENTIALS', 'User');

        const { _id, password } = user;

        if (!_id || password != args.password) 
            throw new ContentError('WRONG_CREDENTIALS');

        const { accessToken, refreshToken } = createTokens(user);

        res.cookie('access-token', accessToken);
        res.cookie('refresh-token', refreshToken);

        return user;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.getUser = async req => {
    try {
        const user = req._id ? 
            await User.findById(req._id) : 
            await User.findOne({name: req.name});
        
        if (!user)
            throw new ContentError('USER_NOT_FOUND', 'User');

        return user
    } catch (err) {
        return generalErrorHandler(err);
    }
};

exports.addUser = async req => {
    try { 
        const emailExists = await User.findOne({ email: req.email });
        const userExists = await User.findOne({ name: req.name });

        if (emailExists) throw new ContentError('EMAIL_ALREADY_TAKEN');
        if (userExists) throw new ContentError('USERNAME_ALREADY_TAKEN');

        const user = new User(req);
        const newUser = await user.save();

        return newUser;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.updateUser = async (req, _id) => {
    try {
        if (req.passwordNew) {
            const user = await User.findById(_id);

            if (user.password != req.password)
                throw new ContentError('WRONG_CREDENTIALS');
        }

        if (req.passwordNew) {
            req.password = req.passwordNew;
            delete req.passwordNew;
        }

        return await User.findByIdAndUpdate(_id, req);
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.getCollections = async (req, _id) => {
    try {
        let collections = await Collection.find({ owner: req._id }, {__v: 0});

        if (_id != req._id)
            collections = collections.filter(collection => collection.private);

        return collections;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.getBookmarks = async (req, _id) => {
    try {
        let collections = await Collection.find({ _id: {
            $in: req.bookmarks
        } }, {__v: 0});

        return collections;
    } catch (error) {
        return generalErrorHandler(err);
    }
};


exports.resetAuth = async _id => {
    try {
        await User.findByIdAndUpdate(_id, { $inc: { count: 1 } });
        return true;
    } catch (error) {
        return generalErrorHandler(err);
    }
};