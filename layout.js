var LINE_HEIGHT = 1.2
var CHAR_ASC = 0.9
var CHAR_DSC = LINE_HEIGHT - CHAR_ASC
var FRAC_SHIFT_MID = 0.6
var FRAC_PADDING = 0.1
var SS_SIZE = 0.75
var SUP_SHIFT = 0.9
var SUB_SHIFT = 0.25
var POSITION_SHIFT = 0
var BIGOP_SHIFT = -0.3
var SSSTACK_MARGIN_SUP = 0.1
var SSSTACK_MARGIN_SUB = 0.75
var MATH_SPACE = '\u2005'

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
var NumberBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
NumberBox.prototype = new CBox;
NumberBox.prototype.write = function(){
	return '<var class="nm">' + this.c + '</var>'
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
OpBox.prototype.write = function(adjLeft, adjRight){
	return '<op>' + this.c + '</op>'
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
	return '<sp>' + this.c + '</sp>'
}
var BCBox = function(c){
	this.height = CHAR_ASC
	this.depth = CHAR_DSC
	this.c = c
}
BCBox.prototype = new CBox;
BCBox.prototype.breakAfter  = true;
BCBox.prototype.spaceAfter  = true;
BCBox.prototype.write = function(adjLeft, adjRight){
	return '<op>' + this.c + '</op>'
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
	return '<frac style="height:' + EMDIST(fracV) + '">'
		+ '<hd>(</hd>'
		+ '<num style="height:' + EMDIST(numV) + ';top:' + EMDIST(numShift) + '">' + this.num.write() + '</num>'
		+ '<fdv style="top:' + EMDIST(elementsShift + FRAC_PADDING) + '">/</fdv>'
		+ '<den style="height:' + EMDIST(denV) + ';top:' + EMDIST(denShift) + '">' + this.den.write() + '</den>'
		+ '<hd>)</hd>'
		+ '</frac>'
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
	return '<stack style="height:' + EMDIST(fracV) + '">'
		+ '<num style="height:' + EMDIST(numV) + ';top:' + EMDIST(numShift) + '">' + this.num.write() + '</num>'
		+ '<den style="height:' + EMDIST(denV) + ';top:' + EMDIST(denShift) + '">' + this.den.write() + '</den>'
		+ '</stack>'
}

var StackBox = function(parts, align){
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
	this.align = align;
}
StackBox.prototype = new Box;
StackBox.prototype.write = function(_h, _d){
	if(arguments.length >= 2) {
		var height = _h;
		var depth =  _d;
		var fracV = Math.max(height, depth) * 2 - FRAC_SHIFT_MID;
		var elementsShift = Math.max(height, depth) - height;
	} else {
		var height = this.height;
		var depth = this.depth;
		var fracV = (Math.max(height, depth) - FRAC_SHIFT_MID) * 2;
		var elementsShift = Math.max(height, depth) - height;
	}

	var buf = '<stack class="' + (this.align ? 'a' + this.align : '') + '" style="height:' + EMDIST(fracV) + '">';
	for(var i = 0; i < this.parts.length; i++){
		var part = this.parts[i];
		var partV = part.height + part.depth;
		var partShift = part.height - Math.max(part.height, part.depth) + elementsShift;
		buf += '<num style="height:' + EMDIST(partV) + ';top:' + EMDIST(partShift) + '">' + part.write() + '</num>'
	};
	buf += '</stack>';
	return buf;
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
	var h = this.height
	var d = this.depth
	var shift = h - Math.max(h, d);
	if(shift < 0.002 && shift > -0.002){
		return '<seg style="height:' + EMDIST(h + d) + '">' + buf + '</seg>'
	} else {
		return '<seg style="height:' + EMDIST(h + d) + ';vertical-align:' + EMDIST(shift) + '">'
			+ '<ei style="top:' + EMDIST(shift) + '">' + buf + '</ei></seg>'
	}
}

var BBox = function(left, content, right){
	this.height = content.height
	this.depth = content.depth
	this.left = new CBox(left)
	this.right = new CBox(right)
	this.content = content
}

var scale_span = function(h, v, t, k, aux){
	return '<e class="' + (k || 'bb') + '" style="transform:scale('+ h + ',' + v + ');'
			+ '-webkit-transform:scale('+ h + ',' + v + ');'
			+ '-moz-transform:scale('+ h + ',' + v + ');'
			+ '-ms-transform:scale('+ h + ',' + v + ');'
			+ '-o-transform:scale('+ h + ',' + v + ');'
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
		var SCALE_H = Math.min(2, 1 + 0.25 * (SCALE_V - 1));
		var baselineAdjustment = - (halfwayHeight * SCALE_H - halfwayHeight) / SCALE_H;
		var auxStyle = 'font-size:' + (SCALE_H * 100) + '%;vertical-align:' + EMDIST(baselineAdjustment);
		return (this.left.c ? scale_span(1, SCALE_V / SCALE_H, this.left.write(), 'bb l', auxStyle) : '')
		       + (this.content.write()).replace(/[\s\u2005\u2009\u205f]+((?:<\/i>)+)$/, '$1')
		       + (this.right.c ? scale_span(1, SCALE_V / SCALE_H, this.right.write(), 'bb r', auxStyle) : '')
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
	this.sup = sup ? new ScaleBox(SS_SIZE, sup, SSSTACK_MARGIN_SUP) : null;
	this.sub = sub ? new ScaleBox(SS_SIZE, sub, SSSTACK_MARGIN_SUB) : null;
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
	return '<sc style="font-size:' + (this.scale * 100) + '%">' + this.content.write() + '</sc>'
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
	return '<bo style="font-size:' + (this.scale * 100) + '%;position:relative;top:' +
		EMDIST((this.halfwayHeight * this.scale - this.halfwayHeight + BIGOP_SHIFT) / (this.scale)) + '">' + this.content.write() + '</bo>'
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
exports.Stack2Box = Stack2Box;
exports.StackBox = StackBox;
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