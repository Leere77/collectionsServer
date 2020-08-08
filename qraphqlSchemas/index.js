/*
 TODO:
    Разделить query и mutations 
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
    name: 'contentType',
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
                if (!req._id)  
                    return null;
                
                return await userController.getUser({ _id: req._id });
            }
        },
        user: {
            type: userType,
            args: { name: { type: GraphQLString }, _id: { type: GraphQLID }},
            async resolve(_, args) {
                let user = await userController.getUser(args);
                return user;
            }
        },
        getCollection: {
            type: collectionType,
            args: { _id: { type: GraphQLID }},
            async resolve(_, args, req) {
                return await collectionController.getCollection(args, req._id);
            }
        },
        fetchTitle: {
            type: new GraphQLList(titleType),
            args: { 
                search: { type: GraphQLString },
                type: { type: contentType }
            },
            async resolve(_, { search, type }) {
                if (type == 'book')
                    return await titleController.googleApi(search);
                else
                    return await titleController.imdbApi(search, type);
            }
        }
    }
});
//resolvers as array
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
                return await userController.addUser(args);
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
                if (!req._id)  
                    return null;
                
                return await userController.updateUser(args, req._id);
            }
        },
        addBookmark: {
            type: GraphQLBoolean,
            args: { 
                _id: { type: GraphQLID }
            },
            async resolve(_, args, req) {
                if (!req._id)  
                    return null;
                
                return await collectionController.addBookmark(args, req._id);
            }
        },
        removeBookmark: {
            type: GraphQLBoolean,
            args: { 
                _id: { type: GraphQLID }
            },
            async resolve(_, args, req) {
                if (!req._id)  
                    return null;
                
                return await collectionController.removeBookmark(args, req._id);
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
                // if (!req._id)  
                //     return null;

                return await collectionController.addCollection(args, req._id);
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
                // if (!req._id)  
                //     return null;

                return collectionController.updateCollection(args, req._id);
            }
        },
        removeCollection: {
            type: GraphQLBoolean,
            args: {
                _id: { type: GraphQLID },
            },
            async resolve(_, args, req) {
                // if (!req._id)  
                //     return null;

                return collectionController.removeCollection(args, req._id);
            }
        },
        addTitle: { 
            type: titleType,
            args: {
                _id: { type: GraphQLID },
                title: { type: titleInput }
            },
            async resolve(_, args, req) {
                // if (!req._id)  
                //     return null;

                return await collectionController.addTitle(args, req._id);
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
                // if (!req._id)  
                //     return null;

                return await collectionController.deleteTitle(args);
            }
        },
        login: {
            type: userType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(_, args, {res}) {
                return await userController.validateUser(args, res);
            }
        },
        resetAuth: {
            type: GraphQLBoolean,
            async resolve(_, args, res) {
                if (!res._id)
                    return null;
    
                return userController.resetAuth(res._id);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations
});