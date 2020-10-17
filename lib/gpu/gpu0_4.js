var ctx4 = document.getElementById("c4").getContext("2d");

/* draw grid */
ctx4.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<256; i+=32){
	ctx4.fillRect(i, 0, 16, 256);
}
for(var i=0; i<256; i+=32){
	ctx4.fillRect(0, i, 256, 16);
}

/* put pixel center dots */
ctx4.fillStyle="rgba(0,0,0,1)";
for(var i=7; i<256; i+=16){
	for(var j=7; j<256; j+=16){
		ctx4.fillRect(i, j, 2, 2);
	}
}

var step = 256;

var v0 = {x: 1*step, y: 1*step};
var v1 = {x: 15*step, y: 5*step};
var v2 = {x: 3*step, y: 7*step};

/* draw triangle */
ctx4.beginPath();
ctx4.moveTo(v0.x/16, v0.y/16);
ctx4.lineTo(v1.x/16, v1.y/16);
ctx4.lineTo(v2.x/16, v2.y/16);
ctx4.lineTo(v0.x/16, v0.y/16);
ctx4.lineWidth = 1;
ctx4.strokeStyle = "rgba(255, 0, 0, 0.9)";
ctx4.stroke();

function edge_fn(v0, v1, p){
	return (v0.y - v1.y)*p.x + (v1.x - v0.x)*p.y + (v0.x*v1.y - v1.x*v0.y);
}

function put_pixel(p){
	var x = (p.x & ~255) / 16;
	var y = (p.y & ~255) / 16;
	ctx4.fillRect(x, y, 16, 16);
}

ctx4.fillStyle="rgba(255, 0, 0, 0.3)";
for(var i = step/2; i < 16*step; i += step){
	for(var j = step/2; j < 8*step; j += step){
		p = {x: i, y: j};
		if(edge_fn(v0, v1, p) >= 0 &&
			edge_fn(v1, v2, p) >= 0 &&
			edge_fn(v2, v0, p) >= 0){
			put_pixel(p);
		}
	}
}
