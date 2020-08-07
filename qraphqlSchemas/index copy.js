const { GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
	GraphQLID,
	GraphQLList,
    GraphQLNonNull } = require('graphql');
    
const userController = require('../controllers/userController');
const collectionController = require('../controllers/collectionController');

// const collectionsType = new GraphQLObjectType({
//     name: 'Collections',
//     fields: () => ({
//         book: { type: GraphQLID },
//         movie: { type: GraphQLID },
//         series: { type: GraphQLID },
//         custom: { type: [GraphQLID] },
//         bookmarks: { type: [GraphQLID]}
//     })
// });

const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        // collections: { type: [{
        //     book: { type: GraphQLID },
        //     movie: { type: GraphQLID },
        //     series: { type: GraphQLID },
        //     custom: { type: [GraphQLID] },
        //     bookmarks: { type: [GraphQLID]}
        // }]},
        links: { type: [GraphQLString] }
    })
});
debugger
// const titleType = new GraphQLObjectType({
//     name: 'Title',
//     fields: () => ({
//         title: { type: GraphQLString },
//         rated: { type: GraphQLInt },
//         poster: { type: GraphQLString },
//         author: { type: GraphQLString },
//         year: { type: GraphQLInt }
//     })
// });

const collectionType = new GraphQLObjectType({
    name: 'Collection',
    fields: () => ({
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        // list: { type: [{
        //     title: { type: GraphQLString },
        //     rated: { type: GraphQLInt },
        //     poster: { type: GraphQLString },
        //     author: { type: GraphQLString },
        //     year: { type: GraphQLInt }
        // }]},
        private: { type: GraphQLBoolean },
        anonymous: { type: GraphQLBoolean },
        ratedBy: { type: [GraphQLID] },
        owner: { type: GraphQLID }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: userType,
            args: { name: { type: GraphQLString }},
            async resolve(parent, args) {
                return await userController.getUser(args)
            }
        },
        collection: {
            type: collectionType,
            args: { name: { type: GraphQLID }},
            async resolve(parent, args) {
                return await collectionController.getCollection(args)
            }
        },
    }
});
/*
const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        addUser: {
            type: userType,
            args: {},
            async resolve(args) {
                return ''
            }
        },
        updateUser: {
            type: userType,
            args: {},
            async resolve(args) {
                return ''
            }
        }
    }
});
*/
module.exports = new GraphQLSchema({
    query: RootQuery,
    //mutation: Mutations
});