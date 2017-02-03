//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );


//Mets le résultat dans la console
function callLeboncoin (){
    var url = 'https://www.leboncoin.fr/ventes_immobilieres/1076257949.htm?ca=12_s'

    request (url, function (error, response, html)
    {
        if (!error && response.statusCode == 200 ) {
            var $ = cheerio.load (html)

            console.log ($('h2.item_price span_value').text())
        }
        else {
            console.log(error)
        }
    })
}

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    res.render( 'home', {
        message: 'The Home Page!'
    });
});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});