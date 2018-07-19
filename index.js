#!/usr/bin/node
// 13. Require and Define Constant
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/js'));
app.use(express.json());
const DEFAULT_PRODUCTS = 4;
const SERVERPORT = 80;

// 14. Model Prototype
var model = {
  "title": "products",
  "list": [],
  "filter": "",
  "editing": { "active": false, "id": "", "name": ""}
}

// 15. Init items
function initItems(n) {
  for (i = 1; i <= n; i++)
    model.list.push({
      "id": i,
      "name": "product " + i
    })
}

// 16. Load & Save handler
app.post('/products/:action',function(req,res) {
	switch (req.params.action) {
    case "load":
      res.send(model);
      return;
    case "save":
      res.send("ok");
      model = req.body;
      return;
    default:
  }
});

// 17. Listen
app.listen(SERVERPORT);
initItems(DEFAULT_PRODUCTS);
