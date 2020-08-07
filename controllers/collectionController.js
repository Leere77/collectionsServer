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
            [req.contentType == 'custom' ? '$push' : '$set']: {
                ['collections.' + req.contentType]: newCollection._id }
            };
    
        await User.findByIdAndUpdate(req.owner, updateUserCollectionsType);
        return newCollection;
    } catch (error) {
        console.log(error);
    }
};

exports.updateCollection = async req => {
    try {
        return await Collection.findByIdAndUpdate(req.params.id, req.params);
    } catch (error) {
        console.log(error);
    }
};
