var ctx3 = document.getElementById("c3").getContext("2d");

/* draw grid */
ctx3.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<256; i+=32){
	ctx3.fillRect(i, 0, 16, 256);
}
for(var i=0; i<256; i+=32){
	ctx3.fillRect(0, i, 256, 16);
}

/* put pixel center dots */
ctx3.fillStyle="rgba(0,0,0,1)";
for(var i=7; i<256; i+=16){
	for(var j=7; j<256; j+=16){
		ctx3.fillRect(i, j, 2, 2);
	}
}

var v0 = {x: 1, y: 1};
var v1 = {x: 15, y: 5};
var v2 = {x: 3, y: 7};

/* draw triangle */
ctx3.beginPath();
ctx3.moveTo(v0.x*16, v0.y*16);
ctx3.lineTo(v1.x*16, v1.y*16);
ctx3.lineTo(v2.x*16, v2.y*16);
ctx3.lineTo(v0.x*16, v0.y*16);
ctx3.lineWidth = 1;
ctx3.strokeStyle = "rgba(255, 0, 0, 0.9)";
ctx3.stroke();

function edge_fn(v0, v1, p){
	return (v0.y - v1.y)*p.x + (v1.x - v0.x)*p.y + (v0.x*v1.y - v1.x*v0.y);
}

for(var i=0; i<16; i++){
	for(var j=0; j<8; j++){
		p = {x: i, y: j};
		if(edge_fn(v0, v1, p) >= 0 &&
			edge_fn(v1, v2, p) >= 0 &&
			edge_fn(v2, v0, p) >= 0){
			/* put pixel */
			ctx3.fillStyle="rgba(255, 0, 0, 0.3)";
			ctx3.fillRect(i*16, j*16, 16, 16);
		}
	}
}
