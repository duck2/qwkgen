"use strict";

var ctx1 = document.getElementById("c1").getContext("2d");
var W = document.getElementById("c1").width;
var H = document.getElementById("c1").height;

function mat4x4_mul_vec4(M, v){
	var i, j, r = [];
	for(i=0; i<4; i++){
		r[i] = 0;
		for(j=0; j<4; j++){
			r[i] += M[i][j] * v[j];
		}
	}
	return r;
}

/* draw grid */
ctx1.fillStyle="rgba(0,0,0,0.12)";
for(var i=0; i<128; i+=8){
	ctx1.fillRect(i, 0, 4, 128);
}
for(var i=0; i<128; i+=8){
	ctx1.fillRect(0, i, 128, 4);
}

var verts = [
	[0,-1,5,1],
	[-2.5,-1,-5,1],
	[2.5,-1,-5,1],
];

var t0 = {v0: 0, v1: 2, v2: 1};
var trigs = [t0];

var cam = {vw: 2, vh: 2, near: 1, far: 100};

function put_pixel(x, y){
	ctx1.fillStyle="rgba(255,0,0,0.7)";
	ctx1.fillRect(x, H-y, 1, 1);
}

function edge_fn(x0, y0, x1, y1, x, y){
	return (y0 - y1)*x + (x1 - x0)*y + (x0*y1 - x1*y0);
}

function is_top_left(x0, y0, x1, y1){
	if(y0 == y1 && x0 < x1) return true;
	else if(y0 < y1) return true;
	else return false;
}

function draw_trig(v0, v1, v2, color){
	/* clamp to nearest subpixel */
	var x0 = Math.round(v0[0] * 256);
	var y0 = Math.round(v0[1] * 256);
	var x1 = Math.round(v1[0] * 256);
	var y1 = Math.round(v1[1] * 256);
	var x2 = Math.round(v2[0] * 256);
	var y2 = Math.round(v2[1] * 256);

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
				put_pixel(x>>8, y>>8, color);
			}
		}
	}
}

function proj_mtx(vw, vh, n, f){
	return [
		[2*n/vw, 0, 0, 0],
		[0, 2*n/vh, 0, 0],
		[0, 0, f/(n-f), n*f/(n-f)],
		[0, 0, -1, 0]
	];
}

function viewport(v, w, h){
	return [(v[0]+1)*w/2, (v[1]+1)*h/2, v[2], v[3]];
}

function wnorm(v){
	return [v[0]/v[3], v[1]/v[3], v[2]/v[3], 1];
}

var P = proj_mtx(cam.vw, cam.vh, cam.near, cam.far);

var verts_vp = [];
for(var i=0; i<verts.length; i++){
	var v = verts[i];
	var v_clip = mat4x4_mul_vec4(P, v);
	var v_vp = viewport(wnorm(v_clip), 128, 128);
	verts_vp.push(v_vp);
}

for(var i=0; i<trigs.length; i++){
	var t = trigs[i];
	draw_trig(verts_vp[t.v0], verts_vp[t.v1], verts_vp[t.v2]);
}
