"use strict";

var ctx0 = document.getElementById("c0").getContext("2d");
var W = document.getElementById("c0").width;
var H = document.getElementById("c0").height;

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
ctx0.fillStyle="rgba(0,0,0,0.12)";
for(var i=0; i<128; i+=8){
	ctx0.fillRect(i, 0, 4, 128);
}
for(var i=0; i<128; i+=8){
	ctx0.fillRect(0, i, 128, 4);
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
	ctx0.fillStyle="rgba(255,0,0,0.7)";
	ctx0.fillRect(x, 128-y, 1, 1);
}

function draw_trig(v0, v1, v2){
	/* doubles emulating x.8 fixed point */
	var x0 = Math.round(v0[0] * 256);
	var x1 = Math.round(v1[0] * 256);
	var x2 = Math.round(v2[0] * 256);
	var y0 = Math.round(v0[1] * 256);
	var y1 = Math.round(v1[1] * 256);
	var y2 = Math.round(v2[1] * 256);

	/* F = Ax + By + C */
	var A01 = y0 - y1;
	var A12 = y1 - y2;
	var A20 = y2 - y0;
	var B01 = x1 - x0;
	var B12 = x2 - x1;
	var B20 = x0 - x2;

	/* fill rules */
	var bias0 = (A12 > 0 || A12 == 0 && B12 < 0) ? 0 : -1;
	var bias1 = (A20 > 0 || A20 == 0 && B20 < 0) ? 0 : -1;
	var bias2 = (A01 > 0 || A01 == 0 && B01 < 0) ? 0 : -1;

	/* multiply using fixed point */
	var C01 = (x0*y1 - y0*x1 + bias2) >> 8;
	var C12 = (x1*y2 - y1*x2 + bias0) >> 8;
	var C20 = (x2*y0 - y2*x0 + bias1) >> 8;

	/* start from pixel center - add x/2, subtract y/2 */
	var w0_row = C12 + (A12 >> 1) - (B12 >> 1);
	var w1_row = C20 + (A20 >> 1) - (B20 >> 1);
	var w2_row = C01 + (A01 >> 1) - (B01 >> 1);

	for(var y=0; y<H; y++){
		var w0 = w0_row;
		var w1 = w1_row;
		var w2 = w2_row;
		for(var x=0; x<W; x++){
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
