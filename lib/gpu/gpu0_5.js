var ctx5 = document.getElementById("c5").getContext("2d");

/* draw grid */
ctx5.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<256; i+=32){
	ctx5.fillRect(i, 0, 16, 256);
}
for(var i=0; i<256; i+=32){
	ctx5.fillRect(0, i, 256, 16);
}

/* put pixel center dots */
ctx5.fillStyle="rgba(0,0,0,1)";
for(var i=7; i<256; i+=16){
	for(var j=7; j<256; j+=16){
		ctx5.fillRect(i, j, 2, 2);
	}
}

var v0 = {x: 13.5, y: 5.5};
var v1 = {x: 15.5, y: 5.5};
var v2 = {x: 13.5, y: 7.5};
var v3 = {x: 15.5, y: 7.5};

/* draw triangle */
ctx5.beginPath();
ctx5.moveTo(v0.x*16, v0.y*16);
ctx5.lineTo(v1.x*16, v1.y*16);
ctx5.lineTo(v2.x*16, v2.y*16);
ctx5.lineTo(v0.x*16, v0.y*16);
ctx5.lineWidth = 1;
ctx5.strokeStyle = "rgba(255, 0, 0, 0.9)";
ctx5.stroke();

/* draw triangle */
ctx5.beginPath();
ctx5.moveTo(v1.x*16, v1.y*16);
ctx5.lineTo(v2.x*16, v2.y*16);
ctx5.lineTo(v3.x*16, v3.y*16);
ctx5.lineTo(v1.x*16, v1.y*16);
ctx5.lineWidth = 1;
ctx5.strokeStyle = "rgba(0, 255, 0, 0.9)";
ctx5.stroke();

function edge_fn(x0, y0, x1, y1, x, y){
	return (y0 - y1)*x + (x1 - x0)*y + (x0*y1 - x1*y0);
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

	for(var y=minY; y<=maxY; y+=256){
		for(var x=minX; x<=maxX; x+=256){
			if(edge_fn(x0, y0, x1, y1, x, y) >= 0 &&
				edge_fn(x1, y1, x2, y2, x, y) >= 0 &&
				edge_fn(x2, y2, x0, y0, x, y) >= 0){
				/* remove fractional part before putting pixel */
				ctx5.fillStyle = color;
				ctx5.fillRect((x >> 8) * 16, (y >> 8) * 16, 16, 16);
			}
		}
	}
}

draw_trig(v0, v1, v2, "rgba(255, 0, 0, 0.3)");
draw_trig(v1, v3, v2, "rgba(0, 255, 0, 0.3)");
