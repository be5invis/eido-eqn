exports.defms = function(defm){
	defm('upper choose lower', '(upper above lower)');
	defm("sin", '"sin" rm');
	defm("cos", '"cos" rm');
	defm("tan", '"tan" rm');
	defm("cot", '"cot" rm');
	defm("sec", '"sec" rm');
	defm("csc", '"csc" rm');
	defm("ln", '"ln" rm');
	defm("lg", '"lg" rm');
	defm("log", '"log" rm');
	defm("lb", '"lb" rm');
	defm("lim", '"lim" rm');
	defm("sup", '"sup" rm');
	defm("inf", '"inf" rm');
	defm("erf", '"erf" rm');
	defm("erfc", '"erfc" rm');
	defm("x '", 'x ^ prime');
	defm("x bra", 'langle left x right |')
	defm("x ket", '| left x right rangle')
}