const { GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
	GraphQLID,
	GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType } = require('graphql');
    
const userController = require('../controllers/userController');
const collectionController = require('../controllers/collectionController');

const collectionsType = new GraphQLObjectType({
    name: 'Collections',
    fields: () => ({
        book: { type: GraphQLID },
        movie: { type: GraphQLID },
        series: { type: GraphQLID },
        custom: { type: new GraphQLList(GraphQLID) },
        bookmarks: { type: new GraphQLList(GraphQLID) }
    })
});

const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        collections: { type: collectionsType },
        links: { type: new GraphQLList(GraphQLString) }
    })
});

const titleType = new GraphQLObjectType({
    name: 'Title',
    fields: () => ({
        title: { type: GraphQLString },
        rated: { type: GraphQLInt },
        poster: { type: GraphQLString },
        author: { type: GraphQLString },
        year: { type: GraphQLInt }
    })
});

const contentType = new GraphQLEnumType({
    name: 'contentType',
    values: {
        book: { value: 'book' },
        movie: { value: 'movie' },
        series: { value: 'series' },
        custom: { value: 'custom' }
    }
});

const collectionType = new GraphQLObjectType({
    name: 'Collection',
    fields: () => ({
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        contentType: { type: contentType},
        list: { type: new GraphQLList(titleType)},
        private: { type: GraphQLBoolean },
        anonymous: { type: GraphQLBoolean },
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
        collection: {
            type: collectionType,
            args: { name: { type: GraphQLID }},
            async resolve(_, args) {
                return await collectionController.getCollection(args);
            }
        },
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
            },
            async resolve(_, args) {
                return 
            }
        },
        addCollection: {
            type: collectionType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                contentType: { type: contentType },
                private: { type: GraphQLString },
                anonymous: { type: GraphQLString },
                owner: { type: GraphQLID },
            },
            async resolve(_, args) {
                return await collectionController.createCollection(args);
            }
        },
        login: {
            type: userType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, args, {res}) => {
                return await userController.validateUser(args, res);
            }
        },
        resetAuth: async (_, args, res) => {
            if (!res._id)
                return null;
                
            return await userController.validateUser(args, res);
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations
});