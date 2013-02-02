var CHAR_ASC = 0.9
var CHAR_DSC = 1.2 - CHAR_ASC
var FRAC_SHIFT_MID = 0.4
var SS_SIZE = 0.7
var SUP_SHIFT = 1
var SUB_SHIFT = 0.1
var FRAC_PADDING = 0.1
var POSITION_SHIFT = 0
var OPERATOR_SCALE = 1.5
var INTEGRATE_SCALE = 2

var EMDIST = function(x){
	return x.toFixed(4).replace(/\.?0+$/, '') + 'em'
}

var Box = function(){
	this.height = 0;
	this.depth = 0;
}
Box.prototype.write = function(){return ''}

var CBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
CBox.prototype = new Box;
CBox.prototype.write = function(){
	return this.c
}

var VarBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
VarBox.prototype = new CBox;
VarBox.prototype.write = function(){
	return '<var>' + this.c + '</var>'
}
var CodeBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
CodeBox.prototype = new CBox;
CodeBox.prototype.write = function(){
	return '<code>' + this.c + '</code>'
}
var BfBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
BfBox.prototype = new CBox;
BfBox.prototype.write = function(){
	return '<b>' + this.c + '</b>'
}
var OpBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
OpBox.prototype = new CBox;
OpBox.prototype.breakBefore = true;
OpBox.prototype.breakAfter  = true;
OpBox.prototype.spaceBefore = true;
OpBox.prototype.spaceAfter  = true;
OpBox.prototype.write = function(){
	return '<i class="op">' + this.c + '</i>'
}
var SpBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
SpBox.prototype = new CBox;
SpBox.prototype.breakBefore = true;
SpBox.prototype.breakAfter  = true;
SpBox.prototype.write = function(){
	return '<i class="sp">' + this.c + '</i>'
}
var BCBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
BCBox.prototype = new CBox;
BCBox.prototype.breakAfter  = true;
BCBox.prototype.spaceAfter  = true;
BCBox.prototype.write = function(){
	return this.c + ' '
}
var ScaleBox = function(scale, b){
	this.content = b;
	this.scale = scale;
	this.height = b.height * scale;
	this.depth = b.depth * scale;
}
ScaleBox.prototype = new Box;
ScaleBox.prototype.write = function(){
	return '<i style="font-size:' + EMDIST(this.scale) + '">' + this.content.write() + '</i>'
}

var FracBox = function(num, den){
	this.num = num
	this.den = den
	this.height = num.height + num.depth + FRAC_PADDING + FRAC_SHIFT_MID
	this.depth = den.height + den.depth + FRAC_PADDING - FRAC_SHIFT_MID
}
FracBox.prototype = new Box
FracBox.prototype.write = function() {
	// Magic! do not touch
	var fracV = (Math.max(this.height, this.depth) - FRAC_SHIFT_MID) * 2;
	var numV = this.num.height + this.num.depth;
	var denV = this.den.height + this.den.depth;
	var elementsShift = Math.max(this.height, this.depth) - this.height;
	var numShift = this.num.height - Math.max(this.num.height, this.num.depth) + elementsShift;
	var denShift = this.den.height - Math.max(this.den.height, this.den.depth) + elementsShift + FRAC_PADDING * 2;
	return '<i class="fb" style="height:' + EMDIST(fracV) + '">'
		+ '<i class="h">(</i>'
		+ '<i class="num" style="height:' + EMDIST(numV) + ';top:' + EMDIST(numShift) + '">' + this.num.write() + '</i>'
		+ '<i class="fdv" style="top:' + EMDIST(elementsShift + FRAC_PADDING) + '">/</i>'
		+ '<i class="den" style="height:' + EMDIST(denV) + ';top:' + EMDIST(denShift) + '">' + this.den.write() + '</i>'
		+ '<i class="h">)</i>'
		+ '</i>'
}

var Stack2Box = function(num, den){
	this.num = num
	this.den = den
	this.height = num.height + num.depth + FRAC_PADDING + FRAC_SHIFT_MID
	this.depth = den.height + den.depth + FRAC_PADDING - FRAC_SHIFT_MID
}
Stack2Box.prototype = new Box;
Stack2Box.prototype.write = function() {
	// Magic! do not touch
	var fracV = (Math.max(this.height, this.depth) - FRAC_SHIFT_MID) * 2;
	var numV = this.num.height + this.num.depth;
	var denV = this.den.height + this.den.depth;
	var elementsShift = Math.max(this.height, this.depth) - this.height;
	var numShift = this.num.height - Math.max(this.num.height, this.num.depth) + elementsShift;
	var denShift = this.den.height - Math.max(this.den.height, this.den.depth) + elementsShift + FRAC_PADDING * 2;
	return '<i class="fb" style="height:' + EMDIST(fracV) + '">'
		+ '<i class="num" style="height:' + EMDIST(numV) + ';top:' + EMDIST(numShift) + '">' + this.num.write() + '</i>'
		+ '<i class="den" style="height:' + EMDIST(denV) + ';top:' + EMDIST(denShift) + '">' + this.den.write() + '</i>'
		+ '</i>'
}

var StackBox = function(parts){
	this.parts = [];
	var v = 0;
	for(var i = 0; i < parts.length; i++){
		if(parts[i]){
			this.parts.push(parts[i]);
			v += parts[i].height + parts[i].depth
		}
	}
	this.height = v / 2 + FRAC_SHIFT_MID;
	this.depth = v / 2 - FRAC_SHIFT_MID;
}
StackBox.prototype = new Box;
StackBox.prototype.write = function(_h, _d){
	var height = (arguments.length >= 2 ? _h : this.height);
	var depth = (arguments.length >= 2 ? _d : this.depth);
	var fracV = (Math.max(height, depth) - FRAC_SHIFT_MID) * 2;
	var elementsShift = Math.max(height, depth) - height;

	var buf = '<i class="fb" style="height:' + EMDIST(fracV) + '">';
	for(var i = 0; i < this.parts.length; i++){
		var part = this.parts[i];
		var partV = part.height + part.depth;
		var partShift = part.height - Math.max(part.height, part.depth) + elementsShift;
		buf += '<i class="num" style="height:' + EMDIST(partV) + ';top:' + EMDIST(partShift) + '">' + part.write() + '</i>'
	};
	buf += '</i>';
	return buf;
}

var HBox = function(xs){
	if(!xs.length) xs = Array.prototype.slice.call(arguments, 0);
	var h = 0
	var d = 0
	var bx = []
	for(var i = 0; i < xs.length; i++){
		bx.push(xs[i])
		if(h < xs[i].height) h = xs[i].height
		if(d < xs[i].depth)  d = xs[i].depth
	}

	this.height = h
	this.depth = d
	this.boxes = bx
}
HBox.prototype = new Box
HBox.prototype.write = function(){
	var buf = ''
	for(var i = 0; i < this.boxes.length; i++) buf += this.boxes[i].write();
	return buf;
}

var BBox = function(left, content, right){
	this.height = content.height
	this.depth = content.depth
	this.left = new CBox(left)
	this.right = new CBox(right)
	this.content = content
}

var scale_span = function(h, v, t, k, aux){
	return '<i class="' + (k || 'bb') + '" style="transform:scale('+ h + ',' + v + ');'
			+ '-webkit-transform:scale('+ h + ',' + v + ');'
			+ '-moz-transform:scale('+ h + ',' + v + ');'
			+ '-ms-transform:scale('+ h + ',' + v + ');'
			+ '-o-transform:scale('+ h + ',' + v + ');'
			+ (aux || '') + '">' + t + "</i>"
}
BBox.prototype = new Box;
BBox.prototype.write = function(){
	var halfwayHeight = (this.left.height - this.left.depth) / 2;
	var halfBracketHeight = halfwayHeight + this.left.depth;
	var contentUpperHeight = this.content.height - halfwayHeight;
	var contentLowerDepth = this.content.depth + halfwayHeight;

	var SCALE_V = Math.ceil(8 * Math.max(1, contentUpperHeight / halfBracketHeight, contentLowerDepth / halfBracketHeight)) / 8;
	if(SCALE_V <= 1.1) {
		SCALE_V = 1;
		return '<i class="bn">' + this.left.write() + '</i>' + this.content.write() + '<i class="bn">' + this.right.write() + '</i>';
	} else {
		var SCALE_H = Math.min(2, 1 + 0.25 * (SCALE_V - 1));
		var baselineAdjustment = - (halfwayHeight * SCALE_H - halfwayHeight) / SCALE_H;
		var auxStyle = 'font-size:' + (SCALE_H * 100) + '%;vertical-align:' + EMDIST(baselineAdjustment);
		return (this.left.c ? scale_span(1, SCALE_V / SCALE_H, this.left.write(), null, auxStyle) : '')
		       + this.content.write() 
		       + (this.right.c ? scale_span(1, SCALE_V / SCALE_H, this.right.write(), null, auxStyle) : '')
	}
}

var SqrtBox = function(content){
	this.content = content
	this.height = content.height + FRAC_PADDING
	this.depth = content.depth + FRAC_PADDING
}
SqrtBox.prototype = new Box;
SqrtBox.prototype.write = function(){
	return '<i class="sqrt"><i class="i" style="padding: ' + EMDIST(FRAC_PADDING) + ' 0">' + this.content.write() + '</i></i>'
}

var DecoBox = function(content, deco){
	this.height = content.height
	this.depth = content.depth
	this.content = content
	this.deco = deco
}
DecoBox.prototype = new Box;
DecoBox.prototype.write = function(){
	return '<i style="text-decoration:' + this.deco + '">' + this.content.write() + '</i>'
}

var SSBox = function(base, sup, sub){
	this.sup = sup
	this.sub = sub
	this.base = base;
	this.height = base.height;
	this.depth = base.depth;
}
SSBox.prototype = new Box;
SSBox.prototype.write = function(){
	var sup = this.sup || new CBox('&nbsp;');
	var sub = this.sub || new CBox('&nbsp;');
	var h = this.height / SS_SIZE;
	var d = this.depth / SS_SIZE;
	var stackV = 0;
	var stackShift = 0;
	var baseShift = this.base.yShift / SS_SIZE || 0
	var supShift = - sup.height - sup.depth + SUP_SHIFT + baseShift;
	var subShift = - sup.height - sup.depth - sub.height - SUB_SHIFT + baseShift;
	return	'<i class="sg" style="height:' + EMDIST((this.height + this.depth)) + '">'
			+ this.base.write()
			+ '<i class="ss" style="font-size:' + (SS_SIZE*100) + '%">'
			+ '<i class="ssi" style="height:' + EMDIST((h+d)) + ';top:' + EMDIST((stackShift)) + '">'
			+ '<sup style="height:' + EMDIST((sup.height + sup.depth)) + ';top:' + EMDIST(supShift) + '">' + sup.write() + '</sup>'
			+ '<sub style="height:' + EMDIST((0)) + ';top:100%;margin-top:' + EMDIST((subShift)) + '">' + sub.write() + '</sub>'
			+ '</i></i></i>'
}

var SSStackBox = function(base, sup, sub){
	this.sup = sup ? new ScaleBox(SS_SIZE, sup) : null
	this.sub = sub ? new ScaleBox(SS_SIZE, sub) : null
	this.base = base;
	this.height = base.height + (sup ? (this.sup.height + this.sup.depth) : 0);
	this.depth = base.depth + (sub ? (this.sub.height + this.sub.depth) : 0);
}
SSStackBox.prototype = new Box;
SSStackBox.prototype.write = function(){
	return new StackBox([this.sup, this.base, this.sub]).write(this.height, this.depth)
}

var FSBox = function(scale, content){
	this.scale = scale;
	this.content = content;
	this.height = content.height * scale
	this.depth = content.depth * scale
}
FSBox.prototype = new Box;
FSBox.prototype.write = function(){
	return '<i class="sc" style="font-size:' + (this.scale * 100) + '%">' + this.content.write() + '</i>'
}

var BigOpBox = function(scale, content){
	this.scale = scale;
	this.content = content;

	var halfwayHeight = (content.height - content.depth) / 2;
	this.height = (content.height - halfwayHeight) * scale + halfwayHeight;
	this.depth = (halfwayHeight + content.depth) * scale - halfwayHeight;
	if(this.height < 0) this.height = 0;
	if(this.depth < 0) this.depth = 0;

	this.halfwayHeight = halfwayHeight

}
BigOpBox.prototype = new Box;
BigOpBox.prototype.write = function(){
	return '<i class="bo" style="font-size:' + (this.scale * 100) + '%;vertical-align:' +
		EMDIST(- (this.halfwayHeight * this.scale - this.halfwayHeight) / (this.scale)) + '">' + this.content.write() + '</i>'
}


var layoutSegment = function(parts){
	if(!parts.length) return '';
	var h = 0
	var d = 0
	var buf = ''
	for(var i = 0; i < parts.length; i++){
		buf += parts[i].write();
		if(h < parts[i].height) h = parts[i].height
		if(d < parts[i].depth)  d = parts[i].depth
	}
	var shift = h - Math.max(h, d);
	var spacesBefore = buf.match(/^\s*/)[0] || '';
	var spacesAfter = buf.match(/\s*$/)[0] || '';
	if(shift < 0.002 && shift > -0.002){
		return spacesBefore + '<s style="height:' + EMDIST((h + d)) + '">' + buf.trim() + '</s>' + spacesAfter
	} else {
		return spacesBefore + '<s style="height:' + EMDIST((h + d)) + ';vertical-align:' + EMDIST(shift) + '">'
			+ '<i class="ei" style="top:' + EMDIST(shift) + '">' + buf.trim() + '</i></s>' + spacesAfter
	}
}

var layout = function(box){
	if(box instanceof HBox){
		var buf = '';
		var segment = [];
		for(var i = 0; i < box.boxes.length; i++){
			var current = box.boxes[i];
			if(current.breakBefore){
				buf += layoutSegment(segment)
				segment = [];
			}
			segment.push(current)
			if(current.breakAfter){
				buf += layoutSegment(segment)
				segment = [];
			}
		}
		buf += layoutSegment(segment);
		return buf;
	} else {
		return layoutSegment([box])
	}
};

var eqn = null;
var marco = {};
(function () {
	var ID = 1
	var BRACKET = 2
	var SYMBOL = 3
	var TEXT = 4
	var TT = 5
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
	var lex = function(s){
		var q = [];
		walk(/("(?:[^\\\"]|\\.)*")|(`(?:[^`]|``)*`)|([a-zA-Z0-9\.]+)|([\[\]\(\)\{\}])|(,|[\/<>?:';|\\\-_+=~!@#$%^&*]+)/g, s, function(m, text, tt, id, b, sy){
			if(text) q.push({type: TEXT, c: text.replace(/\\"/g, '"')})
			if(tt) q.push({type: TT, c: tt})
			if(id) q.push({type: ID, c: id})
			if(b)  q.push({type: BRACKET, c: b})
			if(sy) q.push({type: SYMBOL, c: sy})
			return ''
		}, function(){});
		return q;
	};


	var parse = function(q){
		var j = 0
		var expr = function(){
			var terms = [];
			while(q[j] &&!(q[j].c === ')' || q[j].c === ']' || q[j].c === '}')) {
				if(marco[q[j].c] && marco[q[j].c] instanceof Function && marco[q[j].c].length){
					var themarco = marco[q[j].c];
					j++;
					var args = [terms[terms.length - 1]];
					terms.length -= 1;
					for(var i = 1; i < themarco.length; i++){
						args.push(term());
					}
					terms.push(themarco.apply(null, args))
				} else {
					terms.push(term());
				}
			}
			if(terms.length === 0) return new CBox('');
			if(terms.length === 1) return terms[0];
			return new HBox(terms);
		}
		var term = function(){
			var token = q[j];
			if(token.c === '('){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== ')') throw "Mismatch bracket!"
				j++
				return new BBox('(', r, ')');
			}
			if(token.c === '['){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== ']') throw "Mismatch bracket!";
				j++;
				return new BBox('[', r, ']');
			}
			if(token.c === '{'){
				j++;
				var r = expr();
				if(!q[j] || q[j].c !== '}') throw "Mismatch bracket!";
				j++;
				return r;
			}
			if(marco[token.c] && marco[token.c] instanceof Function){
				if(marco[token.c].length){
					throw "Wrong marco call!"
				} else {
					j++;
					return marco[token.c]()
				}
			} else {
				j++;
				if(token.type == ID && /^[a-zA-Z]/.test(token.c)){
					return new VarBox(token.c)
				} else if(token.type === TEXT){
					return new CBox(token.c.slice(1, -1))
				} else if(token.type === TT){
					return new CodeBox(token.c.slice(1, -1).replace(/``/g, '`'))
				} else {
					return new CBox(token.c)
				}
			}
		}
		return expr();
	};
	eqn = function(s){
		return '<span class="eqn">' + layout(parse(lex(s.trim()))) + '</span>'
	}
})();


var CBM = function(s){
	return function(){return new CBox(s)}
}
var OBM = function(s){
	return function(){return new OpBox(s)}
}
var XBM = function(scale, s){
	return function(){return new BigOpBox(scale, new CBox(s))}
}
var VBM = function(s){
	return function(){return new VarBox(s)}
}
var SPBM = function(s){
	return function(){return new SpBox(s)}
}
marco.over = function(left, right){
	return new FracBox(left, right)
}
marco.above = function(upper, lower){
	var upperParts = [upper], lowerParts = [lower]
	if(upper instanceof StackBox) upperParts = upper.parts
	if(lower instanceof StackBox) lowerParts = lower.parts
	return new StackBox(upperParts.concat(lowerParts));
}
marco.squared = function(operand){
	return new SSBox(operand, new CBox('2'));
}
marco.sqrt = function(operand){
	return new SqrtBox(operand);
}
marco['^'] = function(base, sup){
	if(base instanceof SSBox && ! base.sup){
		return new SSBox(base.base, sup, base.sub)
	} else {
		return new SSBox(base, sup)
	}
}
marco['_'] = function(base, sub){
	if(base instanceof SSBox && ! base.sub){
		return new SSBox(base.base, base.sup, sub)
	} else {
		return new SSBox(base, null, sub)
	}
}
marco['^^'] = function(base, sup){
	if(base instanceof SSStackBox && ! base.sup){
		return new SSStackBox(base.base, sup, base.sub)
	} else {
		return new SSStackBox(base, sup)
	}
}
marco['__'] = function(base, sub){
	if(base instanceof SSStackBox && ! base.sub){
		return new SSStackBox(base.base, base.sup, sub)
	} else {
		return new SSStackBox(base, null, sub)
	}
}
marco.set = function(content){
	return new BBox('{', content, '}')
}

marco['rm'] = marco.fn = function(cb){
	if(cb instanceof CBox){
		return new CBox(cb.c)
	} else {
		return cb
	}
}
marco['bf'] = function(cb){
	if(cb instanceof CBox){
		return new BfBox(cb.c)
	} else {
		return cb
	}
}
marco['vr'] = function(cb){
	if(cb instanceof CBox){
		return new VarBox(cb.c)
	} else {
		return cb
	}
}

// hats
marco['hat'] = function(b){
	if(b instanceof CBox){
		b.c += '\u0302'
		return b
	} else {
		return b
	}
}
marco['overline'] = function(b){
	if(b instanceof CBox){
		b.c += '\u0304'
		return b
	} else {
		return b
	}
}

marco['quot'] = CBM("\u0022")
marco['amp'] = CBM("&amp;");
marco['apos'] = CBM("\u0027");
marco['lt'] = OBM("&lt;");
marco['gt'] = OBM("&gt;");
marco['nbsp'] = SPBM("\u00A0");
marco['iexcl'] = CBM("\u00A1");
marco['cent'] = CBM("\u00A2");
marco['pound'] = CBM("\u00A3");
marco['curren'] = CBM("\u00A4");
marco['yen'] = CBM("\u00A5");
marco['brvbar'] = CBM("\u00A6");
marco['sect'] = CBM("\u00A7");
marco['uml'] = CBM("\u00A8");
marco['copy'] = CBM("\u00A9");
marco['ordf'] = CBM("\u00AA");
marco['laquo'] = CBM("\u00AB");
marco['not'] = OBM("\u00AC");
marco['shy'] = CBM("\u00AD");
marco['reg'] = CBM("\u00AE");
marco['macr'] = CBM("\u00AF");
marco['deg'] = CBM("\u00B0");
marco['plusmn'] = OBM("\u00B1");
marco['sup2'] = CBM("\u00B2");
marco['sup3'] = CBM("\u00B3");
marco['acute'] = CBM("\u00B4");
marco['micro'] = CBM("\u00B5");
marco['para'] = CBM("\u00B6");
marco['middot'] = CBM("\u00B7");
marco['cedil'] = CBM("\u00B8");
marco['sup1'] = CBM("\u00B9");
marco['ordm'] = CBM("\u00BA");
marco['raquo'] = CBM("\u00BB");
marco['frac14'] = CBM("\u00BC");
marco['frac12'] = CBM("\u00BD");
marco['frac34'] = CBM("\u00BE");
marco['iquest'] = CBM("\u00BF");
marco['Agrave'] = VBM("\u00C0");
marco['Aacute'] = VBM("\u00C1");
marco['Acirc'] = VBM("\u00C2");
marco['Atilde'] = VBM("\u00C3");
marco['Auml'] = VBM("\u00C4");
marco['Aring'] = VBM("\u00C5");
marco['AElig'] = VBM("\u00C6");
marco['Ccedil'] = VBM("\u00C7");
marco['Egrave'] = VBM("\u00C8");
marco['Eacute'] = VBM("\u00C9");
marco['Ecirc'] = VBM("\u00CA");
marco['Euml'] = VBM("\u00CB");
marco['Igrave'] = VBM("\u00CC");
marco['Iacute'] = VBM("\u00CD");
marco['Icirc'] = VBM("\u00CE");
marco['Iuml'] = VBM("\u00CF");
marco['ETH'] = VBM("\u00D0");
marco['Ntilde'] = VBM("\u00D1");
marco['Ograve'] = VBM("\u00D2");
marco['Oacute'] = VBM("\u00D3");
marco['Ocirc'] = VBM("\u00D4");
marco['Otilde'] = VBM("\u00D5");
marco['Ouml'] = VBM("\u00D6");
marco['times'] = OBM("\u00D7");
marco['Oslash'] = VBM("\u00D8");
marco['Ugrave'] = VBM("\u00D9");
marco['Uacute'] = VBM("\u00DA");
marco['Ucirc'] = VBM("\u00DB");
marco['Uuml'] = VBM("\u00DC");
marco['Yacute'] = VBM("\u00DD");
marco['THORN'] = VBM("\u00DE");
marco['szlig'] = VBM("\u00DF");
marco['agrave'] = VBM("\u00E0");
marco['aacute'] = VBM("\u00E1");
marco['acirc'] = VBM("\u00E2");
marco['atilde'] = VBM("\u00E3");
marco['auml'] = VBM("\u00E4");
marco['aring'] = VBM("\u00E5");
marco['aelig'] = VBM("\u00E6");
marco['ccedil'] = VBM("\u00E7");
marco['egrave'] = VBM("\u00E8");
marco['eacute'] = VBM("\u00E9");
marco['ecirc'] = VBM("\u00EA");
marco['euml'] = VBM("\u00EB");
marco['igrave'] = VBM("\u00EC");
marco['iacute'] = VBM("\u00ED");
marco['icirc'] = VBM("\u00EE");
marco['iuml'] = VBM("\u00EF");
marco['eth'] = VBM("\u00F0");
marco['ntilde'] = VBM("\u00F1");
marco['ograve'] = VBM("\u00F2");
marco['oacute'] = VBM("\u00F3");
marco['ocirc'] = VBM("\u00F4");
marco['otilde'] = VBM("\u00F5");
marco['ouml'] = VBM("\u00F6");
marco['divide'] = OBM("\u00F7");
marco['oslash'] = VBM("\u00F8");
marco['ugrave'] = VBM("\u00F9");
marco['uacute'] = VBM("\u00FA");
marco['ucirc'] = VBM("\u00FB");
marco['uuml'] = VBM("\u00FC");
marco['yacute'] = VBM("\u00FD");
marco['thorn'] = VBM("\u00FE");
marco['yuml'] = VBM("\u00FF");
marco['OElig'] = VBM("\u0152");
marco['oelig'] = VBM("\u0153");
marco['Scaron'] = VBM("\u0160");
marco['scaron'] = VBM("\u0161");
marco['Yuml'] = VBM("\u0178");
marco['fnof'] = VBM("\u0192");
marco['circ'] = VBM("\u02C6");
marco['tilde'] = VBM("\u02DC");
marco['Alpha'] = VBM("\u0391");
marco['Beta'] = VBM("\u0392");
marco['Gamma'] = VBM("\u0393");
marco['Delta'] = VBM("\u0394");
marco['Epsilon'] = VBM("\u0395");
marco['Zeta'] = VBM("\u0396");
marco['Eta'] = VBM("\u0397");
marco['Theta'] = VBM("\u0398");
marco['Iota'] = VBM("\u0399");
marco['Kappa'] = VBM("\u039A");
marco['Lambda'] = VBM("\u039B");
marco['Mu'] = VBM("\u039C");
marco['Nu'] = VBM("\u039D");
marco['Xi'] = VBM("\u039E");
marco['Omicron'] = VBM("\u039F");
marco['Pi'] = VBM("\u03A0");
marco['Rho'] = VBM("\u03A1");
marco['Sigma'] = VBM("\u03A3");
marco['Tau'] = VBM("\u03A4");
marco['Upsilon'] = VBM("\u03A5");
marco['Phi'] = VBM("\u03A6");
marco['Chi'] = VBM("\u03A7");
marco['Psi'] = VBM("\u03A8");
marco['Omega'] = VBM("\u03A9");
marco['alpha'] = VBM("\u03B1");
marco['beta'] = VBM("\u03B2");
marco['gamma'] = VBM("\u03B3");
marco['delta'] = VBM("\u03B4");
marco['epsilon'] = VBM("\u03B5");
marco['zeta'] = VBM("\u03B6");
marco['eta'] = VBM("\u03B7");
marco['theta'] = VBM("\u03B8");
marco['iota'] = VBM("\u03B9");
marco['kappa'] = VBM("\u03BA");
marco['lambda'] = VBM("\u03BB");
marco['mu'] = VBM("\u03BC");
marco['nu'] = VBM("\u03BD");
marco['xi'] = VBM("\u03BE");
marco['omicron'] = VBM("\u03BF");
marco['pi'] = VBM("\u03C0");
marco['rho'] = VBM("\u03C1");
marco['sigmaf'] = VBM("\u03C2");
marco['sigma'] = VBM("\u03C3");
marco['tau'] = VBM("\u03C4");
marco['upsilon'] = VBM("\u03C5");
marco['phi'] = VBM("\u03C6");
marco['varphi'] = VBM("\u03D5");
marco['chi'] = VBM("\u03C7");
marco['psi'] = VBM("\u03C8");
marco['omega'] = VBM("\u03C9");
marco['thetasym'] = VBM("\u03D1");
marco['upsih'] = VBM("\u03D2");
marco['piv'] = VBM("\u03D6");
marco['ensp'] = SPBM("\u2002");
marco['emsp'] = SPBM("\u2003");
marco['thinsp'] = CBM("\u2009");
marco['zwnj'] = CBM("\u200C");
marco['zwj'] = CBM("\u200D");
marco['lrm'] = CBM("\u200E");
marco['rlm'] = CBM("\u200F");
marco['ndash'] = CBM("\u2013");
marco['mdash'] = CBM("\u2014");
marco['lsquo'] = CBM("\u2018");
marco['rsquo'] = CBM("\u2019");
marco['sbquo'] = CBM("\u201A");
marco['ldquo'] = CBM("\u201C");
marco['rdquo'] = CBM("\u201D");
marco['bdquo'] = CBM("\u201E");
marco['dagger'] = CBM("\u2020");
marco['Dagger'] = CBM("\u2021");
marco['bull'] = CBM("\u2022");
marco['hellip'] = CBM("\u2026");
marco['permil'] = CBM("\u2030");
marco['prime'] = CBM("\u2032");
marco['Prime'] = CBM("\u2033");
marco['lsaquo'] = CBM("\u2039");
marco['rsaquo'] = CBM("\u203A");
marco['oline'] = CBM("\u203E");
marco['frasl'] = CBM("\u2044");
marco['euro'] = CBM("\u20AC");
marco['image'] = CBM("\u2111");
marco['weierp'] = CBM("\u2118");
marco['real'] = CBM("\u211C");
marco['trade'] = CBM("\u2122");
marco['alefsym'] = OBM("\u2135");
marco['larr'] = OBM("\u2190");
marco['uarr'] = OBM("\u2191");
marco['rarr'] = OBM("\u2192");
marco['darr'] = OBM("\u2193");
marco['harr'] = OBM("\u2194");
marco['crarr'] = OBM("\u21B5");
marco['lArr'] = OBM("\u21D0");
marco['uArr'] = OBM("\u21D1");
marco['rArr'] = OBM("\u21D2");
marco['dArr'] = OBM("\u21D3");
marco['hArr'] = OBM("\u21D4");
marco['forall'] = OBM("\u2200");
marco['part'] = CBM("\u2202");
marco['exist'] = OBM("\u2203");
marco['empty'] = CBM("\u2205");
marco['nabla'] = CBM("\u2207");
marco['isin'] = OBM("\u2208");
marco['notin'] = OBM("\u2209");
marco['ni'] = OBM("\u220B");
marco['prod'] = XBM(OPERATOR_SCALE, "\u220F");
marco['coprod'] = XBM(OPERATOR_SCALE, "\u2210");
marco['sum'] = XBM(OPERATOR_SCALE, "\u2211");
marco['minus'] = OBM("\u2212");
marco['lowast'] = OBM("\u2217");
marco['ring'] = OBM("\u2218");
marco['bullet'] = OBM("\u2219");
marco['sqrtsym'] = OBM("\u221A");
marco['cbrtsym'] = OBM("\u221B");
marco['qdrtsym'] = OBM("\u221C");
marco['prop'] = OBM("\u221D");
marco['infin'] = marco['infty'] = OBM("\u221E");
marco['ang'] = OBM("\u2220");
marco['and'] = OBM("\u2227");
marco['or'] = OBM("\u2228");
marco['cap'] = OBM("\u2229");
marco['cup'] = OBM("\u222A");
marco['int'] = XBM(INTEGRATE_SCALE, "\u222B");
marco['iint'] = XBM(INTEGRATE_SCALE, "\u222C");
marco['iiint'] = XBM(INTEGRATE_SCALE, "\u222D");
marco['oint'] = XBM(INTEGRATE_SCALE, "\u222E");
marco['oiint'] = XBM(INTEGRATE_SCALE, "\u222F");
marco['oiiint'] = XBM(INTEGRATE_SCALE, "\u2230");
marco['cwint'] = XBM(INTEGRATE_SCALE, "\u2231");
marco['ocwint'] = XBM(INTEGRATE_SCALE, "\u2232");
marco['occwint'] = XBM(INTEGRATE_SCALE, "\u2233");
marco['therefore'] = OBM("\u2234");
marco['sim'] = OBM("\u223C");
marco['cong'] = OBM("\u2245");
marco['asymp'] = marco['approx'] = OBM("\u2248");
marco['ne'] = OBM("\u2260");
marco['equiv'] = OBM("\u2261");
marco['le'] = OBM("\u2264");
marco['ge'] = OBM("\u2265");
marco['subst'] = OBM("\u2282");
marco['supst'] = OBM("\u2283");
marco['nsubst'] = OBM("\u2284");
marco['subste'] = OBM("\u2286");
marco['supste'] = OBM("\u2287");
marco['prefix'] = OBM("\u228f");
marco['postfix'] = OBM("\u2290");
marco['prefixe'] = OBM("\u2291");
marco['postfixe'] = OBM("\u2292");
marco['oplus'] = OBM("\u2295");
marco['otimes'] = OBM("\u2297");
marco['perp'] = OBM("\u22A5");
marco['And'] = XBM(OPERATOR_SCALE, "\u22C0");
marco['Or'] = XBM(OPERATOR_SCALE, "\u22C1");
marco['Cap'] = marco['Intersect'] = XBM(OPERATOR_SCALE, "\u22C2");
marco['Cup'] = marco['Union'] = XBM(OPERATOR_SCALE, "\u22C3");
marco['sdot'] = OBM("\u22C5");
marco['lceil'] = OBM("\u2308");
marco['rceil'] = OBM("\u2309");
marco['lfloor'] = OBM("\u230A");
marco['rfloor'] = OBM("\u230B");
marco['lang'] = OBM("\u2329");
marco['rang'] = OBM("\u232A");
marco['loz'] = OBM("\u25CA");
marco['spades'] = OBM("\u2660");
marco['clubs'] = OBM("\u2663");
marco['hearts'] = OBM("\u2665");
marco['diams'] = OBM("\u2666");

marco['hbar'] = VBM("\u0127")
marco['Hbar'] = VBM("\u0126")

marco['='] = OBM('=');
marco['+'] = OBM('+');
marco['-'] = marco.minus;
marco['<'] = marco.lt;
marco['>'] = marco.gt;
marco['~'] = SPBM(' ');
marco['~~'] = marco.ensp;
marco['~~~'] = marco.emsp;
marco['+-'] = marco.plusmn;
marco['->'] = marco.rarr;
marco['=>'] = marco.rArr;
marco['|->'] = OBM('\u21A6')
marco['>='] = marco.ge;
marco['<='] = marco.le;
marco['\''] = marco.prime;
marco.union = marco.cup
marco.intersect = marco.cap

marco[','] = function(){return new BCBox(', ')};
marco[';'] = function(){return new BCBox('; ')};
marco['|'] = CBM('\u2223');
marco['||'] = CBM('\u2223\u2223');
marco['divides'] = OBM('\u2223');
marco['parallel'] = OBM('\u2223\u2223');
marco[':'] = OBM(':');

marco['...'] = OBM('…');
marco['......'] = OBM('……');

marco.sin = OBM('sin')
marco.cos = OBM('cos')
marco.tan = OBM('tan')
marco.log = OBM('log')
marco.ln  = OBM('ln')
marco.lim = OBM('lim')
marco.sup = OBM('sup')
marco.inf = OBM('inf')

marco.lcbr = CBM('\u27E8')
marco.rcbr = CBM('\u27e9')
marco.ket  = function(content){
	return new BBox('\u2223', content, '\u27e9')
}
marco.bra  = function(content){
	return new BBox('\u27e8', content, '\u2223')
}
marco.braket = function(content){
	return new BBox('\u27e8', content, '\u27e9')
}
marco.left = function(bracketLeft, content){
	if(bracketLeft instanceof CBox){
		var bcl = bracketLeft.c
	} else {
		var bcl = ''
	}
	if(content instanceof BBox && content.left.c === ''){
		return new BBox(bcl, content.content, content.right.c)
	} else {
		return new BBox(bcl, content, '')
	}
}

marco.right = function(content, bracketRight){
	if(bracketRight instanceof CBox){
		var bcl = bracketRight.c
	} else {
		var bcl = ''
	}
	if(content instanceof BBox && content.right.c === ''){
		return new BBox(content.left.c, content.content, bcl)
	} else {
		return new BBox('', content, bcl)
	}
}

marco.underline = function(content){
	return new DecoBox(content, 'underline')
}

exports.apply = function(){
	this.usePackage('ove/html');
	this.$inline = function(s){
		return eqn(s);
	}
	this.$ = this.$inline;
	this.$display = function(s){
		var lines = s.trim().split("\n");
		return this.div('class="eqn-display"', this.div('class="eqn-display-i"', lines.map(eqn).join("<br>")))
	}
	this.$ul = function(s){
		var lines = s.trim().split("\n");
		var t = this;
		return this.ul('class="eqn-list"', lines.map(function(line){return t.li(eqn(line))}).join("\n"))
	}
	this.$ol = function(s){
		var lines = s.trim().split("\n");
		var t = this;
		return this.ol('class="eqn-list"', lines.map(function(line){return t.li(eqn(line))}).join("\n"))
	}
	this.$align = function(alignment,s){
		if(arguments.length < 2){
			s = alignment;
			alignment = [];
		} else {
			alignment = alignment.split('|')
		}
		var lines = s.trim().split("\n");
		var buf = '';
		for(var i = 0; i < lines.length; i++){
			var line = lines[i];
			var cells = line.split("//");
			buf += '<tr>' + cells.map(function(cell, j){return '<td' + (alignment[j] ? ' style="text-align:' + alignment[j] + '"' : '') + '>' + eqn(cell) + '</td>'}).join('') + '</tr>'
		};

		return '<table class="eqn-align">' + buf + '</table>'
	}
}