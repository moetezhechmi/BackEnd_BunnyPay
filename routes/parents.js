const express = require('express');
const router = express.Router();
//const User = require('../models/user');
const Parent = require('../models/parent').parentModel;
const Child = require('../models/child').childModel;
const Trader = require('../models/trader').traderModel;


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
const upload = multer({ storage: storage });
var pathFolder = 'public/';
// signup
router.post('/signUpParent', function(req, res) {
    try {
        Parent.findOne({ 'email': req.body.email }, function(err, parent) {
            if (err) {
                res.json({
                    status: 0,
                    message: ('Error while saving') + err
                });
            }
            if (parent) {
                res.json({
                    status: 0,
                    message: ('Email already used')
                });
            } else {

                var newParent = new Parent({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,

                    email: req.body.email,
                    phone: req.body.phone,
                    password: req.body.password,
                    photo: "p7.png",
                    solde: "1000",
                    verified: "0"

                });
                //save the user
                newParent.save(function(err, savedParent) {
                    if (err) {
                        res.json({
                            status: 0,
                            message: err
                        });
                    } else {
                        var token = jwt.sign(savedParent.getParent(), 'MySecret', { expiresIn: 3600 });
                        res.json({
                            message: ('signUp successfully'),
                            _id: newParent._id,
                            token: token,
                            parent: savedParent.getParent()
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
router.post('/signInParent', function(req, res) {
    try {
        Parent.findOne({ email: req.body.email }, function(err, parent) {
            console.log(parent)
            if (err) {
                res.json({
                    message: ('erreur auth SignIn') + err
                });
            }

            if (!parent) {
                res.json({
                    message: 'Authentication failed. User not found.'
                });
            } else {
                if (parent.verified == "0") {
                    res.json({
                        message: 'Account not verified.'
                    });
                } else {
                    parent.comparePassword(req.body.password, function(err, isMatch) {
                        if (isMatch && !err) {
                            // if user is found and password is right create a token
                            var token = jwt.sign(parent.getParent(), 'MySecret', { expiresIn: 3600 });
                            res.json({
                                message: 'Login successfully',
                                _id: parent._id,
                                firstname: parent.firstname,
                                lastname: parent.lastname,


                                /*email: user.email,
                                _id: user._id,
                                name:user.name,
                                birthdate:user.birthdate,
                                sexe:user.sexe,
                                phone:user.phone,
                                photo:user.photo,
                                verified:user.verified*/
                            });
                        } else {
                            res.json({
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

router.post('/updateParent', function(req, res) {

    try {



        Parent.findOne({ _id: req.body.parentId }, function(err, parent) {

            if (err) {

                res.json({

                    status: 0,

                    message: ('Error update parent') + err

                });

            } else {

                if (!parent) {

                    res.json({

                        status: 0,

                        message: ('parent does not exist')



                    });

                } else {

                    try {

                        if (req.body.email) {

                            parent.email = req.body.email;

                        }

                        if (req.body.firstname) {

                            parent.firstname = req.body.firstname;

                        }

                        if (req.body.lastname) {

                            parent.lastname = req.body.lastname;

                        }

                        if (req.body.phone) {

                            parent.phone = req.body.phone;

                        }


                        if (req.body.oldPassword && req.body.newPassword) {

                            // check if password matches

                            parent.comparePassword(req.body.oldPassword, function(err, isMatch, next) {

                                if (isMatch && !err) {

                                    parent.password = req.body.newPassword;

                                    parent.save(function(err, savedParent) {

                                        if (err) {

                                            res.json({

                                                status: 0,

                                                message: ('error Update parent ') + err

                                            });

                                        } else {

                                            var token = jwt.sign(savedParent.getParent(), 'MySecret', { expiresIn: 36000 });

                                            res.json({

                                                status: 1,

                                                message: 'profile updated successfully',

                                                data: {

                                                    parent: savedParent.getParent()



                                                }

                                            })

                                        }

                                    });



                                } else {

                                    res.json({

                                        status: 0,

                                        message: 'update parent failed. Wrong password.'

                                    });

                                }

                            });

                        } else {

                            parent.save(function(err, savedParent) {

                                if (err) {

                                    res.json({

                                        status: 0,

                                        message: ('error Update parent ') + err

                                    });

                                } else {

                                    var token = jwt.sign(savedParent.getParent(), 'MySecret', { expiresIn: 3600 });

                                    res.json({

                                        status: 1,

                                        message: 'profile updated successfully',

                                        data: {

                                            parent: savedParent.getParent()



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
router.post('/getParentById', function(req, res) {
    try {
        Parent.findOne({ _id: req.body.parentId }, function(err, parent) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('error get Profile ' + err)
                });
            }
            if (!parent) {
                return res.json({
                    status: 0,
                    message: ('parent does not exist')
                });
            } else {
                res.json({
                    status: 1,
                    message: 'get Profile successfully',
                    parentId: parent._id,
                    firstname: parent.firstname,
                    lastname: parent.lastname,
                    email: parent.email,
                    phone: parent.phone,
                    password: parent.password,
                    photo: parent.photo,
                    solde: parent.solde
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
        Parent.findOne({ email: req.body.email }, function(err, parent) {
            if (err) {
                res.json({
                    message: ('erreur auth SignIn') + err
                });
            }

            if (!parent) {
                res.json({
                    message: 'User not found.'
                });
            } else {
                var mailOptions = {
                    from: 'bunnypay2021@gmail.com',
                    to: req.body.email,
                    subject: 'Reset your password for Carespace',
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

// add child to parent
router.post('/addChild', upload.single('file'), function(req, res) {
    try {



        Parent.findOne({ '_id': req.body.parentId }).exec(function(err, parent) {
            if (err) {
                return res.json({
                    status: 0,
                    message: ('Error find publication ') + err
                });
            } else {
                try {
                    var today = new Date();
                    var birthDate = new Date(req.body.age);
                    var age = today.getFullYear() - birthDate.getFullYear();
                    var m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--
                    }
                    var childContent = [];

                    childContent = parent.child;
                    const child = {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        age: age,
                        sexe: req.body.sexe,
                        etat: "null",
                        hisParent: req.body.parentId,
                        solde: '0',
                        photo: '/uploads/' +req.file.originalname,
                        tagId: '0',
                        accepted: "In Progress"

                    };

                    childContent.push(child);
                    parent.comment = childContent;
                    parent.save(function(err) {
                        if (err) {
                            console.log('error' + err)
                        } else {
                            return res.json({

                                message: 'Child added succeffully'
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

router.post('/Lost', function(req, res) {
    var chaima;
    Parent.findOne({ '_id': req.body.parentId }, function(err, parent) {
        if (err) {
            return res.json({

                message: ('Error find parent ') + err
            });
        } else {
        
            for (var i = 0; i < parent.child.length; i++) {
                if (parent.child[i]._id == req.body.childId) {
                    parent.child[i].accepted = "In Progress"
                    
                }
            }
            parent.save();
            res.json("done");
        }
    });
});
//delete child
router.post('/deleteChild', function(req, res) {
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

                message: 'child succefuuly deleted'
            });
        }
    });
});
//update mdp
router.post('/updatemdp', function(req, res) {
    try {
        Parent.findOne({ email: req.body.email }, function(err, parent) {
            if (err) {
                res.json({
                    status: 0,
                    message: ('Error update mdp') + err
                });
            } else {
                if (!parent) {
                    res.json({
                        status: 0,
                        message: ('user does not exist')

                    });
                } else {
                    try {
                        if (req.body.password) {
                            parent.password = req.body.password;
                        }
                        parent.save(function(err, savedSector) {
                            if (err) {
                                res.json({
                                    status: 0,
                                    message: ('error Update password ') + err
                                });
                            } else {
                                res.json({
                                    status: 1,
                                    message: 'Update password successfully',
                                    password: parent.password

                                })
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
//update verified
router.post('/updateVerified', function(req, res) {
    try {
        Parent.findOne({ email: req.body.email }, function(err, parent) {
            if (err) {
                res.json({

                    message: ('Error update verified') + err
                });
            } else {
                if (!parent) {
                    res.json({

                        message: ('parent does not exist')

                    });
                } else {
                    try {

                        parent.verified = "1";

                        parent.save(function(err, savedSector) {
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


router.post('/updateSolde', async(req, res)=> {
    try {
        const parent = await Parent.findOne({ _id: req.body.parentId });
        
        var newChilds = [];
       
       
            for (var j = 0; j < parent.child.length; j++) {
                newChilds.push(parent.child[j]);


            }
        
        for (var k = 0; k < newChilds.length; k++) {
            
            if (newChilds[k]._id == req.body.childId) {
                newChilds[k].solde = (parseInt(newChilds[k].solde ) - parseInt(req.body.total))
            }
        }
      parent.save(function(err, savedSector) {
            if (err) {
                res.json({

                    message: ('error Update verified ') + err
                });
            } 
            else{
                 res.json({

                    message: ('solde updated successfully')
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





router.post('/getChildsByParent', async(req, res)=> {
    try {
        const parent = await Parent.findOne({_id:req.body.parentId}).populate('child.hisparent',{'id': 0});
        var newShop=[]
              for (var i = 0; i < parent.child.length; i++) {
              
                  newShop.push({
                      "_id": parent.child[i]._id,
                      "firstname": parent.child[i].firstname,
                      "lastname": parent.child[i].lastname,
                      "sexe": parent.child[i].sexe,
                      "age": parent.child[i].age,
                      "solde": parent.child[i].solde,
                      "photo": parent.child[i].photo,
                      "accepted": parent.child[i].accepted

                  })
              }
            
            
        res.json(newShop);
    }catch(err){
        res.json({message:err});
    }
    });

    router.post('/getDropdownChild', async(req, res)=> {
        try {
            const parent = await Parent.findOne({_id:req.body.parentId}).populate('child.hisparent',{'id': 0});
            var newShop=[]
                  for (var i = 0; i < parent.child.length; i++) {
                    if(parent.child[i].accepted == 'Accepted')
                    {
                      newShop.push({
                          "_id": parent.child[i]._id,
                          "firstname": parent.child[i].firstname,
                          "lastname": parent.child[i].lastname,
                          "sexe": parent.child[i].sexe,
                          "age": parent.child[i].age,
                          "solde": parent.child[i].solde,
                          "photo": parent.child[i].photo,
                          "accepted": parent.child[i].accepted
    
                      })
                  }
                }
                
            res.json(newShop);
        }catch(err){
            res.json({message:err});
        }
        }); 




router.post('/reloadMoney', async(req, res) => {
    var s;
    var t;
    const trader = await Trader.findOne({ _id: req.body.traderId });
    Parent.findOne({ '_id': req.body.parentId }, function(err, parent) {
        if (err) {
            return res.json({

                message: ('Error find parent ') + err
            });

        } else {


            var newTicket = []
            for (var i = 0; i < trader.ticket.length; i++) {

                newTicket.push({
                    "_id": trader.ticket[i]._id,
                    "code": trader.ticket[i].code,
                    "montant": trader.ticket[i].montant,
                    "used": trader.ticket[i].used
                })


            }


            for (var i = 0; i < newTicket.length; i++) {
                if (newTicket[i].code == req.body.code && newTicket[i].used == 'not used') {
                    t = newTicket[i]._id;
                    for (var j = 0; j < parent.child.length; j++) {
                        if (parent.child[j]._id == req.body.childId) {
                            s = parseInt(parent.child[j].solde) + parseInt(newTicket[i].montant);

                            parent.child[j].solde = s;

                        }
                    }
                }

            }
        }
        parent.save(function(err, savedSector) {
            if (err) {
                res.json({

                    message: ('error Update verified ') + err
                });
            } else {
                for (var v = 0; v < trader.ticket.length; v++) {
                    if (trader.ticket[v]._id == t) {
                        trader.ticket.splice(v, 1);
                    }
                }
                trader.save();
                res.json({

                    message: 'Update verified successfully'


                })
            }
        });
    });
});




router.post('/getChildByName', async(req, res) => {
    try {
        const parent = await Parent.findOne({ _id: req.body.parentId });
        var id;
        for (var i = 0; i < parent.child.length; i++) {
            if (parent.child[i].firstname == req.body.firstname) {
                id = parent.child[i]._id
            }

        }
        res.json(id);

    } catch (err) {
        res.json({ message: err });
    }
});


router.post('/getChildByTag', async(req, res) => {
    try {
        const parent = await Parent.find();
        console.log(parent);
        var newChilds = [];
        var id = '';
        for (var i = 0; i < parent.length; i++) {
            for (var j = 0; j < parent[i].child.length; j++) {
                newChilds.push(parent[i].child[j]);


            }
        }
        for (var k = 0; k < newChilds.length; k++) {
            console.log(newChilds[k].tagId)
            if (newChilds[k].tagId == req.body.tag) {
                id = newChilds[k]._id
            }
        }
        console.log(id)


        res.json(id);
    } catch (err) {
        res.json({ message: err });
    }
});
router.post('/getChilSoldedByTag', async(req, res) => {
    try {
        const parent = await Parent.find();
        console.log(parent);
        var newChilds = [];
        var solde = '';
        for (var i = 0; i < parent.length; i++) {
            for (var j = 0; j < parent[i].child.length; j++) {
                newChilds.push(parent[i].child[j]);


            }
        }
        for (var k = 0; k < newChilds.length; k++) {
            console.log(newChilds[k].tagId)
            if (newChilds[k].tagId == req.body.tag) {
                solde = newChilds[k].solde
            }
        }
        console.log(solde)


        res.json(solde);
    } catch (err) {
        res.json({ message: err });
    }
});


module.exports = router;