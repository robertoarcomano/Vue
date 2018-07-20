# Vue + Vuex: useful examples

## HTML Images
#### Main HTML and Chrome Source Inspector
<img src=html1.png>

#### Edit Modal Prompt
<img src=html2.png>

## Comments on index.html
#### 1. Include Bootstrap, jQuery, Vue, Babel
```
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
  <script src="https://unpkg.com/vuex@2.0.0"></script>
  <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
  <script src="semantic/semantic.min.js"></script>
  <link rel="stylesheet" href="semantic/semantic.min.css">
```
#### 2. Define DIV elements and contents
```
<div style="width: 350px">
  <br>
  <!-- 2.1. header -->
  <div id="header">
    <div class="ui compact menu">
      <a class="item">
        <i class="icon product hunt"></i> Products
        <div class="floating ui red label">{{getCount()}}</div>
      </a>
    </div>
    <br><br>
    <button type="button" class="ui green button" v-on:click="load()">Load</button>&nbsp;
    <button type="button" class="ui red button" v-on:click="save()">Save</button>
  </div>
  <br>

  <!-- 2.2. products -->
  <div id="products" class="ui cards" style="height: 60%; overflow-y: scroll; width: '18rem'">
    <product v-for="obj in listFilteredSorted()" v-bind:obj="obj" v-bind:key="obj.id"></product>
  </div>
  <!-- 2.2.1. product template -->
  <template id="template1">
    <div class='ui card'>
      <div class='content'>
        <div class='ui header'>{{obj.name}}</div>
        <div class="description">
          <button type='button' class='ui blue button' v-on:click="setEditObj(obj)">
            Edit
          </button>&nbsp;
          <a href='#' class='ui grey button' v-on:click="Delete1(obj.id)">Delete</a>
        </div>
      </div>
    </div>
  </template><br>

  <!-- 2.3. Search & Create Product -->
  <h4 class="ui header">
    Search & Create Product
  </h4>
  <div class="ui input focus" id="new">
    <input type="text" id="searchAndCreateName"placeholder="Search..." v-on:keyup="keyUp" ref="searchAndCreateName"/>&nbsp;
    <button class="ui active violet button" v-on:click="add()" :disabled="getDisabled()"><i class="icon product hunt"></i>Add</button>
  </div>

  <!-- 2.4. Editing product -->
  <div id="edit" class='ui card mini modal' v-on:>
    <div class='content'>
      <div class='header'>Edit</div>
      <div class="ui input focus description">
        <input id="inputEdit" type="text" :value="getEditing().name" v-on:keyup="keyUp"/>
      </div>
    </div>
    <div class='extra content'>
      <button type="button" class="ui gray button" v-on:click="close">Close</button>
      <button type='button' class='ui blue button' v-on:click="editOk">Edit</button>
    </div>
  </div>
```   
#### 3. Include product.js
```   
    <script src="products.js"></script>
```  
#### 4. Script to select and focus on Modal Popup Modify Product
```
  <script>
    $('#edit').modal('setting', {
      autofocus: false,
      onVisible: function () {
        setTimeout(function () {
          $('#inputEdit').focus();
          $('#inputEdit').select();
        }, 10);
      }
    });
  </script>
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
    listFilteredSorted: function() {
      return this.$store.getters.listFilteredSorted;
    }
  }
})

//  10.1. Component product
Vue.component('product', {
  props: ['obj'],
  store: store,
  template: '#template1',
  methods: {
    setEditObj: function (obj) {
      this.$store.commit("setEditObj",obj);
      $('.mini.modal').modal('show');
    },
    Delete: function (id) {
      this.$store.commit("Delete",id);
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
      this.$store.commit("editOk");
      return this.close();
    },
    getEditing: function() {
      return this.$store.state.editing;
    },
    keyUp: function(event) {
      return this.$store.commit("editingKeyUp",event.target.value);
    },
    close: function(event) {
      return $('.mini.modal').modal('hide');
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
## 18.1 Webpack
## 18.2 Plugins
## 18.3 Unit Testing
