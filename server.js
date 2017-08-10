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
    host: 'http://139.59.80.42:5000',
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
var UserMenu = require('./app/models/user_menu');
var OtpUser = require('./app/models/otp_user');
var Save_Food_Detail = require('./app/models/save_food_detail');
var port = 5000;
var jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');
var OrderManage = require('./app/models/order_manage');
// get our request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
// Use the passport package in our application
app.use(passport.initialize());


app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// serve swagger
app.get('/swagger.json', function (req, res) {
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
apiRoutes.post('/signup', function (req, res) {
    if (!req.body.mobile || !req.body.password) {
        res.send({ success: false, msg: 'mobile or password is missing', data: null });
    } else {
        var newUser = new User({
            mobile: req.body.mobile,
            password: req.body.password
        });
        // save the user
        newUser.save(function (err, user_data) {
            if (err) {
                res.send({ success: false, msg: 'Username already exists', data: null });
            } else {
                User.findOne({
                    mobile: req.body.mobile
                }, function (err, user_data_found) {
                    if (err) {
                        res.send({ success: false, msg: "Could not find the user", data: null });
                    } else {
                        var myOtp = 1234;
                        var SendUserOtp = new OtpUser({
                            otp: myOtp,
                            mobile: req.body.mobile
                        });
                        // save the OTP and mobile
                        SendUserOtp.save(function (err) {
                            if (err) {
                                res.json({ success: false, msg: 'something is wrong', data: null });
                            }
                            else {
                                res.json({ success: true, msg: 'OTP sent succesfully and signed up successfully', data: user_data_found });
                            }

                        });

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
apiRoutes.post('/authenticate', function (req, res) {
    User.findOne({
        mobile: req.body.mobile
    }, function (err, user) {
        if (err) {
            res.send({ success: false, msg: 'something went wrong', data: null });
        }

        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. User not found.', data: null });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.send({ success: true, token: 'JWT ' + token, msg: 'succesfully authenticated', data: { userID: user._id } });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.', data: null });
                }
            });
        }
    });
});

/**
 * @swagger
 * definition:
 *   GuestDuty_saveUserData:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       latitude:
 *         type: number
 *       longitude:
 *         type: number
 *       landmark:
 *         type: string
 *       mobile:
 *         type: string
 *       profession:
 *         type: string
 *       gender:
 *         type: string
 *       dob:
 *         type: string
 *       address:
 *         type: string
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/saveUserData:
 *   post:
 *     tags:
 *       - saveUserData
 *     description: Saving the data of the User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_saveUserData
 *         description: User data Object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_saveUserData'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the data of the user
 */
apiRoutes.post('/saveUserData', function (req, res) {
    User.findOne({
        mobile: req.body.mobile
    }, function (err, user) {
        if (err) {
            res.json({ success: false, msg: 'something went wrong,some error', data: null });
        }

        if (user) {
            var newUserData = new UserData({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                landmark: req.body.landmark,
                profession: req.body.profession,
                gender: req.body.gender,
                address: req.body.address,
                dob: req.body.dob,
                userID: req.body.userID
            });
            // save the user
            newUserData.save(function (err, docs) {
                if (err) {
                    return res.json({ success: false, msg: 'Could not save the data some error', data: null });
                }
                else {
                    res.json({ success: true, msg: 'user saved successfully', data: docs });
                }
            });

        } else {
            res.send({ success: false, msg: 'user already exists', data: null });
        }
    });
});

//Get User details
/**
 * @swagger
 * definition:
 *   GuestDuty_userDetail:
 *     properties:
 *       mobile:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/userDetail:
 *   post:
 *     tags:
 *       - userDetail
 *     description: Getting particular user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_UserDetail
 *         description: user data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_userDetail'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of the user
 */
apiRoutes.post('/userDetail', function (req, res) {

    if (req.body.mobile) {
        // console.log(req.params);
        UserData.findOne({ mobile: req.body.mobile }, function (err, docs) {
            if (err) {
                res.send({ success: false, msg: 'mobile number not found', data: null });
            }
            else if (!docs) {
                res.send({ success: false, msg: 'mobile number not found', data: null });
            }
            else {
                res.send({ success: true, msg: 'user found', data: docs });
            }

        });
    }

});

//Get User details
/**
 * @swagger
 * definition:
 *   GuestDuty_userDetailByID:
 *     properties:
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/userDetailByID:
 *   post:
 *     tags:
 *       - userDetailByID
 *     description: Getting particular user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userDetailByID
 *         description: user data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_userDetailByID'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of the user
 */
apiRoutes.post('/userDetailByID', function (req, res) {

    if (req.body.userID) {
        // console.log(req.params);
        UserData.findOne({ userID: req.body.userID }, function (err, docs) {
            if (err) {
                res.send({ success: false, msg: 'some error here', data: '' });
            } else if (!docs) {
                res.send({ success: false, msg: 'user ID not found here', data: '' });

            } else {
                res.send({ success: true, msg: 'user found', data: docs });
            }

        });
    } else {
        res.send({ success: false, msg: 'missing some field', data: null });
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
apiRoutes.get('/allUsers', function (req, res) {

    UserData.find({}, function (err, docs) {
        if (err) {
            res.json({ success: false, msg: 'something went wrong', data: null });
        }
        else if (!docs) {
            res.json({ success: false, msg: 'no user present now ', data: null });
        }
        else {
            console.log("we are in success true case");
            console.log(docs);
            res.send({ success: true, msg: 'all users data fetched', data: docs });
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
apiRoutes.post('/userResetPassword', function (req, res) {
    if (!req.body.mobile || !req.body.oldPassword || !req.body.newPassword) {
        res.send({ success: false, msg: 'something is missing', data: null });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function (err, user) {
            if (err) {
                res.send({ success: false, msg: 'something went wrong', data: null });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: null });
            } else {
                // check if password matches
                user.comparePassword(req.body.oldPassword, function (err, isMatch) {
                    if (isMatch && !err) {
                        bcrypt.genSalt(10, function (err, salt) {
                            if (err) {
                                res.send({ success: false, msg: 'something went wrong in gen', data: null });
                            }
                            bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                                if (err) {
                                    res.send({ success: false, msg: 'something went wrong', data: null });
                                }
                                req.body.newPassword = hash;
                                User.update({ mobile: req.body.mobile }, {
                                    password: req.body.newPassword
                                }, function (err, resp) {
                                    if (err || !resp) {
                                        res.send({ success: false, msg: 'something went wrong', data: null });
                                    }
                                    if (resp) {
                                        res.send({ success: true, msg: "succesfully updated the password" });
                                    }
                                });
                            });
                        });



                    } else {
                        res.send({ success: false, msg: 'Something really went wrong', data: null });
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
 *   GuestDuty_sendOtp:
 *     properties:
 *         mobile:
 *           type: string
 *         
 *       
 */
/**
 * @swagger
 * /api/sendOtp:
 *   post:
 *     tags:
 *       - sendOtp
 *     description: sending the OTP
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_sendOtp
 *         description: send OTP
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_sendOtp'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to send the OTP
 */
apiRoutes.post('/sendOtp', function (req, res) {
    if (!req.body.mobile) {
        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
    } else {
        User.findOne({ mobile: req.body.mobile }, function (err, user) {
            if (err) {
                res.send({ success: false, msg: 'error in getting mobile number', data: null });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: null });
            } else {
                var myOtp = 1234;
                var SendUserOtp = new OtpUser({
                    otp: myOtp,
                    mobile: req.body.mobile
                });
                // save the OTP and mobile
                SendUserOtp.save(function (err, data) {
                    if (err || !data) {
                        res.send({ success: false, msg: 'something is wrong', data: null });
                    }
                    else {
                        res.send({ success: true, msg: 'OTP sent succesfully' });
                    }
                });
            }
        });

    }

});

//OTP verify api
/**
 * @swagger
 * definition:
 *   GuestDuty_otpVerify:
 *     properties:
 *         otp:
 *           type: number
 *         mobile:
 *           type: string
 *    
 *       
 */
/**
 * @swagger
 * /api/otpVerify:
 *   post:
 *     tags:
 *       - otpVerify
 *     description: Verifying the otp
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_otpVerify
 *         description: Verify otp
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_otpVerify'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to Verify the OTP
 */
apiRoutes.post('/otpVerify', function (req, res) {

    if (!req.body.otp || !req.body.mobile) {
        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
    } else {
        OtpUser.findOne({ mobile: req.body.mobile }, function (err, user) {
            console.log(user);
            if (err) {
                res.json({ success: false, msg: 'some error please check once again!!', data: null });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: null });
            } else {
                OtpUser.findOne({ mobile: req.body.mobile }, function (err, user) {
                    if (err || !user) {
                        res.send({ success: false, msg: "data not found", data: null });
                    } else {
                        User.findOne({ mobile: req.body.mobile }, function (err, user) {
                            if (err) {
                                return res.json({ success: false, msg: "data not found", data: null });
                            } else {
                                res.send({ success: true, msg: "successful" });
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
 *           type: string
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
 *       - forgotPassword
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
apiRoutes.post('/forgotPassword', function (req, res) {
    if (!req.body.mobile || !req.body.newPassword || !req.body.confirmPassword) {
        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: null });
            } else if (req.body.newPassword !== req.body.confirmPassword) {
                res.send({ success: false, msg: 'Password is not matching', data: null });
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
                    }
                    bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                        if (err) {
                            res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
                        }
                        req.body.newPassword = hash;
                        User.update({ mobile: req.body.mobile }, {
                            password: req.body.newPassword
                        }, function (err, resp) {
                            if (err || !resp) {
                                res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
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

//Saving the Host menu
/**
 * @swagger
 * definition:
 *   GuestDuty_saveFoodDetails:
 *     properties:
 *         userID:
 *           type: string
 *         itemDetails:
 *           type: "[{item_name:String,item_qty:Number,item_price:Number,item_unit:String}]"
 *         foodName:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         placeType:
 *           type: string
 *         foodType: 
 *           type: "['VEG,'NON_VEG']"
 *         filterType:
 *           type: "['String','String']"
 *         forWhichTime:
 *           type: "['BREAKFAST','LUNCH','DINNER']"
 *         forWhichDate:
 *           type: string
 *         description:
 *           type: string
 *         
 */
/**
 * @swagger
 * /api/saveFoodDetails:
 *   post:
 *     tags:
 *       - saveFoodDetails
 *     description: Host Menu Save
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_saveFoodDetails
 *         description: Saving the host menu
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_saveFoodDetails'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the Menu entered by host
 */
apiRoutes.post('/saveFoodDetails', function (req, res) {
    if (!req.body.userID || !req.body.foodName) {
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: null });
    } else {
        var newSave_Food_Detail = new Save_Food_Detail({
            userID: req.body.userID,
            itemDetails: req.body.itemDetails,
            foodName: req.body.foodName,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            placeType: req.body.placeType,
            foodType: req.body.foodType,
            filterType: req.body.filterType,
            forWhichTime: req.body.forWhichTime,
            forWhichDate: req.body.forWhichDate,
            description: req.body.description
        });
        // save the user
        newSave_Food_Detail.save(function (err) {
            if (err) {
                res.json({ success: false, msg: 'error is there while storing check again', data: null });
            }
            else {
                res.json({ success: true, msg: 'Menu Saved succesfully' });
            }
        });
    }
});

//Profile Details
/**
 * @swagger
 * definition:
 *   GuestDuty_profileDetail:
 *     properties:
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/profileDetail:
 *   post:
 *     tags:
 *       - profileDetail
 *     description: Getting particular user profile data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_profileDetail
 *         description: user profile data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_profileDetail'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the profile data of the user
 */
apiRoutes.post('/profileDetail', function (req, res) {

    if (req.body.userID) {
        UserData.findOne({ userID: req.body.userID }, function (err, docs) {
            if (err) {
                res.json({ success: false, msg: 'some error check again!!', data: null });
            } else if (!docs) {
                res.json({ success: false, msg: 'user not found!', data: null });
            }

            else {
                res.json({ success: true, msg: 'user found', data: docs });
            }

        });
    }

});

//FoodList
/**
 * @swagger
 * definition:
 *   GuestDuty_foodList:
 *     
 *  
 *       
 */
/**
 * @swagger
 * /api/foodList:
 *   get:
 *     tags:
 *       - foodList
 *     description: Getting all food details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_foodList
 *         description: Food data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_foodList'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the foods
 */
apiRoutes.get('/foodList', function (req, res) {

    Save_Food_Detail.find({}, function (err, docs) {
        if (err) {
            res.json({ success: false, msg: 'some error while fetching!!', data: null });
        } else {
            res.json({ success: true, msg: 'Food details data fetched', data: docs });
        }

    });
});

/**
 * @swagger
 * definition:
 *   GuestDuty_foodDetail:
 *     properties:
 *       foodID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/foodDetail:
 *   post:
 *     tags:
 *       - foodDetail
 *     description: Getting particular food data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_foodDetail
 *         description: food individual data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_foodDetail'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the food data
 */
apiRoutes.post('/foodDetail', function (req, res) {

    if (req.body.foodID) {
        Save_Food_Detail.findOne({ _id: req.body.foodID }, function (err, docs) {
            if (err) {
                res.send({ success: false, msg: 'food details not found', data: null });
            }
            else if (!docs) {
                res.send({ success: false, msg: 'food id doesnot correct', data: null });
            }
            else {
                if (docs.userID) {
                    UserData.findOne({ userID: docs.userID }, function (err, user_details) {
                        if (err) {
                            res.send({ success: false, msg: 'food details not found', data: null });
                        } else {
                            res.send({ success: true, msg: 'food details found', data: { food_detail: docs, user_detail: user_details } });
                        }
                    });
                }

            }

        });
    } else {
        res.send({ success: false, msg: 'you havent given foodID', data: null });
    }

});

//Saving the orderfood
/**
 * @swagger
 * definition:
 *   GuestDuty_orderfood:
 *     properties:
 *         foodID:
 *           type: string
 *         hostID:
 *           type: string
 *         eaterID:
 *           type: string
 *         itemDetail: 
 *           type: "[{itemName:String, itemQty:Number, itemPrice:Number, itemUnit:String}]"
 *         paymentID:
 *           type: string        
 *         totalPrice:
 *           type: number
 *         orderStatus:
 *           type: string
 *         
 */
/**
 * @swagger
 * /api/orderfood:
 *   post:
 *     tags:
 *       - orderfood
 *     description: order Save 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_orderfood
 *         description: Saving the order
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_orderfood'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the order posted by host
 */

apiRoutes.post('/orderfood', function (req, res) {

    if (!req.body.foodID || !req.body.hostID || !req.body.eaterID) {
        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
    } else {
        var orderBooking = new OrderManage({
            foodID: req.body.foodID,
            hostID: req.body.hostID,
            eaterID: req.body.eaterID,
            items: req.body.itemDetail,
            totalPrice: req.body.totalPrice,
            orderStatus: req.body.orderStatus,
            paymentID: req.body.paymentID
        });
        // save the user
        orderBooking.save(function (err) {
            if (err) {
                res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
            }
            res.send({ success: true, msg: 'Ordered successfully' });
        });
    }

});


//orderhistory
/**
 * @swagger
 * definition:
 *   GuestDuty_orderhistory:
 *     properties:
 *         hostID:
 *           type: string
 *         eaterID:
 *           type: string
 * 
 *  
 *       
 */
/**
 * @swagger
 * /api/orderhistory:
 *   post:
 *     tags:
 *       - orderhistory
 *     description: Getting all order details by giving either hostID or eaterID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_orderhistory
 *         description: order data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_orderhistory'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the orders based on host0Id or eaterId
 */

apiRoutes.post('/orderhistory', function (req, res) {

    if (req.body.hostID || req.body.eaterID) {
        OrderManage.find({ $or: [{ "hostID": req.body.hostID }, { "eaterID": req.body.eaterID }] }, function (err, docs) {
            if (err || !docs) {
                res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });
            } else {

                res.send({ success: true, msg: 'order details fetched successfull', data: docs });
            }

        });
    } else {

        res.send({ success: false, msg: 'Missing some fields I guess!!', data: null });

    }

});

//cookList
/**
 * @swagger
 * definition:
 *   GuestDuty_cookList:
 *     
 *  
 *       
 */
/**
 * @swagger
 * /api/cookList:
 *   get:
 *     tags:
 *       - cookList
 *     description: Getting all cook details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_cookList
 *         description: cook data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_cookList'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the cooks
 */


apiRoutes.get('/cookList', function (req, res) {

    var mainData = [];
    Save_Food_Detail.find({}, { userID: 1 }, function (err, docs) {

        if (err) {

            res.send({
                success: false,
                msg: 'some error occured',
                data: null
            });
        } else if (!docs) {

            res.send({ success: false, msg: ' data not available in this time', data: null });
        } else {

            const promises = [];
            var mainData = [];
            for (var i = 0; i < docs.length; i++) {
                promises.push(new Promise(function (resolve, reject) {
                    UserData.find({ userID: docs[i].userID }, { name: 1, email: 1, mobile: 1, userID: 1, latitude:1, longitude:1, address:1 }, function (err, cookdata) {
                        if (err) {
                            return reject(err);
                        }
                        mainData.push(cookdata[0]);
                        return resolve(cookdata);
                    });
                }));
            }
            Promise.all(promises)
                .then(function () {
                    if(mainData == "") {
                       res.send({ success: false, msg: ' no cook available here', data: null });  
                    } else {
                        res.send({ success: true, msg: 'data retreived successfully', data: mainData });
                    }
                    
                });

        }


    });


});



/**
 * @swagger
 * definition:
 *   GuestDuty_editProfileDetail:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       latitude:
 *         type: number
 *       longitude:
 *         type: number
 *       landmark:
 *         type: string
 *       mobile:
 *         type: string
 *       profession:
 *         type: string
 *       gender:
 *         type: string
 *       dob:
 *         type: string
 *       address:
 *         type: string
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/editProfileDetail:
 *   post:
 *     tags:
 *       - editProfileDetail
 *     description: editing the data of the User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_editProfileDetail
 *         description: edit User data 
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_editProfileDetail'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to edit the data of the user
 */
apiRoutes.post('/editProfileDetail', function (req, res) {

    if (req.body.userID) {

        User.findOne({ _id: req.body.userID }, function (err, docs) {
            if (err) {
                res.json({ success: false, msg: "some error occured try again!" });
            } else if (!docs) {
                res.json({ success: false, msg: "No user record found!!!" });
            } else {
                //  res.json({success:true, msg:"user found in database", data: null});
                UserData.findOne({ userID: req.body.userID }, function (err, userDocs) {
                    if (err) {
                        res.json({ success: false, msg: "some error occured try again!" });
                    } else if (!userDocs) {
                        // here user_login collection has data but this detail he has not filled
                        var userDetailFill = new UserData({
                            name: req.body.name || null,
                            email: req.body.email || null,
                            mobile: req.body.mobile || null,
                            latitude: req.body.latitude || 0,
                            longitude: req.body.longitude || 0,
                            landmark: req.body.landmark || null,
                            profession: req.body.profession || null,
                            gender: req.body.gender || null,
                            address: req.body.address || null,
                            dob: req.body.dob || null,
                            userID: req.body.userID
                        });

                        userDetailFill.save(function (err) {
                            if (err) {
                                res.json({ success: false, msg: "some error occured while saving data try Again" });
                            }
                            else {
                                res.json({ success: true, msg: "saved data successfully" });
                            }
                        })

                    } else {
                        // here he has to update his data because he has already filled it.
                        UserData.update({ userID: req.body.userID },
                            {
                                name: req.body.name || userDocs.name,
                                email: req.body.email || userDocs.email,
                                latitude: req.body.latitude || userDocs.latitude,
                                longitude: req.body.longitude || userDocs.longitude,
                                landmark: req.body.landmark || userDocs.landmark,
                                profession: req.body.profession || userDocs.profession,
                                gender: req.body.gender || userDocs.gender,
                                address: req.body.address || userDocs.address, dob: req.body.dob || userDocs.dob
                            }, function (err, updateddata) {

                                if (err) {
                                    res.json({ success: false, msg: "error in updation" });
                                } else {
                                    res.json({ success: true, msg: "updated data successfully" });
                                }

                            });
                    }
                });
            }

        });

    } else {
        res.json({ success: false, msg: "you must provide userID !!!!" });
    }
});


//Saving the User menu
/**
 * @swagger
 * definition:
 *   GuestDuty_saveUserMenu:
 *     properties:
 *         userID:
 *           type: string
 *         itemDetails:
 *           type: "[{item_name:string,item_qty:Number,item_price:Number,item_unit:string}]"
 *         
 */
/**
 * @swagger
 * /api/saveUserMenu:
 *   post:
 *     tags:
 *       - saveUserMenu
 *     description: user Menu Save
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_saveUserMenu
 *         description: Saving the user menu
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_saveUserMenu'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the Menu entered by user
 */



apiRoutes.post('/saveUserMenu', function (req, res) {

    if (!req.body.userID) {
        res.json({ success: false, msg: 'you must give userID', data: null });
    } else {
        UserMenu.find({userID: req.body.userID}, function(err, validateUserData) {
            console.log(validateUserData);
            if(err) {
                res.json({ success: false, msg: 'some Error occured', data: null });
            } else if(validateUserData != "") {
               res.json({ success: false, msg: 'Already same userID present', data: null }); 
            } else {
                var saveUserMenu = new UserMenu({
                    userID: req.body.userID,
                    itemDetail: req.body.itemDetail
                });
                // save the user
                saveUserMenu.save(function (err, docs) {
                    if (err) {
                        res.json({ success: false, msg: 'some Error occured', data: null });
                    }
                    res.json({ success: true, msg: 'User Menu Saved Successfully', data: docs });
                });
            }

        });
        
    }

});


//getMenuList
/**
 * @swagger
 * definition:
 *   GuestDuty_getMenuList:
 *     properties:
 *         userID:
 *           type: string
 *  
 *       
 */
/**
 * @swagger
 * /api/getMenuList:
 *   post:
 *     tags:
 *       - getMenuList
 *     description: Getting  saved menu list of user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_getMenuList
 *         description: Menu List
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_getMenuList'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the menu list of user
 */
apiRoutes.post('/getMenuList', function (req, res) {
    if (!req.body.userID) {
        res.json({ success: false, msg: "you must give userID", data: null });
    } else {
        UserMenu.find({ userID: req.body.userID }, function (err, docs) {
            if (err) {
                res.json({ success: false, msg: 'some error while fetching!!', data: null });
            } else if (docs == "") {
                return res.send({ success: false, msg: 'wrong user given by You', data: null });
            }
            else if (docs[0].itemDetail == "") {
                res.json({ success: false, msg: 'there is no data in your menu list', data: null });
            } else {
                console.log(docs[0].itemDetail);
                res.json({ success: true, msg: 'Menu List data fetched', data: docs });
            }
        });
    }

});




//getAllMenuList
/**
 * @swagger
 * definition:
 *   GuestDuty_getAllMenuList:
 *     properties:
 *  
 *       
 */
/**
 * @swagger
 * /api/getAllMenuList:
 *   get:
 *     tags:
 *       - getAllMenuList
 *     description: Getting  saved menu list of  all user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_getAllMenuList
 *         description: Menu List
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_getAllMenuList'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the menu list of  all user
 */
apiRoutes.get('/getAllMenuList', function (req, res) {

        UserMenu.find({}, function (err, docs) {
            if (err) {
                res.json({ success: false, msg: 'some error while fetching!!', data: null });
            } else if (docs == "") {
                res.json({ success: false, msg: 'there is no data in all menu list', data: null });
            } else {
                res.json({ success: true, msg: 'Menu List data fetched', data: docs });
            }
        });
    

});




/**
 * @swagger
 * definition:
 *   GuestDuty_editUserMenu:
 *     properties:
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/editUserMenu:
 *   post:
 *     tags:
 *       - editUserMenu
 *     description: editing the menu of the User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_editUserMenu
 *         description: edit menu data 
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_editUserMenu'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to edit the menu of the user
 */
apiRoutes.post('/editUserMenu', function (req, res) {
    if (!req.body.userID) {
        res.json({ success: false, msg: "you must give userID", data: null });
    } else {    
        User.findOne({ _id: req.body.userID }, function(err, myData) {
            if(err) {
              res.json({ success: false, msg: 'some error while updating!!', data: null });  
            } else if(!myData) {
              res.json({ success: false, msg: 'user Doesnot exist', data: null });   
            } else {
                 UserMenu.update({ userID: req.body.userID },{itemDetail: req.body.itemDetail},function (err, docs) {
                    if (err) {
                        res.json({ success: false, msg: 'some error while updating!!', data: null });
                    } else if (!docs) {
                        res.json({ success: false, msg: 'not updated this row,updation failed !!!', data: null });
                    } else {
                        res.json({ success: true, msg: 'User Menu data Updated', data: docs });
                    }
                });
            }
        });
       
    }

});




// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
