const express=require("express");
const bodyParser=require("body-parser");
// const ejs=require("ejs");
const mongoose=require("mongoose");
const _=require("lodash")
const app=express();


app.listen(process.env.PORT || 3000,function(){
  console.log("listening at 3000 port");
});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
// database connection
mongoose.connect("mongodb+srv://sheikhhaji18:18shakila@cluster0.2akiep0.mongodb.net/todolistDB",{useNewUrlParser:true});

// schemma
const listSchema={name:String};
// model
const listitem=mongoose.model("Item",listSchema);

const item1={name:"start dsa preparation"};
const item2={name:"bike service"};
const item3={name:"aptitude preparation"};
const defaultitem=[item1,item2,item3];

const newlistitem={name:String,items:[listSchema]};

const newlist=mongoose.model("NewItem",newlistitem);

// listitem.insertMany([item1,item2,item3],function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("inserted successfully");
//   }
// });


app.get("/",function(req,res){
  listitem.find(function(err,listitems){
       if(listitems.length===0){
         listitem.insertMany([item1,item2,item3],function(err){
           if(err){
             console.log(err);
           }else{
             console.log("inserted successfully");
           }
         });
         res.redirect("/");
       }else{
          res.render("list",{listTile:"Today",list:listitems});
       }
  });

});

app.post("/",function(req,res){
       var collectionname=req.body.hi;
       var itemname=req.body.haji;
       var itemnames=new listitem({name:itemname});
      if(collectionname==="Today"){
        const items=new listitem({name:itemname});
        items.save();
        res.redirect("/");
      }
      else{
     newlist.findOneAndUpdate({name:collectionname}, {$push: {items: itemnames}},function(err){
       if(err){
         console.log(err);
       }
       else{
         console.log("inserted successfully");
       }
     });

       res.redirect("/"+collectionname);

      }



});

app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const collectionname=req.body.titles;
  console.log(id);
  console.log(collectionname);
  if(collectionname==="Today"){
  listitem.deleteOne({_id:id},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("successfully deleted that record");
    }
    res.redirect("/");
  });}
  else{
    newlist.findOneAndUpdate({name:collectionname}, {$pull: {items: {_id:id}}},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("deleted successfully");
      }

    });
    res.redirect("/"+collectionname);
  }

});

app.get("/:id",function(req,res){
  const ids=_.capitalize(req.params.id);
  newlist.findOne({name:ids},function(err,foundlist){
       if(!foundlist){
         newlist.create({name:ids,items:defaultitem},function(err){
           if(err){
             console.log(err);
           }else{
             console.log("inserted successfully");
           }
         });
         res.redirect("/"+ids);
       }else{

          res.render("list",{listTile:foundlist.name,list:foundlist.items});
       }

})});
app.get("/about",function(req,res){
  res.render("about");
})
