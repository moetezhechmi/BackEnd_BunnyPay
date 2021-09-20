const express = require('express');
const router = express.Router();
const _ = require('lodash');
//const User = require('../models/user');
const Trader = require('../models/trader').traderModel;
const Shop = require('../models/shop').shopModel;
const Parent = require('../models/parent').parentModel;
const Child = require('../models/child').childModel;
const Ticket = require('../models/ticket').ticketModel;



var jwt = require('jsonwebtoken');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bunnypay2021@gmail.com',
        pass: 'BunnyPay@2021'
    }
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/')
    },
    filename: (req, file, cb) => {
        const mimeType = file.mimetype.split('/');
        const fileType = mimeType[1];
        const fileName = file.originalname;
        cb(null, fileName);
    },
});
const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "7927b6b1",
  apiSecret: "o6MZjHYmSQhmvU9v"
})
const upload = multer({ storage: storage });
var pathFolder = 'public/';
// signup
router.post('/signUpTrader', function(req, res) {
    try {

        Trader.findOne({ 'email': req.body.email }, function(err, trader) {
            if (err) {
                res.json({
                    status: 0,
                    message: ('Error while saving') + err
                });
            }
            if (trader) {
                res.json({
                    status: 0,
                    message: ('Email already used')
                });
            } else {

                var newTrader = new Trader({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: req.body.password,
                    photo: "p7.png",
                    solde: "0",
                    verified: "0"

                });
                //save the user
                newTrader.save(function(err, savedTrader) {
                    if (err) {
                        res.json({
                            status: 0,
                            message: err
                        });
                    } else {
                        var token = jwt.sign(savedTrader.getTrader(), 'MySecret', { expiresIn: 3600 });
                        res.json({
                            message: ('signUp successfully'),
                            _id: newTrader._id
                        });



                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});
//signupimage
router.post('/signUpTraderImage', upload.single('file'), function(req, res) {
    try {

        Trader.findOne({ 'email': req.body.email }, function(err, trader) {


            if (err) {
                res.json({
                    status: 0,
                    message: ('Error while saving') + err
                });
            }
            if (trader) {
                res.json({
                    status: 0,
                    message: ('Email already used')
                });
            } else {

                var newTrader = new Trader({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: req.body.password,
                    photo: 'http://localhost:3000/uploads/' + req.body.image,
                    solde: "0",
                    verified: "0"

                });
                //save the user
                newTrader.save(function(err, savedTrader) {
                    if (err) {
                        res.json({
                            status: 0,
                            message: err
                        });
                    } else {
                        var token = jwt.sign(savedTrader.getTrader(), 'MySecret', { expiresIn: 3600 });
                        res.json({
                            message: ('signUp successfully'),
                            _id: newTrader._id
                        });



                    }
                });
            }
        });



    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});
//signin  user
router.post('/signInTrader', function(req, res) {
    try {
        Trader.findOne({ email: req.body.email }, function(err, trader) {
            console.log(trader)
            if (err) {
                res.json({
                    message: ('erreur auth SignIn') + err
                });
            }

            if (!trader) {
                res.json({
                    message: 'Authentication failed. User not found.',
                    status: 0,

                });
            } else {
                if (trader.verified == "0") {
                    res.json({
                        message: 'Account not verified.',
                        status: 2,

                    });
                } else {
                    trader.comparePassword(req.body.password, function(err, isMatch) {
                        if (isMatch && !err) {
                            // if user is found and password is right create a token
                            var token = jwt.sign(trader.getTrader(), 'MySecret', { expiresIn: 3600 });
                            res.json({
                                message: 'Login successfully',
                                status: 1,
                                email: trader.email,
                                firstname: trader.firstname,
                                lastname: trader.lastname,
                                phone: trader.phone,
                                _id: trader._id,




                            });
                        } else {
                            res.json({
                                status: 3,
                                message: 'Authentication failed. Wrong password.'
                            });
                        }
                    });
                }
                // check if password matches

            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            message: '500 Internal Server Error'
        })

    }
});
// update user

router.post('/updateTrader', function(req, res) {

    try {



        Trader.findOne({ _id: req.body.traderId }, function(err, trader) {
            console.log(req.body.traderId)

            if (err) {

                res.json({

                    status: 0,

                    message: ('Error update trader') + err

                });

            } else {

                if (!trader) {

                    res.json({

                        status: 0,

                        message: ('trader does not exist')



                    });

                } else {

                    try {

                        if (req.body.email) {

                            trader.email = req.body.email;

                        }

                        if (req.body.firstname) {

                            trader.firstname = req.body.firstname;

                        }

                        if (req.body.lastname) {
                            console.log(req.body.lastname)

                            trader.lastname = req.body.lastname;

                        }

                        if (req.body.phone) {

                            trader.phone = req.body.phone;

                        }


                        if (req.body.oldPassword && req.body.newPassword) {

                            // check if password matches

                            trader.comparePassword(req.body.oldPassword, function(err, isMatch, next) {

                                if (isMatch && !err) {

                                    trader.password = req.body.newPassword;

                                    trader.save(function(err, savedTrader) {

                                        if (err) {

                                            res.json({

                                                status: 0,

                                                message: ('error Update trader ') + err

                                            });

                                        } else {

                                            var token = jwt.sign(savedTrader.getTrader(), 'MySecret', { expiresIn: 36000 });

                                            res.json({

                                                status: 1,

                                                message: 'profile Trader updated successfully',

                                                data: {

                                                    trader: savedTrader.getTrader()



                                                }

                                            })

                                        }

                                    });



                                } else {

                                    res.json({

                                        status: 0,

                                        message: 'update trader failed. Wrong password.'

                                    });

                                }

                            });

                        } else {

                            trader.save(function(err, savedTrader) {

                                if (err) {

                                    res.json({

                                        status: 0,

                                        message: ('error Update Trader ') + err

                                    });

                                } else {

                                    var token = jwt.sign(savedTrader.getTrader(), 'MySecret', { expiresIn: 3600 });

                                    res.json({

                                        status: 1,

                                        message: 'profile Trader updated successfully',

                                        data: {

                                            trader: savedTrader.getTrader()



                                        }

                                    })

                                }

                            });

                        }

                    } catch (err) {

                        console.log(err);

                        res.json({

                            status: 0,

                            message: '500 Internal Server Error',

                            data: {}

                        })



                    }

                }



            }



        });

    } catch (err) {

        console.log(err);

        res.json({

            status: 0,

            message: '500 Internal Server Error',

            data: {}

        })



    }

});
// get User By Id
router.post('/getTraderById', function(req, res) {
    try {
        Trader.findOne({ _id: req.body.traderId }, function(err, trader) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('error get Profile ' + err)
                });
            }
            if (!trader) {
                return res.json({
                    status: 0,
                    message: ('trader does not exist')
                });
            } else {
                res.json({
                    status: 1,
                    message: 'get Profile trader successfully',
                    traderId: trader._id,
                    firstname: trader.firstname,
                    lastname: trader.lastname,
                    email: trader.email,
                    phone: trader.phone,
                    password: trader.password,
                    traderPhoto: trader.photo,
                    traderSolde: trader.solde
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});

function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
//send mail
router.post('/sendmail', function(req, res) {
    try {
        Trader.findOne({ email: req.body.email }, function(err, trader) {
            if (err) {
                res.json({
                    message: ('erreur auth SignIn') + err
                });
            }

            if (!trader) {
                res.json({
                    message: 'User not found.'
                });
            } else {
                var mailOptions = {
                    from: 'bunnypay2021@gmail.com',
                    to: req.body.email,
                    subject: 'Confirm your account',
                    text: getRandomString(6)
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.json({
                            message: "mail sent successfully",
                            code: mailOptions.text

                        });
                    }
                });

            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            message: '500 Internal Server Error'
        })

    }
});

// add shop to trader
router.post('/addShop', function(req, res) {
    try {

        Trader.findOne({ '_id': req.body.traderId }).exec(function(err, trader) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find publication ') + err
                });
            } else {
                try {
                    var shopContent = [];

                    shopContent = trader.shop;
                    const shop = {
                        name: req.body.name,
                        description: req.body.description,
                        latitude: '36.8992047',
                        longitude: '10.1875152',
                        street: ' Avenue Fethi Zouhir',
                        town: ' Cebalat Ben Ammar 2083',
                        governorate: "Ariana",
                        Owner: req.body.traderId,

                    };

                    shopContent.push(shop);
                    trader.shop = shopContent;
                    trader.save(function(err) {
                        if (err) {
                            console.log('error' + err)
                        } else {
                            return res.json({

                                message: 'shop added succeffully'
                            });
                        }
                    });

                } catch (err) {
                    console.log(err);
                    res.json({
                        status: 0,
                        message: '500 Internal Server Error',
                        data: {}
                    })

                }
            }
        });

    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});

router.post('/addShopfile', function(req, res) {
    try {
        const { name, description } = req.body;
        console.log(req.body);
        Trader.findOne({ '_id': "60643cdfccd8cb53c9074ff2" }).exec(function(err, trader) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find trader ') + err
                });
            } else {
                try {
                    var shopContent = [];
                    shopContent = trader.shop;


                    const shopp = {
                        name,
                        description,
                        Owner: "60643cdfccd8cb53c9074ff2",

                    };


                    shopContent.push(shopp);
                    trader.shop = shopContent;
                    trader.save(function(err) {
                        if (err) {
                            console.log('error' + err)
                        } else {
                            return res.json({

                                message: 'shop added succeffully'
                            });
                        }
                    });

                } catch (err) {
                    console.log(err);
                    res.json({
                        status: 0,
                        message: '500 Internal Server Error',
                        data: {}
                    })

                }
            }
        });

    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});





//delete child
router.post('/deleteShop', function(req, res) {
    Trader.findOne({ '_id': req.body.traderId }, function(err, trader) {
        if (err) {
            return res.json({

                message: ('Error find trader ') + err
            });
        } else {
            for (var i = 0; i < trader.shop.length; i++) {
                if (trader.shop[i]._id == req.body._id) {
                    trader.shop.splice(i, 1);
                }
            }
            trader.save();
            res.json({

                message: 'shop succefuuly deleted'
            });
        }
    });
});

//update verified
router.post('/updateVerified', function(req, res) {
    try {
        Trader.findOne({ email: req.body.email }, function(err, trader) {
            if (err) {
                res.json({

                    message: ('Error update verified') + err
                });
            } else {
                if (!trader) {
                    res.json({

                        message: ('trader does not exist')

                    });
                } else {
                    try {

                        trader.verified = "1";

                        trader.save(function(err, savedSector) {
                            if (err) {
                                res.json({

                                    message: ('error Update verified ') + err
                                });
                            } else {
                                res.json({

                                    message: 'Update verified successfully'


                                })
                            }
                        });

                    } catch (err) {
                        console.log(err);
                        res.json({

                            message: '500 Internal Server Error'

                        })

                    }
                }

            }

        });
    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});



router.post('/getShopsByTrader', async(req, res) => {
    try {
        const trader = await Trader.findOne({ _id: req.body.traderId }).populate('shop.Owner', { 'id': 0 });
        var newShop = []
        for (var i = 0; i < trader.shop.length; i++) {
            newShop.push({
                "_id": trader.shop[i]._id,
                "name": trader.shop[i].name,
                "description": trader.shop[i].description,
                "latitude": trader.shop[i].latitude,
                "longitude": trader.shop[i].longitude,
                "street": trader.shop[i].street,
                "town": trader.shop[i].town,
                "governorate": trader.shop[i].governorate,
                "owner": trader.shop[i].Owner._id,





            })
        }
        res.json(newShop);
    } catch (err) {
        res.json({ message: err });
    }
});

// productttt
router.post('/addProduct', upload.single('file'), function(req, res) {
    try {
        const { name, price, quantite, ShopId, TraderId, category } = req.body;

        Trader.findOne({ '_id': TraderId }).exec(function(err, trader) {

            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find trader ') + err
                });
            } else {

                for (var i = 0; i < trader.shop.length; i++) {
                    if (trader.shop[i]._id == ShopId) {

                        var productContent = [];

                        productContent = trader.shop[i].product;


                        const product = {
                            name,
                            price,
                            quantite,
                            photo: 'http://localhost:3000/uploads/' + req.file.filename,
                            category,
                            ShopId


                        };
                        productContent.push(product);
                        trader.shop[i].product = productContent;
                        trader.save(function(err) {
                            console.log('product added succeffully');
                            if (err) {
                                console.log('error' + err)
                            } else {
                                console.log('product added successfully')
                                return res.json({

                                    message: 'product added succeffully'

                                });
                            }
                        });
                    }
                }

            }

        });
    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});


router.post('/getShopByName', async(req, res) => {
    try {
        const trader = await Trader.findOne({ _id: '605272384ef677239daa2c4c' });
        var id;
        for (var i = 0; i < trader.shop.length; i++) {
            if (trader.shop[i].name == req.body.name)
                id = trader.shop[i]._id
        }
        res.json(id);

    } catch (err) {
        res.json({ message: err });
    }
});


router.post('/getProductsByShop', async(req, res) => {
    try {
        const trader = await Trader.findOne({ _id: req.body.traderId });
        var newProduct = []
        for (var i = 0; i < trader.shop.length; i++) {
            for (var j = 0; j < trader.shop[i].product.length; j++) {
                if(trader.shop[i].name.toString()===req.body.nameshop.toString()){
                    newProduct.push({

                        "_id": trader.shop[i].product[j]._id,
                        "name": trader.shop[i].product[j].name,
                        "price": trader.shop[i].product[j].price,
                        "quantite": trader.shop[i].product[j].quantite,
                        "photo": trader.shop[i].product[j].photo,
                        "category": trader.shop[i].product[j].category,
                        "shopname": trader.shop[i].name,
                        "shopId": trader.shop[i]._id,
                        "traderId": trader._id
    
    
    
                    })
                }
               
            }


        }


        res.json(newProduct);


    } catch (err) {
        res.json({ message: err });
    }
});


router.post('/deleteProduct', function(req, res) {
    Trader.findOne({ '_id': req.body.traderId }, function(err, trader) {
        if (err) {
            return res.json({

                message: ('Error find trader ') + err
            });
        } else {
            for (var i = 0; i < trader.shop.length; i++) {
                if (trader.shop[i]._id == req.body.shopId) {
                    for (var j = 0; j < trader.shop[i].product.length; j++) {
                        if (trader.shop[i].product[j]._id == req.body._id) {
                            trader.shop[i].product.splice(i, 1);
                        }
                    }

                }
            }
            trader.save();

            res.json({

                message: 'product succefuuly deleted'
            });
        }
    });
});

router.post('/updateProduct', function(req, res) {
    Trader.findOne({ '_id': req.body.traderId }, function(err, trader) {

        console.log(req.body.traderId);
        if (err) {
            return res.json({

                message: ('Error find trader ') + err
            });
        } else {
            for (var i = 0; i < trader.shop.length; i++) {
                if (trader.shop[i]._id == req.body.ShopId)
                    console.log(req.body.ShopId); {
                    for (var j = 0; j < trader.shop[i].product.length; j++) {
                        if (trader.shop[i].product[j]._id == req.body._id) {
                            console.log(req.body._id);

                            if (req.body.name) {
                                console.log(req.body.name);
                                trader.shop[i].product[j].name = req.body.name;

                            }

                            if (req.body.price) {
                                console.log(req.body.price);
                                trader.shop[i].product[j].price = req.body.price;

                            }

                            if (req.body.quantite) {
                                console.log(req.body.quantite);
                                trader.shop[i].product[j].quantite = req.body.quantite;

                            }
                        }
                    }

                }
            }
            trader.save();
            res.json({
                message: 'product succefuuly updated'
            });
        }
    });
});




router.post('/signup', function(req, res) {
    //console.log(req, body);
    const { firstname, lastname, email, phone, password } = req.body;
    Trader.findOne({ email }).exec((err, trader) => {
        if (trader) {
            return res.status(400).json({ error: "Trader with email already existe." });
        }
        const token = jwt.sign({ firstname, lastname, email, phone, password }, process.env.JWT_ACC_ACTIVATE, { expiresIn: '20m' });


        const mailOptions = {
            from: 'bunnypay2021@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Activation Link',
            html: `
            <h2>Please click on given link to activate your account</h2>
            <p> ${token}</p>
        `
        };
        transporter.sendMail(mailOptions, function(error, body) {
            if (err) {
                return res.json({
                    error: err.message
                })
            }
            return res.json({ message: 'Email has been sent, kindly activate your account' });
            console.log(body);
        });


    });
});

router.post('/email-activate', function(req, res) {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function(err, decodedToken) {
            if (err) {
                return res.status(400).json({ error: 'Incorrect or Expired lin.k' })
            }
            const { firstname, lastname, email, phone, password } = decodedToken;

            Trader.findOne({ email }).exec((err, trader) => {
                if (trader) {
                    return res.status(400).json({ error: "Trader with email already existe." });
                }
                let newTrader = new Trader({ firstname, lastname, email, phone, password });
                newTrader.save((err, success) => {
                    if (err) {
                        console.log("Error in signup while account activation: ", err);
                        return res.status(400), json({ error: 'Error activating account' })
                    }
                    res.json({
                        message: "Signup success!"
                    })
                })
            });
        })
    } else {
        return res.json({ error: "Something went wrong !!" })
    }
});

router.post('/forgot-password', function(req, res) {
    const { email } = req.body;
    Trader.findOne({ email }, (err, trader) => {
        if (err || !trader) {
            return res.status(400).json({ error: "Trader with email does not  existe." });
        }
        const token = jwt.sign({ _id: trader._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });

        //Nodemail
        const mailOptions = {
            from: 'bunnypay2021@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Forgot Password Link',
            html: `<h2>Please click on given link to reset your password</h2>
            <p> ${token}</p>`
        };

        return trader.updateOne({ resetLink: token }, function(err, success) {
            if (err) {
                return res.status(400).json({ error: "reset password link error" });
            } else {

                transporter.sendMail(mailOptions, function(error, body) {
                    if (err) {
                        return res.json({
                            error: err.message
                        })
                    }
                    return res.json({ message: 'Email has been sent, kindly activate your account' });
                    console.log(body);
                });
            }
        })
    })

});

router.post('/reset-password', function(req, res) {


    const { resetLink, newPass } = req.body;
    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(error, decodedData) {
            if (error) {
                return res.status(401).json({
                    error: "Incorrect Token or it is expired."
                })
            }
            Trader.findOne({ resetLink }, (err, trader) => {
                if (err || !trader) {
                    return res.status(400).json({ error: "User with this token does not exist." });
                }
                const obj = {
                    password: newPass,
                    resetLink: ''
                }

                trader = _.extend(trader, obj);
                trader.save((err, result) => {
                    if (err) {
                        return res.status(400).json({ error: "reset password error" });
                    } else {
                        return res.status(200).json({ message: 'Your password has been change .' });
                    }

                })

            })

        })

    } else {
        return res.status(401).json({ error: "Authentication error !!" });

    }



});



router.post('/AcceptChild', function(req, res) {
    var chaima;
    Parent.findOne({ '_id': req.body.parentId }, function(err, parent) {
        if (err) {
            return res.json({

                message: ('Error find parent ') + err
            });
        } else {
        
            for (var i = 0; i < parent.child.length; i++) {
                if (parent.child[i]._id == req.body.childId) {
                    parent.child[i].accepted = "Accepted"
                    chaima = parent.child[i].accepted;
                }
            }
            parent.save();
            res.json({
                accepted: chaima
            });
        }
    });
});
router.post('/AdhererTag', function(req, res) {
    var chaima;
    Parent.findOne({ '_id': req.body.parentId }, function(err, parent) {
        if (err) {
            return res.json({

                message: ('Error find parent ') + err
            });
        } else {
            var tag = req.body.tagId;
            var taaaag = tag.substring(1, tag.length);
            console.log(taaaag)
            for (var i = 0; i < parent.child.length; i++) {
                if (parent.child[i]._id == req.body.childId) {
                   
                    parent.child[i].tagId = taaaag;
                }
            }
            parent.save();
            res.json({
                accepted: chaima
            });
        }
    });
});

router.get('/getChildrenAdmin', async(req, res) => {
    try {
        const parent = await Parent.find();

        var newChild = []
        var status;
        for (var i = 0; i < parent.length; i++) {
            for (var j = 0; j < parent[i].child.length; j++) {
                if (parent[i].child[j].tagId == '0') {
                    status = 'http://localhost:3000/uploads/scanTag.gif'
                } else {
                    status = 'http://localhost:3000/uploads/checked.gif'
                }
                if (parent[i].child[j].accepted == 'In Progress') {

                    newChild.push({

                        "_id": parent[i].child[j]._id,
                        "firstname": parent[i].child[j].firstname,
                        "lastname": parent[i].child[j].lastname,
                        "age": parent[i].child[j].age,
                        "sexe": parent[i].child[j].sexe,
                        "etat": parent[i].child[j].etat,
                        "parentId": parent[i]._id,
                        "photo": parent[i].child[j].photo,
                        "accepted": parent[i].child[j].accepted,
                        "status": status,





                    })

                }
            }
        }


        res.json(newChild);


    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/RefuseChildAdmin', function(req, res) {
    Parent.findOne({ '_id': req.body.parentId }, function(err, parent) {
        if (err) {
            return res.json({

                message: ('Error find parent ') + err
            });
        } else {
            for (var i = 0; i < parent.child.length; i++) {
                if (parent.child[i]._id == req.body.childId) {
                    parent.child.splice(i, 1);
                }
            }
            parent.save();
            res.json({

                message: 'child succefuuly refused'
            });
        }
    });
});


router.post('/addTicket', function(req, res) {
    try {
        console.log(req.body)
        Trader.findOne({ '_id': req.body.traderId }).exec(function(err, trader) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find publication ') + err
                });
            } else {
                try {
                    var ticketContent = [];

                    ticketContent = trader.ticket;
                    const ticket = {
                        code: req.body.code,
                        montant: req.body.montant,
                        used: 'not used',
                        Owner: req.body.traderId,

                    };

                    ticketContent.push(ticket);
                    trader.ticket = ticketContent;
                    trader.save(function(err) {
                        if (err) {
                            console.log('error' + err)
                        } else {
                            return res.json({

                                message: 'ticket added succeffully'
                            });
                        }
                    });

                } catch (err) {
                    console.log(err);
                    res.json({
                        status: 0,
                        message: '500 Internal Server Error',
                        data: {}
                    })

                }
            }
        });

    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});


router.post('/getTicketsAdmin', async(req, res) => {
    try {
        const trader = await Trader.findOne({ _id: req.body.traderId });

        var newTicket = []
        for (var i = 0; i < trader.ticket.length; i++) {

            newTicket.push({
                "_id": trader.ticket[i]._id,
                "code": trader.ticket[i].code,
                "montant": trader.ticket[i].montant,
                "used": trader.ticket[i].used
            })


        }
        res.json(newTicket);
    } catch (err) {
        res.json({ message: err });
    }
});




router.get('/getallshop', async(req, res) => {
    try {
        const trader = await Trader.find();

        var newShop = []
        for (var i = 0; i < trader.length; i++) {
            for (var j = 0; j < trader[i].shop.length; j++) {


                newShop.push({

                    "_id": trader[i].shop[j]._id,
                    "name": trader[i].shop[j].name,
                    "description": trader[i].shop[j].description,
                    "latitude": trader[i].shop[j].latitude,
                    "longitude": trader[i].shop[j].longitude,
                    "street": trader[i].shop[j].street,
                    "town": trader[i].shop[j].town,
                    "governorate": trader[i].shop[j].gouvernorate,



                })

            }
        }


        res.json(newShop);


    } catch (err) {
        res.json({ message: err });
    }
});


router.post('/addCommande', async(req, res)=> {

    try {
        
        var verif;

        Trader.findOne({ '_id': req.body.traderId }).exec(function(err, trader) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find trader ') + err
                });
            } else {
                try {
            

                    var commandeContent = [];
                    for (var i = 0; i < trader.shop.length; i++) {
                        if (trader.shop[i]._id == req.body.shop) {
                            var p = req.body.products.substring(1, req.body.products.length);
                            var q = req.body.quantites.substring(1, req.body.quantites.length);
                            var prods = p.split("/");
                            var quantites = q.split("/");
                            var productContent = []
                            for (var k = 0; k < prods.length; k++) {
                                productContent.push({
                                    quantite: quantites[k],
                                    prod: prods[k]
                                })
                            } //boucle for hedhi twali fel if 
                            
                            commandeContent = trader.commande;

                            commandeContent.push({
                                child: req.body.child,
                                shop: req.body.shop,
                                product: productContent,
                                total: req.body.total
                            });


                            trader.commande = commandeContent

                        }
                    }
                    trader.save(function(err) {
                        if (err) {
                            console.log('error' + err)
                        } else {


                            return res.json({

                                message: 'commande added succeffully'
                            });
                           
        


                        }
                    });
                } catch (err) {
                    console.log(err);
                    res.json({
                        status: 0,
                        message: '500 Internal Server Error',
                        data: {}
                    })

                }
            }
        });

    } catch (err) {
        console.log(err);
        res.json({
            status: 0,
            message: '500 Internal Server Error',
            data: {}
        })

    }
});

const traderhistory = async (req,res,next)  => {
    const parent = await Parent.find();
    //console.log(parent)

    Trader.find()
    .then(traders  => {
        shops=[];
        for (var i = 0; i < traders.length; i++) {
            for (var j = 0; j < traders[i].shop.length; j++) {
                shops.push(traders[i].shop[j])
            }
        }
        //console.log(shops)
        var newCommandes = []
        for (var k = 0; k < traders.length; k++) {
            for (var l = 0; l < traders[k].commande.length; l++) {
                for (var m = 0; m < shops.length; m++) {
                    //console.log("compare traders.commande.shop :"+traders[k].commande[l].shop+" with liste shops[i]._id :"+shops[m]._id)
                    if(traders[k].commande[l].shop.toString()===shops[m]._id.toString()){
                        //console.log("egaux")
                        for (var n = 0; n < parent.length; n++) {
                           for (var d = 0; d < parent[n].child.length; d++) {

                            if (traders[k].commande[l].child.toString()===parent[n].child[d]._id.toString()) {
                                newCommandes.push({
                                    "date": traders[k].commande[l].date,
                                    "child": parent[n].child[d].firstname+" "+parent[n].child[d].lastname,
                                    "shop": shops[m].name,
                                    "total": traders[k].commande[l].total,
                                    
                                })
                            }
                        }
                    }
                        

                    }
                }
            }
        }
        
        res.json(newCommandes)
    })
    .catch(error  =>{
        console.log(error)
        res.json({
            message: "an error occured when displaying test"
        })
    })
}
const from = "BunnyPay"
const to = "21652658918"
const text = 'Message from BunnyBay : your child is accepted'

router.get('/sendsms', function(req, res) {
    vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
        } else {
            console.log("error");
        }
    }
})
})
const test = async (req,res,next)  => {
    const parent = await Parent.findOne({ '_id': req.body.parentId });
    //console.log(parent)

    Trader.find()
    .then(traders  => {
        shops=[];
        products=[];
        prodhistory=[];
        prodCmd=[];


        for (var i = 0; i < traders.length; i++) {
            for (var j = 0; j < traders[i].shop.length; j++) {
                shops.push(traders[i].shop[j])
            }
        }
        for (var t = 0; t < traders.length; t++) {
            for (var v = 0; v < traders[t].shop.length; v++) {
                for (var r = 0; r < traders[t].shop[v].product.length; r++) {
                products.push(traders[t].shop[v].product[r])
            }
        }}
        //console.log(shops)
        var newCommandes = []
        for (var k = 0; k < traders.length; k++) {
            for (var l = 0; l < traders[k].commande.length; l++) {
                for (var m = 0; m < shops.length; m++) {
                    //console.log("compare traders.commande.shop :"+traders[k].commande[l].shop+" with liste shops[i]._id :"+shops[m]._id)
                    if(traders[k].commande[l].shop.toString()===shops[m]._id.toString()){
                        //console.log("egaux")
                        
                            for (var o = 0; o < traders[k].commande[l].product.length; o++) {
                                for (var p = 0; p < products.length; p++) {
                                    
                                    if (traders[k].commande[l].product[o].prod.toString()===products[p]._id.toString()) {
                                        prodhistory.push({
                                            "_id":products[p]._id,
                                            "name":products[p].name,
                                            "photo":products[p].photo,
                                            "quantite":traders[k].commande[l].product[o].quantite,
                                        })
                                    }
                                }

                            }

                           for (var n = 0; n < parent.child.length; n++) {

                            if (traders[k].commande[l].child.toString()===parent.child[n]._id.toString()) {

                                newCommandes.push({
                                    "id":traders[k].commande[l]._id,
                                    "date": traders[k].commande[l].date,
                                    "child": parent.child[n].firstname+" "+parent.child[n].lastname,
                                    "childimg": parent.child[n].photo,
                                    "shop": shops[m].name,
                                    "prodtotal":traders[k].commande[l].product.length,
                                    "total": traders[k].commande[l].total,
                                    
                                    
                                })
                            }
                        }
                        

                    }
                }
            }
        }
        
        res.json(newCommandes)
    })
    .catch(error  =>{
        console.log(error)
        res.json({
            message: "an error occured when displaying test"
        })
    })
}

const traderhistoryflutter = async (req,res,next)  => {
    const parent = await Parent.find();
    const trader = await Trader.findOne({ '_id': req.body.traderId });
    //console.log(parent)

 
        shops=[];
            for (var j = 0; j < trader.shop.length; j++) {
                console.log(trader.shop[j]);
                shops.push(trader.shop[j])
            }
        
        //console.log(shops)
        var newCommandes = []
        
            for (var l = 0; l < trader.commande.length; l++) {
                for (var m = 0; m < shops.length; m++) {
                    //console.log("compare traders.commande.shop :"+traders[k].commande[l].shop+" with liste shops[i]._id :"+shops[m]._id)
                    if(trader.commande[l].shop.toString()===shops[m]._id.toString()){
                        //console.log("egaux")
                        for (var n = 0; n < parent.length; n++) {
                           for (var d = 0; d < parent[n].child.length; d++) {
                            if (trader.commande[l].child.toString()===parent[n].child[d]._id.toString()) {
                                newCommandes.push({
                                    "date": trader.commande[l].date,
                                    "child": parent[n].child[d].firstname+" "+parent[n].child[d].lastname,
                                    "shop": shops[m].name,
                                    "total": trader.commande[l].total,
                                    
                                })
                            }
                        }
                    }
                        

                    }
                }
            }
        
        
        res.json(newCommandes)
   
    .catch(error  =>{
        console.log(error)
        res.json({
            message: "an error occured when displaying test"
        })
    })
}



router.post('/getProductCmd', async(req, res) => {
    try {
        var newProduct = []
        var products = []

        const traders = await Trader.find();
        for (var t = 0; t < traders.length; t++) {
            for (var v = 0; v < traders[t].shop.length; v++) {
                for (var r = 0; r < traders[t].shop[v].product.length; r++) {
                products.push(traders[t].shop[v].product[r])
            }
        }}
        for(var i =0;i<traders.length;i++){
            for(j=0;j<traders[i].commande.length;j++){
                if(traders[i].commande[j]._id == req.body.cmdId){
                     for(var k =0;k<traders[i].commande[j].product.length;k++){
                        for(var l =0;l<products.length;l++){
                        if(traders[i].commande[j].product[k].prod.toString()===products[l]._id.toString()){
                             newProduct.push({

                    
                    "name": products[l].name,
                    "photo":  products[l].photo,
                    "price": products[l].price,
                    "quantite": traders[i].commande[j].product[k].quantite,
                    



                })
                        }
                     }
                     }
                }
            }
        }

res.json(newProduct);
        
    } catch (err) {
        res.json({ message: err });
    }
});





router.post('/producthistory', async(req, res) => {
    try {
         const trader = await Trader.findOne({ '_id': req.body.traderId });

     
        products=[];
        var prodhistory=[];

        
        
            for (var v = 0; v < trader.shop.length; v++) {
                for (var r = 0; r < trader.shop[v].product.length; r++) {
                products.push(trader.shop[v].product[r])
            }
        }
        
            for (var l = 0; l < trader.commande.length; l++) {
             
                        for (var n = 0; n < trader.commande[l].child.length; n++) {
                            
                            if(trader.commande[l].child[n].toString()===req.body.childId.toString()){
                                console.log("c bon")
                                for (var o = 0; o < trader.commande[l].product.length; o++) {
                                for (var p = 0; p < products.length; p++) {
                                    
                                    if (trader.commande[l].product[o].prod.toString()===products[p]._id.toString()) {
                                        prodhistory.push({
                                            "name":products[p].name,
                                            "photo":products[p].photo,
                                            "quantite":trader.commande[l].product[o].quantite,
                                        })
                                    }
                                }

                            }
                            }
                            
                           
                            
                        }
                        

                    
                
          }
        

        res.json(prodhistory);


    } catch (err) {
        res.json({ message: err });
    }
});




router.post("/traderhistoryflutter",traderhistoryflutter)
router.get("/traderhistory",traderhistory)

router.post("/test",test)


module.exports = router;