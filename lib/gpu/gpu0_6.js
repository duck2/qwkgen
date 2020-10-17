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

var step = 256;

var v0 = {x: 13.5*step, y: 5.5*step};
var v1 = {x: 15.5*step, y: 5.5*step};
var v2 = {x: 13.5*step, y: 7.5*step};
var v3 = {x: 15.5*step, y: 7.5*step};
var v4 = {x: 7*step, y: 4*step};
var v5 = {x: 1*step, y: 6*step};
var v6 = {x: 5*step, y: 6*step};
var v7 = {x: 8*step, y: 7*step};
var v8 = {x: 9.5*step, y: 5.5*step};

var t0 = {v0: v0, v1: v1, v2: v2, style: "rgba(255, 0, 0, 0.3)"};
var t1 = {v0: v1, v1: v3, v2: v2, style: "rgba(0, 255, 0, 0.3)"};
var t2 = {v0: v4, v1: v6, v2: v5, style: "rgba(255, 0, 0, 0.3)"};
var t3 = {v0: v4, v1: v7, v2: v6, style: "rgba(0, 255, 0, 0.3)"};
var t4 = {v0: v4, v1: v8, v2: v7, style: "rgba(0, 0, 255, 0.3)"};
trigs = [t0, t1, t2, t3, t4];

/* draw triangles */
for(var i = 0; i < trigs.length; i++){
	t = trigs[i];
	ctx6.beginPath();
	ctx6.moveTo(t.v0.x/16, t.v0.y/16);
	ctx6.lineTo(t.v1.x/16, t.v1.y/16);
	ctx6.lineTo(t.v2.x/16, t.v2.y/16);
	ctx6.lineTo(t.v0.x/16, t.v0.y/16);
	ctx6.lineWidth = 1;
	ctx6.strokeStyle = t.style;
	/* too lazy to add line style field */
	ctx6.stroke();
	ctx6.stroke();
}

function edge_fn(v0, v1, p){
	return (v0.y - v1.y)*p.x + (v1.x - v0.x)*p.y + (v0.x*v1.y - v1.x*v0.y);
}

function put_pixel(p){
	var x = (p.x & ~255) / 16;
	var y = (p.y & ~255) / 16;
	ctx6.fillRect(x, y, 16, 16);
}

function is_top_left(v0, v1){
	if(v0.y == v1.y && v0.x < v1.x) return true;
	else if(v0.y > v1.y) return true;
	else return false;
}

for(var i = 0; i < trigs.length; i++){
	t = trigs[i];
	for(var x = step/2; x < 16*step; x += step){
		for(var y = step/2; y < 8*step; y += step){
			var p = {x: x, y: y};
			var bias0 = is_top_left(t.v1, t.v2) ? 0 : -1;
			var bias1 = is_top_left(t.v2, t.v0) ? 0 : -1;
			var bias2 = is_top_left(t.v0, t.v1) ? 0 : -1;
			var w0 = edge_fn(t.v1, t.v2, p) + bias0;
			var w1 = edge_fn(t.v2, t.v0, p) + bias1;
			var w2 = edge_fn(t.v0, t.v1, p) + bias2;
			if(w0 >= 0 && w1 >= 0 && w2 >= 0){
				ctx6.fillStyle = t.style;
				put_pixel(p);
			}
		}
	}
}
