
function $(id){
	return document.getElementById(id);
}
function $tag(tag){
	return document.getElementsByTagName(tag);
}
function $create(tag){
	return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function updateRotate(angle){
	var center = $("center").getBBox();
	var pCenter = $("piston_center").getBBox();
	var pAngle = -(angle * 34 / 51);
	
	$("crankshaft").setAttribute('transform','rotate('+[angle, center.x, center.y]+')');
	$("piston").setAttribute('transform','rotate('+[pAngle, pCenter.x, pCenter.y]+')');
};


window.onload = function(){
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
	};
	
	setInterval(function(){
		rotate = (rotate + speed) % 360;
		updateRotate(rotate);
	}, 50);
};

	
	
	