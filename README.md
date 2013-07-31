#param2doc

Express middleware to automatically map routing parameters onto Mongoose documents

##Installation

```bash
$ npm install param2doc
```

##Usage

###Example

```javascript
var express = require('express');
var param2doc = require('param2doc');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var exampleSchema = mongoose.Schema({
  name: String
});

mongoose.model('Example', exampleSchema);

param2doc.init({mongoose: mongoose});

app.get("/path/:example", param2doc(), function (req, res) {
  if (req.documents.example)
    res.send("<h1>" + req.documents.example.name + "</h1>");
  else
    next();
});
```

When called with the URL http://server/path/0123456789ABCDEF then req.documents.example 
will contain a referemce to a document of the Example model with the ID 0123456789ABCDEF
(if it exists).


##TODOs / Future features

- Support `app.params()`
- For more see TODOs in source code