var LINE_HEIGHT         	= 1.2;
var CHAR_ASC            	= 0.9;
var CHAR_DESC           	= LINE_HEIGHT - CHAR_ASC;
var STACK_MIDDLE        	= CHAR_ASC - (CHAR_ASC + CHAR_DESC) / 2;
var FRAC_MIDDLE         	= 0.24;
var OPERATOR_ASC        	= 0.9
var OPERATOR_DESC       	= 0.5
var FRAC_PADDING        	= 0.1
var SS_SIZE             	= 0.7;
var SUP_BOTTOM          	= -0.75;
var SUB_TOP             	= 0.75;
var SUP_TOP_TOLERENCE   	= CHAR_ASC + LINE_HEIGHT * SS_SIZE + SUP_BOTTOM - CHAR_ASC;
var SUB_BOTTOM_TOLERENCE	= -(-CHAR_DESC + SUB_TOP - LINE_HEIGHT * SS_SIZE + CHAR_DESC);
var POSITION_SHIFT      	= 0
var BIGOP_SHIFT         	= 0
var SSSTACK_MARGIN_SUP  	= 0.07
var SSSTACK_MARGIN_SUB  	= -0.55
var BRACKET_SHIFT       	= 0.037;
var BRACKET_SHIFT_2     	= -0.032;
var BRACKET_ASC         	= CHAR_ASC;
var BRACKET_DESC        	= LINE_HEIGHT - BRACKET_ASC;
var BRACKET_GEARS       	= 8;

var OPERATOR_SCALE 	= 1.5;
var INTEGRATE_SCALE	= 1.75;

var ASCENDER_OPERATOR  	= CHAR_ASC;
var DESCENDER_OPERATOR 	= LINE_HEIGHT * 1.1 - CHAR_ASC;
var ASCENDER_INTEGRATE 	= CHAR_ASC + 0.05;
var DESCENDER_INTEGRATE	= LINE_HEIGHT * 1.1 - CHAR_ASC;
var OPERATOR_SHIFT     	= -0.11;
var INTEGRATE_SHIFT    	= -0.17;
var ROOT_KERN          	= -0.6;
var ROOT_RISE          	= 0.15;


exports.LINE_HEIGHT         	= LINE_HEIGHT
exports.CHAR_ASC            	= CHAR_ASC
exports.CHAR_DESC           	= CHAR_DESC
exports.STACK_MIDDLE        	= STACK_MIDDLE
exports.FRAC_MIDDLE         	= FRAC_MIDDLE
exports.OPERATOR_ASC        	= OPERATOR_ASC
exports.OPERATOR_DESC       	= OPERATOR_DESC
exports.FRAC_PADDING        	= FRAC_PADDING
exports.SS_SIZE             	= SS_SIZE
exports.SUP_BOTTOM          	= SUP_BOTTOM
exports.SUB_TOP             	= SUB_TOP
exports.SUP_TOP_TOLERENCE   	= SUP_TOP_TOLERENCE
exports.SUB_BOTTOM_TOLERENCE	= SUB_BOTTOM_TOLERENCE
exports.POSITION_SHIFT      	= POSITION_SHIFT
exports.BIGOP_SHIFT         	= BIGOP_SHIFT
exports.SSSTACK_MARGIN_SUP  	= SSSTACK_MARGIN_SUP
exports.SSSTACK_MARGIN_SUB  	= SSSTACK_MARGIN_SUB
exports.BRACKET_SHIFT       	= BRACKET_SHIFT
exports.BRACKET_SHIFT_2     	= BRACKET_SHIFT_2
exports.BRACKET_ASC         	= BRACKET_ASC
exports.BRACKET_DESC        	= BRACKET_DESC
exports.OPERATOR_SCALE      	= OPERATOR_SCALE
exports.INTEGRATE_SCALE     	= INTEGRATE_SCALE
exports.ASCENDER_OPERATOR   	= ASCENDER_OPERATOR
exports.DESCENDER_OPERATOR  	= DESCENDER_OPERATOR
exports.ASCENDER_INTEGRATE  	= ASCENDER_INTEGRATE
exports.DESCENDER_INTEGRATE 	= DESCENDER_INTEGRATE
exports.OPERATOR_SHIFT      	= OPERATOR_SHIFT
exports.INTEGRATE_SHIFT     	= INTEGRATE_SHIFT
exports.BRACKET_GEARS       	= BRACKET_GEARS
exports.ROOT_KERN           	= ROOT_KERN
exports.ROOT_RISE           	= ROOT_RISE