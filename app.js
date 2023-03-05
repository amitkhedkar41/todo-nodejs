const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config({ path: '.env' });


const app = express();
app.set('view engine','ejs');
var ms=[];
let workItems=[];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true});

const itemsSchema={
    name:String
};
const Item = mongoose.model("Item" , itemsSchema);
const item1 = new Item({
    name:"Add one item in empty box and cLick on + button to add that item"
});
const item2 = new Item({  
    name:"Check the uncheked box to delet that item from the list"
});
const item3 = new Item({
    name:"Good to go ..Thanks for using app"

});


//for another list Schema//
const listSchema ={
    name :String,
    items:[itemsSchema]

};

const List = mongoose.model("List" , listSchema);

const defaultItems = [item1 ,item2 ,item3];

app.get("/" , function(req ,res){

    //for getting all the items present in the home route

    Item.find({} , function(err , foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err) {
                console.log(err);
                } else {
                console.log("Successfully saved default items to DB.");
                }
            });
            res.redirect("/");

        }else{


        res.render("list" , {listtitle : "Today" , newListItems:foundItems} );
        }
    });
});


//new lists as i type the name.....

app.get("/:customListName" , function(req , res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName} , function(err , foundList){
        if(!err){
            if(!foundList){
                //create new list 
                const list = new List({
                    name:customListName,
                    items:defaultItems
                })
                list.save();
                res.redirect("/" + customListName);

            }else{
               // Show existing list
            res.render("list" ,{listtitle : foundList.name , newListItems:foundList.items})
            }
        }
    });
});


app.post("/" , function(req, res){
    const listName =req.body.list;

    const itemName = req.body.newitem;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");


    }else{
        List.findOne({name: listName} ,  function(err , foundList){
            foundList.items.push(item);
            foundList.save();

            res.redirect("/" + listName)
        });

    }



} );

app.post("/delet" ,function(req , res){

    const CheckedID= req.body.checkbox;

    const listName = req.body.listName;


    if(listName==="Today"){
        
    Item.findByIdAndRemove(CheckedID , function(err){
        if(!err){
            console.log("successfully deleted that shit");
            res.redirect("/");

        }
    });

    }else{
        List.findOneAndUpdate({name:listName} , {$pull :{items:{_id:CheckedID}}} , function(err , foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }

});

app.listen(4100 , function(){
    console.log("server is booooming");  
});
