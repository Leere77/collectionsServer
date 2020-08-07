const Collection = require('../mongooseSchemas/collectionSchema');
const User = require('../mongooseSchemas/userSchema');

exports.getCollection = async req => {
    try {
        return await Collection.findById(req.params.collectionId);
    } catch (error) {
        console.log(error);
    }
};

exports.createCollection = async req => {
    try {
        const collection = new Collection(req);
        const newCollection = await collection.save();
        let updateUserCollectionsType = {
            $push: {
                ['collections.' + req.contentType]: newCollection._id }
            };
    
        await User.findByIdAndUpdate(req.owner, updateUserCollectionsType);
        return newCollection;
    } catch (error) {
        console.log(error);
    }
};

exports.updateCollection = async req => { // add details
    try {
        return await Collection.findByIdAndUpdate(req.params.id, req.params);
    } catch (error) {
        console.log(error);
    }
};

exports.addTitle = async req => {
    try {
        await Collection.findByIdAndUpdate(req._id, {
            $push: { list: req.title }
        });

        return req.title;

    } catch (error) {
        console.log(error);
    }
};

exports.updateTitle = async req => {
    try {
        const collection = await Collection.findOneAndUpdate(
            {
                _id: req._idCollection,
                list: req._idTitle
            },
            {
                $set: { "list.$": req.title }
        });
        console.log(collection)
        return req.title;

    } catch (error) {
        console.log(error);
    }
};