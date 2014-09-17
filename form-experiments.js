Form = function (schema, value, parent) {
  _.extend(this, schema);
  this.dep = new Deps.Dependency();
  this.value = value;
  this.parent = parent;
  this.fields = {};
};

Form.prototype.field = function (fieldName) {
  if (!this.fields[fieldName]) {
    this.fields[fieldName] = new Form(this.schema[fieldName], this.value[fieldName], this);
  }
  var field = this.fields[fieldName];
  field.dep.depend();
  return field;
};

Form.prototype.set = function (value) {
  var self = this;
  if (this.parent) {
    this.parent.value[this.name] = value;
  }
  this.value = value;
  this.dep.changed();
  _.each(this.fields, function (a, i) {
    a.set(value[i]);
  });
};

var personSchema = new Schema({
  name: 'person'
  , schema: {
    name: []
    , age: []
    , favoriteColor: []
  }
});

m = new Form(personSchema, {});

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
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
