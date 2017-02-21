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


function RealEstate ( urlLBC, sendData ) {        // Cette fonction récupère les données des sites Le Bon Coin et Meilleurs Agents afin de les comparer et de déterminer si l'offre immobilière du bon coin est intéressante ou pas

    request( urlLBC, function ( error, response, html ) {
        if ( !error && response.statusCode == 200 ) {

            var $ = cheerio.load( html )

            var lbcDataArray = $( 'section.properties span.value' )                     // Récupération des données du Bon Coin

            var price = parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 )
            var city = $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' )
            var type = $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase()
            var surface = parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )

            var urlMA = 'https://www.meilleursagents.com/prix-immobilier/' + city ;  //Accès a l'URL de meilleur Agent en fonction de la ville de l'offre du Bon Coin

            request( urlMA, function ( error, response, html ) {
            if ( !error ) {

                var $ = cheerio.load( html )

                if (type == 'appartement'){             //Le prix est différent en fonction du type de bien
                    var PrixMA =  parseInt($($($('.price-summary_values.row')[1]).find('.columns')[2]).text().trim().replace(/\s/g,''))  //Prix moyen d'un appartement au m2 selon la ville
                }
                else {
                    var PrixMA = parseInt($($($('.price-summary_values.row')[2]).find('.columns')[2]).text().trim().replace(/\s/g,''))      //Prix moyen d'une maison au m2 selon la ville
                }

                if ( (price/surface) <= PrixMA ){              // Si le prix du m2 de l'annonce le bon coin est moins élévé que le prix de Meilleur Agent, c'est un bon deal
                    var FinalResult = ' It is a good deal ! '
                }
                else {
                    var FinalResult = ' It is not a good deal ! '
                }

                var Data = {            // On stocke les données récupérées dans un objet
                    Pr : price,
                    Cit : city,
                    Typ : type,
                    Surf :surface,
                    MeilleurPrix : PrixMA,
                    FRes : FinalResult
                }

            sendData( Data )
                }
                else {

                    console.log( error )

                }
            })
        }

        else {

            console.log( error )

        }

    })

}


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    res.render( 'home', {
        message : "",
        prix: '',
        ville: '',
        typeB: '',
        surfaceB: '',
        BestPrice: '',
        Res : ''
    });
});

app.get ( '/call', function ( req, res ) {
    var urlLBC = req.query.urlLBC
    
    RealEstate ( urlLBC, function ( Data ) {
        res.render('home', {
        message : "",
        prix: Data.Pr,
        ville: Data.Cit,
        typeB: Data.Typ,
        surfaceB: Data.Surf,
        BestPrice : Data.MeilleurPrix,
        Res : Data.FRes
        })
    });
});


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});