const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

const day = ["Mon", "Tues", "Wednes", "Thurs", "Fri", "Sat", "Sun"];

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
  title: String,
};

const Item = mongoose.model("Item", itemSchema);

app.post("/delete", (req, res) => {
  let id = req.body.checkbox;
  let whichList = req.body.listName;
  console.log(whichList);

  if (whichList === "Your list") {
    Item.deleteOne({ _id: id }, (err, item) => {
      if (err) console.log(err);
      else console.log(item);
    });
    res.redirect("/");
  } else {
    List.findOne({ name: whichList }, (err, theList) => {
      if (err) console.log(err);
      else {
        theList.deleteOne({ _id: id }, (err, item) => {
          if (err) console.log(err);
        });
      }
    });
    res.redirect("/" + whichList);
  }
});

app.post("/", (req, res) => {
  // console.log(req.body);
  let item = req.body.newItem;
  let listTitle = req.body.submit;

  if (item.length > 0) {
    const listItem = Item({ title: item });

    if (listTitle === "Your list") {
      listItem.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listTitle }, (err, foundList) => {
        foundList.items.push(listItem);
        foundList.save();
        res.redirect(`/${listTitle}`);
      });
    }
  } else {
    if (listTitle === "Your list") res.redirect("/");
    else res.redirect("/" + listTitle);
  }
});

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/:customList", (req, res) => {
  const customList = _.capitalize(req.params.customList);

  List.findOne({ name: customList }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customList,
          items: [{ title: `Welcome to ${customList} list` }],
        });
        list.save();
        res.redirect(`/${customList}`);
      } else {
        res.render("list", { listType: foundList.name, list: foundList.items });
      }
    }
  });
});

app.get("/", (req, res) => {
  Item.find({}, (err, item) => {
    if (item.length === 0) {
      Item.insertMany(
        [
          { title: "Welcome to the deadline manager!" },
          { title: "Hit the (+) button to add a new item." },
          { title: "👈 Click this to delete an item." },
        ],
        (err) => {
          if (err) console.log(err);
          else console.log("Success");
        }
      );
      res.redirect("/");
    } else {
      res.render("list", { listType: "Your list", list: item });
    }
  });
});

app.listen(5000, (req, res) => {
  console.log("Server is listening...");
});

// ABOUT PAGE

app.get("/about", (req, res) => {
  res.render("about");
});
