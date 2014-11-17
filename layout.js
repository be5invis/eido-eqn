var LINE_HEIGHT = 1.5;
var CHAR_ASC = 0.9;
var CHAR_DESC = LINE_HEIGHT - CHAR_ASC;
var STACK_MIDDLE = 0.15;
var FRAC_MIDDLE = 0.1;
var OPERATOR_ASC = 0.9
var OPERATOR_DESC = 0.5
var FRAC_SHIFT_MID = 0.6
var STACK_SHIFT_MID = 0.6
var FRAC_PADDING = 0.1
var SS_SIZE = 0.7
var SUP_SHIFT = 1.3
var SUB_SHIFT = 0.5
var POSITION_SHIFT = 0
var BIGOP_SHIFT = -0.15
var SSSTACK_MARGIN_SUP = -0.1
var SSSTACK_MARGIN_SUB = -0.8
var BRACKET_SHIFT = 0;
var BRACKET_ASC = 0.9;
var BRACKET_DESC = LINE_HEIGHT - BRACKET_ASC

function em(x){	return (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, '') + 'em' }
function arr1(box, rise, height, depth){
	return arrx([box], [rise], height, depth)
}
function arrx(boxes, rises, height, depth, cl){
	var buf = '<r style="height:' + em(height + depth) + ';vertical-align:' + em(height - CHAR_ASC) + '"' + (cl ? ' class="' + cl + '"' : '') + '><eb>{</eb>';
	for(var j = 0; j < boxes.length; j++) if(boxes[j]) {
		buf += '<ri style="top:' + em(height - boxes[j].height - rises[j]) + '">' + boxes[j].write() + '</ri>'
	}
	buf += '<eb>}</eb></r>'
	return buf;
}
var EMDIST = em;

var MATH_SPACE = '\u2005'

var Box = function(){
	this.height = 0;
	this.depth = 0;
}
Box.prototype.write = function(){return ''}

var CBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
CBox.prototype = new Box;
CBox.prototype.write = function(){
	return this.c
}

var VarBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
VarBox.prototype = new CBox;
VarBox.prototype.write = function(){
	return '<var>' + this.c + '</var>'
}
var NumberBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
NumberBox.prototype = new CBox;
NumberBox.prototype.write = function(){
	return '<var class="nm">' + this.c + '</var>'
}
var CodeBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
CodeBox.prototype = new CBox;
CodeBox.prototype.write = function(){
	return '<code>' + this.c + '</code>'
}
var BfBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
BfBox.prototype = new CBox;
BfBox.prototype.write = function(){
	return '<b>' + this.c + '</b>'
}
var OpBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
OpBox.prototype = new CBox;
OpBox.prototype.breakBefore = true;
OpBox.prototype.breakAfter  = true;
OpBox.prototype.spaceBefore = true;
OpBox.prototype.spaceAfter  = true;
OpBox.prototype.write = function(adjLeft, adjRight){
	return '<op>' + this.c + '</op>'
}
var SpBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
SpBox.prototype = new CBox;
SpBox.prototype.breakBefore = true;
SpBox.prototype.breakAfter  = true;
SpBox.prototype.write = function(){
	return '<sp>' + this.c + '</sp>'
}
var BCBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DESC
	this.c = c
}
BCBox.prototype = new CBox;
BCBox.prototype.breakAfter  = true;
BCBox.prototype.spaceAfter  = true;
BCBox.prototype.write = function(adjLeft, adjRight){
	return '<op>' + this.c + '</op>'
}
var BracketBox = function(c){
	this.height = BRACKET_ASC
	this.depth = BRACKET_DESC
	this.c = c
}
BracketBox.prototype = new CBox;
BracketBox.prototype.write = function(adjLeft, adjRight){
	return this.c
}
var ScaleBox = function(scale, b, baselineShift){
	this.content = b;
	this.scale = scale;
	this.height = b.height * scale;
	this.depth = b.depth * scale;
	this.baselineShift = baselineShift;
}
ScaleBox.prototype = new Box;
ScaleBox.prototype.write = function(){
	if(this.baselineShift){
		return '<e style="font-size:' + EMDIST(this.scale) + ';position:relative;top:' + EMDIST(-this.baselineShift) + '">' + this.content.write() + '</e>'
	} else {
		return '<e style="font-size:' + EMDIST(this.scale) + '">' + this.content.write() + '</e>'
	}
}

function FracLineBox(){
	this.height = 0;
	this.depth = 0;
}
FracLineBox.prototype = new Box;
FracLineBox.prototype.write = function(){
	return '<fl>/</fl>'
}
function FracBox(num, den){
	this.num = num;
	this.den = den;
	this.height = this.num.height + this.num.depth + FRAC_MIDDLE;
	this.depth = this.den.height + this.den.depth - FRAC_MIDDLE;
}
FracBox.prototype = new Box;
FracBox.prototype.write = function(){
	return arrx(
		[this.num, new FracLineBox(), this.den], 
		[this.height - this.num.height, this.height - this.num.height - this.num.depth, this.height - this.num.height - this.num.depth - this.den.height], 
		this.height, this.depth, 'frac')
}

function StackBox(boxes){
	boxes = boxes.filter(function(x){ return !!x })
	var v = 0;
	this.parts = boxes;
	for(var j = 0; j < boxes.length; j++){
		v += boxes[j].height + boxes[j].depth
	}
	this.height = v / 2 + STACK_MIDDLE
	this.depth = v / 2 - STACK_MIDDLE
}
StackBox.prototype = new Box;
StackBox.prototype.write = function(){
	var rises = [];
	var v = 0;
	for(var j = 0; j < this.parts.length; j++){
		rises[j] = this.height - (v + this.parts[j].height);
		v += this.parts[j].height + this.parts[j].depth
	};
	return arrx(this.parts, rises, this.height, this.depth);
}

function MatrixBox(boxes){
	this.boxes = boxes;
	this.rows = boxes.length;
	this.columns = 0;
	var rowHeights = [];
	var rowDepthes = [];
	var v = 0;
	for(var j = 0; j < boxes.length; j++){
		var rh = 0;
		var rd = 0;
		for(var k = 0; k < boxes[j].length; k++) if(boxes[j][k]){
			if(boxes[j][k].height > rh) rh = boxes[j][k].height;
			if(boxes[j][k].depth > rd) rd = boxes[j][k].depth;
		};
		rowHeights[j] = rh;
		rowDepthes[j] = rd;
		v += rh + rd;
		this.columns = Math.max(this.columns, boxes[j].length)
	};
	this.rowHeights = rowHeights
	this.rowDepthes = rowDepthes
	this.height = v / 2 + STACK_MIDDLE;
	this.depth = v / 2 - STACK_MIDDLE
}
MatrixBox.prototype = new Box;
MatrixBox.prototype.write = function(){
	var rises = [];
	var v = 0;
	for(var j = 0; j < this.rows; j++) {
		rises[j] = this.height - (v + this.rowHeights[j]);
		v += this.rowHeights[j] + this.rowDepthes[j]
	}
	var buf = [];
	for(var k = 0; k < this.columns; k++){
		var column = [];
		for(var j = 0; j < this.rows; j++) {
			column[j] = this.boxes[j][k];
		}
		buf[k] = arrx(column, rises, this.height, this.depth)
	};
	return buf.join(MATH_SPACE);
}

var mangeHBoxSpaces = function(buf){
	return buf.replace(/[ \u205f\u2005]*[\u2005\u205f][ \u2005\u205f]*/g, '\u205f')
	          .replace(/^[\s\u2009\u205f\u2005]+/g, '')
	          .replace(/[\s\u2009\u205f\u2005]+$/g, '');
}

function HBoxJoin(parts, f){
	var buf = '';
	for(var i = 0; i < parts.length; i++) {
		buf += (i > 0 && (parts[i].spaceBefore || parts[i - 1].spaceAfter) ? MATH_SPACE : '') 
			+ f(parts[i]);
	}
	return buf;
}
function STD_WRITE(box){
	return box.write();
}

var HBox = function(xs, spaceQ){
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
	this.spaceQ = spaceQ
	this.spaceBefore = this.boxes[0].spaceBefore;
	this.spaceAfter = this.boxes[this.boxes.length - 1].spaceAfter;
}
HBox.prototype = new Box
HBox.prototype.write = function(adjLeft, adjRight){
	return HBoxJoin(this.boxes, STD_WRITE)
}

var SegmentBox = function(xs){
	HBox.call(this, xs);
}
SegmentBox.prototype = Object.create(HBox.prototype);
SegmentBox.prototype.write = function(adjLeft, adjRight){
	var buf = HBoxJoin(this.boxes, STD_WRITE);
	return buf;
}

var BBox = function(left, content, right){
	this.height = content.height
	this.depth = content.depth
	this.left = new CBox(left)
	this.right = new CBox(right)
	this.content = content
}

var scale_span = function(v, t, k, aux){
	return '<e class="' + (k || 'bb') + '" style="transform:scaley('+ v + ');'
			+ '-webkit-transform:scaley('+ v + ');'
			+ '-moz-transform:scaley('+ v + ');'
			+ '-ms-transform:scaley('+ v + ');'
			+ '-o-transform:scaley('+ v + ');'
			+ (aux || '') + '">' + t + "</e>"
}
BBox.prototype = new Box;
BBox.prototype.write = function(){
	var halfwayHeight = (this.left.height - this.left.depth) / 2;
	var halfBracketHeight = halfwayHeight + this.left.depth;
	var contentUpperHeight = this.content.height - halfwayHeight;
	var contentLowerDepth = this.content.depth + halfwayHeight;

	var SCALE_V = Math.ceil(8 * Math.pow(Math.max(1, contentUpperHeight / halfBracketHeight, contentLowerDepth / halfBracketHeight), 1.2)) / 8;
	if(SCALE_V <= 1.1) {
		SCALE_V = 1;
		return '<e class="bn l">' + this.left.write() + '</e>' + (this.content.write()).replace(/[\s\u2009\u205f]+((?:<\/i>)+)$/, '$1') + '<e class="bn r">' + this.right.write() + '</e>';
	} else {
		var SCALE_H = Math.min(2, 1 + 0.4 * (SCALE_V - 1));
		var baselineAdjustment = - (halfwayHeight * SCALE_H - halfwayHeight) / SCALE_H;
		var auxStyle = 'font-size:' + em(SCALE_H) + ';vertical-align:' + EMDIST(baselineAdjustment + BRACKET_SHIFT);
		return (this.left.c ? scale_span(SCALE_V / SCALE_H, this.left.write(), 'bb l', auxStyle) : '')
		       + (this.content.write()).replace(/[\s\u2005\u2009\u205f]+((?:<\/i>)+)$/, '$1')
		       + (this.right.c ? scale_span(SCALE_V / SCALE_H, this.right.write(), 'bb r', auxStyle) : '')
	}
}

var SqrtBox = function(content){
	this.content = content
	this.height = content.height + FRAC_PADDING
	this.depth = content.depth + FRAC_PADDING
}
SqrtBox.prototype = new Box;
SqrtBox.prototype.write = function(){
	return '<sqrt><sk style="padding: ' + EMDIST(FRAC_PADDING) + ' 0">' + this.content.write() + '</sk></sqrt>'
}

var DecoBox = function(content, deco){
	this.height = content.height
	this.depth = content.depth
	this.content = content
	this.deco = deco
}
DecoBox.prototype = new Box;
DecoBox.prototype.write = function(){
	return '<e style="text-decoration:' + this.deco + '">' + this.content.write() + '</e>'
}

var SSBox = function(base, sup, sub){
	this.sup = sup
	this.sub = sub
	this.base = base;
	this.height = base.height;
	this.depth = base.depth;
	this.spaceBefore = base.spaceBefore;
	this.breakBefore = base.breakBefore;
}
SSBox.prototype = new Box;
SSBox.prototype.write = function(adjLeft, adjRight){
	var sup = this.sup || new CBox('&nbsp;');
	var sub = this.sub || new CBox('&nbsp;');
	var h = this.height / SS_SIZE;
	var d = this.depth / SS_SIZE;
	var stackV = 0;
	var stackShift = 0;
	var baseShift = this.base.yShift / SS_SIZE || 0
	var supShift = - sup.height - sup.depth + SUP_SHIFT + baseShift;
	var subShift = - sup.height - sup.depth - sub.height - SUB_SHIFT + baseShift;
	return	'<sg style="height:' + EMDIST((this.height + this.depth)) + '">'
			+ this.base.write(adjLeft, false)
			+ '<ss style="font-size:' + (SS_SIZE*100) + '%">'
			+ '<ssi style="height:' + EMDIST(h + d) + ';top:' + EMDIST((stackShift)) + '">'
			+ '<sup style="height:' + EMDIST((sup.height + sup.depth)) + ';top:' + EMDIST(supShift) + '">' + sup.write() + '</sup>'
			+ '<sub style="height:' + EMDIST((0)) + ';top:100%;margin-top:' + EMDIST((subShift)) + '">' + sub.write() + '</sub>'
			+ '</ssi></ss></sg>'
}

var SSStackBox = function(base, sup, sub){
	this.sup = sup ? new ScaleBox(SS_SIZE, sup) : null;
	this.sub = sub ? new ScaleBox(SS_SIZE, sub) : null;
	this.base = base;
	this.height = base.height + (sup ? (this.sup.height + this.sup.depth) : 0) + SSSTACK_MARGIN_SUP;
	this.depth = base.depth + (sub ? (this.sub.height + this.sub.depth) : 0) + SSSTACK_MARGIN_SUB;
}
SSStackBox.prototype = new Box;
SSStackBox.prototype.write = function(adjLeft, adjRight){
	var rises = [
		this.sup ? this.height - this.sup.height : 0,
		0,
		this.sub ? -this.depth + this.sub.depth : 0
	];
	return arrx([this.sup, this.base, this.sub], rises, this.height, this.depth, 'sss')
}

var FSBox = function(scale, content){
	this.scale = scale;
	this.content = content;
	this.height = content.height * scale
	this.depth = content.depth * scale
}
FSBox.prototype = new Box;
FSBox.prototype.write = function(){
	return '<sc style="font-size:' + (this.scale * 100) + '%">' + this.content.write() + '</sc>'
}

var BigOpBox = function(content, scale, ascender, descender, shift){
	this.scale = scale;
	this.content = content;
	if(arguments.length < 3) ascender = OPERATOR_ASC
	if(arguments.length < 4) descender = OPERATOR_DESC
	if(arguments.length < 5) shift = BIGOP_SHIFT
	this.height = (ascender + shift) * scale;
	this.depth = (descender - shift) * scale;
	this.shift = shift;
}
BigOpBox.prototype = new Box;
BigOpBox.prototype.write = function(){
	return arrx([new ScaleBox(this.scale, this.content)], [this.shift * this.scale], this.height, this.depth)
}

var layout = function(box, config){
	if(box instanceof HBox && !config.keepSpace){
		var buf = [];
		var segment = [];
		for(var i = 0; i < box.boxes.length; i++){
			var current = box.boxes[i];
			if(current.breakBefore){
				if(segment.length) buf.push(new SegmentBox(segment)); 
				segment = []
			}
			segment.push(current)
			if(current.breakAfter){
				if(segment.length) buf.push(new SegmentBox(segment)); 
				segment = []
			}
		}
		if(segment.length) buf.push(new SegmentBox(segment)); 
		segment = [];
		return HBoxJoin(buf, STD_WRITE);
	} else {
		return (new SegmentBox([box])).write()
	}
};


exports.Box = Box;
exports.CBox = CBox;
exports.VarBox = VarBox;
exports.NumberBox = NumberBox;
exports.CodeBox = CodeBox;
exports.BfBox = BfBox;
exports.OpBox = OpBox;
exports.SpBox = SpBox;
exports.BCBox = BCBox;

exports.ScaleBox = ScaleBox;
exports.FracBox = FracBox;
exports.StackBox = StackBox;
exports.MatrixBox = MatrixBox;
exports.HBox = HBox;
exports.BBox = BBox;
exports.SqrtBox = SqrtBox;
exports.DecoBox = DecoBox;
exports.SSBox = SSBox;
exports.SSStackBox = SSStackBox;
exports.FSBox = FSBox;
exports.BigOpBox = BigOpBox;

exports.layoutSegment = function(boxes){
	return (new SegmentBox(boxes)).write()
};
exports.layout = layout;