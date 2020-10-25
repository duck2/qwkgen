var ctx6 = document.getElementById("c6").getContext("2d");

/* draw grid */
ctx6.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<256; i+=32){
	ctx6.fillRect(i, 0, 16, 256);
}
for(var i=0; i<256; i+=32){
	ctx6.fillRect(0, i, 256, 16);
}

/* put pixel center dots */
ctx6.fillStyle="rgba(0,0,0,1)";
for(var i=7; i<256; i+=16){
	for(var j=7; j<256; j+=16){
		ctx6.fillRect(i, j, 2, 2);
	}
}

var v0 = {x: 13.5, y: 5.5};
var v1 = {x: 15.5, y: 5.5};
var v2 = {x: 13.5, y: 7.5};
var v3 = {x: 15.5, y: 7.5};
var v4 = {x: 7, y: 4};
var v5 = {x: 1, y: 6};
var v6 = {x: 5, y: 6};
var v7 = {x: 8, y: 7};
var v8 = {x: 9.5, y: 5.5};

var t0 = {v0: v0, v1: v1, v2: v2, color: "rgba(255, 0, 0, 0.3)"};
var t1 = {v0: v1, v1: v3, v2: v2, color: "rgba(0, 255, 0, 0.3)"};
var t2 = {v0: v4, v1: v6, v2: v5, color: "rgba(255, 0, 0, 0.3)"};
var t3 = {v0: v4, v1: v7, v2: v6, color: "rgba(0, 255, 0, 0.3)"};
var t4 = {v0: v4, v1: v8, v2: v7, color: "rgba(0, 0, 255, 0.3)"};
var trigs = [t0, t1, t2, t3, t4];

/* draw triangles */
for(var i = 0; i < trigs.length; i++){
	var t = trigs[i];
	ctx6.beginPath();
	ctx6.moveTo(t.v0.x*16, t.v0.y*16);
	ctx6.lineTo(t.v1.x*16, t.v1.y*16);
	ctx6.lineTo(t.v2.x*16, t.v2.y*16);
	ctx6.lineTo(t.v0.x*16, t.v0.y*16);
	ctx6.lineWidth = 1;
	ctx6.strokeStyle = t.color;
	/* too lazy to add line style field */
	ctx6.stroke();
	ctx6.stroke();
}

function edge_fn(x0, y0, x1, y1, x, y){
	return (y0 - y1)*x + (x1 - x0)*y + (x0*y1 - x1*y0);
}

function is_top_left(x0, y0, x1, y1){
	if(y0 == y1 && x0 < x1) return true;
	else if(y0 > y1) return true;
	else return false;
}

function draw_trig(v0, v1, v2, color){
	/* clamp to nearest subpixel */
	var x0 = Math.round(v0.x * 256);
	var y0 = Math.round(v0.y * 256);
	var x1 = Math.round(v1.x * 256);
	var y1 = Math.round(v1.y * 256);
	var x2 = Math.round(v2.x * 256);
	var y2 = Math.round(v2.y * 256);

	/* triangle bounding box */
	var minX = Math.min(x0, x1, x2);
	var minY = Math.min(y0, y1, y2);
	var maxX = Math.max(x0, x1, x2);
	var maxY = Math.max(y0, y1, y2);

    /* clip to screen coords */
	minX = Math.max(minX, 0);
	minY = Math.max(minY, 0);
	maxX = Math.min(maxX, (W-1)<<8);
	maxY = Math.min(maxY, (H-1)<<8);

	/* replace fractional part with 128 to sample from center */
	minX = (minX & ~255) + 128;
	minY = (minY & ~255) + 128;
	maxX = (maxX & ~255) + 128;
	maxY = (maxY & ~255) + 128;

	/* fill rules */
	var bias0 = is_top_left(x1, y1, x2, y2) ? 0 : -1;
	var bias1 = is_top_left(x2, y2, x0, y0) ? 0 : -1;
	var bias2 = is_top_left(x0, y0, x1, y1) ? 0 : -1;

	for(var y=minY; y<=maxY; y+=256){
		for(var x=minX; x<=maxX; x+=256){
			var w0 = edge_fn(x1, y1, x2, y2, x, y) + bias0;
			var w1 = edge_fn(x2, y2, x0, y0, x, y) + bias1;
			var w2 = edge_fn(x0, y0, x1, y1, x, y) + bias2;
			if(w0 >= 0 && w1 >= 0 && w2 >= 0){
				/* remove fractional part before putting pixel */
				ctx6.fillStyle = color;
				ctx6.fillRect((x >> 8) * 16, (y >> 8) * 16, 16, 16);
			}
		}
	}
}

for(var i=0; i<trigs.length; i++){
	var t = trigs[i];
	draw_trig(t.v0, t.v1, t.v2, t.color);
}

