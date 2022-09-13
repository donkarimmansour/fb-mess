const request = require( "request" );
const express = require( "express" );
const open = require( "open" );
const os = require( "os" );
const path = require( "path" );
const morgan = require('morgan');

const PORT = 3000; 

console.log( "Checking for new version..." );


request( { url: "https://raw.githubusercontent.com/FFace32/facebook-mass-message/master/package.json", json: true }, ( error, response, body ) =>
{
    if ( !error && response.statusCode === 200 )
    {
        if ( require( "./package.json" ).version !== body.version )
            console.log( `Version ${body.version} available! See https://github.com/FFace32/facebook-mass-message` );
    }

    const app = express();
    app
        .use( express.static( path.join( __dirname, "public" ) ) )
        .use( express.static( path.join( __dirname, "favicon" ) ) )
        .use( require( "body-parser" ).urlencoded( { extended: true } ) )
        .set( "view engine", "ejs" )
        .set( "views", path.join( __dirname, "views" ) );

        //development
        if (app.get("env") == "development") {
            app.use(morgan("dev"))
        }


        app.listen( PORT, () => {
            console.log( `Listening on http://localhost:${PORT}` );
            //open( `http://localhost:${PORT}` );

             const addresses = [];
             const interfaces = os.networkInterfaces();

                 for ( const name in interfaces )
            {
                if ( interfaces.hasOwnProperty( name ) )
                {
                    for ( const current of interfaces[name] )
                    {
                        if ( current.family === "IPv4" && current.internal === false )
                            addresses.push( current.address );
                    }
                }
            }


            if ( addresses.length )
            {
                console.log( "\nOther possible addresses:" );
                for ( const address of addresses )
                    console.log( `http://${address}:${PORT}` );
            }
        });

         require( "./routers/index" )( app);
       
} );  