var ctx2 = document.getElementById("c2").getContext("2d");
ctx2.scale(4,4);
var W = 32;
var H = 32;

/* draw grid */
for(var i=0; i<32; i+=2){
	ctx2.fillStyle="rgba(0,0,0,0.08)";
	ctx2.fillRect(i, 0, 1, 32);
}
for(var i=0; i<32; i+=2){
	ctx2.fillStyle="rgba(0,0,0,0.08)";
	ctx2.fillRect(0, i, 32, 1);
}

var v0 = {x: 8, y: 28};
var v1 = {x: 15, y: 3};
var v2 = {x: 25, y: 10};

ctx2.fillStyle = "#000";
ctx2.fillRect(8,28,1,1);
ctx2.fillRect(15,3,1,1);
ctx2.fillRect(25,10,1,1);

function edge_fn(v0, v1, p){
	return (v0.y - v1.y)*p.x + (v1.x - v0.x)*p.y + (v0.x*v1.y - v1.x*v0.y);
}

function draw_trig(v0, v1, v2){
	/* triangle bounding box */
	var minX = Math.min(v0.x, v1.x, v2.x);
	var minY = Math.min(v0.y, v1.y, v2.y);
	var maxX = Math.max(v0.x, v1.x, v2.x);
	var maxY = Math.max(v0.y, v1.y, v2.y);

	/* clip to screen coords */
	minX = Math.max(minX, 0);
	minY = Math.max(minY, 0);
	maxX = Math.min(maxX, W-1);
	maxY = Math.min(maxY, H-1);

	ctx2.fillStyle="#f00";
	for(var y=minY; y<=maxY; y++){
		for(var x=minX; x<=maxX; x++){
			p = {x: x, y: y};
			if(edge_fn(v0, v1, p) >= 0 &&
				edge_fn(v1, v2, p) >= 0 &&
				edge_fn(v2, v0, p) >= 0){
				/* put pixel */
				ctx2.fillRect(x, y, 1, 1);
			}
		}
	}
}

draw_trig(v0, v1, v2);
