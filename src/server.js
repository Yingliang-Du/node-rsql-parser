var express = require('express');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

/**
 *	define the Router middle layer, which will be executed before any other routes. 
 *	This route will be used to print the type of HTTP request the particular Route 
 *	is referring to.
 */
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});


router.get("/", function(req,res){
  res.sendFile(path + "index.html");
});

// telling Express to use the Routes we have defined above
app.use("/", router);

/**
 *	The Express Routing is assigned in order, so the last one will get executed when 
 *	the incoming request is not matching any route. 
 *	So we can use it to handle the 404 error case.
 */
app.use("*", function(req,res){
  res.sendFile(path + "404.html");
});

// Start the server on specified port
app.listen(3002, function() {
  console.log("Live at Port 3002");
});