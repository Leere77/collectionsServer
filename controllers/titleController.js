const fetch = require('node-fetch');

exports.googleApi = async function googleApi(search) {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q='
        + encodeURI(search) + '&key=AIzaSyD9yAuJ81suWi1w_vkYBT9cPxFywpVeXGY');

    const body = await res.json();

    if (body.totalItems == 0)
        return null;//{ error: "Book not found!" };

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
    const res = await fetch('http://www.omdbapi.com/?apikey=421d68d9&s='
    + encodeURI(search) + '&type=' + type);

    const body = await res.json();
    
    if (body.Error)
        return null;//{ error: "Nothing found!" };
    
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