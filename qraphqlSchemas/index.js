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

const collectionsType = new GraphQLObjectType({
    name: 'Collections',
    fields: () => ({
        own: { type: new GraphQLList(GraphQLID) },
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
        name: { type: GraphQLString },
        description: { type: GraphQLString },
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
        addCollection: {
            type: collectionType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                private: { type: GraphQLString },
                anonymous: { type: GraphQLString },
                owner: { type: GraphQLID },
            },
            async resolve(_, args) {
                return await collectionController.createCollection(args);
            }
        },
        addTitle: { // remove
            type: titleType,
            args: {
                _id: { type: GraphQLID },
                title: { type: titleInput }
            },
            async resolve(_, args, req) {
                // if (!req._id)  
                //     return null;

                return await collectionController.addTitle(args);
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
    
                return null;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations
});