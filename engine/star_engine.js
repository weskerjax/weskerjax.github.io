var RAD = Math.PI / 180;

function $(id){
	return document.getElementById(id);
}
function $tag(tag){
	return document.getElementsByTagName(tag);
}
function $create(tag){
	return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

/*兩點距離*/
function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/*a邊對應的角度*/
function aSideAngle(a, b, c){
	var ratio = (Math.pow(b,2) + Math.pow(c,2) - Math.pow(a,2)) / (2 * b * c);
	return Math.acos(ratio) / RAD;
}
/*A角度對應的B角度*/
function aAngleAngle(A, a, b){
	return Math.asin(a / b * Math.sin(A * RAD)) / RAD;
}



function Rod(center, mainCenter, line, rod, piston){
	this.rod = rod; 
	this.rodCenter = {
		x: line.x2.baseVal.value,  y: line.y2.baseVal.value
	}; 
	this.piston = piston; 
	this.pistonCenter = {
		x: line.x1.baseVal.value,  y: line.y1.baseVal.value
	}; 

	this.rodWidth  = distance(this.rodCenter.x, this.rodCenter.y, this.pistonCenter.x, this.pistonCenter.y);
	this.width  = distance(mainCenter.x, mainCenter.y, this.pistonCenter.x, this.pistonCenter.y);
	this.radius = distance(center.x, center.y, mainCenter.x, mainCenter.y);
	var edge    = distance(center.x, center.y, this.pistonCenter.x, this.pistonCenter.y);
	
	this.centerAngle = aSideAngle(this.width, this.radius, edge);
	this.pistonAngle = aSideAngle(this.radius, this.width, edge);

	if(center.x < this.pistonCenter.x){
		this.centerAngle = 360 - this.centerAngle;
		this.pistonAngle = -this.pistonAngle;
	}
}

Rod.prototype.rotate = function(rotate, delta){
	var angle = this.centerAngle + rotate;
	var pistonAngle = aAngleAngle(angle, this.radius, this.width);
	var pistonDelta = pistonAngle - this.pistonAngle;
	var rodDelta  = delta - pistonDelta;
	
	var ratio = this.width / this.rodWidth;
	var pistonDelta = pistonDelta * ratio;
	var rodDelta  = rodDelta * ratio;
	
	this.rod.setAttribute('transform','rotate('+[rodDelta, this.rodCenter.x, this.rodCenter.y]+')');
	this.piston.setAttribute('transform','rotate('+[pistonDelta, this.pistonCenter.x, this.pistonCenter.y]+')');
}



function Engine(){
	var line = $("rod_m_line");
	
	this.center = $("center").getBBox();
	this.crankshaft = $("crankshaft");
	
	this.rod = $("rod_m"); 
	this.rodCenter = {
		x: line.x2.baseVal.value,  y: line.y2.baseVal.value
	}; 
	this.piston = $("piston_m"); 
	this.pistonCenter = {
		x: line.x1.baseVal.value,  y: line.y1.baseVal.value
	}; 
	
	this.width  = distance(this.rodCenter.x, this.rodCenter.y, this.pistonCenter.x, this.pistonCenter.y);
	this.radius = distance(this.center.x, this.center.y, this.rodCenter.x, this.rodCenter.y);
	var edge    = distance(this.center.x, this.center.y, this.pistonCenter.x, this.pistonCenter.y);
	
	this.pistonAngle = aSideAngle(this.radius, this.width, edge);
	this.centerAngle = aSideAngle(this.width, this.radius, edge);
	
	
	this.rods = [] 
	this.rods.push(new Rod(this.center, this.rodCenter, $("rod_1_line"), $("rod_1"), $("piston_1"))); 
	this.rods.push(new Rod(this.center, this.rodCenter, $("rod_2_line"), $("rod_2"), $("piston_2"))); 
	this.rods.push(new Rod(this.center, this.rodCenter, $("rod_3_line"), $("rod_3"), $("piston_3"))); 
	this.rods.push(new Rod(this.center, this.rodCenter, $("rod_4_line"), $("rod_4"), $("piston_4"))); 
}

Engine.prototype.rotate = function(rotate){
	this.crankshaft.setAttribute('transform','rotate('+[rotate, this.center.x, this.center.y]+')');
	
	var angle = this.centerAngle + rotate;
	var pistonAngle = aAngleAngle(angle, this.radius, this.width);
	var pistonDelta = pistonAngle - this.pistonAngle;
	var rodDelta  = pistonDelta + rotate; 
	this.rod.setAttribute('transform','rotate('+[-rodDelta, this.rodCenter.x, this.rodCenter.y]+')');
	this.piston.setAttribute('transform','rotate('+[pistonDelta, this.pistonCenter.x, this.pistonCenter.y]+')');
	
	var i = this.rods.length;
	while(i--){ this.rods[i].rotate(rotate, pistonDelta); }
}




window.onload = function(){
	var engine = new Engine();
	var rotate = 0;
	var speed = 5;
	var dire = 1;
	
	var svg = $tag('svg')[0];
	var text = $create('text');
	text.setAttribute('x','0');
	text.setAttribute('y','80');
	text.setAttribute('style','font-size:80px');
	text.innerHTML = 'Speed: '+speed;
	svg.appendChild(text);
	
	svg.style.cursor = 'pointer';
	svg.onclick = function() {
		speed = (speed + dire * 5 );
		text.innerHTML = 'Speed: '+speed;
		if(speed == 50){ dire = -1; }
		else if(speed == 0){ dire = 1; }
		
//		rotate = (rotate+ 10);
//		engine.rotate(rotate);
	};
	
	setInterval(function(){
		rotate = (rotate + speed) % 360;
		engine.rotate(rotate);
	}, 50);
};
	
	