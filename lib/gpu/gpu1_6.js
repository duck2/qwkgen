"use strict";

c6 = document.getElementById("c6");
var ctx6 = c6.getContext("2d");
var W = c6.width;
var H = c6.height;

/* utilities */

function mat4x4_mul_vec4(M, v){
	var i, j, r = [];
	for(i=0; i<4; i++){
		r[i] = 0;
		for(j=0; j<4; j++){
			r[i] += M[i][j] * v[j];
		}
	}
	r[4] = v[4];
	r[5] = v[5];
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

function dot_vec(x, y){
	return x[0]*y[0] + x[1]*y[1] + x[2]*y[2] + x[3]*y[3];
}

/* Only for 3D vectors. */
function cross_vec(x, y){
	return [x[1]*y[2] - x[2]*y[1],
			x[2]*y[0] - x[0]*y[2],
			x[0]*y[1] - x[1]*y[0],
			0];
}

function norm_vec(x){
	var norm = 1 / Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
	return [x[0]*norm, x[1]*norm, x[2]*norm, 0];
}

/* draw grid */
ctx6.fillStyle="rgba(0,0,0,0.12)";
for(var i=0; i<W; i+=8){
	ctx6.fillRect(i, 0, 4, H);
}
for(var i=0; i<H; i+=8){
	ctx6.fillRect(0, i, W, 4);
}

/* start button and onclick stuff */
var animating = false;
function draw_button(){
	ctx6.fillStyle="#fff";
	ctx6.strokeStyle="#000";
	ctx6.fillRect(W-16, H-16, 16, 16);
	ctx6.strokeRect(W-16, H-16, 16, 16);
	if(animating){
		ctx6.fillStyle="#c00";
		ctx6.fillRect(W-12, H-12, 8, 8);
	}else{
		ctx6.beginPath();
		ctx6.moveTo(W-11, H-3);
		ctx6.lineTo(W-11, H-13);
		ctx6.lineTo(W-3, H-8);
		ctx6.lineTo(W-11, H-3);
		ctx6.fillStyle="#0c0";
		ctx6.fill();
	}
}

c6.onclick = function(e){
	var rect = c6.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	if(x > W-16 && y > H-16) animating = !animating;
};

/* scene setup */
var verts = [];
for(var i=0; i<teapot_verts.length; i++){
	var v = teapot_verts[i];
	verts.push([v[0], v[1], v[2], 1, 0, 0]);
}

var trigs = [];
for(var i=0; i<teapot_trigs.length; i++){
	var t = teapot_trigs[i];
	trigs.push({v0: verts[t[0]], v1: verts[t[1]], v2: verts[t[2]], c: "#fff"});
}

var cam = {vw: 2, vh: 2, near: 1, far: 1000};
var light = norm_vec([1, 1, 1, 0]);

var Z_buffer = [];
for(i=0; i<W; i++){
	Z_buffer[i] = [];
}

function texture(u, v){
	var x = (u*(1 << 2)|0) & 1;
	var y = (v*(1 << 2)|0) & 1;
	return x ^ y ? 0 : 255;
}

function put_pixel(x, y, u, v, L, color){
	var c = 20 + 235 * L;
	ctx6.fillStyle = "rgba(" + (c-20) + "," + (c-20) + "," + c + ", 1)";
	ctx6.fillRect(x, H-y, 1, 1);
}

function is_top_left(v0, v1){
	if(v0[1] == v1[1] && v0[0] > v1[0]) return true;
	else if(v0[1] > v1[1]) return true;
	else return false;
}

function draw_trig(v0, v1, v2, n, color){
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

	/* Multiply using fixed point */
	var C01 = (x0*y1 - y0*x1 + bias2) >> 8;
	var C12 = (x1*y2 - y1*x2 + bias0) >> 8;
	var C20 = (x2*y0 - y2*x0 + bias1) >> 8;

	/* compute lighting once */
	var L = dot_vec(light, n);

	var w0_row = C12 + (A12 >> 1) - (B12 >> 1);
	var w1_row = C20 + (A20 >> 1) - (B20 >> 1);
	var w2_row = C01 + (A01 >> 1) - (B01 >> 1);

	for(var y=0; y<H; y++){
		var w0 = w0_row;
		var w1 = w1_row;
		var w2 = w2_row;
		for(var x=0; x<W; x++){
			if(w0 >= 0 && w1 >= 0 && w2 >= 0){
				var k = 1 / (w0 + w1 + w2);
				/* interpolate 1/w, u/w and v/w */
				var wr = v0[3]*w0*k + v1[3]*w1*k + v2[3]*w2*k;
				var uw = v0[4]*w0*k + v1[4]*w1*k + v2[4]*w2*k;
				var vw = v0[5]*w0*k + v1[5]*w1*k + v2[5]*w2*k;
				var u = uw / wr;
				var v = vw / wr;
				if(!Z_buffer[x][y] || Z_buffer[x][y] < wr){
					put_pixel(x, y, u, v, L, color);
					Z_buffer[x][y] = wr;
				}
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

function clip_trig(t){
	var v0 = t.v0, v1 = t.v1, v2 = t.v2;
	var tmp;
	if(v0[2] < 0 && v1[2] < 0 && v2[2] < 0)
		return [];
	if(v0[2] >= 0 && v1[2] >= 0 && v2[2] >= 0){
		return [{v0: v0, v1: v1, v2: v2, c: t.c, n: t.n}];
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
			{v0: v0, v1: v1, v2: a, c: t.c, n: t.n},
			{v0: v1, v1: b, v2: a, c: t.c, n: t.n}
		];
	}else{
		return [{v0: a, v1: b, v2: v2, c: t.c, n: t.n}];
	}
}

function viewport(v, w, h){
	return [(v[0]+1)*w/2, (v[1]+1)*h/2, v[2], v[3], v[4], v[5]];
}

function wnorm(v){
	var wr = 1 / v[3];
	return [v[0]*wr, v[1]*wr, v[2]*wr, wr, v[4]*wr, v[5]*wr];
}

var P = proj_mtx(cam.vw, cam.vh, cam.near, cam.far);

/* actual rendering */
for(var i=0; i<trigs.length; i++){
	var t = trigs[i];
	t.n = norm_vec(cross_vec(sub_vec(t.v1, t.v0), sub_vec(t.v2, t.v0)));
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
	t.v0 = viewport(wnorm(t.v0), W, H);
	t.v1 = viewport(wnorm(t.v1), W, H);
	t.v2 = viewport(wnorm(t.v2), W, H);
}

for(var i=0; i<trigs_clip.length; i++){
	var t = trigs_clip[i];
	draw_trig(t.v0, t.v1, t.v2, t.n, t.c);
}
