"use strict";

var ctx8 = document.getElementById("c8").getContext("2d");

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
ctx8.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<128; i+=8){
	ctx8.fillRect(i, 0, 4, 128);
}
for(var i=0; i<128; i+=8){
	ctx8.fillRect(0, i, 128, 4);
}

var verts = [
	[-0.5,0.5,-2,1],
	[-0.5,-0.5,-2,1],
	[0.5,-0.5,-2,1],
	[0.5,0.5,-2,1],
	[0.75,0.75,-2,1],
	[1,0.75,-2,1],
	[0.875,1,-2,1]
];

var t0 = {v0: 2, v1: 0, v2: 1, style: "rgba(255, 0, 0, 0.3)"};
var t1 = {v0: 0, v1: 2, v2: 3, style: "rgba(0, 255, 0, 0.3)"};
var t2 = {v0: 4, v1: 5, v2: 6, style: "rgba(255, 0, 0, 0.3)"};
var trigs = [t0, t1, t2];

var cam = {vw: 2, vh: 2, near: 1, far: 100};

function put_pixel(x, y){
	ctx8.fillStyle="rgba(255,0,0,0.5)";
	ctx8.fillRect(x, 128-y, 1, 1);
}

function is_top_left(v0, v1){
	if(v0[1] == v1[1] && v0[0] > v1[0]) return true;
	else if(v0[1] > v1[1]) return true;
	else return false;
}

function draw_trig(v0, v1, v2){
	var step = 256;

	/* F = Ax + By + C */
	var A01 = step * (v0[1] - v1[1]);
	var A12 = step * (v1[1] - v2[1]);
	var A20 = step * (v2[1] - v0[1]);
	var B01 = step * (v1[0] - v0[0]);
	var B12 = step * (v2[0] - v1[0]);
	var B20 = step * (v0[0] - v2[0]);
	var C01 = step * (v0[0]*v1[1] - v0[1]*v1[0]);
	var C12 = step * (v1[0]*v2[1] - v1[1]*v2[0]);
	var C20 = step * (v2[0]*v0[1] - v2[1]*v0[0]);

	/* fill rules */
	var bias0 = is_top_left(v1, v2) ? 0 : -1;
	var bias1 = is_top_left(v2, v0) ? 0 : -1;
	var bias2 = is_top_left(v0, v1) ? 0 : -1;

	/* start from x=1/2, y=1/2 */
	var w0_row = C12 + A12/2 + B12/2 + bias0;
	var w1_row = C20 + A20/2 + B20/2 + bias1;
	var w2_row = C01 + A01/2 + B01/2 + bias2;
	for(var y=0; y<128; y++){
		var w0 = w0_row;
		var w1 = w1_row;
		var w2 = w2_row;
		for(var x=0; x<128; x++){
			if(w0 >= 0 && w1 >= 0 && w2 >= 0){
				put_pixel(x, y);
			}
			w0 += A12;
			w1 += A20;
			w2 += A01;
		}
		w0_row += B12;
		w1_row += B20;
		w2_row += B01;
	}
}

function proj_mtx(vw, vh, n, f){
	return [
		[2*n/vw, 0, 0, 0],
		[0, 2*n/vh, 0, 0],
		[0, 0, f/(n-f), -n*f/(n-f)],
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
