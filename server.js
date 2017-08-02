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
    host: 'http://localhost:5000',
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
        res.json({ success: false, msg: 'mobile or password is missing', data: '' });
    } else {
        var newUser = new User({
            mobile: req.body.mobile,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err) {
            if (err) {
                return res.json({ success: false, msg: 'Username already exists', data: '' });
            } else {
                User.findOne({
                    mobile: req.body.mobile
                }, function(err, user_data) {
                    if (err) {
                        return res.json({ success: false, msg: "Could not find the user", data: '' });
                    } else {
                        return res.json({ success: true, msg: "signed up succesfully", data: user_data });
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
        if (err) {
            res.send({ success: false, msg: 'something went wrong', data: '' });
        }

        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. User not found.', data: '' });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    res.json({ success: true, token: 'JWT ' + token, msg: 'succesfully authenticated', data: user });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.', data: '' });
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
        if (err) {
            res.json({ success: true, msg: 'something went wrong', data: '' });
        }

        if (!user) {
            var newUserData = new UserData({
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                latitude: req.body.lat,
                longitude: req.body.long,
                landmark: req.body.landmark,
                profession: req.body.profession,
                gender: req.body.gender,
                address: req.body.address,
                dob: req.body.dob,
                userID: req.body.userID


            });
            // save the user
            newUserData.save(function(err) {
                if (err) {
                    return res.json({ success: false, msg: 'Could not save the data', data: '' });
                }
                res.json({ success: true, msg: ' succesfully saved ', data: '' });
            });

        } else {
            res.send({ success: false, msg: 'user already exists', data: '' });
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
 *         type: number
 *       
 */
/**
 * @swagger
 * /api/userDetail:
 *   post:
 *     tags:
 *       - User
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
apiRoutes.post('/userDetail', function(req, res) {

    if (req.body.mobile) {
        // console.log(req.params);
        UserData.findOne({ mobile: req.body.mobile }, function(err, docs) {
            if (err) {
                return res.send({ success: false, msg: 'mobile number not found', data: '' });
            } else {
                res.send({ success: true, msg: 'user found', data: docs });
            }

        });
    }

});

//Get User details
/**
 * @swagger
 * definition:
 *   GuestDuty_userDetailsByID:
 *     properties:
 *       userID:
 *         type: String
 *       
 */
/**
 * @swagger
 * /api/userDetailsByID:
 *   post:
 *     tags:
 *       - User
 *     description: Getting particular user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userDetailsByID
 *         description: user data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_userDetailsByID '
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of the user
 */
apiRoutes.post('/userDetailByID', function(req, res) {

    if (req.body.userID) {
        // console.log(req.params);
        UserData.findOne({ _id: req.body.userID }, function(err, docs) {
            if (err) {
                return res.send({ success: false, msg: 'user ID not found', data: '' });
            } else {
                res.send({ success: true, msg: 'user found', data: docs });
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
            return res.send({ success: false, msg: 'something went wrong', data: '' });
        } else {
            res.send({ success: false, msg: 'all users', data: docs });
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
        res.send({ success: false, msg: 'something is missing', data: '' });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function(err, user) {
            if (err) {
                res.send({ success: false, msg: 'something went wrong', data: '' });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: '' });
            } else {
                // check if password matches
                user.comparePassword(req.body.oldPassword, function(err, isMatch) {
                    if (isMatch && !err) {
                        bcrypt.genSalt(10, function(err, salt) {
                            if (err) {
                                res.send({ success: false, msg: 'something went wrong in gen', data: '' });
                            }
                            bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                                if (err) {
                                    res.send({ success: false, msg: 'something went wrong', data: '' });
                                }
                                req.body.newPassword = hash;
                                User.update({ mobile: req.body.mobile }, {
                                    password: req.body.newPassword
                                }, function(err, resp) {
                                    if (err) {
                                        res.send({ success: false, msg: 'something went wrong', data: '' });
                                    }
                                    if (resp) {
                                        res.send({ success: true, msg: "succesfully updated the password", data: '' });
                                    }
                                });
                            });
                        });



                    } else {
                        res.send({ success: false, msg: 'Something really went wrong', data: '' });
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
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
    } else {
        UserData.find({ mobile: req.body.mobile }, function(err, user) {
            if (err) {
                res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: '' });
            } else {
                var myOtp = 1234;
                var SendUserOtp = new OtpUser({
                    otp: myOtp,
                    mobile: req.body.mobile
                });
                // save the OTP and mobile
                SendUserOtp.save(function(err) {
                    if (err) {
                        return res.json({ success: false, msg: 'something is wrong', data: '' });
                    }

                    res.json({ success: true, msg: 'OTP sent succesfully', data: '' });
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
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
    } else {
        OtpUser.find({ mobile: req.body.mobile }, function(err, user) {
            if (err) {
                res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
            };

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: '' });
            } else {
                OtpUser.find({ otp: req.body.otp, mobile: req.body.mobile }, function(err, user) {
                    if (err) {
                        return res.json({ success: false, msg: "data not found", data: '' });
                    } else {
                        UserData.find({ mobile: req.body.mobile }, function(err, user) {
                            if (err) {
                                return res.json({ success: false, msg: "data not found", data: '' });
                            } else {
                                res.json({ success: true, msg: "successful", data: user });
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
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
    } else {
        User.findOne({
            mobile: req.body.mobile
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ success: false, msg: 'could not find the user', data: '' });
            } else if (req.body.newPassword !== req.body.confirmPassword) {
                return res.json({ success: false, msg: 'Password is not matching', data: '' });
            } else {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
                    }
                    bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                        if (err) {
                            res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
                        }
                        req.body.newPassword = hash;
                        User.update({ mobile: req.body.mobile }, {
                            password: req.body.newPassword
                        }, function(err, resp) {
                            if (err) {
                                res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
                            }
                            if (resp) {
                                res.send({ success: true, msg: "succesfully changed the password", data: '' });
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
 *   GuestDuty_SaveFoodDetails:
 *     properties:
 *         userId:
 *           type: string
 *         MenuDetails:
 *           type: "[{item_name:String,item_qty:Number,item_price:Number,item_unit:String}]"
 *         FoodName:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         placeType:
 *           type: string
 *         foodType: 
 *           type: "['VEG','NON_VEG']"
 *         filterType:
 *           type: "['String','String']"
 *         noOfPlates:
 *           type: number
 *         ForWhichTime:
 *           type: "['BREAKFAST','LUNCH','DINNER']"
 *         ForWhichDate:
 *           type: string
 *         description:
 *           type: string
 *         
 */
/**
 * @swagger
 * /api/SaveFoodDetails:
 *   post:
 *     tags:
 *       - SaveFoodDetails
 *     description: Host Menu Save
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_SaveFoodDetails
 *         description: Saving the host menu
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_SaveFoodDetails'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to save the Menu entered by host
 */
apiRoutes.post('/SaveFoodDetails', function(req, res) {
    if (!req.body.userID || !req.body.FoodName) {
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
    } else {
        var newSave_Food_Detail = new Save_Food_Detail({
            userID: req.body.userID,
            ItemDetails: req.body.ItemDetails,
            FoodName: req.body.FoodName,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            placeType: req.body.placeType,
            foodType: req.body.foodType,
            filterType: req.body.filterType,
            ForWhichTime: req.body.ForWhichTime,
            ForWhichDate: req.body.ForWhichDate,
            description: req.body.description
        });
        // save the user
        newSave_Food_Detail.save(function(err) {
            if (err) {
                res.json({ success: false, msg: 'Missing som fields I guess!!', data: '' });
            }
            res.json({ success: true, msg: 'Menu Saved succesfully', data: '' });
        });
    }
});

//Profile Details
/**
 * @swagger
 * definition:
 *   GuestDuty_profileDetails:
 *     properties:
 *       userID:
 *         type: string
 *       
 */
/**
 * @swagger
 * /api/profileDetails:
 *   post:
 *     tags:
 *       - profileDetails
 *     description: Getting particular user profile data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_profileDetails
 *         description: user profile data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_profileDetails'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the profile data of the user
 */
apiRoutes.post('/profileDetails', function(req, res) {

    if (req.body.userID) {
        UserData.findOne({ userID: req.body.userID }, function(err, docs) {
            if (err) {
                return res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
            } else {
                res.json({ success: false, msg: 'user found', data: docs });
            }

        });
    }

});

//FoodList
/**
 * @swagger
 * definition:
 *   GuestDuty_FoodList:
 *     
 *  
 *       
 */
/**
 * @swagger
 * /api/FoodList:
 *   get:
 *     tags:
 *       - FoodList
 *     description: Getting all food details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: GuestDuty_FoodList
 *         description: Food data
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/GuestDuty_FoodList'
 *     responses:
 *       200:
 *         description: 
 *            This Api will be used to get the data of all the foods
 */
apiRoutes.get('/FoodList', function(req, res) {

    Save_Food_Detail.find({}, function(err, docs) {
        if (err) {
            res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
        } else {
            res.json({ success: false, msg: 'Food details', data: docs });
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
apiRoutes.post('/foodDetail', function(req, res) {

    if (req.body.foodID) {
        Save_Food_Detail.findOne({ _id: req.body.foodID }, function(err, docs) {
            if (err) {
                return res.send({ success: false, msg: 'food details not found', data: '' });
            } else {
                if (docs.userID) {
                    console.log("userId", docs.userID);
                    UserData.findOne({ userID: docs.userID }, function(err, user_details) {
                        if (err) {
                            return res.send({ success: false, msg: 'food details not found', data: '' });
                        } else {
                            var object_res = docs + user_details;
                            res.send({ success: true, msg: 'food details found', data: object_res });
                        }
                    });
                }

            }

        });
    } else {
        return res.send({ success: false, msg: 'food details not found', data: '' });
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
 *         totalPrice:
 *           type: number
 *         status:
 *           type: string
 *         paymentID:
 *          type: string
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

apiRoutes.post('/orderfood', function(req, res) {

    if (!req.body.foodID || !req.body.hostID || !req.body.eaterID) {
        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
    } else {
        var orderBooking = new OrderManage({
            foodID: req.body.foodID,
            hostID: req.body.hostID,
            eaterID: req.body.eaterID,
            items: req.body.itemDetail,
            totalPrice: req.body.totalPrice,
            status: req.body.status,
            paymentID: req.body.paymentID
        });
        // save the user
        orderBooking.save(function(err) {
            if (err) {
                res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
            }
            res.json({ success: true, msg: 'Menu Saved succesfully', data: '' });
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
 *   get:
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
 *            This Api will be used to get the data of all the orders based on hostId or eaterId
 */

apiRoutes.post('/orderhistory', function(req, res) {

    if (req.body.hostID || req.body.eaterID) {
        OrderManage.find({ $or: [{ "hostID": req.body.hostID }, { "eaterID": req.body.eaterID }] }, function(err, docs) {
            if (err) {
                res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });
            } else {

                res.json({ success: true, msg: 'order details fetched successfull', data: docs });
            }

        });
    } else {

        res.json({ success: false, msg: 'Missing some fields I guess!!', data: '' });

    }

});



// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);