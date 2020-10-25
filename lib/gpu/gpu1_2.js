"use strict";

var ctx2 = document.getElementById("c2").getContext("2d");
var W = document.getElementById("c2").width;
var H = document.getElementById("c2").height;

/* utilities */

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

function add_vec(x, y){
	return [x[0]+y[0], x[1]+y[1], x[2]+y[2], x[3]+y[3]];
}

function sub_vec(x, y){
	return [x[0]-y[0], x[1]-y[1], x[2]-y[2], x[3]-y[3]];
}

function scale_vec(c, x){
	return [c*x[0], c*x[1], c*x[2], c*x[3]];
}

/* draw grid */
ctx2.fillStyle="rgba(0,0,0,0.12)";
for(var i=0; i<128; i+=8){
	ctx2.fillRect(i, 0, 4, 128);
}
for(var i=0; i<128; i+=8){
	ctx2.fillRect(0, i, 128, 4);
}

var verts = [
	[0,-1,5,1],
	[-2.5,-1,-5,1],
	[2.5,-1,-5,1],
];

var t0 = {v0: verts[0], v1: verts[2], v2: verts[1]};
var trigs = [t0];

var cam = {vw: 2, vh: 2, near: 1, far: 100};

function put_pixel(x, y){
	ctx2.fillStyle="rgba(255,0,0,0.7)";
	ctx2.fillRect(x, 128-y, 1, 1);
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

function clip_trig(t){
	var v0 = t.v0, v1 = t.v1, v2 = t.v2;
	var tmp;
	if(v0[2] < 0 && v1[2] < 0 && v2[2] < 0)
		return [];
	if(v0[2] >= 0 && v1[2] >= 0 && v2[2] >= 0){
		return [t];
	}
	if(v0[2] * v2[2] > 0){
		tmp = v1; v1 = v2; v2 = tmp;
		tmp = v0; v0 = v1; v1 = tmp;
	}else if (v1[2] * v2[2] > 0){
		tmp = v0; v0 = v2; v2 = tmp;
		tmp = v0; v0 = v1; v1 = tmp;
	}
	var t02 = v0[2] / (v0[2] - v2[2]);
	var t12 = v1[2] / (v1[2] - v2[2]);
	var a = add_vec(v0, scale_vec(t02, sub_vec(v2, v0)));
	var b = add_vec(v1, scale_vec(t12, sub_vec(v2, v1)));
	if(v2[2] < 0){
		return [
			{v0: v0, v1: v1, v2: a},
			{v0: v1, v1: b, v2: a}
		];
	}else{
		return [{v0: a, v1: b, v2: v2}];
	}
}

function viewport(v, w, h){
	return [(v[0]+1)*w/2, (v[1]+1)*h/2, v[2], v[3]];
}

function wnorm(v){
	return [v[0]/v[3], v[1]/v[3], v[2]/v[3], 1];
}

var P = proj_mtx(cam.vw, cam.vh, cam.near, cam.far);

for(var i=0; i<trigs.length; i++){
	var t = trigs[i];
	t.v0 = mat4x4_mul_vec4(P, t.v0);
	t.v1 = mat4x4_mul_vec4(P, t.v1);
	t.v2 = mat4x4_mul_vec4(P, t.v2);
}

var trigs_clip = [];
for(var i=0; i<trigs.length; i++){
	var ts = clip_trig(trigs[i]);
	Array.prototype.push.apply(trigs_clip, ts);
}

for(var i=0; i<trigs_clip.length; i++){
	var t = trigs_clip[i];
	t.v0 = viewport(wnorm(t.v0), 128, 128);
	t.v1 = viewport(wnorm(t.v1), 128, 128);
	t.v2 = viewport(wnorm(t.v2), 128, 128);
}

for(var i=0; i<trigs_clip.length; i++){
	var t = trigs_clip[i];
	draw_trig(t.v0, t.v1, t.v2);
}
