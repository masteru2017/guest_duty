var express = require('express');
var app = express();
var path = require('path');
var swaggerJSDoc = require('swagger-jsdoc');
// swagger definition
var swaggerDefinition = {
    info: {
        title: 'Node Swagger API',
        version: '1.0.0',
        description: 'Demonstrating how to describe a RESTful API with Swagger',
    },
    host: 'localhost:5000',
    basePath: '/',
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['server.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var http = require('http');
var passport = require('passport');
var config = require('./config/database'); // get db config file
var User = require('./app/models/user'); // get the mongoose model
var Host = require('./app/models/host');
var OtpUser = require('./app/models/otp_user');
var port = 5000;
var jwt = require('jwt-simple');


// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
/**
 * @swagger
 * definition:
 *   GuestDuty_Signup:
 *     properties:
 *       name:
 *         type: string
 *       password:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/signup:
 *   post:
 *     tags:
 *       - Signing Up
 *     description: Signing up an User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty
 *         description: Signup object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_Signup'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to signing up an user
 */
apiRoutes.post('/signup', function(req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({ success: false, msg: 'Please pass name and password.' });
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: 'Username already exists.' });
            }
            res.json({ success: true, msg: 'Successful created new user.' });
        });
    }
});

// connect the api routes under /api/*
app.use('/api', apiRoutes);


/**
 * @swagger
 * definition:
 *   GuestDuty_Authenticate:
 *     properties:
 *       name:
 *         type: string
 *       password:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/authenticate:
 *   post:
 *     tags:
 *       - Log In
 *     description: Login for User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_Authenticate
 *         description: Login Object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_Authenticate'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to logging in an user
 */
apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({ success: true, token: 'JWT ' + token });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            });
        }
    });
});

/**
 * @swagger
 * definition:
 *   GuestDuty_SaveHostData:
 *     properties:
 *       hostname:
 *         type: string
 *       email:
 *         type: string
 *       lat:
 *         type: number
 *       long:
 *         type: number
 *       landmark:
 *         type: string
 *       mobile:
 *         type: number
 *       
 */
/**
 * @swagger
 * /api/SaveHostData:
 *   post:
 *     tags:
 *       - SaveHostData
 *     description: Saving the data of the Host
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_SaveHostData
 *         description: Host data Object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_SaveHostData'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the data of the host
 */
apiRoutes.post('/SaveHostData', function(req, res) {
    Host.findOne({
        hostname: req.body.hostname
    }, function(err, host) {
        if (err) throw err;

        if (!host) {
            var newHost = new Host({
                hostname: req.body.hostname,
                email: req.body.email,
                lat: req.body.lat,
                long: req.body.long,
                landmark: req.body.landmark,
                mobile: req.body.mobile
            });
            // save the user
            newHost.save(function(err) {
                if (err) {
                    return res.json({ success: false, msg: 'Username already exists.' });
                }
                res.json({ success: true, msg: 'Successful created new user.' });
            });

        } else {
            res.send({ success: false, msg: 'host not found' });
        }
    });
});

//Get Host User details
/**
 * @swagger
 * definition:
 *   GuestDuty_HostUser:
 *     properties:
 *       email:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/HostUser:
 *   post:
 *     tags:
 *       - HostUser
 *     description: Getting particular host data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_HostUser
 *         description: Host data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_HostUser'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of the host
 */
apiRoutes.post('/HostUser', function(req, res) {

    if (req.body.email) {
        // console.log(req.params);
        Host.findOne({ email: req.body.email }, function(err, docs) {
            if (err) {
                return res.json({ success: false, msg: 'Check the email id' })
            } else {
                res.json(docs);
            }

        });
    }

});

//Get all the host details
/**
 * @swagger
 * definition:
 *   GuestDuty_AllHosts:
 *     
 *  
 *       
 */
/**
 * @swagger
 * /api/AllHosts:
 *   get:
 *     tags:
 *       - AllHosts
 *     description: Getting particular host data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_AllHosts
 *         description: Host data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_AllHosts'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the hosts
 */
apiRoutes.get('/AllHosts', function(req, res) {

    Host.find({}, function(err, docs) {
        if (err) {
            return res.json({ success: false, msg: 'Check the email id' })
        } else {
            res.json(docs);
        }

    });
});

//Change the exisiting password
/**
 * @swagger
 * definition:
 *   GuestDuty_userResetPassword:
 *     properties:
 *         name:
 *           type: string
 *         oldPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *  
 *       
 */
/**
 * @swagger
 * /api/userResetPassword:
 *   post:
 *     tags:
 *       - userResetPassword
 *     description: Resetting the password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_userResetPassword
 *         description: Reset password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_userResetPassword'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to Reset the password of the user
 */
apiRoutes.post('/userResetPassword', function(req, res) {
    if (!req.body.name || !req.body.oldPassword || !req.body.newPassword) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        User.findOne({
            name: req.body.name
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                // check if password matches
                user.comparePassword(req.body.oldPassword, function(err, isMatch) {
                    if (isMatch && !err) {
                        User.findOneAndRemove({ name: req.body.name }, function(err) {
                            if (err) {
                                return res.json({ success: false, msg: err });
                            }
                        });
                        // if user is found and password is right create a token
                        var existingUser = new User({
                            name: req.body.name,
                            password: req.body.newPassword
                        });
                        // save the user
                        existingUser.save(function(err) {
                            if (err) {
                                return res.json({ success: false, msg: err });
                            }

                            res.json({ success: true, msg: 'Password Changed successfully' });
                        });
                        // return the information including token as JSON
                        // res.json({ success: true, token: 'JWT ' + token });
                    } else {
                        res.send({ success: false, msg: 'Something really went wrong' });
                    }
                });
            }
        });
    }
});

//SendOtp Api

/**
 * @swagger
 * definition:
 *   GuestDuty_SendOtp:
 *     properties:
 *         mobile:
 *           type: number
 *         
 *       
 */
/**
 * @swagger
 * /api/SendOtp:
 *   post:
 *     tags:
 *       - SendOtp
 *     description: Sending the OTP
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_SendOtp
 *         description: Send OTP
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_SendOtp'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to Send the OTP
 */
apiRoutes.post('/SendOtp', function(req, res) {
    if (!req.body.mobile) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        Host.find({ mobile: req.body.mobile }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                //OTP API logic should go here, but for now sending predefined otp
                var myOtp = Math.floor(Math.random() * 89999 + 10000);
                var url = 'http://199.189.250.157/smsclient/api.php?username=ankur1234&password=ankur_47463&source=AASHI&dmobile=' + req.body.mobile + '&message=' + myOtp;
                var req = http.request(url, function(res) {
                    console.log("done");
                });
                var SendUserOtp = new OtpUser({
                    otp: myOtp,
                    mobile: req.body.mobile
                });
                // save the OTP and mobile
                SendUserOtp.save(function(err) {
                    if (err) {
                        return res.json({ success: false, msg: err });
                    }

                    res.json({ success: true, msg: 'OTP sent succesfully' });
                });
            }
        });

    }

});

//OTP verify api
/**
 * @swagger
 * definition:
 *   GuestDuty_OtpVerify:
 *     properties:
 *         id:
 *           type: string
 *         otp:
 *           type: number
 *         mobile:
 *           type: number
 *    
 *       
 */
/**
 * @swagger
 * /api/OtpVerify:
 *   post:
 *     tags:
 *       - OtpVerify
 *     description: Verifying the OTP
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_OtpVerify
 *         description: Verify OTP
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_OtpVerify'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to Verify the OTP
 */
apiRoutes.post('/OtpVerify', function(req, res) {

    if (!req.body.id || !req.body.otp || !req.body.mobile) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        User.find({ _id: req.body.id }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                OtpUser.find({ otp: req.body.otp, mobile: req.body.mobile }, function(err, user) {
                    if (err) {
                        return res.json({ success: false, msg: "data not found" });
                    } else {
                        Host.find({ mobile: req.body.mobile }, function(err, user) {
                            if (err) {
                                return res.json({ success: false, msg: "data not found" });
                            } else {
                                res.json({ success: true, msg: user });
                            }
                        });
                    }

                });
            }
        });
    }
});

//Forgot password Api
/**
 * @swagger
 * definition:
 *   GuestDuty_forgotPassword:
 *     properties:
 *         name:
 *           type: string
 *         newPassword:
 *           type: string
 *         
 *    
 *       
 */
/**
 * @swagger
 * /api/OtpVerify:
 *   post:
 *     tags:
 *       - ForgotPassword
 *     description: Forgot password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_forgotPassword
 *         description: Forgot password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_forgotPassword'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to Set the password when forgot
 */
apiRoutes.post('/forgotPassword', function(req, res) {
    if (!req.body.name || !req.body.newPassword) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        User.findOne({
            name: req.body.name
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                User.findOneAndRemove({ name: req.body.name }, function(err) {
                    if (err) {
                        return res.json({ success: false, msg: err });
                    }
                });
                // if user is found and password is right create a token
                var forgotPasswordUser = new User({
                    name: req.body.name,
                    password: req.body.newPassword
                });
                // save the user
                forgotPasswordUser.save(function(err) {
                    if (err) {
                        return res.json({ success: false, msg: err });
                    }

                    res.json({ success: true, msg: 'Password Changed successfully' });
                });
            }
        });
    }
});

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);