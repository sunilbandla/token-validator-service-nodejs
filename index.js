var express = require("express");
var morgan = require("morgan");
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

var options = {
    // The URL of the metadata document for your app. We will put the keys for token validation from the URL found in the jwks_uri tag of the in the metadata.
    identityMetadata: "https://login.microsoftonline.com/common/.well-known/openid-configuration/",
    clientID: "YOUR_CLIENT_ID", // Replace with your Client ID
    validateIssuer: false,
    loggingLevel: 'warn',
    passReqToCallback: false
};

// Check for client id placeholder
if (options.clientID === 'YOUR_CLIENT_ID') {
    console.error("Please update 'options' with the client id (application id) of your application");
    return;
}

var bearerStrategy = new BearerStrategy(options,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

var app = express();
app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/api/claims",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        var claimsList = Object.keys(claims)
            .reduce(function (previous, key) {
                return previous.concat({
                    type: key,
                    value: claims[key]
                });
            }, []);
        res.status(200).json(claimsList);
    }
);

app.listen(5000, function () {
    console.log("Listening on port 5000");
});
