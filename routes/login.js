var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.json({limit: '1mb'}));
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.post('/', function (req, res) {
  
  console.log(req.body);
  res.json(req.body);
})

function verify(user, passwd) {
    
}

module.exports = router;