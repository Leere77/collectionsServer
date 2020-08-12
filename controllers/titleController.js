const fetch = require('node-fetch');
const { parsed: { GOOGLE_API_KEY, OMDB_API_KEY } } = require('dotenv').config();

exports.googleApi = async function googleApi(search) {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q='
        + encodeURI(search) + '&key=' + GOOGLE_API_KEY);
    const body = await res.json();

    if (body.totalItems == 0)
        return [];

    return body.items.map(book => {
        const { volumeInfo: { 
            title = '',
            authors = [],
            publishedDate: published = '',
            imageLinks: {thumbnail: image} = ''
            }} = book;

        return {
            title,
            author: authors.join(),
            image,//: image.replace('zoom=1', 'zoom=2'),
            published,
            contentType: 'book',
            rated: 0
        };
    });
}

exports.imdbApi = async function imdbApi(search = '', type = '') {
    const res = await fetch('http://www.omdbapi.com/?apikey=&s=' + OMDB_API_KEY
    + encodeURI(search) + '&type=' + type);

    const body = await res.json();
    
    if (body.Error)
        return [];
    
    return body.Search.map(item => {
        const { 
            Title: title,
            Year: published = '',
            Type: contentType = 'movie',
            Poster: image = ''
        } = item;

        return {
            title,
            author: '',
            image,
            published,
            contentType,
            rated: 0
        };
    });
}