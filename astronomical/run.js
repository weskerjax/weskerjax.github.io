var RAD = Math.PI / 180;
var moonCycle = 29.53; /* 月亮週期 29.53 天 */
var moonDivisor = moonCycle * 86400 * 1000;
var moonStart = (new Date('2015/11/12')).getTime(); /* 農曆初一 */


function $(id){
	return document.getElementById(id);
}
function $tag(tag){
	return document.getElementsByTagName(tag);
}
function $create(tag){
	return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function distance(p1, p2){
	var x = (p1.x + p1.width / 2)  - (p2.x + p2.width / 2);   
	var y = (p1.y + p1.height / 2) - (p2.y + p2.height / 2);   
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/* 修補黃道角度 */
function patchZodiacAngle(angle, point){
	var center = $("zodiac_center").getBBox();
	var dist = distance(center, $("center").getBBox());
	var radius = distance(center, point); /* 黃道半徑 */
	var drop = Math.asin(dist / radius) / RAD; /* 黃道落差角度 */
	var height = dist * Math.cos(angle * RAD);
	return angle + drop - Math.asin(height / radius) / RAD;
}

/* 設定月相 */
function setMoonPhase(angle){
	var moon = $('moon');
	var bbox = moon.getBBox();

	var maskPath = $('moon_mask_path');
	if(!maskPath){
		maskPath = $create('path');		
		maskPath.id = 'moon_mask_path'; 
		maskPath.setAttribute('fill','white');
		maskPath.setAttribute('transform','rotate('+[30, bbox.x + bbox.width / 2,  bbox.y + bbox.height / 2]+')');	
		
		var mask = $create('mask');
		mask.id = 'moon_mask'; 
		mask.appendChild(maskPath);
		moon.appendChild(mask);
		
		$('moon_light').setAttribute('mask','url(#moon_mask)');
	}
	
	var left = bbox.width * 0.68;  
	var right = bbox.width * 0.68;  
	
	if(angle < 180){
		right *= Math.cos((180-angle)*RAD); 
	}else{
		left  *= Math.cos((180-angle)*RAD);
	}
	
	maskPath.setAttribute('d',[
		'M', (bbox.x + bbox.width / 2), bbox.y,
		'c'+[right, 0], [right, bbox.width], [0, bbox.width],
		'c'+[-left, 0], [-left, -bbox.width], [0, -bbox.width],
		'z'
	].join(' '));
}



function init(todayStamp){
	var center = $("center").getBBox();
	var today = new Date(todayStamp);
	 
	/* 黃道中心 */
	var zodiacCenter = $("zodiac_center").getBBox(); 
	
	 /* 黃道角度，春分為原點 3月21號 */
	var start = new Date(today.getFullYear(), 2, 21);
	var end = new Date(today.getFullYear()+1, 2, 21);
	if(start > todayStamp){
		end = start;
		start = new Date(today.getFullYear()-1, 2, 21);  
	}
	var zodiacAngle = (todayStamp - start) / (end - start) * 360;
	$("zodiac").setAttribute('transform','rotate('+[zodiacAngle, center.x, center.y]+')');
	

	/* 太陽角度 */	
	var sunAngle = patchZodiacAngle(zodiacAngle, $("sun").getBBox());
	$("sun").setAttribute('transform','rotate('+[-sunAngle, zodiacCenter.x, zodiacCenter.y]+')');
	$("sun").setAttribute('title',today.toLocaleDateString());
		
	
	/* 月亮指針角度 */
	var moonPointAngle = ((todayStamp - moonStart) / moonDivisor * 360) % 360; 
	$("moon_point").setAttribute('transform','rotate('+[-moonPointAngle, center.x, center.y]+')');
	setMoonPhase(moonPointAngle);
	
	/* 月亮角度 */
	var moonAngle = patchZodiacAngle(zodiacAngle + moonPointAngle, $("moon").getBBox());
	$("moon").setAttribute('transform','rotate('+[-moonAngle, zodiacCenter.x, zodiacCenter.y]+')');
	$("moon").setAttribute('title', (moonPointAngle * moonCycle / 360).toFixed(1));
	

	var rotation = $("rotation"); /* 自轉 */
	var minute = $("minute");
	
	/* 更新畫面 */
	var timerId;
	(function refresh() {
		var delta = (Date.now() - todayStamp) / 1000 * 360;
		
		/* 分鐘盤 */
		delta = delta / 3600; 
		minute.setAttribute('transform','rotate('+[(-delta % 360), center.x, center.y]+')');
		
		/* 自轉盤 */
		delta = delta / 24; 
		rotation.setAttribute('transform','rotate('+[(delta % 360), center.x, center.y]+')');
			
		clearTimeout(timerId);
		timerId = setTimeout(refresh, 1000);
	})();
};




window.onload = function(today){
	/* 定時重新載入畫面 */
	setTimeout(function(){ location.reload(); }, 3600 * 1000);
	
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	init(today.getTime());	
	
	var stamp = today.getTime();
	var timerId = null;
	$("sun").style.cursor = 'pointer';
	$("sun").onclick = function() {
		if(timerId){
			clearInterval(timerId);  
			timerId = null;
		}else{
			timerId = setInterval(function(){
				init(stamp += (86400 * 1000));	
			}, 200);
		}
	};
};

	
	
/**#############################################################*/

/* 驗證[農曆初一]偏差值 */
function checkMoonStart(){
	var start = new Date('2015/11/12 00:00:00');
	var list = [
		'2015/12/11',
		'2016/1/10',
		'2016/2/8',
		'2016/3/9',
		'2016/4/7',
	];
	
	for (var i=0; i < list.length; i++){
		start.setTime(start.getTime() + moonDivisor);
		var dateStr = start.toLocaleDateString();
		console.log(list[i] == dateStr, dateStr, list[i]);
	};
}
//checkMoonStart();
	
	