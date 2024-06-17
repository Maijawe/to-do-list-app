const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
var _ = require('lodash');

const app = express();

let workItems = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1/todoDB', { useNewUrlParser: true});
//mongoose items schema
const Schema = mongoose.Schema;

const itemsSchema = new Schema({
  name : String
});

//items model
const Item = mongoose.model('Item' , itemsSchema);

//insertMany
  const buyFood = new Item({
  name: "Buy Food"
});

const cookFood = new Item({
  name: "Cook Food"
});

const eatFood = new Item({
  name: "Eat Food"
});

//list schema
const listSchema = new Schema({
  name: String ,
  items: [itemsSchema]
});

//list model
 const List = mongoose.model("List" , listSchema);


const defaultListItems = [buyFood , cookFood , eatFood];

app.get("/" ,function(req ,res){


  //finding all documents(read)
  Item.find({} , function(err , foundItems){

//checking if there are items in my collection..if not , add the following items , else read all the data

if (foundItems.length ===0){
  Item.insertMany(defaultListItems , function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("successfully saved to items db");
  }
  });
res.redirect("/");
  }
  else{
    res.render('list', {listTitle: "Today" , newListItem: foundItems});
      }

  });

});
//handles the form that has an action of /
app.post("/" , function(req , res){

  let itemName = req.body.newItem;
  var listName = req.body.list;
  const item_N = new Item({
    name: itemName
  });

  if(listName.trim() =="Today"){
    item_N.save();
    res.redirect("/");
  }
  else{

List.findOne({name: listName.trim()}  , function(err , foundList){

    foundList.items.push(item_N); //suspected Bug
    foundList.save();
    res.redirect("/" + listName);

});
}

});

app.post("/delete" , function(req , res) {
  var checkedItemId = req.body.checkbox;
  const listname = req.body.listNameHidden;
  if(listname.trim() == "Today"){
    Item.findByIdAndRemove(checkedItemId.trim(), function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("successfully deleted id: " +checkedItemId);
        res.redirect("/");
      }
    });

  }
else{
List.findOneAndUpdate({name: listname.trim()} , {$pull : {items : {_id: checkedItemId.trim()} }} , function(err , foundList){
  if(!err){
    res.redirect("/"+listname);
  }
  else{
    console.log(err);
  }
});
}

});


app.get("/about" , function(req , res){
  res.render('about');
});
app.get("/:customerListName", function(req , res){
    const customerListName = _.capitalize(req.params.customerListName);
List.findOne({name: customerListName.trim()} , function(err , collection){
  if(!err) {

  if(!collection) {
    //create a new list and add default items(buy food , etc)
    const list = new List({
     name: customerListName ,
     items: defaultListItems
   });
    list.save();
    res.redirect("/" +customerListName);
  }
  else{
    // show existing list
    res.render("list" , {listTitle: collection.name , newListItem : collection.items});
  }

}
else{
  console.log(err);
}
});

});

/*let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
} */
app.listen(3000 , function(){
  console.log("You're suucessfully connected");
});
