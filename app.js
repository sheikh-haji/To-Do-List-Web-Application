//jshint esversion:6
require('dotenv').config()
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const session = require('express-session');
const RedisStore = require("connect-redis")(session)

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app=express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy=require("passport-facebook");




app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
// app.use(function(req,res,next){
// if(!req.session){
//     return next(new Error('Oh no')) //handle error
// }
// next() //otherwise continue
// });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",

     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ username: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "https://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // const { email, first_name, last_name } = profile._json;
      // const userData = {
      //   email,
      //   firstName: first_name,
      //   lastName: last_name
      // };
      // new userModel(userData).save();
      // done(null, profile);
      console.log(profile);
      User.findOrCreate({ username: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT || 3000,function(req,res){
   console.log("listening to port 3000");
});
mongoose.connect("mongodb+srv://sheikhhaji18:"+process.env.PASSWORD+"@cluster0.2akiep0.mongodb.net/todolistDB",{useNewUrlParser:true});
// mongoose.set("useCreateIndex", true);
// plugin to put in the schema
const user=new mongoose.Schema({username:String,password:String,googleId:String,secret:String});
user.plugin(passportLocalMongoose);
user.plugin(findOrCreate);
const User=new mongoose.model("user",user);
// User is a collection
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
const listSchema={name:String};
// model
const listitem=mongoose.model("Item",listSchema);

const item1={name:"start dsa preparation"};
const item2={name:"bike service"};
const item3={name:"aptitude preparation"};
const defaultitem=[item1,item2,item3];
const newlistitem={uname:String,name:String,items:[listSchema]};
//
const newlist=mongoose.model("NewItem",newlistitem);

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/list");
  });

  app.get("/auth/facebook",
    passport.authenticate('facebook')
  );
  app.get("/auth/facebook/callback",
    passport.authenticate('facebook', { failureRedirect: "/l" }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/list");
    });
app.get("/", function(req, res){
  res.render("login");
});

// app.get("/login", function(req, res){
//   res.render("login");
// });

app.get("/register", function(req, res){
  res.render("register");
});


app.get("/list", function(req, res){
    if(req.isAuthenticated()){
       const temp=req.user.username;
       newlist.findOne({uname:temp},function(err,foundlist){

            if(!foundlist){
              // console.log(foundlist.items);
              newlist.create({uname:temp,name:"Today",items:defaultitem},function(err){
                if(err){
                  console.log(err);
                }else{
                  console.log("inserted successfully");
                }
              });
              res.redirect("/list");
            }else{

               res.render("list",{listTile:foundlist.name,list:foundlist.items});
            }

     })
    }
});

app.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){
      return err;
    }
  });
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/list");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/list");
      });
    }
  });

});
app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const temp1=req.user.username;
  if(req.isAuthenticated()){
  newlist.findOneAndUpdate({uname:temp1}, {$pull: {items: {_id:id}}},function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("deleted successfully");
          res.redirect("/list");
        }

      });}

});

app.post("/post",function(req,res){
  const temp1=req.user.username;
  const temp2={name:req.body.haji};

  if(req.isAuthenticated()){
  newlist.findOneAndUpdate({uname:temp1}, {$push: {items: temp2}},function(err){
         if(err){
           console.log(err);
         }
         else{
           console.log("inserted successfully");
           res.redirect("/list");
         }
       });
    }
});

// app.listen(3000, function() {
  // console.log("Server started on port 3000.");
// });

// const express=require("express");
// const bodyParser=require("body-parser");
// // const ejs=require("ejs");
// const mongoose=require("mongoose");
// const _=require("lodash")
// const app=express();
//
//
// app.listen(process.env.PORT || 3000,function(){
//   console.log("listening at 3000 port");
// });
// app.set("view engine","ejs");
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static("public"));
// // database connection
// mongoose.connect("mongodb+srv://sheikhhaji18:18shakila@cluster0.2akiep0.mongodb.net/todolistDB",{useNewUrlParser:true});
//
// // schemma
// const listSchema={name:String};
// // model
// const listitem=mongoose.model("Item",listSchema);
//
// const item1={name:"start dsa preparation"};
// const item2={name:"bike service"};
// const item3={name:"aptitude preparation"};
// const defaultitem=[item1,item2,item3];
//
// const newlistitem={name:String,items:[listSchema]};
//
// const newlist=mongoose.model("NewItem",newlistitem);
//
// // listitem.insertMany([item1,item2,item3],function(err){
// //   if(err){
// //     console.log(err);
// //   }else{
// //     console.log("inserted successfully");
// //   }
// // });
//
//
// app.get("/",function(req,res){
//   listitem.find(function(err,listitems){
//        if(listitems.length===0){
//          listitem.insertMany([item1,item2,item3],function(err){
//            if(err){
//              console.log(err);
//            }else{
//              console.log("inserted successfully");
//            }
//          });
//          res.redirect("/");
//        }else{
//           res.render("list",{listTile:"Today",list:listitems});
//        }
//   });
//
// });
//
// app.post("/",function(req,res){
//        var collectionname=req.body.hi;
//        var itemname=req.body.haji;
//        var itemnames=new listitem({name:itemname});
//       if(collectionname==="Today"){
//         const items=new listitem({name:itemname});
//         items.save();
//         res.redirect("/");
//       }
//       else{
//      newlist.findOneAndUpdate({name:collectionname}, {$push: {items: itemnames}},function(err){
//        if(err){
//          console.log(err);
//        }
//        else{
//          console.log("inserted successfully");
//        }
//      });
//
//        res.redirect("/"+collectionname);
//
//       }
//
//
//
// });
//
// app.post("/delete",function(req,res){
//   const id=req.body.checkbox;
//   const collectionname=req.body.titles;
//   console.log(id);
//   console.log(collectionname);
//   if(collectionname==="Today"){
//   listitem.deleteOne({_id:id},function(err){
//     if(err){
//       console.log(err);
//     }
//     else{
//       console.log("successfully deleted that record");
//     }
//     res.redirect("/");
//   });}
//   else{
//     newlist.findOneAndUpdate({name:collectionname}, {$pull: {items: {_id:id}}},function(err){
//       if(err){
//         console.log(err);
//       }
//       else{
//         console.log("deleted successfully");
//       }
//
//     });
//     res.redirect("/"+collectionname);
//   }
//
// });
//
// app.get("/:id",function(req,res){
//   const ids=_.capitalize(req.params.id);
//   newlist.findOne({name:ids},function(err,foundlist){
//        if(!foundlist){
//          newlist.create({name:ids,items:defaultitem},function(err){
//            if(err){
//              console.log(err);
//            }else{
//              console.log("inserted successfully");
//            }
//          });
//          res.redirect("/"+ids);
//        }else{
//
//           res.render("list",{listTile:foundlist.name,list:foundlist.items});
//        }
//
// })});
// app.get("/about",function(req,res){
//   res.render("about");
// })
