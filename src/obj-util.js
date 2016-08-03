var objUtil = exports;

var logger = require('./logger');

objUtil.isEmpty = function(obj) {
	logger.debug('typeof obj-------', typeof obj);
	logger.debug('content of obj-------', obj); 

	// when obj is null or undefined
	if (!obj) {
		return true;
	}
	
	// when obj is empty
	if (Object.keys(obj).length === 0) {
		return true;
	}

	logger.debug('obj is not empty!');
	return false;
}