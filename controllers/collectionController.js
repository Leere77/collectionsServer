const Collection = require('../mongooseSchemas/collectionSchema');
const User = require('../mongooseSchemas/userSchema');
const ContentError = require('../error');

const generalErrorHandler = err => 
    new Error(err instanceof ContentError ? 
        err.message : 
        'Internal error');

exports.getCollection = async (req, _id) => {
    try {
        const collection = await Collection.findById(req._id);

        if (collection.private && collection.owner != _id)
            throw new ContentError('ACCESS_DENIED', 'Collection');

        return collection;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.addCollection = async (req, owner) => {
    try {
        const collection = new Collection({ ...req, owner });
        const newCollection = await collection.save();
        let updateUserCollectionsType = {
            $push: {
                collections: newCollection._id }
            };

        await User.findByIdAndUpdate(owner, updateUserCollectionsType);
        //revert changes if user wasn't found
        return newCollection;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.updateCollection = async (req, _id) => { // add details
    try {
        const collection = Collection.findById(req._id);

        if (collection.owner != _id)
            throw new ContentError('ACCESS_DENIED');

        const update = {...req};
        delete update._id;

        const updatedCollection = await Collection.findByIdAndUpdate(req._id, req);

        return updatedCollection;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.removeCollection = async (req, _id) => { // add details
    try {
        const collection = Collection.findById(req._id);

        if (!collection)
            throw new ContentError('COLLECTION_NOT_FOUND', 'Collection');

        if (collection.owner != _id)
            throw new ContentError('ACCESS_DENIED', 'Collection');

        await User.findByIdAndUpdate(_id, {
            $pull: {
                'collections.bookmarks': [req._id]
            }
        });

        await Collection.findByIdAndRemove(req._id);

        return true;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.addTitle = async req => {
    try {
        const collection = await Collection.findByIdAndUpdate(req._id, {
            $push: { list: req.title }
        });

        if (!collection)
            throw new ContentError('COLLECTION_NOT_FOUND', 'Collection');

        return req.title;

    } catch (error) {
        return generalErrorHandler(err);
    }
};

// exports.updateTitle = async req => {
//     try {
//         const updatedFields = {};
//         const fields = Object.keys(req.title);

//         fields.forEach(field => {
//             updatedFields['list.$.' + field] = req.title[field]
//         });

//         await Collection.findOneAndUpdate(
//             {
//                 _id: req._idCollection,
//                 'list._id': req._idTitle
//             },
//             {
//                 $set: updatedFields
//         });

//         return req.title;

//     } catch (error) {
//         console.log(error);
//         return null;
//     }
// };

exports.deleteTitle = async req => {
    try {
        await Collection.findOneAndUpdate(
            {
                _id: req._idCollection,
            },
            {
                $pull: { list: {
                    _id: req._idTitle
                }}
        });

        return req.title;

    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.addBookmark = async (req, _id) => {
    try {
        const user = await User.findByIdAndUpdate(_id, 
            {
                $addToSet: {
                    bookmarks: req._id
                }
            });
        
        if (user)
            return true;
        
        return false;
    } catch (error) {
        return generalErrorHandler(err);
    }
};

exports.removeBookmark = async (req, _id) => {
    try {
        const user = await User.findByIdAndUpdate(_id, 
            {
                $pull: {
                    bookmarks: req._id
                }
            });
        
        if (user)
            return true;
        
        return false;
    } catch (error) {
        return generalErrorHandler(err);
    }
};