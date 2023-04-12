const express = require('express');
const router = express.Router();
const User = require("../models/users")
const multer = require ('multer');
 const fs = require('fs');
const { error } = require('console');
//upload image

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

router.get("/add", (req, res) => {
    res.render("add-user", {title: "Add Users"});
});

router.post('/add', upload, async (req, res) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename
    });
    try {
      await user.save();
      req.session.message = {
        type: 'success',
        message: 'User added successfully!'
      };
      res.redirect('/');
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  });
  
  router.get("/", (req, res) => {
    User.find().exec()
         .then(users => {
             res.render("index", {
                 title: "Home Page",
                 users: users,
             });
         })
         .catch(err => {
             res.json({message: err.message});
         });
 });
 
 router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id);
        if (user == null) {
            res.redirect('/');
        } else {
            res.render('edit-user', {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;
    try{
        fs.unlinkSync('./uploads/' + req.body.old_image);
    }catch(err){
        console.log(error);
    }
    }else{
        new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
      }).then((result) => {
        req.session.message = {
          type: 'success',
          message: "user updated successfully",
        };
        res.redirect("/");
      }).catch((err) => {
        res.json({message: err.message, type: 'danger'});
      });
      
});

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndDelete(id)
        .then(result => {
            if(result.image != ''){
                try{
                    fs.unlinkSync('./uploads/'+ result.image);
                }catch(err){
                    console.log(err);
                }
            }
            req.session.message = {
                type: 'info',
                message: "user deleted successfully",
            };
            res.redirect("/");
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});



module.exports = router;