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
    host: 'http://localhost:8521',
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
var UserData = require('./app/models/user_data');
var OtpUser = require('./app/models/otp_user');
var HostMenuSave = require('./app/models/host_menu_save');
var port = 8521;
var jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');

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
//
apiRoutes.post('/hostMenuSave', function(req, res) {
    if (false /*!req.body.hostId || !req.body.FoodName*/ ) {
        res.json({ success: false, msg: 'Enter the food details properly' });
    } else {
        var newHostMenuSave = new HostMenuSave({
            hostId: 12345678,
            MenuDetails: ['chapathi', 'palya', 'kosambari'],
            FoodName: 'Veg Meals',
            lat: 123.444,
            long: 12.55,
            placeType: 'OFFICE',
            foodType: ['VEG', 'NON_VEG'],
            flavorType: ['SWEET', 'SALTY'],
            noOfPlates: 2,
            ForWhichTime: ['BREAKFAST', 'LUNCH', 'DINNER'],
            ForWhichDate: '2017-07-22T09:54:46.000Z'

        });
        // save the user
        newHostMenuSave.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: 'Not able to save the data' });
            }
            res.json({ success: true, msg: 'Menu Saved successfully' });
        });
    }
});



// create a new user account (POST http://localhost:8080/api/signup)
/**
 * @swagger
 * definition:
 *   GuestDuty_Signup:
 *     properties:
 *       mobile:
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
    if (!req.body.mobile || !req.body.password) {
        res.json({ success: false, msg: 'Please enter Mobile number and password.' });
    } else {
        var newUser = new User({
            mobile: req.body.mobile,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err) {
            console.log("inside save function");
            if (err) {
                return res.json({ success: false, msg: 'Username already exists.' });
            } else {
                console.log("findnig the user logic");
                User.findOne({
                    mobile: req.body.mobile
                }, function(err, user_data) {
                    if (err) {
                        return res.json({ success: false, msg: "Could not find the user" });
                    } else {
                        return res.json({ success: true, msg: user_data });
                    }


                });
            }
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
 *       mobile:
 *         type: number
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
        mobile: req.body.mobile
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
                    res.json({ success: true, token: 'JWT ' + token, msg: user });
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
 *   GuestDuty_SaveUserData:
 *     properties:
 *       name:
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
 *       profession:
 *         type: string
 *       gender:
 *         type: string
 *       dob:
 *         type: string
 *       address:
 *         type: string
 *       userid:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/SaveUserData:
 *   post:
 *     tags:
 *       - SaveUserData
 *     description: Saving the data of the User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_SaveUserData
 *         description: User data Object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_SaveUserData'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the data of the user
 */
apiRoutes.post('/SaveUserData', function(req, res) {
    UserData.findOne({
        mobile: req.body.mobile
    }, function(err, user) {
        if (err) throw "something is wrong";

        if (!user) {
            var newUserData = new UserData({
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                lat: req.body.lat,
                long: req.body.long,
                landmark: req.body.landmark,
                profession: req.body.profession,
                gender: req.body.gender,
                address: req.body.address,
                dob: req.body.dob,
                userid: req.body.userid


            });
            // save the user
            newUserData.save(function(err) {
                if (err) {
                    return res.json({ success: false, msg: 'Something went wrong' });
                }
                res.json({ success: true, msg: 'Successful created new user.' });
            });

        } else {
            res.send({ success: false, msg: 'User already exists' });
        }
    });
});

//Get User details
/**
 * @swagger
 * definition:
 *   GuestDuty_userDetails:
 *     properties:
 *       mobile:
 *         type: number
 *       
 */
/**
 * @swagger
 * /api/userDetails:
 *   post:
 *     tags:
 *       - User
 *     description: Getting particular user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_UserDetails
 *         description: user data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_userDetails'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of the user
 */
apiRoutes.post('/userDetail', function(req, res) {

    if (req.body.mobile) {
        // console.log(req.params);
        UserData.findOne({ mobile: req.body.mobile }, function(err, docs) {
            if (err) {
                return res.json({ success: false, msg: 'Check the email id' })
            } else {
                res.json(docs);
            }

        });
    }

});

//Get all the user details
/**
 * @swagger
 * definition:
 *   GuestDuty_allUsers:
 *     
 *  
 *       
 */
/**
 * @swagger
 * /api/allUsers:
 *   get:
 *     tags:
 *       - allUsers
 *     description: Getting particular user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_allUsers
 *         description: users data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_allUsers'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the users
 */
apiRoutes.get('/allUsers', function(req, res) {

    UserData.find({}, function(err, docs) {
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
 *         mobile:
 *           type: number
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
    if (!req.body.mobile || !req.body.oldPassword || !req.body.newPassword) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                // check if password matches
                user.comparePassword(req.body.oldPassword, function(err, isMatch) {
                    if (isMatch && !err) {
                        bcrypt.genSalt(10, function(err, salt) {
                            if (err) {
                                return next(err);
                            }
                            bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                                if (err) {
                                    return next(err);
                                }
                                req.body.newPassword = hash;
                                User.update({ mobile: req.body.mobile }, {
                                    password: req.body.newPassword
                                }, function(err, resp) {
                                    if (err) {
                                        res.send({ success: false, msg: 'something went wrong' });
                                    }
                                    if (resp) {
                                        res.send({ success: true, msg: "succesfully updated the password" });
                                    }
                                });
                            });
                        });



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
        UserData.find({ mobile: req.body.mobile }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                var myOtp = 1234;
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

    if (!req.body.otp || !req.body.mobile) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        OtpUser.find({ mobile: req.body.mobile }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else {
                OtpUser.find({ otp: req.body.otp, mobile: req.body.mobile }, function(err, user) {
                    if (err) {
                        return res.json({ success: false, msg: "data not found" });
                    } else {
                        UserData.find({ mobile: req.body.mobile }, function(err, user) {
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
 *         mobile:
 *           type: number
 *         newPassword:
 *           type: string
 *         confirmPassword:
 *           type: string
 */
/**
 * @swagger
 * /api/forgotPassword:
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
    if (!req.body.mobile || !req.body.newPassword || !req.body.confirmPassword) {
        res.json({ success: false, msg: 'Missing some fields I guess!!' });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user' });
            } else if (req.body.newPassword !== req.body.confirmPassword) {
                return res.json({ success: false, msg: 'Password is not matching' });
            } else {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return next(err);
                    }
                    bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                        if (err) {
                            return next(err);
                        }
                        req.body.newPassword = hash;
                        User.update({ mobile: req.body.mobile }, {
                            password: req.body.newPassword
                        }, function(err, resp) {
                            if (err) {
                                res.send({ success: false, msg: 'something went wrong' });
                            }
                            if (resp) {
                                res.send({ success: true, msg: "succesfully changed the password" });
                            }
                        });
                    });
                });

            }
        });
    }
});

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);