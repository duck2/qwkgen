"use strict";

var ctx7 = document.getElementById("c7").getContext("2d");

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
ctx7.fillStyle="rgba(0,0,0,0.08)";
for(var i=0; i<128; i+=8){
	ctx7.fillRect(i, 0, 4, 256);
}
for(var i=0; i<128; i+=8){
	ctx7.fillRect(0, i, 256, 4);
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

function put_pixel(p){
	ctx7.fillStyle = "#000";
	ctx7.fillRect(4*p[0], 4*(32-p[1]), 4, 4);
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

/* draw triangles */
for(var i = 0; i < trigs.length; i++){
	t = trigs[i];
	ctx7.beginPath();
	ctx7.moveTo(verts_vp[t.v0][0], 128-verts_vp[t.v0][1]);
	ctx7.lineTo(verts_vp[t.v1][0], 128-verts_vp[t.v1][1]);
	ctx7.lineTo(verts_vp[t.v2][0], 128-verts_vp[t.v2][1]);
	ctx7.lineTo(verts_vp[t.v0][0], 128-verts_vp[t.v0][1]);
	ctx7.lineWidth = 1;
	ctx7.strokeStyle = "#000";
	ctx7.stroke();
}
