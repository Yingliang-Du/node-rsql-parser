# Node RSQL / FIQL Parser
[RSQL](https://github.com/jirutka/rsql-parser) (RESTful Service Query Language) is an extention of [FIQL](http://tools.ietf.org/html/draft-nottingham-atompub-fiql-00) (Feed Item Query Language). It is very simple and yet capable to express complex queries within a HTTP URI string. It is very well adopted as a generic query language for searching RESTful service endpoints.

## Gratitute
Without GOD's blessing, I am not able to do anything useful!
Thanks to Prashanth Ponugoti and Kameswara Eati for their guidance, inspiration and contribution.

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
|=in=|In|
|=out=|Not In|

The comparation unit (simpliest query) can be formed using a key, an operator and a value as follow:
`comparison = key, comparison-oprator, values;`

The key identifies a field (or attribute, element, …) of the resource representation to filter by. It can be any non empty Unicode string that doesn’t contain reserved characters or a white space. The specific syntax of the selector is not enforced by this parser.

The following is the list of two composite operators:

|Composite Operator|Description|
|-------|-------|
|;|AND|
|,|OR|

By default, the AND operator takes precedence (meaning, it’s evaluated before any OR operators are). However, a parenthesized expression can be used to change the precedence, yielding whatever the contained expression yields.

## License

This project is licensed under [MIT license](http://opensource.org/licenses/MIT).
