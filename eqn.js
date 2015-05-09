var layouter = require('./layout');
var Box = layouter.Box;
var CBox = layouter.CBox;
var VarBox = layouter.VarBox;
var NumberBox = layouter.NumberBox;
var CodeBox = layouter.CodeBox;
var BfBox = layouter.BfBox;
var OpBox = layouter.OpBox;
var SpBox = layouter.SpBox;
var BracketBox = layouter.BracketBox;

var BCBox = layouter.BCBox;
var ScaleBox = layouter.ScaleBox;
var FracBox = layouter.FracBox;
var StackBox = layouter.StackBox;
var HBox = layouter.HBox;
var BBox = layouter.BBox;
var SqrtBox = layouter.SqrtBox;
var DecoBox = layouter.DecoBox;
var SSBox = layouter.SSBox;
var SSStackBox = layouter.SSStackBox;
var FSBox = layouter.FSBox;
var BigOpBox = layouter.BigOpBox;

var layoutSegment = layouter.layoutSegment;
var layout = layouter.layout;

var macros = require('./macros').macros;

var eqn = null;
var eqn_lex = null;
var eqn_compile = null;
var ID = 1;
var BRACKET = 2;
var SYMBOL = 3;
var TEXT = 4;
var TT = 5;
var SPACE = 6;
(function () {
	function walk(r, s, fMatch, fGap){
		var l = r.lastIndex;
		r.lastIndex = 0;
		fMatch = fMatch || function(){};
		fGap = fGap || function(){};
		var match, last = 0;
		while(match = r.exec(s)){
			if(last < match.index) fGap(s.slice(last, match.index));
			fMatch.apply(this, match);
			last = r.lastIndex;
		};
		if(last < s.length) fGap(s.slice(last));
		r.lastIndex = l;
		return s;
	};
	var lex = eqn_lex = function(s){
		var q = [];
		walk(/("(?:[^\\\"]|\\.)*")|(`(?:[^`]|``)*`)|(:?[a-zA-Z0-9\u0080-\uffff]+:?|\.\d+)|([\[\]\(\)\{\}])|([\.\,\;]|[\/<>?:'|\\\-_+=~!@#$%^&*]+)/g, s, function(m, text, tt, id, b, sy){
			if(text) q.push({type: TEXT, c: text.replace(/\\"/g, '"')})
			if(tt) q.push({type: TT, c: tt})
			if(id) q.push({type: ID, c: id})
			if(b)  q.push({type: BRACKET, c: b})
			if(sy) q.push({type: SYMBOL, c: sy})
			return ''
		}, function(space){
		});
		return q;
	};


	var compile = eqn_compile = function(q, macros, config){
		var j = 0;
		var expr = function(){
			var terms = [];
			while(q[j] &&!(q[j].c === ')' || q[j].c === ']' || q[j].c === '}')) {
				if(macros[q[j].c] && macros[q[j].c] instanceof Function && (macros[q[j].c].arity || macros[q[j].c].length)) {
					var macroname = q[j].c
					var themacro = macros[macroname];
					var arity = themacro.arity || themacro.length;
					j++;
					if(/^:/.test(macroname)) {
						terms = terms.slice(0, -arity).concat(themacro.apply(macros, terms.slice(-arity)))
					} else if(/:$/.test(macroname)) {
						var parameters = [];
						for(var i = 0; i < arity; i++){
							parameters.push(term());
						}
						terms.push(themacro.apply(macros, parameters))
					} else {
						var parameters = [terms[terms.length - 1]];
						terms.length -= 1;
						for(var i = 1; i < arity; i++){
							parameters.push(term());
						}
						terms.push(themacro.apply(macros, parameters))
					}

				} else {
					terms.push(term());
				}
			}
			if(terms.length === 0) return new CBox('');
			if(terms.length === 1) return terms[0];
			return new HBox(terms, config.keepSpace);
		}
		var term = function(){
			var token = q[j];
			if(token.c === '('){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== ')') throw "Mismatch bracket!"
				j++
				return new BBox(new BracketBox('('), r, new BracketBox(')'));
			}
			if(token.c === '['){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== ']') throw "Mismatch bracket!";
				j++;
				return new BBox(new BracketBox('['), r, new BracketBox(']'));
			}
			if(token.c === '{'){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== '}') throw "Mismatch bracket!";
				j++;
				return r;
			}
			if(macros[token.c]){
				if(macros[token.c] instanceof Function){
					if(macros[token.c].arity || macros[token.c].length){
						throw "Invalid macro: " + token.c
					} else {
						j++;
						return macros[token.c].call(macros)
					}
				} else {
					j++;
					return macros[token.c]
				}
			} else {
				j++;
				if(token.type == ID && /^[a-zA-Z]/.test(token.c)){
					return new VarBox(token.c)
				} else if(token.type === ID && /^[0-9]/.test(token.c)) {
					// A number
					return new NumberBox(token.c)
				} else if(token.type === TEXT){
					return new CBox(token.c.slice(1, -1))
				} else if(token.type === TT){
					return new CodeBox(token.c.slice(1, -1).replace(/``/g, '`'))
				} else if(token.type === SYMBOL) {
					return new OpBox(token.c)
				} else {
					return new CBox(token.c)
				}
			}
		}
		return expr();
	};
	var encodeEqnResultHtml = function(html) {
		return html
	};
	var encodeEqnSourceQuickPreview = function(source) {
		return '<code class="h preview">' + ('' + source).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>';
	}
	eqn = function(s, config, customMacros){
		config = config || {};
		return '<span class="eqn">' + encodeEqnSourceQuickPreview(s) + encodeEqnResultHtml(layout(compile(lex(('' + s).trim()), macros, config), config)) + '</span>'
	}
})();

// custom functions
require('./defms.js').defms(function(sPattern, sDefinition){
	var pattern = sPattern.split(/\s+/);
	var parameterPlacements = {};
	var tokens = eqn_lex(sDefinition.trim(), {});
	if(pattern.length > 1) {
		parameterPlacements[pattern[0]] = 0;
		for(var j = 2; j < pattern.length; j++){
			parameterPlacements[pattern[j]] = j - 1
		};
		var fid = pattern[1];
		macros[fid] = function(){
			var m = Object.create(this);
			for(var param in parameterPlacements){
				m[param] = arguments[parameterPlacements[param]]
			};
			return eqn_compile(tokens, m);
		};
		macros[fid].arity = pattern.length - 1;
	} else {
		var fid = pattern[0];
		macros[fid] = function(){
			return eqn_compile(tokens, this, this['#config'] || {});
		}
	};
});

exports.apply = function(scope, exports, runtime){
	exports.$inline = function(s, config, customMacros){
		return eqn(s, config, customMacros);
	}
	exports.$ = exports.$inline;
	exports.$.display = exports.$display = function(s){
		var lines = s.trim().split(/\r?\n/);
		return scope.tags.div('class="eqn-display"', scope.tags.div('class="eqn-display-i"', lines.map(function(line){return eqn(line)}).join("<br>")))
	}
	exports.$.ul = exports.$ul = function(s){
		var lines = s.trim().split(/\r?\n/);
		var t = scope;
		return scope.tags.ul('class="eqn-list"', lines.map(function(line){return t.li(eqn(line))}).join("\n"))
	}
	exports.$.ol = exports.$ol = function(s){
		var lines = s.trim().split(/\r?\n/);
		var t = scope;
		return scope.tags.ol('class="eqn-list"', lines.map(function(line){return t.li(eqn(line))}).join("\n"))
	}
	exports.$.align = exports.$align = function(alignment,s){
		if(arguments.length < 2){
			s = alignment;
			alignment = [];
		} else {
			alignment = alignment.split(';')
		}
		var lines = s.trim().split("\n");
		var buf = '';
		for(var i = 0; i < lines.length; i++){
			var line = lines[i];
			var cells = line.split("&&");
			buf += '<tr>' + cells.map(function(cell, j){return '<td' + (alignment[j] ? ' style="text-align:' + alignment[j] + '"' : '') + '>' + eqn(cell) + '</td>'}).join('') + '</tr>'
		};
		return scope.tags.table('class="eqn-align"', buf);
	};
	return exports
}