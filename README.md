# Vue + Vuex: useful examples

## HTML Images
#### Main HTML and Chrome Source Inspector
<img src=html1.png>

#### Edit Modal Prompt
<img src=html2.png>

## Comments on index.html
#### 1. Include Bootstrap, jQuery, Vue, Babel
```
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js" integrity="sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/vuex@2.0.0"></script>
```
#### 2. Script to select and focus on Modal Popup Modify Product
```
    <script>
      $(window).on('shown.bs.modal', function() {
        var inputObj = $(".modal-body").find("input");
        inputObj.select();
        inputObj.focus();
      });
    </script>
```
#### 3. Define DIV elements and contents
```
    <div style="width: 350px">
      <!-- 3.1. header -->
      <div id="header">
        <h5 class="card-title">Products Count: {{getCount()}}</h5>
        <button type="button" class="btn btn-success" v-on:click="load()">Load</button>&nbsp;
        <button type="button" class="btn btn-warning" v-on:click="save()">Save</button>
      </div><br>

      <!-- 3.2. products -->
      <div id="products" style="height: 60%; overflow-y: scroll; width: '18rem'">
        <div v-for="obj in listFilteredSorted()" class='card' style="width: '18rem'">
          <div class='card-body'>
            <h5 class='card-title'>{{obj.name}}</h5>
            <button type='button' class='btn btn-primary' data-toggle='modal' data-target='#edit' v-on:click="setEditObj(obj)">
              Edit
            </button>&nbsp;
            <a href='#' class='btn btn-danger' v-on:click="Delete(obj.id)">Delete</a>
          </div>
        </div>
      </div><br><br>

      <!-- 3.3. Search & Create Product -->
      <div id="new">
        Search & Create Product
        <input type="text" id="searchAndCreateName" v-on:keyup="keyUp" ref="searchAndCreateName"/>&nbsp;
        <button class="btn btn-info" v-on:click="add()" :disabled="getDisabled()">Add</button>
      </div><br>

      <!-- 3.4. Editing product -->
      <div id="edit" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title" id="exampleModalLongTitle">Edit Product {{getEditing().id}}</h5>
             <button type="button" class="close" data-dismiss="modal" aria-label="Close">
               <span aria-hidden="true">&times;</span>
             </button>
           </div>
           <div class="modal-body">
             <input type="text" :value="getEditing().name" v-on:keyup="keyUp"/>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
             <button type="button" class="btn btn-primary" v-on:click="editOk">Edit</button>
           </div>
         </div>
        </div>
      </div>
    </div>
```   
#### 4. Include product.js
```   
    <script src="products.js"></script>
```  
## Comments on product.js
#### 5. State prototype
```  
const state = {
  title: "",
  filter: "",
  editing: { id: "", name: ""},
  list: []
}
```  
#### 6. nextId useful function
```  
function nextId(state) {
  var maxId = 0;
  state.list.forEach(function(item,index,arr) {
    if (item.id > maxId)
      maxId = item.id;
  })
  return maxId+1;
}
```  
#### 7. Define mutations (Redux reducers)
```  
const mutations = {
  Delete(state,id) {
    state.list.forEach(function(item,index,arr) {
      if (item.id == id)
        return arr.splice(index,1)
    })
  },
  load(state) {
    fetch("/products/load", { method: 'post' })
    .then(results => { return results.json() })
    .then(json => {
      state.list = json.list;
    })
  },
  save(state) {
    fetch("/products/save", { method: 'post', headers: {'Content-Type': 'application/json'},body: JSON.stringify(state) })
  },
  add(state) {
    state.list.push({ id: nextId(state), name: state.filter})
    state.filter = "";
  },
  editingKeyUp(state,name) {
    state.editing.name = name;
  },
  filterKeyUp(state,name) {
    state.filter = name;
  },
  setEditObj(state,obj) {
    state.editing = Object.assign({}, obj);
  },
  editOk(state) {
    state.list = state.list.map(
      (item) => {
        if (item.id == state.editing.id)
          item.name = state.editing.name;
        return item;
      }
    );
    $("#edit").trigger('click.dismiss.bs.modal')
    state.editing = { id: "", name: ""};
  }
}
```  
#### 8. Define Store
```  
var store = new Vuex.Store({
  state: state,
  mutations: mutations,
  getters: {
    // 8.1. Useful function to filter and sort product list
    listFilteredSorted: state => {
      return state.list.filter(
        (product) => {
          return product.name.indexOf(state.filter) != -1
        }
      ).sort(function (a,b) { return (a.name > b.name) - (a.name < b.name)})
    }
  }
})
```  
#### 9. Header Vue instance
```  
var header = new Vue({
  el: '#header',
  store: store,
  methods: {
    save: function() {
      return this.$store.commit("save");
    },
    load: function() {
      return this.$store.commit("load");
    },
    getCount: function() {
      return this.$store.getters.listFilteredSorted.length;
    }
  }
})
```  
#### 10. Products Vue instance
```  
var products =  new Vue({
  el: '#products',
  store: store,
  methods: {
    setEditObj: function (obj) {
      this.$store.commit("setEditObj",obj);
    },
    Delete: function (id) {
      this.$store.commit("Delete",id);
    },
    listFilteredSorted: function() {
      return this.$store.getters.listFilteredSorted;
    }
  }
})
```  
#### 11. New Vue instance
```  
var New = new Vue({
  el: '#new',
  store: store,
  methods: {
    getDisabled: function() {
      return this.$store.state.filter.length == 0
    },
    add: function() {
      this.$store.commit("add");
      this.$refs.searchAndCreateName.value = "";
    },
    keyUp: function(event) {
      return this.$store.commit("filterKeyUp",event.target.value);
    }
  }
})
```  
#### 12. Edit Vue instance
```  
var edit = new Vue({
  el: '#edit',
  store: store,
  methods: {
    editOk: function(event) {
      return this.$store.commit("editOk");
    },
    getEditing: function() {
      return this.$store.state.editing;
    },
    keyUp: function(event) {
      return this.$store.commit("editingKeyUp",event.target.value);
    }
  }
})
```  
## Comments on index.js
#### 13. Require and Define Constant
```  
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/js'));
app.use(express.json());
const DEFAULT_PRODUCTS = 4;
const SERVERPORT = 80;
```  
#### 14. Model Prototype
```  
var model = {
  "title": "products",
  "list": [],
  "filter": "",
  "editing": { "active": false, "id": "", "name": ""}
}
```  
#### 15. Init items
```  
function initItems(n) {
  for (i = 1; i <= n; i++)
    model.list.push({
      "id": i,
      "name": "product " + i
    })
}
```  
#### 16. Load & Save handler
```  
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
```  
#### 17. Listen
```  
app.listen(SERVERPORT);
initItems(DEFAULT_PRODUCTS);
```  
# 18 TODO
## 18.1 Components
## 18.2 Webpack
## 18.3 Plugins
## 18.4 Unit Testing
