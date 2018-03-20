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
	return (D.S.isBloggerMode == true) ? str.replace(/<br\s*\/?>|&lt;br\s*\/?&gt;/gi, '\n') : str;
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
	str = str.replace(/\n/gm, '&nbsp;<br>');

	// when adding a piece of code, check to see if it has line breaks in it 
	// and if it does, wrap individual line breaks with span tags
	if(css != null){
		if((/br/gi).test(str)){
			var ls = str.split('&nbsp;<br>');
			
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
	var funcs	=	'ABS ACOS ADD_MONTHS ASCII ASCIISTR ASIN ATAN ATAN2 AVG BFILENAME BIN_TO_NUM ' +
					'BITAND CARDINALITY CASE STATEMENT CAST CEIL CHARTOROWID CHR COALESCE COMPOSE ' +
					'CONCAT CONVERT CORR COS COSH COUNT COVAR_POP COVAR_SAMP CUME_DIST CURRENT_DATE ' +
					'CURRENT_TIMESTAMP DBTIMEZONE DECODE DECOMPOSE DENSE_RANK DUMP EXP EXTRACT FLOOR ' +
					'FROM_TZ GREATEST GROUP_ID HEXTORAW INITCAP INSTR LAG LAST_DAY LEAD LEAST LENGTH ' +
					'LN LNNVL LOCALTIMESTAMP LOG LOWER LPAD LTRIM MAX MEDIAN MIN MOD MONTHS_BETWEEN ' +
					'NANVL NEW_TIME NEXT_DAY NULLIF NUMTODSINTERVAL NUMTOYMINTERVAL NVL NVL2 POWER ' +
					'RANK RAWTOHEX REMAINDER REPLACE ROUND RPAD RTRIM SESSIONTIMEZONE SIGN SIN SINH ' +
					'SOUNDEX SQLCODE SQLERRM SQRT STDDEV SUBSTR SUM SYS_CONTEXT SYSDATE SYSTIMESTAMP ' +
					'TAN TANH TO_CHAR TO_CLOB TO_DATE TO_DSINTERVAL TO_LOB TO_MULTI_BYTE TO_NCLOB ' +
					'TO_NUMBER TO_SINGLE_BYTE TO_TIMESTAMP TO_TIMESTAMP_TZ TO_YMINTERVAL TRANSLATE ' +
					'TRIM TRUNC TZ_OFFSET UID UPPER USER USERENV VAR_POP VAR_SAMP VARIANCE VSIZE';

	var keywords =	'ABORT ACCEPT ACCESS ADD ARRAY ARRAYLEN AS ASC ASSERT ASSIGN AT AUTHORIZATION BASE_TABLE ' +
					'BEGIN BINARY_INTEGER BODY BY CACHE CASCADE CASE CHAR_BASE CHECK CLOSE CLUSTER CLUSTERS ' +
					'COLAUTH COLUMN COLUMNS COMPRESS CONNECT CONSTANT CONSTRAINT CRASH CURRENT CURRVAL CURSOR CYCLE ' +
					'DATA_BASE DATABASE DBA DEBUGOFF DEBUGON DECIMAL DECLARE DEFAULT DEFINITION DELAY DELTA ' +
					'DESC DIGITS DISPOSE DO ELSE ELSIF END ENTRY EXCEPTION EXCEPTION_INIT EXIT FALSE FETCH FOR ' +
					'FOREIGN FORM FROM FUNCTION GENERIC GOTO GROUP HAVING IDENTIFIED IF INCREMENT INDEX INDEXES ' +
					'INDICATOR INTO IS KEY LEVEL LIMITED LOOP MAXVALUE MINVALUE MODE NATURAL NEW NEXTVAL NOCACHE ' +
					'NOCOMPRESS NOCYCLE NOMAXVALUE NOMINVALUE NULL NUMBER_BASE OF ON OPEN OPTION ORDER OTHERS ' +
					'PACKAGE PARTITION PCTFREE POSITIVE PRAGMA PRIMARY PRIVATE PROCEDURE PUBLIC RAISE RANGE REAL ' +
					'RECORD REFERENCES RELEASE REMR RESOURCE RETURN REVERSE ROWLABEL ROWNUM ROWTYPE RUN SCHEMA ' +
					'SEPARATE SEQUENCE SIZE SMALLINT SPACE SQL START STATEMENT SUBTYPE TABAUTH TABLE TABLES TASK TERMINATE ' +
					'THEN TO TRUE TYPE UNIQUE USE VALUES VIEW VIEWS WHEN WHERE WHILE WITH WORK';

	var operators =	'ALL ALTER AND ANY BETWEEN COMMIT COMMENT CREATE DELETE DISTINCT DROP EXISTS GRANT IN INSERT SELECT SET '+
                    'INTERSECT LIKE MINUS NOT OR OUT PRIOR RENAME REVOKE ROLLBACK SAVEPOINT UNION UPDATE XOR';

	var datatype =	'CHAR VARCHAR VARCHAR2 NUMBER DATE TIMESTAMP';

	this.RL = [
		{ r: D.S.R.DQS,					c: 'string' },			
		{ r: D.S.R.SQS,					c: 'string' },
		{ r: new RegExp('--(.*)$', 'gm'),          c: 'comments' },			
		{ r: new RegExp('[a|]{2}', 'gm'),	       c: 'func' },		
		{ r: new RegExp(this.KW(funcs), 'gm'),	   c: 'func' },		
		{ r: new RegExp(this.KW(operators), 'gm'), c: 'op' },			
		{ r: new RegExp(this.KW(keywords), 'gm'),  c: 'keyword' },		
		{ r: new RegExp(this.KW(datatype), 'gm'),  c: 'datatype' }	
		];

	this.CssClass = 'dp-sql';
};

D.S.B.Sql.prototype	= new D.S.H();
D.S.B.Sql.Aliases	= ['sql'];
