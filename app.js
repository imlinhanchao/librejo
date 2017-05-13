var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var hbs = require('hbs');
var exphbs = require('express-handlebars');

var index = require('./routes/index');
var api = require('./routes/api');
var admin = require('./routes/admin');
var app = express();
var blocks = [];

app.engine('hbs', exphbs({
    layoutsDir: __dirname + '/views',
    defaultLayout: 'layout',
    extname: '.hbs',
    partialsDir:[
        __dirname + '/views/partials/'
    ],
    helpers:{
        static: function(name){
            return require('./lib/static.js').map(name);
        },
        block: function(name) {
            var val = (blocks[name] || []).join('\n');
            // clear the block
            blocks[name] = [];
            return val;
        },
        extend: function(name, context) {
            var block = blocks[name];
            if (!block) {
                block = blocks[name] = [];
            }

            block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
        }
    }
}));

var blocks = {};
hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
