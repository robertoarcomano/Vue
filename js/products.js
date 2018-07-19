// 5. State prototype
const state = {
  title: "",
  filter: "",
  editing: { id: "", name: ""},
  list: []
}

// 6. nextId useful function
function nextId(state) {
  var maxId = 0;
  state.list.forEach(function(item,index,arr) {
    if (item.id > maxId)
      maxId = item.id;
  })
  return maxId+1;
}

// 7. Define mutations (Redux reducers)
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

// 8. Define Store
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

// 9. Header Vue instance
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

// 10. Products Vue instance
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

// 11. New Vue instance
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

// 12. Edit Vue instance
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
