Form = function (schema, value, parent) {
  _.extend(this, schema);
  this.dep = new Deps.Dependency();
  this.value = value;
  this.parent = parent;
  this.fields = {};
  this.children = {};
};

Form.prototype.field = function (fieldName) {
  this.dep.depend();
  var field = this.fields[fieldName] || new Form(this.schema[fieldName], this.value[fieldName], this);
  if (!this.fields[fieldName]) {
    this.fields[fieldName] = field;
  } else {
    field.value = this.value[fieldName];
  }
  field.dep.depend();
  return field;
};

Form.prototype.items = function (fieldName) {
  var self = this;
  this.childSchema = this.childSchema || new Schema({
    name: this.name
    , rules: this.rules
    , schema: this.schema
  });
  this.dep.depend();
  var children = {};
  _.each(this.value, function (a, i) {
    var key = a && a._id || i;
    if (!self.children[key]) {
      self.children[key] = new Form(self.childSchema, a, self);
    } else {
      self.children[key].value = a;
    }
    children[key] = self.children[key];
  });
  // cleanup deleted values
  self.children = children;

  return _.values(children);
};

Form.prototype.set = function (value) {
  var self = this;
  if (this.parent) {
    this.parent.value[this.name] = value;
  }
  this.value = value;
  this.dep.changed();
};

var personSchema = new Schema({
  name: 'person'
  , schema: {
    name: []
    , age: []
    , favoriteColor: []
  }
});

m = new Form(personSchema, {
  name: 'my name'
  , neighbor: {
    name: 'my neighbor'
  }
  , friends: [
    {
      name: 'sam'
    }
  ]
});

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Template.hello.helpers({
    item: m
  });

  Template.hello.events({
    'change input': function (e) {
      this.set(e.currentTarget.value);
    }
    , 'click button': function (e) {
      this.value.push({name: 'new friend'});
      this.set(this.value);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
