# Node RSQL / FIQL Parser
[RSQL](https://github.com/jirutka/rsql-parser) (RESTful Service Query Language) is an extention of [FIQL](http://tools.ietf.org/html/draft-nottingham-atompub-fiql-00) (Feed Item Query Language). It is very simple and yet capable to express complex queries within a HTTP URI string. It is very well adopted as a generic query language for searching RESTful service endpoints.

## RSQL Overview
RSQL defines comparison operators and composite operators base on FIQL. Those operators can be used to build complex queries.
The following is a list of comparison operators:
|Comparison Operator|Description|
|-------|-------|
|==|Equal To |
|!=|Not Equal To|
|=lt= or <|Less Than|
|=le= or <=|Less Or Equal To|
|=gt= or >|Greater Than|
|=ge= or >=|Greater Or Equal To|
