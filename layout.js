var LINE_HEIGHT = 1.2;
var CHAR_ASC = 0.976;
var CHAR_DESC = LINE_HEIGHT - CHAR_ASC;
var STACK_MIDDLE = CHAR_ASC - (CHAR_ASC + CHAR_DESC) / 2;
var FRAC_MIDDLE = 0.33;
var OPERATOR_ASC = 0.9
var OPERATOR_DESC = 0.5
var FRAC_PADDING = 0.1
var SS_SIZE = 0.65;
var SUP_BOTTOM = -0.75;
var SUB_TOP = 0.75;
var SUP_TOP_TOLERENCE = CHAR_ASC + LINE_HEIGHT * SS_SIZE + SUP_BOTTOM - CHAR_ASC;
var SUB_BOTTOM_TOLERENCE = -(-CHAR_DESC + SUB_TOP - LINE_HEIGHT * SS_SIZE + CHAR_DESC);
var POSITION_SHIFT = 0
var BIGOP_SHIFT = 0
var SSSTACK_MARGIN_SUP = 0
var SSSTACK_MARGIN_SUB = -0.7
var BRACKET_SHIFT = 0.06;
var BRACKET_ASC = 0.9;
var BRACKET_DESC = LINE_HEIGHT - BRACKET_ASC;

var MATH_SPACE = '<sp>\u2005</sp>'
var MATRIX_SPACE = '\u2000'

function em(x){	return (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, '') + 'em' }
function arr1(box, rise, height, depth){
	return arrx([box], [rise], height, depth)
}
function arrx(boxes, rises, height, depth, cl, scales){
	var buf = '<r style="height:' + em(height + depth) + ';vertical-align:' + em(height - CHAR_ASC) + '"' + (cl ? ' class="' + cl + '"' : '') + '><eb>{</eb>';
	for(var j = 0; j < boxes.length; j++) if(boxes[j]) {
		if(scales) var scale = scales[j];
		else var scale = 1;
		buf += '<ri style="top:' + em((height - rises[j]) / scale - boxes[j].height) + (scale && scale !== 1 ? ';font-size:' + em(scale) : '') + '">' + boxes[j].write() + '</ri>'
	}
	buf += '<eb>}</eb></r>'
	return buf;
}
var EMDIST = em;


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
var ScaleBox = function(scale, b){
	this.content = b;
	this.scale = scale;
	this.height = b.height * scale;
	this.depth = b.depth * scale;
}
ScaleBox.prototype = new Box;
ScaleBox.prototype.write = function(){
	return '<r style="height:' + EMDIST(this.height + this.depth) + '"><ri style="font-size:' + em(this.scale) + '">' + this.content.write() + '</ri></r>'
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
	this.height = this.num.height + this.num.depth + FRAC_MIDDLE + FRAC_PADDING;
	this.depth = this.den.height + this.den.depth - FRAC_MIDDLE + FRAC_PADDING;
}
FracBox.prototype = new Box;
FracBox.prototype.write = function(){
	return arrx(
		[this.num, new FracLineBox(), this.den], 
		[
			this.height - this.num.height, 
			this.height - this.num.height - this.num.depth - FRAC_PADDING, 
			this.height - this.num.height - this.num.depth - this.den.height - 2 * FRAC_PADDING], 
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

function MatrixBox(boxes, alignments){
	this.boxes = boxes;
	this.rows = boxes.length;
	this.columns = 0;
	this.alignments = alignments || '';
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
	this.rowHeights = rowHeights;
	this.rowDepthes = rowDepthes;
	this.height = v / 2 + STACK_MIDDLE;
	this.depth = v / 2 - STACK_MIDDLE;
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
		buf[k] = arrx(column, rises, this.height, this.depth, 'mc' + (this.alignments[k] || '').trim())
	};
	return buf.join(MATRIX_SPACE);
}

function hJoin(parts, f){
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
	return hJoin(this.boxes, STD_WRITE)
}

var SegmentBox = function(xs){
	HBox.call(this, xs);
}
SegmentBox.prototype = Object.create(HBox.prototype);
SegmentBox.prototype.write = function(adjLeft, adjRight){
	var buf = hJoin(this.boxes, STD_WRITE);
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

	var SCALE_V = Math.ceil(8 * Math.max(1, contentUpperHeight / halfBracketHeight, contentLowerDepth / halfBracketHeight)) / 8;
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

function SqrtInternalBox(content){
	this.content = content
	this.height = content.height + FRAC_PADDING * 2
	this.depth = content.depth
}
SqrtInternalBox.prototype = new Box;
SqrtInternalBox.prototype.write = function(){
	return '<sqrt style="margin-top:' + em(FRAC_PADDING) + '"><sk style="padding: ' + EMDIST(FRAC_PADDING) + ' 0 0">' + this.content.write() + '</sk></sqrt>'
}

var SqrtBox = function(content){
	SqrtInternalBox.call(this, content)
}
SqrtBox.prototype = new Box;
SqrtBox.prototype.write = function(){
	return arrx([new SqrtInternalBox(this.content)], [0], this.height, this.depth)
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
	if(sup){
		this.height = this.base.height + SUP_BOTTOM + SS_SIZE * (sup.depth + sup.height);
		if(this.height - base.height <= SUP_TOP_TOLERENCE) {
			this.height = base.height
		}
	} else {
		this.height = base.height;
	};
	if(sub){
		this.depth = this.base.depth - SUB_TOP + SS_SIZE * (sub.height + sub.depth);
		if(this.depth - base.depth <= SUB_BOTTOM_TOLERENCE) {
			this.depth = base.depth
		}
	} else {
		this.depth = base.depth;
	}
	this.spaceBefore = base.spaceBefore;
	this.breakBefore = base.breakBefore;
}
SSBox.prototype = new Box;
SSBox.prototype.write = function(adjLeft, adjRight){
	var sup = this.sup;
	var sub = this.sub;
	return this.base.write(adjLeft, false) 
	       + arrx([sup, sub], [
	       	sup ? this.base.height + SUP_BOTTOM + sup.depth * SS_SIZE : 0,
	       	sub ? -this.base.depth + SUB_TOP - sub.height * SS_SIZE : 0
	       ], this.height, this.depth, 'ss', [SS_SIZE, SS_SIZE])
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
		return hJoin(buf, STD_WRITE);
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