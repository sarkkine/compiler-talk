
// Our lexer will split and recognize our tokens
function tokenize(code) {
    var results = [];
    var tokenRegExp = /\s*([A-Za-z]+|[0-9]+|\S)\s*/g;

    var m;
    while ((m = tokenRegExp.exec(code)) !== null) 
        results.push(m[1]);
    return results;
}

// Helper functions
function isNumber(token) {
    return token !== undefined && token.match(/^[0-9]+$/) !== null;
}

function isName(token) {
    return token !== undefined && token.match(/^[A-Za-z]+$/) !== null;
}


// The parser will build an Abstract Syntax Tree from the tokens
//
function parse(code) {

    var tokens = tokenize(code);
    var position = 0;

    // peek returns the next token without advancing position.
    function peek() {
        return tokens[position];
    }

    // consume consumes one token and moves` to point to the next one.
    function consume(token) {
        //assert.strictEqual(token, tokens[position]);
        position++;
    }

    // This is the cool part. Each group of syntax rules is translated to one
    // function.

    function parsePrimaryExpr() {
        var t = peek();

        if (isNumber(t)) {
            consume(t);
            return {type: "number", value: t}; // This goes to the AST
        } else if (isName(t)) {
            consume(t);
            return {type: "name", id: t};
        } else if (t === "(") {
            consume(t);
            var expr = parseExpr();
            if (peek() !== ")")
                throw new SyntaxError("expected )");
            consume(")");
            return expr;
        } else {
            // No match. So it’s an error.
            throw new SyntaxError("wtf! expected a number, a variable, or parentheses");
        }
    }

    function parseMulExpr() {
        var expr = parsePrimaryExpr();
        var t = peek();
        while (t === "*" || t === "/") {
            consume(t);
            var rhs = parsePrimaryExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    }

    function parseExpr() {
        var expr = parseMulExpr();
        var t = peek();
        while (t === "+" || t === "-") {
            consume(t);
            var rhs = parseMulExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    }

    // call `parseExpr()` to parse an Expr
    var result = parseExpr();

    // One more thing. Make sure `parseExpr()` consumed *all* the
    // input. If it didn’t, that means the next token didn’t match any syntax
    // rule, which is an error
    if (position !== tokens.length)
        throw new SyntaxError("wtf! unexpected '" + peek() + "'");

    return result;
}

// And here's a "backend "function for actually performing 
// some computation using the AST
// This could also be something that emits code etc.

function evaluateAsFloat(ast) {
    var variables = Object.create(null);
    variables.e = Math.E;
    variables.pi = Math.PI;

    function evaluate(obj) {
        switch (obj.type) {
        case "number":  return parseInt(obj.value);
        case "name":  return variables[obj.id] || 0;
        case "+":  return evaluate(obj.left) + evaluate(obj.right);
        case "-":  return evaluate(obj.left) - evaluate(obj.right);
        case "*":  return evaluate(obj.left) * evaluate(obj.right);
        case "/":  return evaluate(obj.left) / evaluate(obj.right);
        }
    }
    return evaluate(ast);
}

module.exports = {
    parse: function(code) {
	return parse(code);
    },
    execute: function(ast) {
	return evaluateAsFloat(ast);
    }
}
