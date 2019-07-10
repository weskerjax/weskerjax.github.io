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
	return Math.sqrt(x * x + y * y);
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



function display(datetime){
	var center = $("center").getBBox();
	var timeStamp = datetime.getTime(); 
	 
	/* 黃道中心 */
	var zodiacCenter = $("zodiac_center").getBBox(); 
	
	 /* 黃道角度，春分為原點 3月21號 */
	var start = new Date(datetime.getFullYear(), 2, 21);
	var end = new Date(datetime.getFullYear()+1, 2, 21);
	if(start > timeStamp){
		end = start;
		start = new Date(datetime.getFullYear()-1, 2, 21);  
	}
	var zodiacAngle = (timeStamp - start) / (end - start) * 360;
	$("zodiac").setAttribute('transform', 'rotate('+[zodiacAngle, center.x, center.y]+')');
	

	/* 太陽角度 */	
	var sunAngle = patchZodiacAngle(zodiacAngle, $("sun").getBBox());
	$("sun").setAttribute('transform', 'rotate('+[-sunAngle, zodiacCenter.x, zodiacCenter.y]+')');
	$("sun").setAttribute('title', datetime.toLocaleDateString());
		
	
	/* 月亮指針角度 */
	var moonPointAngle = ((timeStamp - moonStart) / moonDivisor * 360) % 360; 
	$("moon_point").setAttribute('transform', 'rotate('+[-moonPointAngle, center.x, center.y]+')');
	setMoonPhase(moonPointAngle);
	
	/* 月亮角度 */
	var moonAngle = patchZodiacAngle(zodiacAngle + moonPointAngle, $("moon").getBBox());
	$("moon").setAttribute('transform', 'rotate('+[-moonAngle, zodiacCenter.x, zodiacCenter.y]+')');
	$("moon").setAttribute('title', (moonPointAngle * moonCycle / 360).toFixed(1));

	
	/* 分鐘盤 */
	var minuteRate =  (datetime.getMinutes() + datetime.getSeconds() / 60) / 60; 
	$("minute").setAttribute('transform', 'rotate('+[(-minuteRate * 360), center.x, center.y]+')');
	
	/* 自轉盤 */
	var hourRate =  (datetime.getHours() + datetime.getMinutes() / 60) / 24;
	$("rotation").setAttribute('transform', 'rotate('+[(hourRate * 360), center.x, center.y]+')');

};



window.onload = function(today){
	/* 定時重新載入畫面 */
	setTimeout(function(){ location.reload(); }, 3600 * 1000);

	var mode = 0;
	var interval = 0;
	display(new Date());
	
	setInterval(function() {
		var datetime = new Date();
		
		switch(mode){
			case 1:
				interval += 10; 
				datetime.setMinutes(datetime.getMinutes() + interval);
				break;
			case 2:
				interval += 1440; 
				datetime.setMinutes(datetime.getMinutes() + interval);
				break;
			case 3:
				datetime.setMinutes(datetime.getMinutes() + interval);
				break;			
			default: 
				interval = 0;		
				break;
		}
		
		display(datetime);		
	}, 200);
		
	
	/* 模式切換 */
	$("root").style.cursor = 'pointer';
	$("root").onclick = function() { mode = (mode + 1) % 4 };
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
	
	