"use strict";

(function(){

/* utilities */

function matmul(a, b){
	var out = [[],[],[],[]];
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			out[i][j] = 0;
			for(var k=0; k<4; k++){
				out[i][j] += a[i][k] * b[k][j];
			}
		}
	}
	return out;
}

function rot(phi, x, y, z){
	var v = [];
	norm_vec(v, [x, y, z, 0]);
	var C = Math.cos(phi * Math.PI / 180);
	var S = Math.sin(phi * Math.PI / 180);
	var t = 1 - C;
	return [
		[t*v[0]*v[0] + C, t*v[0]*v[1] - S*v[2], t*v[0]*v[2] + S*v[1], 0],
		[t*v[0]*v[1] + S*v[2], t*v[1]*v[1] + C, t*v[1]*v[2] - S*v[0], 0],
		[t*v[0]*v[2] - S*v[1], t*v[1]*v[2] + S*v[0], t*v[2]*v[2] + C, 0],
		[0, 0, 0, 1]
	];
}

function trs(x, y, z){
	return [
		[1, 0, 0, x],
		[0, 1, 0, y],
		[0, 0, 1, z],
		[0, 0, 0, 1]
	];
}

function sc(x, y, z){
	return [
		[x, 0, 0, 0],
		[0, y, 0, 0],
		[0, 0, z, 0],
		[0, 0, 0, 1]
	]
}

function mat4x4_mul_vec4(r, M, v){
	var i, j;
	for(i=0; i<4; i++){
		r[i] = 0;
		for(j=0; j<4; j++){
			r[i] += M[i][j] * v[j];
		}
	}
}

function add_vec(r, x, y){
	r[0] = x[0]+y[0];
	r[1] = x[1]+y[1];
	r[2] = x[2]+y[2];
	r[3] = x[3]+y[3];
}

function sub_vec(r, x, y){
	r[0] = x[0]-y[0];
	r[1] = x[1]-y[1];
	r[2] = x[2]-y[2];
	r[3] = x[3]-y[3];
}

function scale_vec(r, c, x){
	r[0] = c*x[0];
	r[1] = c*x[1];
	r[2] = c*x[2];
	r[3] = c*x[3];
}

function dot_vec(x, y){
	return x[0]*y[0] + x[1]*y[1] + x[2]*y[2] + x[3]*y[3];
}

/* Only for 3D vectors. */
function cross_vec(r, x, y){
	r[0] = x[1]*y[2] - x[2]*y[1];
	r[1] = x[2]*y[0] - x[0]*y[2];
	r[2] = x[0]*y[1] - x[1]*y[0];
	r[3] = 0;
}

/* Only for 3D vectors. */
function norm_vec(r, x){
	var norm = 1 / Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
	r[0] = x[0]*norm;
	r[1] = x[1]*norm;
	r[2] = x[2]*norm;
	r[3] = 0;
}

/* JS doesn't like in-place copying, but I don't like GC.
 * This comes useful in vertex processing. */
Array.prototype.set4 = function(src){
	this[0] = src[0];
	this[1] = src[1];
	this[2] = src[2];
	this[3] = src[3];
}

/* UI stuff */

var canvas_off = document.getElementById("c2_off");
var ctx_off = canvas_off.getContext("2d");
var W = canvas_off.width;
var H = canvas_off.height;

var canvas = document.getElementById("c2");
var ctx = canvas.getContext("2d");
var W_ui = canvas.width;
var H_ui = canvas.height;
ctx.scale(W_ui/W, H_ui/H);

var animating = false;

canvas.onclick = function(e){
	var rect = canvas.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	if(x > W_ui-16 && y > H_ui-16){
		if(!animating) window.requestAnimationFrame(draw);
		animating = !animating;
	}
};

var img_data = ctx_off.createImageData(W, H);
var fb = img_data.data;
var fbsize = fb.length;

function draw_button(){
	ctx.fillStyle="#fff";
	ctx.strokeStyle="#000";
	ctx.fillRect(W-32, H-32, 32, 32);
	ctx.strokeRect(W-32, H-32, 32, 32);
	ctx.strokeRect(W-32, H-32, 32, 32);
	if(animating){
		ctx.fillStyle="#c00";
		ctx.fillRect(W-24, H-24, 16, 16);
	}else{
		ctx.beginPath();
		ctx.moveTo(W-22, H-6);
		ctx.lineTo(W-22, H-26);
		ctx.lineTo(W-6, H-16);
		ctx.lineTo(W-22, H-6);
		ctx.fillStyle="#0c0";
		ctx.fill();
	}
}

function draw_fps(fps){
	ctx.font = "24px monospace";
	ctx.fillStyle = "#000";
	ctx.fillText(fps.toFixed(1) + " fps", W-120, 28);
}

/* scene setup for 4 teapots */

var verts_model = [];
for(var j=0; j<4; j++){
	for(var i=0; i<teapot_verts.length; i++){
		var v = teapot_verts[i];
		verts_model.push([v[0], v[1], v[2], 1]);
	}
}

/* arrange teapots */
var M0 = [
	trs(-4, 0, 0),
	matmul(trs(4, 0, 0), rot(180, 0, 1, 0)),
	matmul(trs(0, 0, 4), rot(90, 0, 1, 0)),
	matmul(trs(0, 0, -4), rot(270, 0, 1, 0))
];

for(var j=0; j<4; j++){
	for(var i=0; i<teapot_verts.length; i++){
		var tmp = [];
		var v = verts_model[i + j*teapot_verts.length];
		mat4x4_mul_vec4(tmp, M0[j], v);
		v.set4(tmp);
	}
}

var trigs = [];
var l = teapot_verts.length;
for(var j=0; j<4; j++){
	for(var i=0; i<teapot_trigs.length; i++){
		var t = teapot_trigs[i];
		trigs.push([j*l+t[0], j*l+t[1], j*l+t[2], []]);
	}
}

var cam = {vw: 8/3, vh: 2, near: 1, far: 1000};
var light = [];
norm_vec(light, [1, 1, 1, 0]);

/* rasterizer itself */

var Z_bufsize = W*H;
var Z_buffer_buf = new ArrayBuffer(Z_bufsize * 4);
var Z_buffer = new Float32Array(Z_buffer_buf);

function texture(u, v){
	var x = (u*(1 << 2)|0) & 1;
	var y = (v*(1 << 2)|0) & 1;
	return x ^ y ? 0 : 255;
}

function put_pixel(x, y, L, color){
	var c = 20 + 235 * L;
	var p = 4*((H-1-y)*W + x);
	fb[p] = c-20;
	fb[p+1] = c-20;
	fb[p+2] = c;
	fb[p+3] = 255;
}

function edge_fn(x0, y0, x1, y1, x, y){
	return (y0 - y1)*x + (x1 - x0)*y + (x0*y1 - x1*y0);
}

function is_top_left(x0, y0, x1, y1){
	if(y0 == y1 && x0 < x1) return true;
	else if(y0 < y1) return true;
	else return false;
}

function draw_trig(v0, v1, v2, n, color){
	var x0 = v0[0];
	var x1 = v1[0];
	var x2 = v2[0];
	var y0 = v0[1];
	var y1 = v1[1];
	var y2 = v2[1];

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

	/* check if bounding box includes a sample */
	var minX_corner = minX + 127 & ~255;
	var minY_corner = minY + 127 & ~255;
	var maxX_corner = maxX + 128 & ~255;
	var maxY_corner = maxY + 128 & ~255;
	if(minX_corner == maxX_corner || minY_corner == maxY_corner)
		return;

	/* replace fractional part with 128 to sample from center */
	minX = (minX & ~255) | 128;
	minY = (minY & ~255) | 128;
	maxX = (maxX & ~255) | 128;
	maxY = (maxY & ~255) | 128;

    /* F = Ax + By + C */
    var A01 = y0 - y1;
    var A12 = y1 - y2;
    var A20 = y2 - y0;
    var B01 = x1 - x0;
    var B12 = x2 - x1;
    var B20 = x0 - x2;
    var C01 = x0*y1 - y0*x1;
    var C12 = x1*y2 - y1*x2;
    var C20 = x2*y0 - y2*x0;

    /* fill rules */
    var bias0 = (A12 > 0 || A12 == 0 && B12 < 0) ? 0 : -1;
    var bias1 = (A20 > 0 || A20 == 0 && B20 < 0) ? 0 : -1;
    var bias2 = (A01 > 0 || A01 == 0 && B01 < 0) ? 0 : -1;

	/* get initial edge function values
	 * we will advance in only 1 pixel steps after
	 * here, so drop the fractional part */
	var w0_row = (C12 + A12*minX + B12*minY + bias0) >> 8;
	var w1_row = (C20 + A20*minX + B20*minY + bias1) >> 8;
	var w2_row = (C01 + A01*minX + B01*minY + bias2) >> 8;

	var A = w0_row + w1_row + w2_row;
	if(A <= 0)
		return;
	var k = 1/A;

	/* convert min-max values to integral pixels */
	minX = minX >> 8;
	minY = minY >> 8;
	maxX = maxX >> 8;
	maxY = maxY >> 8;

	/* compute lighting once */
	var L = dot_vec(light, n);

	/* traverse triangle */
	for(var y=minY; y<=maxY; y++){
		var w0 = w0_row;
		var w1 = w1_row;
		var w2 = w2_row;
		for(var x=minX; x<=maxX; x++){
			if((w0 | w1 | w2) >= 0){
				var wr = v0[3]*w0*k + v1[3]*w1*k + v2[3]*w2*k;
				if(!Z_buffer[y*W+x] || Z_buffer[y*W+x] < wr){
					put_pixel(x, y, L, color);
					Z_buffer[y*W+x] = wr;
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

/* vertex processing */

function proj_mtx(vw, vh, n, f){
	return [
		[2*n/vw, 0, 0, 0],
		[0, 2*n/vh, 0, 0],
		[0, 0, f/(n-f), n*f/(n-f)],
		[0, 0, -1, 0]
	];
}

function viewport(r, v){
	r[0] = (v[0]+1)*W/2;
	r[1] = (v[1]+1)*H/2;
	r[2] = v[2];
	r[3] = v[3];
}

function wnorm(r, v){
	var wr = 1 / v[3];
	r[0] = v[0]*wr;
	r[1] = v[1]*wr;
	r[2] = v[2]*wr;
	r[3] = wr;
}

var P = proj_mtx(cam.vw, cam.vh, cam.near, cam.far);

/* rendering loop */

var prev_ms = 0;
var frames = 0;
var fps = 0;
function draw(ms){
	var ms = ms || 0;
	fb.fill(0);
	render(ms);
	ctx_off.putImageData(img_data, 0, 0);
	ctx.clearRect(0, 0, W, H);
	ctx.drawImage(canvas_off, 0, 0);
	draw_button();
	draw_fps(fps);
	if(ms >= prev_ms + 1000){
		fps = frames * 1000 / (ms - prev_ms);
		prev_ms = ms;
		frames = 0;
	}
	frames += 1;
	if(animating)
		window.requestAnimationFrame(draw);
}

/* deep copy once */
var verts = JSON.parse(JSON.stringify(verts_model));

/* do triangle lookup */
for(var i=0; i<trigs.length; i++){
	var t = trigs[i];
	t[0] = verts[t[0]];
	t[1] = verts[t[1]];
	t[2] = verts[t[2]];
}

var t0 = [], t1 = [], t2 = [], t3 = [];

function render(t){
	var phi = t * 360 / 32000;  /* 1/32 Hz */
	var M = matmul(trs(0, -2.5, -10), rot(phi, 0, 1, 0));
	/* reset vertices */
	for(i=0; i<verts.length; i++){
		verts[i].set4(verts_model[i]);
	}

	/* model to world */
	for(var i=0; i<verts.length; i++){
		var v = verts[i];
		mat4x4_mul_vec4(t0, M, v);
		v.set4(t0);
	}
	/* recompute normals */
	for(var i=0; i<trigs.length; i++){
		var t = trigs[i];
		sub_vec(t0, t[1], t[0]);
		sub_vec(t1, t[2], t[0]);
		cross_vec(t2, t0, t1);
		norm_vec(t3, t2);
		t[3].set4(t3);
	}

	/* world to clip */
	for(var i=0; i<verts.length; i++){
		var v = verts[i];
		mat4x4_mul_vec4(t0, P, v);
		v.set4(t0);
	}
	/* skipped clipping for now */
	/* clip to viewport */
	for(var i=0; i<verts.length; i++){
		var v = verts[i];
		wnorm(t0, v);
		viewport(v, t0);
		v[0] = Math.round(v[0] * 256);
		v[1] = Math.round(v[1] * 256);
	}

	for(var i=0; i<Z_bufsize; i++)
		Z_buffer[i] = 0;
	for(var i=0; i<trigs.length; i++){
		var t = trigs[i];
		draw_trig(t[0], t[1], t[2], t[3]);
	}
}

draw();

})(); /* IIFE ends */
