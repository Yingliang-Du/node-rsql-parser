/*
Parsing RSQL string into Javascript Object.

Operation vocabulary: 
	;		and
	, 	or
	==	:
	!=  neq
	<  		lt
	=lt=  lt
	<=  	lte
	=le=  lte
	>  		gt
	=gt=  gt
	>=  	gte
	=ge=  gte
	=in=  inq
	=out= nin
operations: ['==', '!=', '<', '=lt=', '<=', '=le=', '>', '=gt=', '>=', '=ge=', '=in=', '=out=']
RSQL strings been tested:
-(and) rsql strings-
	paymentStatusCode=in=('PAID', 'INPROGRESS');datePaid>='2010-01-01';datePaid<='2016-01-01';
  productType=in=('AUTO');formType=in=('Statement')
  claimStatusCode=in=('PAID', 'REJECTED');claimDate>='2010-01-01';claimDate<='2016-01-01'
  productType=in=('AUTO');documentType=in=('Statement');date>='2010-01-01';date<='2016-01-01';
-(and/or) rsql string exclude ('=in=', '=out=')
  datePaid>='2010-01-01', datePaid=le='2016-01-01',datePaid=ge='2020-01-01,Somthing=='Some THing'
  datePaid>='2010-01-01'; datePaid=le='2016-01-01',datePaid=ge='2020-01-01,Somthing=='Some THing'
  datePaid>='2010-01-01'; datePaid=le='2016-01-01',datePaid=ge='2020-01-01;Somthing=='Some THing'
  datePaid>='2010-01-01'; datePaid=le='2016-01-01';datePaid=ge='2020-01-01;Somthing=='Some THing'
-(and/or) rsql string include ('=in=', '=out=')
  claimSubmisionDate=lt=2015-07-01;claimSubmisionDate=gt=2015-01-01;account.product.lineOfBusinessCode=in=(AH,LI,RWM);insured.name.suffix==Ms;claimStatusCode=in=(SUBMITTED,PENDING,ACTIVE),claimNumber== "155831094578314641816"
  paymentStatusCode=in=('PAID', 'INPROGRESS', 'DECLINED');datePaid>='2010-01-01';datePaid<='2016-01-01';productType=in=('AUTO', 'LIFE');formType=in=('Statement', 'Contract')
-rsql string contains key without value--should be ignored
	productType=in=('AUTO');documentType=in=('Statement');date>=;date<='2016-01-01';
  productType=in=('AUTO');documentType=in=('Statement');date;date<='2016-01-01';
  productType=in=;documentType=in=('Statement');date>='2010-01-01';date<='2016-01-01';
-rsql contains parenthesized sections
  (something=='Some Thing',somedate=ge=2000-01-01),claimSubmisionDate=lt=2015-07-01;claimSubmisionDate=gt=2015-01-01;account.product.lineOfBusinessCode=in=(AH,LI,RWM);insured.name.suffix==Ms;claimStatusCode=in=(SUBMITTED,PENDING,ACTIVE),claimNumber== "155831094578314641816"
	((insuredDetails.name.firstName=='JOHN';insuredDetails.name.lastName=='DOE'))
  ((insuredDetails.name.firstName=='JOHN';insuredDetails.name.lastName=='DOE'),(insuredDetails.name.firstName=='JANE';insuredDetails.name.lastName=='DOE'))
*/
var rsqlParser = exports;

var logger = require('./logger');

/**
 *  parsing rsql string - break it into operation units
 */
rsqlParser.parsing = function(rsqlString) {
  // array of sections which contains operation units
  var rsqlUnits = {};

  logger.debug('original rsqlString -', rsqlString);
  // if the rsql string is parenthesized, remove the outer parentheses
  var parenthesized = true;
  while (parenthesized) {
    parenthesized = isParenthesized(rsqlString);
    if (parenthesized) {
      // assign rsqlString with parentheses removed value
      rsqlString = parenthesized;
    }
  }
  logger.debug('un parenthesized rsqlString -', rsqlString);

  /** 
   *  replace ',' with '#', ';' with '*' for all parenthesized sections,
   *  so rsql string can be pased base on and(;) or(,) operations
   */
  rsqlString = maskParenthesizedSections(rsqlString);
  logger.debug('rsqlString with parenthesized sections masked -', rsqlString);

  /**
   *  parse rsql and deal with parenthesized() sections;
   *  break rsql string into operation units.
   */
  rsqlUnits = tokenizeRsqlSection(rsqlString);

  logger.debug('break rsql string into operation units:', rsqlUnits);
  return rsqlUnits;
}

/**
 *  tokenize rsql section string to operation units,
 *    resolve and, or
 */
function tokenizeRsqlSection(sectionString) {
  var sectionUnit = {};
  var tokenSections;

  // check and, or build arrays
  var tokenOrs, tokenAnds;
  var _and = [];
  // check for ors first
  if (sectionString.includes(',')) {
    // build _or array in section unit
    var _or = [];
    sectionUnit.or = _or; 
    // tokenize into _or elements
    tokenOrs = sectionString.split(",");
    for (var i = 0; i < tokenOrs.length; i++) {
      // check for token contains _and elements
      if (tokenOrs[i].includes(';')) {
        // build and unit in _or array
        var andUnit = {};
        _and = [];
        andUnit.and = _and;
        _or.push(andUnit);
        // tokenize to _and elements
        tokenAnds = tokenOrs[i].split(';');
        // build and array
        for (var j = 0; j < tokenAnds.length; j++) {
          // add each _and element into _and array
          //_and.push(tokenAnds[j]);
          /* if the element is a section(not operation unit) 
              continue tokenize section recursively.
              a section should be parenthesized.
          */
          analyzeNAddSection(tokenAnds[j], _and);
        }
      }
      else {
        // add to _or array base on token type
        analyzeNAddSection(tokenOrs[i], _or);
      }
    }
  }
  else if (sectionString.includes(';')) {
    // build _and array in section unit - only contains ands
    _and = [];
    sectionUnit.and = _and;
    // tokenize into and elements
    tokenAnds = sectionString.split(';');
    for (var i = 0; i < tokenAnds.length; i++) {
      //_and.push(tokenAnds[i]);
      /* if the element is a section(not operation unit) 
          continue tokenize section recursively.
          a section should be parenthesized.
      */
      analyzeNAddSection(tokenAnds[i], _and);
    }
  }
  else {
    // single element - should be operation unit itself
    sectionUnit = sectionString;
    logger.debug('single element(should be operation unit itself) -', sectionUnit);
  }

  return sectionUnit;
}

/**
 *  for each parenthesized section, 
 *    remove unnessisary parentheses if exist;
 *    add to array if it is operation unit;
 *    recursivly tokenize the section if it is not an operation unit 
 */
function analyzeNAddSection(token, _and_or) {
  var tokenSections = [];
  peerParenthesizedSections(token, tokenSections);
  if (tokenSections.length === 0) {
    // add the operation unit into _or array
    _and_or.push(token);
  }
  else if (tokenSections.length === 1) {
    // check and see if tokenSections[0] is a parenthesized section itself
    if (isParenthesized(tokenSections[0])) {
      // analyze the parenthesized section recursivly to remove outer parentheses
      analyzeNAddSection(tokenSections[0], _and_or);
    }
    /* if the element is a section(not operation unit) 
        continue tokenize section recursively.
        this token should be parenthesized.
    */
    // replace '*' with ';' and '#' with ','
    tokenSections[0] = tokenSections[0].replace(/\*/g, ';');
    tokenSections[0] = tokenSections[0].replace(/\#/g, ',');
    // mask parenthesized section
    tokenSections[0] = maskParenthesizedSections(tokenSections[0]);
    // tokenize this section
    _and_or.push(tokenizeRsqlSection(tokenSections[0]));
  }
  else {
    logger.error('The parenthesized token should only contains one outer section');
  }
}

/**
 *  check and see if a section is parenthesized.
 */
function isParenthesized(section) {
  section = section.trim();
  if (section.charAt(0) === '(' && section.charAt(section.length-1) === ')') {
    var checkSections = [];
    peerParenthesizedSections(section, checkSections);
    if (checkSections.length === 1) {
      // this section is parenthesized, return the section with parentheses removed
      return checkSections[0];
    }
  }
  // the section is not parenthesized
  return false;
}

/**
 *  replace ',' with '#', ';' with '*' for all parenthesized section,
 *  so rsql string can be pased base on and(;) or(,) operations
 */
function maskParenthesizedSections(rsqlString) {
  logger.debug('section befor mask -', rsqlString);
  // define regexp pattern to match '=in=(whatever)' or '=out=(whatever)'
  var pattern = /=\(([^)]+)\)/g;
  // replace ',' with '#' in =in=, =out= array - split by '#' later
  rsqlString = rsqlString.replace(pattern, function repalcer(match) {
    return match.replace(/,/g, '#');
  });

  /* for nested sections, find outer most parentheses enclosed sections and 
  replace ',' with '#' and ';' with '*' */
  // find all parenthesized sections in the same level
  var sections = [];
  peerParenthesizedSections(rsqlString, sections);
  for (var i=0; i<sections.length; i++) {
    // replace ',' with '#' and ';' with '*' for each peer parenthesized section
    rsqlString = rsqlString.replace(sections[i], function repalcer(match) {
      match = match.replace(/;/g, '*');
      return match.replace(/,/g, '#');
    });
  }

  return rsqlString;
}

/**
 *  find same level sections that are not nested
 */
function peerParenthesizedSections(text, sections) {
  var end = text.lastIndexOf(')');
  var i = end - 1;
  var nesting = 1;

  // end when no more parenthesized section in string
  if (end === -1) {
    return;
  }
  
  // find current section
  while (nesting > 0) {
    var c = text.charAt(i);

    if (c === ')') {
      nesting++;
    } 
    else if (c === '(') {
      nesting--;
    }
    i--;
  }
  
  // push current section into the array exclude section start with =(
  if (text.substring(i, i+2) !== '=(') {
    sections.push(text.substring(i+2, end));
  }
  
  // recurersivelly find the next section
  peerParenthesizedSections(text.substring(0, i), sections);
}

/**
 *  Tokenize the basic operation level unit.
 *  operators: ['==', '!=', '<', '=lt=', '<=', '=le=', '>', '=gt=', '>=', '=ge=', '=in=', '=out=']
 */
rsqlParser.tokenizeOperator = function(unitString, operator) {
  // tokenize
  var token = unitString.split(operator);
  // create key/value element
  var element = {};

  // trim and remove quotes from key for all operation values
  element.key = token[0].trim().replace(/["']/g, "");

  // build array value for operator '=in=' and '=out='
  if (['=in=', '=out='].indexOf(operator) !== -1) {
    // Build array elements for =in= or =out=
    var ary = [];
    if (token[1].startsWith('(')) {
      // remove parens to get elements
      var value = token[1].substring(1, token[1].length-1);
      logger.debug("The array value -->" + value);
      // extract element in the array
      var arrayTokens = value.split('#');
      for (var k=0; k<arrayTokens.length; k++) {
        // trim and remove quotes from each element of array
        ary.push(arrayTokens[k].trim().replace(/["']/g, ""));
      }
      // assign array to element value
      element.value = ary;
    }
    else {
      // The array operation value must be inclosed in () -or- it will be ignored
      logger.error("The array operation value should be inclosed in ()", element.value);
    }
  }
  else {
    // trim and remove quotes from value for all operation values except array
    element.value = token[1].trim().replace(/["']/g, "");
  }

  return element;
}

/**
 *  operators: ['==', '!=', '<', '=lt=', '<=', '=le=', '>', '=gt=', '>=', '=ge=', '=in=', '=out=']
 */
rsqlParser.getOperator = function(unitString) {
  var operator;

  if (unitString.includes('==')) operator = '==';
  if (unitString.includes('!=')) operator = '!=';
  // make sure to do '<' before '<='
  if (unitString.includes('<')) operator = '<';
  if (unitString.includes('=lt=')) operator = '=lt=';
  if (unitString.includes('<=')) operator = '<=';
  if (unitString.includes('=le=')) operator = '=le=';
  // make sure to do '>' before '>='
  if (unitString.includes('>')) operator = '>';
  if (unitString.includes('=gt=')) operator = '=gt=';
  if (unitString.includes('>=')) operator = '>=';
  if (unitString.includes('=ge=')) operator = '=ge=';
  if (unitString.includes('=in=')) operator = '=in=';
  if (unitString.includes('=out=')) operator = '=out=';

  return operator;
}

/**
 *  validate rsql string by check if Parentheses are balanced.
 */
rsqlParser.valid = function(rsqlString) {
  var open=0, close=0;

  for (var i=0; i<rsqlString.length; i++) {
    var c = rsqlString.charAt(i);

    if (c === ')') {
      close++;
    } 
    else if (c === '(') {
      open++;
    }
  }
  
  return open === close;
}
