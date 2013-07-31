
/**
 * Main export which returns a middleware function. When called without any
 * arguments attempts to convert all parameters of the path into documents.
 * 
 * @param {string} [param] Name of the routing path parameter to convert to
 *                         a Mongoose document
 * @param {string} [model] Name of the Mongoose model to use. Defaults to the 
 *                         parameter <code>param</code>, however with first 
 *                         letter capitalized.
 * @param {string} [variable] Name of the property of the 
 *                            <code>request.documents</code> object in which
 *                            the found document reference is stored. 
 */
function param2doc(param, model, variable) {
	if (arguments.length == 0) {
    return function (req, res, next) {
      convertAllParams(Object.keys(req.params), req, next);
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

function convertAllParams(params, req, next) {
  if (params.length == 0) {
    next();
  } else {
    convertParam(param2doc.options, req, params.shift(), null, null, function(err) {
      // TODO Handle err (configurable)
      convertAllParams(params, req, next);
    });
  }
}

function convertParam(options, req, param, model, variable, done, notFound) {
	var mongoose = options.mongoose;

  // TODO handle non existing parameter (possibly depending on option)
  if (!req.params[param]) return;

  // TODO make uppercase first letter optional
	model = model || upperFirstChar(param);

  variable = variable || param;

  try {
    var modelClass = mongoose.model(model);
  } catch(e) {
    // TODO Handle non-existent model
    debugger;
  }

  var docs = req.documents = req.documents || {};

  // TODO find document by field other than _id
  modelClass.findById(req.params[param], function(err, document) {
    if (err) 
      (notFound || done)(err);
    else {
      docs[variable] = document;
      done();
    }
  });
}

/**
 * Returns the passed string with the first letter in upper case
 * 
 * @param {string} string
 * @return {string}
 */
function upperFirstChar(string) {
	return string.slice(0, 1).toUpperCase() + string.slice(1);
}