(function () {
	function $e(name, props) {
		var el = document.createElement(name);
		if (props) { Object.assign(el, props); }
		return el;
	};

	function $toolbar(h) {
		var div = $e('div', { className: 'tools' });

		div.appendChild($e('a', {
			innerHTML: '原始碼',
			href: '#',
			onclick: function () {
				var code = h.code.replace(/</g, '&lt;');
				var wnd = window.open('', '_blank', 'width=750, height=400, location=0, resizable=1, menubar=0, scrollbars=0');
				wnd.document.write('<textarea style="width:99%;height:99%">' + code + '</textarea>');
				wnd.document.close();

				return false;
			}
		}));
		return div;
	};

	function normalize(code) {
		var tabSize = 4, tab = '\t', min = 999;
		var tmp = code.replace(/<br\s*\/?>/gi, '\n');

		/* Tab to Spaces */
		tmp = tmp.replace(/.+/mg, function (line) {
			var pos = 0;
			while ((pos = line.indexOf(tab)) != -1) {
				var num = tabSize - pos % tabSize;
				line = line.replace(tab, ' '.repeat(num))
			}
			return line;
		});

		/* 移除開頭的縮排 */
		tmp.replace(/.*[\r\n]?/g, function (line) {
			if (!/\S/.test(line)) { return; }
			var m = line.match(/^\s*/)[0];
			min = Math.min(min, m.length);
		});
		if (min > 0) {
			tmp = tmp.replace(/.+/mg, function (line) { return line.substr(min); });
		}

		/* 空白行處理，移除前後的空行 */
		tmp = tmp.replace(/.+/mg, function (line) { return /\S/.test(line) ? line : ''; });
		tmp = tmp.replace(/^\n+/, '').replace(/\n+$/, '');

		return tmp;
	};


	/* Match object */
	function Match(value, index, css) {
		this.value = value;
		this.index = index;
		this.length = value.length;
		this.css = css;
	}


	/**#############################################################################*/

	var B = {}; /*Brushes*/
	var MLCC = new RegExp('/\\*[\\s\\S]*?\\*/', 'gm'); // 多行註解 */
	var SLCC = new RegExp('//.*$', 'gm'); /* 單行註解 */
	var DQS = new RegExp('"(?:\\.|(\\\\\\")|[^\\""\\n])*"', 'g');/* 雙引號字串 */
	var SQS = new RegExp("'(?:\\.|(\\\\\\')|[^\\''\\n])*'", 'g');/* 單引號字串 */
	var XDQS = new RegExp('"(?:\\.|(\\\\\\")|[^\\""])*"', 'g');/* 跨行雙引號字串 */

	function kw(str, mod) {
		return new RegExp('\\b' + str.replace(/ /g, '\\b|\\b') + '\\b', mod);
	}


	/**=[ none ]====================================================================================*/
	B.none = function (sunclass) {
		if (sunclass) {
			sunclass.prototype = new B.none();
			return sunclass;
		}
		this.addControls = true;
		this.noGutter = false;
	};

	B.none.prototype.addBit = function (str, css) {
		if (!str) { return; }

		str = str.replace(/[ ]{2}/g, ' &nbsp;');
		str = str.replace(/</g, '&lt;');

		var ls = str.split('\n');
		for (var i = 0; i < ls.length; i++) {
			if (i > 0) { this.div.appendChild($e('br')); }
			this.div.appendChild($e('span', { className: css, innerHTML: ls[i] }));
		}
	};

	B.none.prototype.toLi = function () {
		var ls = this.div.innerHTML.split(/<br\/?>/);
		this.div.innerHTML = '';

		for (var i = 0, l = ls.length; i < l; i++) {
			var li = $e('li');
			li.appendChild($e('span', { innerHTML: ls[i] + '&nbsp;' }));
			this.ol.appendChild(li);
		}
	};

	B.none.prototype.matchCode = function (r, css) {
		var m = null;
		while (m = r.exec(this.code)) {
			this.mes.push(new Match(m[0], m.index, css));
		}
	};

	B.none.prototype.execRegexList = function () {
		if (!Array.isArray(this.RL)) { return }

		for (var i = 0; i < this.RL.length; i++) {
			this.matchCode(this.RL[i].r, this.RL[i].c);
		}
	};

	B.none.prototype.highlight = function (code) {
		this.code = normalize(code || '');

		this.div = $e('div', { className: 'dp-highlighter', h: this });
		this.bar = $e('div', { className: 'bar' });
		this.ol = $e('ol', { className: this.CssClass });

		if (this.noGutter) { this.div.className += ' nogutter'; }
		if (this.addControls) { this.bar.appendChild($toolbar(this)); }

		this.mes = [];
		this.execRegexList();

		/* 排序匹配項 */
		this.mes.sort(function (a, b) {
			return (a.index - b.index) || (b.length - a.length); /* index ASC, length DESC */
		});

		/* 去除重疊 */
		for (var i = this.mes.length - 1; i > 0; i--) {
			for (var j = i - 1; j >= 0; j--) {
				var end = this.mes[j].index + this.mes[j].length;
				if (this.mes[i].index < end) { this.mes[i] = null; break; }
			}
		}

		/* 將匹配與不匹配的內容混合 */
		var pos = 0;
		for (var i = 0, l = this.mes.length; i < l; i++) {
			var m = this.mes[i];
			if (!m) { continue; }

			this.addBit(this.code.substring(pos, m.index), '');
			this.addBit(m.value, m.css);

			pos = m.index + m.length;
		}

		this.addBit(this.code.substr(pos), '');
		this.toLi();
		this.div.appendChild(this.bar);
		this.div.appendChild(this.ol);
	};


	/**=[ SQL ]====================================================================================*/
	B.sql = B.none(function () {
		var funcs =
			'MD5 PASSWORD ENCRYPT SHA1 SHA DECODE ENCODE AES_DECRYPT AES_ENCRYPT GROUP_CONCAT COUNT ' +
			'DES_DECRYPT DES_ENCRYPT COMPRESS UNCOMPRESS UNCOMPRESSED_LENGTH MAX MIN LEFT ' +
			'FOREIGN_KEY_CHECKS NAMES';

		var keywords =
			'ACTION AFTER AS ASC AUTO_INCREMENT BEFORE BEGIN BY CASCADE CASE CHARACTER ' +
			'COLLATE CONNECTION DATABASE DEFAULT DELAYED DELIMITER DESC DETERMINISTIC ' +
			'EACH ELSE END END ENGINE FOR FOREIGN FROM GROUP IF INDEX INNER ' +
			'INTO JOIN JOIN KEY KEY LOW_PRIORITY NEW NO NULL NULL OLD ON ON ORDER ' +
			'PRIMARY PROCEDURE PROCEDURE REFERENCES RESTRICT ROW SEPARATOR TABLE THEN ' +
			'TRIGGER USE USING VALUE VALUES WHEN WHERE UNSIGNED';

		var operators =
			'SELECT SET DROP EXISTS CREATE COMMENT NOT UPDATE DISTINCT DELETE ALTER UNION INSERT REPLACE';

		var datatype =
			'DATE TEXT DATETIME INT CHAR VARCHAR INTEGER FLOAT';

		this.RL = [
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /--(.*)$/gm, c: 'comments' },
			{ r: kw(funcs, 'gm'), c: 'func' },
			{ r: kw(operators, 'gm'), c: 'op' },
			{ r: kw(keywords, 'gm'), c: 'keyword' },
			{ r: kw(datatype, 'gm'), c: 'datatype' }
		];		
	});


	/**=[ PHP ]====================================================================================*/
	B.php = B.none(function () {
		var funcs =
			'abs acos acosh addcslashes addslashes array_[a-z_]* atan atan2 atanh ' +
			'base_convert base64_[a-z_]* basename bcadd bccomp bcdiv ' +
			'bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno ' +
			'bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate ' +
			'checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists ' +
			'closedir closelog copy cos cosh count count_chars date decbin dechex ' +
			'decoct deg2rad delete dirname ebcdic2ascii end ereg[a-z_]* error_[a-z_]* ' +
			'escapeshellarg escapeshellcmd eval exec exit exp explode var_dump ' +
			'extension_loaded feof fflush fgetc fgetcsv fgets fgetss file[a-z_]* floatval ' +
			'flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread ' +
			'fscanf fseek fsockopen fstat ftell ftok fclose tmpfile popen pclose get[a-z_]* glob gmdate gmmktime ' +
			'ini_[a-z_]* interface_exists intval ip2long is_[a-z_]* max min mkdir mktime nl2br ' +
			'parse_[a-z_]* passthru pathinfo print_r readlink realpath rewind rewinddir ' +
			'rmdir round str[a-z_]* substr[a-z_]* image[a-z_]* in_array md5 uniqid rand ' +
			'mt_srand microtime session_start sprintf mysqli_[a-z_]* join rawurldecode ' +
			'iconv pack trim htmlspecialchars mb_[a-z_]* curl_[a-z_]* preg_[a-z_]*';

		var keywords =
			'and or xor __FILE__ __LINE__ array as break case null parent ' +
			'cfunction class const continue declare default die do echo else true false ' +
			'elseif empty enddeclare endfor endforeach endif endswitch endwhile ' +
			'extends for foreach function include include_once global if ' +
			'new old_function return static switch use require require_once ' +
			'var while __FUNCTION__ __CLASS__ ' +
			'__METHOD__ abstract interface public implements extends private protected throw ' +
			'isset unset header double try catch';

		this.RL = [
			{ r: SLCC, c: 'comment' },
			{ r: MLCC, c: 'comments' },
			{ r: XDQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /(\&lt;|<)[?]php|[?](\&gt;|>)/gm, c: 'tag' },// php tag
			{ r: /\\$\\w+/g, c: 'vars' },
			{ r: kw(funcs, 'gmi'), c: 'func' },
			{ r: kw(keywords, 'gm'), c: 'keyword' }
		];
	});


	/**=[ Python ]====================================================================================*/
	B.py = B.none(function () {
		var keywords =
			'and assert break class continue def del elif else except exec ' +
			'finally for from global if import in is lambda not or object pass print ' +
			'raise return try yield while';

		this.RL = [
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /#.*$/gm, c: 'comment' },
			{ r: /[A-Z][a-z]+/gm, c: 'func' },
			{ r: kw(keywords, 'gm'), c: 'keyword' }
		];
	});


	/**=[ JavaScript ]====================================================================================*/
	B.js = B.none(function () {
		var keywords =
			'abstract boolean break byte case catch char class const continue debugger ' +
			'default delete do double else enum export extends false final finally float ' +
			'for function goto if implements import in instanceof int interface let long native ' +
			'new null package private protected public return short static super switch ' +
			'synchronized this throw throws transient true try typeof var void volatile while with';

		this.RL = [
			{ r: SLCC, c: 'comment' },
			{ r: MLCC, c: 'comments' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /^\\s*#.*/gm, c: 'preprocessor' },
			{ r: /[A-Z][a-z]+/gm, c: 'func' },
			{ r: kw(keywords, 'gm'), c: 'keyword' },
		];
	});


	/**=[ Java ]====================================================================================*/
	B.java = B.none(function () {
		var keywords =
			'abstract assert boolean break byte case catch char class const ' +
			'continue default do double else enum extends ' +
			'false final finally float for goto if implements import ' +
			'instanceof int interface long native new null ' +
			'package private protected public return ' +
			'short static strictfp super switch synchronized this throw throws true ' +
			'transient try void volatile while';

		this.RL = [
			{ r: SLCC, c: 'comment' },
			{ r: MLCC, c: 'comments' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi, c: 'value' },
			{ r: /(?!\@interface\b)\@[\$\w]+\b/g, c: 'preprocessor' },
			{ r: /\@interface\b/g, c: 'preprocessor' },
			{ r: /\b[A-Z]\w+\b/g, c: 'func' },
			{ r: kw(keywords, 'gm'), c: 'keyword' },
		];
	});


	/**=[ XML,HTML ]====================================================================================*/
	B.xml = B.none(function () {
		this.execRegexList = function () {
			var r, m;

			// Match CDATA in the following format <![ ... [ ... ]]>
			this.matchCode(new RegExp('(\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\&gt;|>)', 'gm'), 'cdata');

			// Match comments
			this.matchCode(new RegExp('(\&lt;|<)!--\\s*.*?\\s*--(\&gt;|>)', 'gm'), 'comments');

			// Match attributes and their values
			r = new RegExp('([:\\w-\.]+)\\s*=\\s*(".*?"|\'.*?\'|\\w+)*|(\\w+)', 'gm');
			while (m = r.exec(this.code)) {
				if (m[1]) { this.mes.push(new Match(m[1], m.index, 'attribute')); }
				if (m[2]) { this.mes.push(new Match(m[2], m.index + m[0].indexOf(m[2]), 'attribute-value')); }
			}

			// Match opening and closing tag brackets
			this.matchCode(new RegExp('(\&lt;|<)/*\\?*(?!\\!)|/*\\?*(\&gt;|>)', 'gm'), 'tag');

			// Match tag names
			r = new RegExp('(?:\&lt;|<)/*\\?*\\s*([:\\w-\.]+)', 'gm');
			while (m = r.exec(this.code)) {
				this.mes.push(new Match(m[1], m.index + m[0].indexOf(m[1]), 'tag-name'));
			}
		};
	});


	/**=[ VB,ASP ]====================================================================================*/
	B.vb = B.none(function () {
		var funcs =
			'createobject dateadd deletefile fileexists ' +
			'inputbox ipmt movefile msgbox ppmt rgb union';

		var keywords =
			'array as boolean byte const date dim do double ' +
			'each else elseif end exit false for function if ' +
			'in integer long loop mod new next nothing object ' +
			'set single step string sub then to true until ' +
			'variant while with';
 
		this.RL = [
			{ r: /^[ ]*\'(.*)$/gm, c: 'comments' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: kw(funcs, 'igm'), c: 'func' },
			{ r: kw(keywords, 'igm'), c: 'keyword' },
			{ r: /(\&lt;|<)[%]|[%](\&gt;|>)/gm, c: 'tag' }
		];
	});


	/**=[ C# ]====================================================================================*/
	B.cs = B.none(function () {
		var objClass =
			'EventArgs DateTime ActionResult FileStream ' +
			'WebResponse WebRequest StreamReader Directory Int32 ' +
			'Encoding Regex WebException List Path File XDocument XmlReader ' +
			'HttpUtility String Image ImageFormat ImageAnimator IntPtr ' +
			'NameValueCollection ArgumentNullException HttpValueCollection ' +
			'Serializable Exception Bitmap Graphics Expression Func PredicateBuilder';

		var keywords =
			'var abstract as base bool break byte case catch char checked class const ' +
			'continue decimal default delegate do double else enum event explicit ' +
			'extern false finally fixed float for foreach get goto if implicit in int ' +
			'interface internal is lock long namespace new null object operator out ' +
			'override params private protected public readonly ref return sbyte sealed set ' +
			'short sizeof stackalloc static string struct switch this throw true try ' +
			'typeof uint ulong unchecked unsafe ushort using virtual void while';

		this.RL = [
			{ r: SLCC, c: 'comment' },
			{ r: MLCC, c: 'comments' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: kw(objClass, 'gm'), c: 'func' },
			{ r: kw(keywords, 'gm'), c: 'keyword' },
			{ r: /^\\s*#.*/gm, c: 'preprocessor' }
		];
	});


	/**=[ Config ]====================================================================================*/
	B.cfg = B.none(function () {
		this.RL = [
			{ r: /(\&gt;|>)/gm, c: 'gt' },
			{ r: /\[#;](.*)$/gm, c: 'comments' },
			{ r: /^[a-z]+[a-z_\.]* /gmi, c: 'keyword' },
			{ r: /^[ ]*[a-z_]+[ ]*=/gmi, c: 'value' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' }
		];
	});


	/**=[ sh,bash ]====================================================================================*/
	B.sh = B.none(function () {
		var keywords =
			'apt-get cat cd cp curl do done echo else exit export ' +
			'fi for ftp grep if in install ln ls make mkdir mke2fs mv mysql mysqldump ' +
			'rm sfdisk sleep sudo tar then tr wget while';

		this.RL = [
			{ r: /^[ \t]*\#(.*)$/gm, c: 'comments' },
			{ r: /[a-z_]+=/gmi, c: 'func' },
			{ r: /\$[a-z_]+/gmi, c: 'value' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: kw(keywords, 'gm'), c: 'keyword' }
		];
	});


	/**=[ CSS ]====================================================================================*/
	B.css = B.none(function () {
		this.execRegexList = function () {
			var r1, r2, m1, m2;
			// Match xml comments
			this.matchCode(MLCC, 'comments');
			this.matchCode(/!important/g, 'important');

			/* 匹配 '{' 至 '}' 之間的文字 */
			r1 = new RegExp('\{[^}]+\}', 'gm');
			/* 匹配 'xxx:xxx[;\n\(!]' 格式的文字 */
			r2 = new RegExp('([@:\\w-\.]+)\\s*:\\s*([^;\n\(!]+)[;\n\(!]', 'gm');
			while (m1 = r1.exec(this.code)) {
				while (m2 = r2.exec(m1[0])) {
					this.mes.push(new Match(m2[1], m1.index + m2.index, 'func'));
					this.mes.push(new Match(m2[2], m1.index + m2.index + m2[0].indexOf(m2[2]), 'value'));
				}
			}
			/* Match attributes and their values */
			r1 = new RegExp('^([\\s\\w\.#*:+-]+)[,\{\n]', 'gm'); 
			while (m1 = r1.exec(this.code)) {
				this.mes.push(new Match(m1[1], m1.index, 'keyword'));
			}
		};
	});


	/**=[ C++ ]====================================================================================*/
	B.c = B.none(function () {
		var funcs =
			'malloc calloc realloc free ' +
			'fclose feof fopen fprintf fscanf printf remove rename rewind scanf ftell fseek fnmatch ' +
			'strlen strcpy strcat strstr strtok ' +
			'opendir readdir closedir ' +
			'dirname';

		var datatypes =
			'NULL BOOL BOOLEAN BYTE CHAR DIR FLOAT FILE char bool short int __int\\d+ long float double dirent';

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
			{ r: SLCC, c: 'comment' },
			{ r: MLCC, c: 'comments' },
			{ r: DQS, c: 'string' },
			{ r: SQS, c: 'string' },
			{ r: /^ *#\\w*/gm, c: 'keyword' },
			{ r: kw(funcs, 'gm'), c: 'func' },
			{ r: kw(datatypes, 'gm'), c: 'datatypes' },
			{ r: kw(keywords, 'gm'), c: 'keyword' }
		];
	});


	/**#############################################################################*/

	var els = document.querySelectorAll('pre[name="code"]');
	if (els.length == 0) { return; }

	for (var i = 0, l = els.length; i < l; i++) {
		var el = els[i];
		var op = el.className.toLowerCase();
		var lang = op.split(':')[0];
		if (!B[lang]) { lang = 'none';}

		var h = new B[lang](); /* 加亮物件 */
		h.CssClass = 'dp-' + lang;
		h.addControls = !op.includes('nocontrols');
		h.noGutter = op.includes('nogutter');
		h.source = el;
		h.highlight(el.innerHTML);

		el.style.display = 'none';
		el.parentNode.insertBefore(h.div, el);
	}
})();

