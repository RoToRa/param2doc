
function param2doc(param, model, variable) {
	if (arguments.length == 0) {
    return function (req, res, next) {
      var chain = function(params) {
        if (params.length == 0) {
          next();
        } else {
          convertParam(param2doc.options, req, params.shift(), model, variable, function(err) {
            // TODO Handle err
            chain(params);
          });
        }
      }
      chain(Object.keys(req.params));
    }
  } else {
		return function (req, res, next) {
			convertParam(param2doc.options, req, param, model, variable, function() {
        next();
      }, function() {
        // TODO Option to do something else if ID doesn't match
        next('route');
      });
		}
	}
}

param2doc.options = {
  mongoose: null
};

param2doc.init = function(options) {
	for (var option in options) {
		param2doc.options[option] = options[option];
	}

  if (!param2doc.options.mongoose) {
    throw "param2doc: Initialization requires reference to Mongoose."
  }
}

module.exports = param2doc;

/* Private functions */

function convertParam(options, req, param, model, variable, done, notFound) {
	var mongoose = options.mongoose;

  if (!req.params[param]) return;

	var docs = req.documents = req.documents || {};

	model = model || upperFirstLetter(param);

	if (!variable) {
		if (typeof docs[param] === "undefined") {
			variable = param;
		} else {
			var i = 0;
			do {
				variable = param + ++i;
			} while (typeof docs[variable] !== "undefined");
		}
	}

  try {
    var modelClass = mongoose.model(model);
  } catch(e) {
    debugger;
    // TODO
  }

  modelClass.findById(req.params[param], function(err, document) {
    if (err) 
      (notFound || done)(err);
    else {
      docs[variable] = document;
      done();
    }
  });
}

function upperFirstLetter(string) {
	return string.slice(0, 1).toUpperCase() + string.slice(1);
}