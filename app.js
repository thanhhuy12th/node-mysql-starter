'use strict';

// Depedencies
const https             = require('https'),
      express           = require('express'),
      bodyParser        = require('body-parser'),
      cors              = require('cors'),
      serveIndex        = require('serve-index'),
      cluster           = require('cluster'),
      workers           = process.env.WORKERS || require('os').cpus().length;
// Component
const routes      = require('./routes/'),
      routes_user = require('./routes/user'),
      routes_exp  = require('./routes/example'),
      config      = require('./config/'),
      logError    = require('./lib/logerror.js');


if (cluster.isMaster) {
  console.log("Server fetch-api 1.0.0");
  console.log('start cluster with %s workers', workers);
  for (var i = 0; i < workers; ++i) {
    var worker = cluster.fork().process;
    console.log('worker %s started.', worker.pid);
  }

  cluster.on('exit', function(worker) {
    console.log('worker %s died. restart...', worker.process.pid);
    cluster.fork();
  });
} 
else {
  const   app     = express();
  app.set('port',config.PORT);
  const server = app.listen(app.get('port'), function(){
    console.log("App is running on port: "+config.PORT);
  });

  //Config app
  app.use(cors());
  app.use(express.static('public'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // View file upload
  app.use('/ftp', express.static('public/upload/img'), serveIndex('public/upload/img', {'icons': true}));
  // Use route
  routes_user(app);
  routes_exp(app);


  console.log(`Worker ${process.pid} started`);
}
// Write log
process.on('uncaughtException', function (err) {
  let errDate = (new Date).toUTCString();
  let data = "";
  logError.readLog()
  .then(function(res){
    data = res + errDate + ' uncaughtException:'+ " \n " + err.stack;
    return logError.writeLog(data);
  })
  .then(function(res){
    if(res == 1){
      console.log(errDate + ": Error has been write to error.log ...");
    }
    else{
      console.log("err from write log");
    }
  })
  .catch(function(err){
    console.log(err);
  });
})


