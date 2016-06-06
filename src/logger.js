var logger = exports;

logger.debugLevel = 'debug';
var levels = ['debug', 'info', 'warn', 'error'];

logger.log = function(level, message) {
  if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) ) {
    log(level + ': ', message);
  }
};

/**
 *  debug level logging both message and object.
 */
logger.debug = function(message, object) {
  if (levels.indexOf('debug') >= levels.indexOf(logger.debugLevel) ) {
    message = 'debug: ' + message;
    log(message, object);
  }
};

/**
 *  error level logging both message and object.
 */
logger.error = function(message, object) {
  if (levels.indexOf('error') >= levels.indexOf(logger.debugLevel) ) {
    message = 'error: ' + message;
    log(message, object);
  }
};

/**
 *  Build and log message.
 */
function log(message, object) {
  // build message string - suppose JSON if not String
  if (!object) {
    // when object is null or undefined - just print message
  }
  else if (typeof object !== 'string') {
    message += ' => ' + JSON.stringify(object, null, 4);
  }
  else {
    message += ' => ' + object;
  }
  // log message
  console.log(message);
}