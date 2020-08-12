/*
 TODO:
    Разделить type, query и mutations 
    Тесты
*/

const { GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
	GraphQLID,
	GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
    GraphQLInputObjectType } = require('graphql');
    
const userController = require('../controllers/userController');
const collectionController = require('../controllers/collectionController');
const titleController = require('../controllers/titleController');
const ContentError = require('../error');


const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        collections: { 
            type: new GraphQLList(collectionType),
            async resolve(parent, args, req) {
                return await userController.getCollections(parent, req._id)
            }
        },
        bookmarks: { 
            type: new GraphQLList(collectionType),
            async resolve(parent, args, req) {
                return await userController.getBookmarks(parent, req._id)
            }
        },
        links: { type: new GraphQLList(GraphQLString) }
    })
});

const contentType = new GraphQLEnumType({
    name: 'ContentType',
    values: {
        book: { value: 'book' },
        movie: { value: 'movie' },
        series: { value: 'series' },
        game: { value: 'game' }
    }
});

const title = {
    name: 'Title',
    fields: () => ({
        title: { type: GraphQLString },
        contentType: { type: contentType},
        rated: { type: GraphQLInt },
        image: { type: GraphQLString },
        author: { type: GraphQLString },
        published: { type: GraphQLString }
    })
};

const titleInput = new GraphQLInputObjectType({ ...title, name: 'TitleInput' });
const titleType = new GraphQLObjectType(title);

const collectionType = new GraphQLObjectType({
    name: 'Collection',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        list: { type: new GraphQLList(titleType)},
        private: { type: GraphQLBoolean },
        ratedBy: { type: new GraphQLList(GraphQLID) },
        owner: { type: GraphQLID }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        me: {
            type: userType,            
            async resolve(parent, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
        
                    return await userController.getUser({ _id: req._id });
                } catch (err) {
                    throw err;
                }
            }
        },
        user: {
            type: userType,
            args: { 
                name: { type: GraphQLString },
                 _id: { type: GraphQLID }
            },
            async resolve(_, args) {
                try {
                    let user = await userController.getUser(args);
                    return user;
                } catch (err) {
                   throw err;
                }
            }
        },
        getCollection: {
            type: collectionType,
            args: { _id: { type: GraphQLID }},
            async resolve(_, args, req) {
                try {
                    return await collectionController.getCollection(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        fetchTitle: {
            type: new GraphQLList(titleType),
            args: { 
                search: { type: GraphQLString },
                type: { type: contentType }
            },
            async resolve(_, { search, type }, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
    
                    if (type == 'book')
                        return await titleController.googleApi(search);
                    else
                        return await titleController.imdbApi(search, type);
                } catch (err) {
                    throw err;
                }
            }
        }
    }
});

const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        addUser: {
            type: userType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(_, args) {
                try {
                    return await userController.addUser(args); 
                } catch (err) {
                    throw err;
                }
            }
        },
        updateUser: {
            type: userType,
            args: {
                name: { type: GraphQLString },
                links: { type: new GraphQLList(GraphQLString) },
                password: { type: GraphQLString },
                passwordNew: { type: GraphQLString },
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await userController.updateUser(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        addBookmark: {
            type: GraphQLBoolean,
            args: { 
                _id: { type: GraphQLID }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await collectionController.addBookmark(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        removeBookmark: {
            type: GraphQLBoolean,
            args: { 
                _id: { type: GraphQLID }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await collectionController.removeBookmark(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        addCollection: {
            type: collectionType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                private: { type: GraphQLString }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await collectionController.addCollection(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        updateCollection: {
            type: collectionType,
            args: {
                _id: { type: GraphQLID },
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                private: { type: GraphQLString }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                        return collectionController.updateCollection(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        removeCollection: {
            type: GraphQLBoolean,
            args: {
                _id: { type: GraphQLID },
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                        return collectionController.removeCollection(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        addTitle: { 
            type: titleType,
            args: {
                _id: { type: GraphQLID },
                title: { type: titleInput }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await collectionController.addTitle(args, req._id);
                } catch (err) {
                    throw err;
                }
            }
        },
        // updateTitle: { 
        //     type: titleType,
        //     args: {
        //         _idTitle: { type: GraphQLID },
        //         _idCollection: { type: GraphQLID },
        //         title: { type: titleInput }
        //     },
        //     async resolve(_, args, req) {
        //         // if (!req._id)  
        //         //     return null;

        //         return await collectionController.updateTitle(args);
        //     }
        // },
        deleteTitle: { 
            type: titleType,
            args: {
                _idTitle: { type: GraphQLID },
                _idCollection: { type: GraphQLID }
            },
            async resolve(_, args, req) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                        return await collectionController.deleteTitle(args);
                } catch (err) {
                    throw err;
                }
            }
        },
        login: {
            type: userType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(_, args, {res}) {
                try {
                    return await userController.validateUser(args, res);
                } catch (err) {
                    throw err;
                }
            }
        },
        resetAuth: {
            type: GraphQLBoolean,
            async resolve(_, args, res) {
                try {
                    if (!req._id)  
                        throw new ContentError('WRONG_CREDENTIALS', 'User');
                
                    return await userController.resetAuth(res._id);
                } catch (err) {
                    throw err;
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations
});