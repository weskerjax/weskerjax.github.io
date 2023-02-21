/**
 * D=dp
 * S=sh
 * B=Brushes
 * T=Toolbar
 * U=Utils
 */
var D = {
	S :{
		T : {},
		U	: {},
		R: {},
		B	: {},
		Strings : {
			AboutDialog : '<html><head><title>About...</title></head><body class="dp-about"><table cellspacing="0"><tr><td class="copy"><p class="title">dp.SyntaxHighlighter</div><div class="para">Version: {V}</p><p><a href="http://www.dreamprojections.com/syntaxhighlighter/?ref=about" target="_blank">http://www.dreamprojections.com/syntaxhighlighter</a></p>&copy;2004-2007 Alex Gorbatchev.</td></tr><tr><td class="footer"><input type="button" class="close" value="OK" onClick="window.close()"/></td></tr></table></body></html>'
		},
		Version : '1.5.1'
	}
};

// Toolbar functions
D.S.T.Commands = {
	ExpandSource: {
		label: '+ 顯示原始碼',
		check: function(h) { return h.collapse; },
		func: function(s, h){
			s.parentNode.removeChild(s);
			h.div.className = h.div.className.replace('collapsed', '');
		}
	},

	// opens a new windows and puts the original unformatted source code inside.
	ViewSource: {
		label: '原始碼',
		func: function(s, h){
			var code = D.S.U.FixForBlogger(h.originalCode).replace(/</g, '&lt;');
			var wnd = window.open('', '_blank', 'width=750, height=400, location=0, resizable=1, menubar=0, scrollbars=0');
			wnd.document.write('<textarea style="width:99%;height:99%">' + code + '</textarea>');
			wnd.document.close();
		}
	},

	About: {
		label: '關於此工具',
		func: function(h){
			var wnd	= window.open('', '_blank', 'dialog,width=300,height=150,scrollbars=0');
			var doc	= wnd.document;

			D.S.U.CopyStyles(doc, window.document);

			doc.write(D.S.Strings.AboutDialog.replace('{V}', D.S.Version));
			doc.close();
			wnd.focus();
		}
	}
};

// creates a <div /> with all toolbar links
D.S.T.Create = function(h){
	var div = document.createElement('DIV');

	div.className = 'tools';

	for(var name in D.S.T.Commands){
		var cmd = D.S.T.Commands[name];
		if(cmd.check != null && !cmd.check(h)){continue;}

		div.innerHTML += '<a href="#" onclick="D.S.T.Command(\'' + name + '\',this);return false;">' + cmd.label + '</a>';
	}
	return div;
};

// executes toolbar command by name
D.S.T.Command = function(name, s){
	var n = s;

	while(n != null && n.className.indexOf('dp-highlighter') == -1){
		n = n.parentNode;
    }

	if(n != null){
		D.S.T.Commands[name].func(s, n.h);
    }
};

// copies all <link rel="stylesheet" /> from 'target' window to 'dest'
D.S.U.CopyStyles = function(d, s){
	var ls = s.getElementsByTagName('link');

	for(var i = 0,l=ls.length; i < l; i++){
		if(ls[i].rel.toLowerCase() == 'stylesheet'){
			d.write('<link type="text/css" rel="stylesheet" href="' + ls[i].href + '"></link>');
        }
    }
};

D.S.U.FixForBlogger = function(str){
	return (D.S.isBloggerMode == true) ? str.replace(/<br\s*\/?>/gi, '\n') : str;//todo
};

D.S.R = {
	MLCC : new RegExp('/\\*[\\s\\S]*?\\*/', 'gm'), // 多行註解
	SLCC : new RegExp('//.*$', 'gm'), //單行註解
	DQS : new RegExp('"(?:\\.|(\\\\\\")|[^\\""\\n])*"','g'),//雙引號字串
	SQS : new RegExp("'(?:\\.|(\\\\\\')|[^\\''\\n])*'", 'g'),//單引號字串
	XDQS : new RegExp('"(?:\\.|(\\\\\\")|[^\\""])*"','g')//跨行雙引號字串
};

// Match object
D.S.Match = function(value, index, css){
	this.value = value;
	this.index = index;
	this.length = value.length;
	this.css = css;
};

// Highlighter object
D.S.H = function(){
	this.noGutter = false;
	this.addControls = true;
	this.collapse = false;
	this.tabsToSpaces = true;
	this.wrapColumn = 80;
	this.showColumns = true;
};

// static callback for the match sorting
D.S.H.SortCallback = function(m1, m2){
	// sort matches by index first
	if(m1.index < m2.index){
		return -1;
    }else if(m1.index > m2.index){
		return 1;
    }else{
		// if index is the same, sort by length
		if(m1.length < m2.length){
			return -1;
        }else if(m1.length > m2.length){
			return 1;
        }
	}
	return 0;
};

D.S.H.prototype.cEl = function(name){
	var result = document.createElement(name);
	result.h = this;
	return result;
};

// gets a list of all matches for a given regular expression
D.S.H.prototype.GetMatches = function(r, css){
	var index = 0,m = null;

	while((m = r.exec(this.code)) != null){
		this.mes[this.mes.length] = new D.S.Match(m[0], m.index, css);
    }
};

D.S.H.prototype.AddBit = function(str, css){
	if(str == null || str.length == 0){
		return;
    }

	var span = this.cEl('SPAN');

//	str = str.replace(/&/g, '&amp;');
	str = str.replace(/[ ]{2}/g, ' &nbsp;');
	str = str.replace(/</g, '&lt;');
//	str = str.replace(/&lt;/g, '<');
//	str = str.replace(/>/g, '&gt;');
	str = str.replace(/\n/gm, '&nbsp;<br/>');

	// when adding a piece of code, check to see if it has line breaks in it
	// and if it does, wrap individual line breaks with span tags
	if(css != null){
		if((/br/gi).test(str)){
			var ls = str.split('&nbsp;<br/>');

			for(var i = 0; i < ls.length; i++){
				span = this.cEl('SPAN');
				span.className = css;
				span.innerHTML = ls[i];

				this.div.appendChild(span);

				// don't add a <BR> for the last line
				if(i + 1 < ls.length){
					this.div.appendChild(this.cEl('BR'));
                }
			}
		}else{
			span.className = css;
			span.innerHTML = str;
			this.div.appendChild(span);
		}
	}else{
		span.innerHTML = str;
		this.div.appendChild(span);
	}
};

// checks if one match is inside any other match
D.S.H.prototype.IsInside = function(m){
	if(m == null || m.length == 0){
		return false;
    }

	for(var i = 0,l=this.mes.length; i < l; i++){
		var c = this.mes[i];

		if(c == null){continue;}

		if((m.index > c.index) && (m.index < c.index + c.length)){
			return true;
        }
	}

	return false;
};

D.S.H.prototype.ProcessRegexList = function(){
	for(var i = 0; i < this.RL.length; i++){
		this.GetMatches(this.RL[i].r, this.RL[i].c);
    }
};

D.S.H.prototype.ProcessSmartTabs = function(code){
	var ls=code.split('\n'),result='',tabSize=4,tab='\t';

	// This function inserts specified amount of spaces in the string
	// where a tab is while removing that given tab.
	function InsertSpaces(line, pos, count){
		var left=line.substr(0, pos),right=line.substr(pos + 1, line.length),spaces='';

		for(var i = 0; i < count; i++){
			spaces += ' ';
        }

		return left + spaces + right;
	}

	// This function process one line for 'smart tabs'
	function ProcessLine(line, tabSize){
		if(line.indexOf(tab) == -1){
			return line;
        }
		var pos = 0;
		while((pos = line.indexOf(tab)) != -1){
			var spaces = tabSize - pos % tabSize;
			line = InsertSpaces(line, pos, spaces);
		}
		return line;
	}

	// Go through all the lines and do the 'smart tabs' magic.
	for(var i = 0,l=ls.length; i<l; i++){
		result += ProcessLine(ls[i], tabSize) + '\n';
    }

	return result;
};

D.S.H.prototype.SwitchToList = function(){
	// thanks to Lachlan Donald from SitePoint.com for this <br/> tag fix.
	var html = this.div.innerHTML.replace(/<(br)\/?>/gi, '\n');
	var ls = html.split('\n');

	if(this.addControls == true){
		this.bar.appendChild(D.S.T.Create(this));
    }

	// add columns ruler
	if(this.showColumns){
		var div = this.cEl('div'),col = this.cEl('div'),showEvery = 10,i = 1;

		while(i <= 150){
			if(i % showEvery == 0){
				div.innerHTML += i;
				i += (i + '').length;
			}else{
				div.innerHTML += '&middot;';
				i++;
			}
		}

		col.className = 'columns';
		col.appendChild(div);
		this.bar.appendChild(col);
	}

	for(var i = 0, lineIndex = this.firstLine,l=ls.length-1; i < l; i++, lineIndex++){
		var li = this.cEl('LI'),span = this.cEl('SPAN');

		// uses .line1 and .line2 css styles for alternating lines
		li.className = (i % 2 == 0) ? 'alt' : '';
		span.innerHTML = ls[i] + '&nbsp;';

		li.appendChild(span);
		this.ol.appendChild(li);
	}

	this.div.innerHTML	= '';
};

D.S.H.prototype.Highlight = function(code){
	function Trim(str){
		return str.replace(/^\s*(.*?)[\s\n]*$/g, '$1');
	}

	function Chop(str){
		return str.replace(/\n*$/, '').replace(/^\n*/, '');
	}

	function Unindent(str){
		var ls = D.S.U.FixForBlogger(str).split('\n'),indents =[],r = new RegExp('^\\s*', 'g'),min = 1000;

		// go through every line and check for common number of indents
		for(var i = 0,l=ls.length; i < l && min > 0; i++){
			if(Trim(ls[i]).length == 0){continue;}

			var mes = r.exec(ls[i]);

			if(mes != null && mes.length > 0){
				min = Math.min(mes[0].length, min);
            }
		}

		// trim minimum common number of white space from the begining of every line
		if(min > 0){
			for(var i = 0,l=ls.length; i < l; i++){
				ls[i] = ls[i].substr(min);
            }
        }

		return ls.join('\n');
	}

	// This function returns a portions of the string from pos1 to pos2 inclusive
	function Copy(string, pos1, pos2){
		return string.substr(pos1, pos2 - pos1);
	}

	var pos	= 0;

	if(code == null){
		code = '';
    }

	this.originalCode = code;
	this.code = Chop(Unindent(code));
	this.div = this.cEl('DIV');
	this.bar = this.cEl('DIV');
	this.ol = this.cEl('OL');
	this.mes = [];

	this.div.className = 'dp-highlighter';
	this.div.h = this;

	this.bar.className = 'bar';

	// set the first line
	this.ol.start = this.firstLine;

	if(this.CssClass != null){
		this.ol.className = this.CssClass;
    }

	if(this.collapse){
		this.div.className += ' collapsed';
    }

	if(this.noGutter){
		this.div.className += ' nogutter';
    }

	// replace tabs with spaces
	if(this.tabsToSpaces == true){
		this.code = this.ProcessSmartTabs(this.code);
    }

	this.ProcessRegexList();

	// if no matches found, add entire code as plain text
	if(this.mes.length == 0){
		this.AddBit(this.code, null);
		this.SwitchToList();
		this.div.appendChild(this.bar);
		this.div.appendChild(this.ol);
		return;
	}

	// sort the matches
	this.mes = this.mes.sort(D.S.H.SortCallback);

	// The following loop checks to see if any of the matches are inside
	// of other matches. This process would get rid of highligted strings
	// inside comments, keywords inside strings and so on.
	for(var i = 0,l=this.mes.length; i<l; i++){
		if(this.IsInside(this.mes[i])){
			this.mes[i] = null;
        }
    }

	// Finally, go through the final list of matches and pull the all
	// together adding everything in between that isn't a match.
	for(var i = 0,l=this.mes.length; i < l; i++){
		var m = this.mes[i];

		if(m == null || m.length == 0){continue;}

		this.AddBit(Copy(this.code, pos, m.index), null);
		this.AddBit(m.value, m.css);

		pos = m.index + m.length;
	}

	this.AddBit(this.code.substr(pos), null);

	this.SwitchToList();
	this.div.appendChild(this.bar);
	this.div.appendChild(this.ol);
};

D.S.H.prototype.KW = function(str){
	return '\\b' + str.replace(new RegExp(' ','g'), '\\b|\\b') + '\\b';
};

D.S.BloggerMode = function(){
	D.S.isBloggerMode = true;
};

// highlightes all els identified by name and gets source code from specified property
D.S.HighlightAll = function(name, showGutter /* optional */, showControls /* optional */, collapseAll /* optional */, firstLine /* optional */, showColumns /* optional */){
	function FindValue(){
		var a = arguments;

		for(var i = 0,l=a.length; i < l; i++){
			if(a[i] == null){continue;}
			if(typeof(a[i]) == 'string' && a[i] != ''){
				return a[i] + '';
            }
			if(typeof(a[i]) == 'object' && a[i].value != ''){
				return a[i].value + '';
            }
		}

		return null;
	}

	function IsOptionSet(value, list){
		for(var i = 0,l=list.length; i<l; i++){
			if(list[i] == value){
				return true;
            }
        }
		return false;
	}

	function GetOptionValue(name, list, defaultValue){
		var r = new RegExp('^' + name + '\\[(\\w+)\\]$', 'gi'),mes = null;

		for(var i = 0,l=list.length; i < l; i++){
			if((mes = r.exec(list[i])) != null){
				return mes[1];
            }
        }
		return defaultValue;
	}

	function FindTagsByName(list, name, tagName){
		var tags = document.getElementsByTagName(tagName);

		for(var i = 0,l=tags.length; i < l; i++){
			if(tags[i].getAttribute('name') == name){
				list.push(tags[i]);
            }
        }
	}

	var els = [],h = null,registered = {},pName = 'innerHTML';

	// for some reason IE doesn't find <pre/> by name, however it does see them just fine by tag name...
	FindTagsByName(els, name, 'pre');
	FindTagsByName(els, name, 'textarea');
	if(els.length == 0){
		return;
    }

	// register all brushes
	for(var brush in D.S.B){
		var al = D.S.B[brush].Aliases;
		if(al == null){continue;}
		for(var i = 0,l=al.length; i < l; i++){
			registered[al[i]] = brush;
        }
	}

	for(var i = 0,l=els.length; i < l; i++){
		var el = els[i];
		var op = FindValue(
				el.attributes['class'], el.className,
				el.attributes['language'], el.lang
				);
		var lang = '';

		if(op == null){continue;}

		op = op.split(':');

		lang = op[0].toLowerCase();

		if(registered[lang] == null){continue;}

		// instantiate a brush
		h = new D.S.B[registered[lang]]();

		// hide the original el
		el.style.display = 'none';

		h.noGutter = (showGutter == null) ? IsOptionSet('nogutter', op) : !showGutter;
		h.addControls = (showControls == null) ? !IsOptionSet('nocontrols', op) : showControls;
		h.collapse = (collapseAll == null) ? IsOptionSet('collapse', op) : collapseAll;
		h.showColumns = (showColumns == null) ? IsOptionSet('showcolumns', op) : showColumns;

		// write out custom brush style
		var headNode = document.getElementsByTagName('head')[0];
		if(h.Style && headNode){
			var styleNode = document.createElement('style');
			styleNode.setAttribute('type', 'text/css');

			if(styleNode.styleSheet){ // for IE
				styleNode.styleSheet.cssText = h.Style;
			}else{ // for everyone else
				var textNode = document.createTextNode(h.Style);
				styleNode.appendChild(textNode);
			}

			headNode.appendChild(styleNode);
		}

		// first line idea comes from Andrew Collington, thanks!
		h.firstLine = (firstLine == null) ? parseInt(GetOptionValue('firstline', op, 1)) : firstLine;

		h.Highlight(el[pName]);

		h.source = el;

		el.parentNode.insertBefore(h.div, el);
	}
};
D.S.push = function(a,v){a[a.length]=v;};

/**=[ SQL ]====================================================================================*/
D.S.B.Sql = function(){
	var funcs	=	'MD5 PASSWORD ENCRYPT SHA1 SHA DECODE ENCODE AES_DECRYPT AES_ENCRYPT GROUP_CONCAT COUNT '+
                    'DES_DECRYPT DES_ENCRYPT COMPRESS UNCOMPRESS UNCOMPRESSED_LENGTH MAX MIN LEFT '+
                    'FOREIGN_KEY_CHECKS NAMES';

	var keywords =	'ACTION AFTER AS ASC AUTO_INCREMENT BEFORE BEGIN BY CASCADE CASE CHARACTER '+
                    'COLLATE CONNECTION DATABASE DEFAULT DELAYED DELIMITER DESC DETERMINISTIC '+
                    'EACH ELSE END END ENGINE FOR FOREIGN FROM GROUP IF INDEX INNER '+
                    'INTO JOIN JOIN KEY KEY LOW_PRIORITY NEW NO NULL NULL OLD ON ON ORDER '+
                    'PRIMARY PROCEDURE PROCEDURE REFERENCES RESTRICT ROW SEPARATOR TABLE THEN '+
                    'TRIGGER USE USING VALUE VALUES WHEN WHERE UNSIGNED';

	var operators =	'SELECT SET DROP EXISTS CREATE COMMENT NOT UPDATE DISTINCT DELETE ALTER UNION INSERT REPLACE';

	var datatype =	'DATE TEXT DATETIME INT CHAR VARCHAR INTEGER FLOAT';

	this.RL = [
		{ r: D.S.R.DQS,					c: 'string' },
		{ r: D.S.R.SQS,					c: 'string' },
		{ r: new RegExp('--(.*)$', 'gm'),          c: 'comments' },
		{ r: new RegExp(this.KW(funcs), 'gm'),	   c: 'func' },
		{ r: new RegExp(this.KW(operators), 'gm'), c: 'op' },
		{ r: new RegExp(this.KW(keywords), 'gm'),  c: 'keyword' },
		{ r: new RegExp(this.KW(datatype), 'gm'),  c: 'datatype' }
		];

	this.CssClass = 'dp-sql';

};

D.S.B.Sql.prototype	= new D.S.H();
D.S.B.Sql.Aliases	= ['sql'];


/**=[ PHP ]====================================================================================*/
D.S.B.Php = function(){
	var funcs	=	'abs acos acosh addcslashes addslashes array_[a-z_]* atan atan2 atanh '+
                    'base_convert base64_[a-z_]* basename bcadd bccomp bcdiv '+
                    'bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno '+
                    'bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate '+
                    'checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists '+
                    'closedir closelog copy cos cosh count count_chars date decbin dechex '+
                    'decoct deg2rad delete dirname ebcdic2ascii end ereg[a-z_]* error_[a-z_]* '+
                    'escapeshellarg escapeshellcmd eval exec exit exp explode var_dump '+
                    'extension_loaded feof fflush fgetc fgetcsv fgets fgetss file[a-z_]* floatval '+
                    'flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread '+
                    'fscanf fseek fsockopen fstat ftell ftok fclose tmpfile popen pclose get[a-z_]* glob gmdate gmmktime '+
                    'ini_[a-z_]* interface_exists intval ip2long is_[a-z_]* max min mkdir mktime nl2br '+
                    'parse_[a-z_]* passthru pathinfo print_r readlink realpath rewind rewinddir '+
                    'rmdir round str[a-z_]* substr[a-z_]* image[a-z_]* in_array md5 uniqid rand '+
                    'mt_srand microtime session_start sprintf mysqli_[a-z_]* join rawurldecode '+
                    'iconv pack trim htmlspecialchars mb_[a-z_]* curl_[a-z_]* preg_[a-z_]*';

	var keywords =	'and or xor __FILE__ __LINE__ array as break case null parent ' +
					'cfunction class const continue declare default die do echo else true false ' +
					'elseif empty enddeclare endfor endforeach endif endswitch endwhile ' +
					'extends for foreach function include include_once global if ' +
					'new old_function return static switch use require require_once ' +
					'var while __FUNCTION__ __CLASS__ ' +
					'__METHOD__ abstract interface public implements extends private protected throw '+
                    'isset unset header double try catch';

	this.RL = [
		{ r: D.S.R.SLCC,	c: 'comment' },
		{ r: D.S.R.MLCC,	c: 'comments' },
		{ r: D.S.R.XDQS,	c: 'string' },
		{ r: D.S.R.SQS,	    c: 'string' },
		{ r: new RegExp('(\&lt;|<)[?]php|[?](\&gt;|>)', 'gm'),	c: 'tag' },// php tag
		{ r: new RegExp('\\$\\w+', 'g'),			c: 'vars' },
		{ r: new RegExp(this.KW(funcs), 'gmi'),		c: 'func' },
		{ r: new RegExp(this.KW(keywords), 'gm'),	c: 'keyword' }
		];

	this.CssClass = 'dp-php';
};

D.S.B.Php.prototype	= new D.S.H();
D.S.B.Php.Aliases	= ['php'];



/**=[ Python ]====================================================================================*/
D.S.B.Py = function(){
    var funcs	=	'[A-Z][a-z]+';

	var keywords =	'as boolean break byte case catch char class const continue debugger ' +
					'def default delete do double else enum export extends from false final finally float ' +
					'for function goto if implements import in instanceof int interface is let long native ' +
					'new not null package private protected public raise return short static super switch ' +
					'synchronized this throw throws transient true try typeof var void volatile while with';

	this.RL = [
		{ r: new RegExp('#(.*)$', 'gm'),		c: 'comment' },
		{ r: D.S.R.MLCC,	c: 'comments' },
		{ r: D.S.R.DQS,		c: 'string' },
		{ r: D.S.R.SQS,		c: 'string' },
		{ r: new RegExp('^\\s*#.*', 'gm'),			c: 'preprocessor' },
		{ r: new RegExp(this.KW(keywords), 'gm'),	c: 'keyword' },
		{ r: new RegExp(this.KW(funcs), 'gm'),		c: 'func' }
		];

	this.CssClass = 'dp-js';
};

D.S.B.Py.prototype	= new D.S.H();
D.S.B.Py.Aliases	= ['py'];





/**=[ JavaScript ]====================================================================================*/
D.S.B.JScript = function(){
    var funcs	=	'[A-Z][a-z]+';

	var keywords =	'abstract boolean break byte case catch char class const continue debugger ' +
					'default delete do double else enum export extends false final finally float ' +
					'for function goto if implements import in instanceof int interface let long native ' +
					'new null package private protected public return short static super switch ' +
					'synchronized this throw throws transient true try typeof var void volatile while with';

	this.RL = [
		{ r: D.S.R.SLCC,	c: 'comment' },
		{ r: D.S.R.MLCC,	c: 'comments' },
		{ r: D.S.R.DQS,		c: 'string' },
		{ r: D.S.R.SQS,		c: 'string' },
		{ r: new RegExp('^\\s*#.*', 'gm'),			c: 'preprocessor' },
		{ r: new RegExp(this.KW(keywords), 'gm'),	c: 'keyword' },
		{ r: new RegExp(this.KW(funcs), 'gm'),		c: 'func' }
		];

	this.CssClass = 'dp-js';
};

D.S.B.JScript.prototype	= new D.S.H();
D.S.B.JScript.Aliases	= ['js'];



/**=[ Java ]====================================================================================*/
D.S.B.Java = function(){
	var keywords =	'abstract assert boolean break byte case catch char class const ' +
					'continue default do double else enum extends ' +
					'false final finally float for goto if implements import ' +
					'instanceof int interface long native new null ' +
					'package private protected public return ' +
					'short static strictfp super switch synchronized this throw throws true ' +
					'transient try void volatile while';

	this.RL = [
		{ r: D.S.R.SLCC,	c: 'comment' },
		{ r: D.S.R.MLCC,	c: 'comments' },
		{ r: D.S.R.DQS,		c: 'string' },
		{ r: D.S.R.SQS,		c: 'string' },
		{ r: /\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi,	c: 'value' },
		{ r: /(?!\@interface\b)\@[\$\w]+\b/g,		c: 'preprocessor' },
		{ r: /\@interface\b/g,						c: 'preprocessor' },
		{ r: /\b[A-Z]\w+\b/g,						c: 'func' },
		{ r: new RegExp(this.KW(keywords), 'gm'),	c: 'keyword' },
	];

	this.CssClass = 'dp-java';
};

D.S.B.Java.prototype	= new D.S.H();
D.S.B.Java.Aliases	= ['java'];



/**=[ XML ]====================================================================================*/
D.S.B.Xml = function(){
	this.CssClass = 'dp-xml';
};

D.S.B.Xml.prototype	= new D.S.H();
D.S.B.Xml.Aliases	= ['xml','html'];

D.S.B.Xml.prototype.ProcessRegexList = function(){
	var m	= null;
	var r	= null;

	// Match CDATA in the following format <![ ... [ ... ]]>
	this.GetMatches(new RegExp('(\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\&gt;|>)', 'gm'), 'cdata');

	// Match comments
	this.GetMatches(new RegExp('(\&lt;|<)!--\\s*.*?\\s*--(\&gt;|>)', 'gm'), 'comments');

	// Match attributes and their values
	r = new RegExp('([:\\w-\.]+)\\s*=\\s*(".*?"|\'.*?\'|\\w+)*|(\\w+)', 'gm');
	while((m = r.exec(this.code)) != null){
		if(m[1] == null){continue;}
		D.S.push(this.mes, new D.S.Match(m[1], m.index, 'attribute'));

		if(m[2] != undefined){	// if xml is invalid and attribute has no property value, ignore it
			D.S.push(this.mes, new D.S.Match(m[2], m.index + m[0].indexOf(m[2]), 'attribute-value'));
		}
	}

	// Match opening and closing tag brackets
	this.GetMatches(new RegExp('(\&lt;|<)/*\\?*(?!\\!)|/*\\?*(\&gt;|>)', 'gm'), 'tag');

	// Match tag names
	r = new RegExp('(?:\&lt;|<)/*\\?*\\s*([:\\w-\.]+)', 'gm');
	while((m = r.exec(this.code))){
		D.S.push(this.mes, new D.S.Match(m[1], m.index + m[0].indexOf(m[1]), 'tag-name'));
	}
};


/**=[ ASP ]====================================================================================*/
D.S.B.Asp = function(){
    var funcs	=	'createobject dateadd deletefile fileexists '+
					'inputbox ipmt movefile msgbox ppmt rgb union';

	var keywords =	'array as boolean byte const date dim do double '+
					'each else elseif end exit false for function if '+
					'in integer long loop mod new next nothing object '+
					'set single step string sub then to true until '+
					'variant while with';

	this.RL = [
		{ r: new RegExp('^[ ]*\'(.*)$', 'gm'),	c: 'comments' },
		{ r: D.S.R.DQS,					        c: 'string' },
		{ r: D.S.R.SQS,					        c: 'string' },
		{ r: new RegExp(this.KW(funcs), 'igm'),	c: 'func' },
		{ r: new RegExp('(\&lt;|<)[%]|[%](\&gt;|>)', 'gm'),	c: 'tag' },
		{ r: new RegExp(this.KW(keywords), 'igm'),		c: 'keyword' }
	];

	this.CssClass = 'dp-asp';
};

D.S.B.Asp.prototype	= new D.S.H();
D.S.B.Asp.Aliases	= ['asp','vb'];


/**=[ C# ]====================================================================================*/
D.S.B.CSharp=function(){
    var objClass	=	'WebResponse WebRequest StreamReader Directory Int32 '+
						'Encoding Regex WebException List Path File XDocument XmlReader '+
						'HttpUtility String Image ImageFormat ImageAnimator IntPtr '+
						'NameValueCollection ArgumentNullException HttpValueCollection '+
						'Serializable Exception Bitmap Graphics Expression Func PredicateBuilder';
						
	var keywords	=	'var abstract as base bool break byte case catch char checked class const '+
						'continue decimal default delegate do double else enum event explicit '+
						'extern false finally fixed float for foreach get goto if implicit in int '+
						'interface internal is lock long namespace new null object operator out '+
						'override params private protected public readonly ref return sbyte sealed set '+
						'short sizeof stackalloc static string struct switch this throw true try '+
						'typeof uint ulong unchecked unsafe ushort using virtual void while';
	this.RL = [
		{ r: D.S.R.SLCC,    						c: 'comment' },
		{ r: D.S.R.MLCC,							c: 'comments' },
		{ r: D.S.R.DQS,								c: 'string' },
		{ r: D.S.R.SQS,								c: 'string' },
		{ r: new RegExp(this.KW(objClass), 'gm'),	c: 'func' },
		{ r: new RegExp('^\\s*#.*','gm'),			c: 'preprocessor' },
		{ r: new RegExp(this.KW(keywords),'gm'),	c: 'keyword'}
	];
	
	this.CssClass='dp-cpp';
};

D.S.B.CSharp.prototype	= new D.S.H();
D.S.B.CSharp.Aliases 	= ['c#','c-sharp','csharp'];




/**=[ Config ]====================================================================================*/
D.S.B.Config = function(){
	var keywords =	'for in do done exit export';

	this.RL = [
		{ r: new RegExp('(\&gt;|>)', 'gm'),			c: 'gt' },
		{ r: new RegExp('\[#;](.*)$', 'gm'),		c: 'comments' },
		{ r: new RegExp('^[a-z]+[a-z_\.]* ', 'gmi'),c: 'keyword' },
		{ r: new RegExp('^[ ]*[a-z_]+[ ]*=', 'gmi'),c: 'value' },
		{ r: D.S.R.DQS,					            c: 'string' },
		{ r: D.S.R.SQS,					            c: 'string' }
	];

	this.CssClass = 'dp-cfg';
};

D.S.B.Config.prototype	= new D.S.H();
D.S.B.Config.Aliases	= ['conf','config'];



/**=[ Bash ]====================================================================================*/
D.S.B.Bash = function(){
	var keywords =	'apt-get cat cd cp curl do done echo else exit export '+
					'fi for ftp grep if in install ln ls make mkdir mke2fs mv mysql mysqldump '+
					'rm sfdisk sleep sudo tar then tr wget while';


	this.RL = [
		{ r: new RegExp('^[ \t]*\#(.*)$', 'gm'),	c: 'comments' },
		{ r: new RegExp('[a-z_]+=', 'gmi'),	    c: 'func' },
		{ r: new RegExp('\$[a-z_]+', 'gmi'),	c: 'value' },
		{ r: D.S.R.DQS,	                        c: 'string' },
		{ r: D.S.R.SQS,	                        c: 'string' },
		{ r: new RegExp(this.KW(keywords),'gm'),c: 'keyword' }
		];

	this.CssClass = 'dp-bash';
};

D.S.B.Bash.prototype	= new D.S.H();
D.S.B.Bash.Aliases	= ['sh','bash'];


/**=[ CSS ]====================================================================================*/
D.S.B.Css = function(){
	this.CssClass = 'dp-css';
};

D.S.B.Css.prototype	= new D.S.H();
D.S.B.Css.Aliases	= ['css'];

D.S.B.Css.prototype.ProcessRegexList = function(){
	var r1,r2,m1,m2;
	// Match xml comments
	this.GetMatches(D.S.R.MLCC, 'comments');
	this.GetMatches(new RegExp('!important', 'g'),'important');

	// Match attributes and their values
    // 匹配 '{' 至 '}' 之間的文字
    r1 = new RegExp('\{[^}]+\}', 'gm');
    // 匹配 'xxx:xxx[;\n\(!]' 格式的文字
    r2 = new RegExp('([@:\\w-\.]+)\\s*:\\s*([^;\n\(!]+)[;\n\(!]', 'gm');
 	while((m1 = r1.exec(this.code))){
		// Match attributes and their values
		while((m2 = r2.exec(m1[0]))){
			if(!m2[1]){continue;}
			D.S.push(this.mes, new D.S.Match(m2[1], m1.index+m2.index, 'func'));

			// if xml is invalid and attribute has no property value, ignore it
			if(m2[2] != undefined){
				D.S.push(this.mes, new D.S.Match(m2[2], m1.index+m2.index + m2[0].indexOf(m2[2]), 'value'));
			}
		}
	}
	// Match attributes and their values
	r1 = new RegExp('^([\\s\\w\.#*:+-]+)[,\{\n]', 'gm'); // Thanks to Tomi Blinnikka of Yahoo! for fixing namespaces in attributes
	while((m1 = r1.exec(this.code))){
		//console.log(m1);
		
		if(!m1[1]){continue;}

		D.S.push(this.mes, new D.S.Match(m1[1], m1.index, 'keyword'));
	}

};


/**=[ C++ ]====================================================================================*/
D.S.B.Cpp = function(){
    var funcs	=
    'malloc calloc realloc free '+
    'fclose feof fopen fprintf fscanf printf remove rename rewind scanf ftell fseek fnmatch '+
    'strlen strcpy strcat strstr strtok '+
    'opendir readdir closedir '+
    'dirname';

	var datatypes = 'NULL BOOL BOOLEAN BYTE CHAR DIR FLOAT FILE char bool short int __int\\d+ long float double dirent';

	var keywords =
	'break case catch class const __finally __exception __try ' +
	'const_cast continue private public protected __declspec ' +
	'default delete deprecated dllexport dllimport do dynamic_cast ' +
	'else enum explicit extern if for friend goto inline ' +
	'mutable naked namespace new noinline noreturn nothrow ' +
	'register reinterpret_cast return selectany ' +
	'sizeof static static_cast struct switch template this ' +
	'thread throw true false try typedef typeid typename union ' +
	'using uuid virtual void volatile whcar_t while';

	this.RL = [
		{ r: D.S.R.SLCC,    c: 'comment' },
		{ r: D.S.R.MLCC,	c: 'comments' },
		{ r: D.S.R.DQS,		c: 'string' },
		{ r: D.S.R.SQS,		c: 'string' },
		{ r: new RegExp('^ *#\\w*', 'gm'),			c: 'keyword' },
		{ r: new RegExp(this.KW(funcs), 'gm'),		c: 'func' },
		{ r: new RegExp(this.KW(datatypes),'gm'),   c: 'datatypes' },
		{ r: new RegExp(this.KW(keywords), 'gm'),   c: 'keyword' }
		];

	this.CssClass = 'dp-cpp';

};

D.S.B.Cpp.prototype	= new D.S.H();
D.S.B.Cpp.Aliases	= ['cpp', 'c', 'c++'];



/**=[ none ]====================================================================================*/
D.S.B.None = function(){
	this.RL = [];
	this.CssClass = 'dp-none';
};

D.S.B.None.prototype	= new D.S.H();
D.S.B.None.Aliases	= ['none'];

