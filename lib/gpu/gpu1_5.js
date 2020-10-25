"use strict";

var ctx5 = document.getElementById("c5").getContext("2d");
var W = document.getElementById("c5").width;
var H = document.getElementById("c5").height;

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
ctx5.fillStyle="rgba(0,0,0,0.12)";
for(var i=0; i<W; i+=8){
	ctx5.fillRect(i, 0, 4, H);
}
for(var i=0; i<H; i+=8){
	ctx5.fillRect(0, i, W, 4);
}

var verts = [
	[-1.793389073166024, -1.961391590028594, -5.6948094314965685, 1.0, 0, 0],
	[-1.793389073166024, 0.8576862723291312, -4.668749001519562, 1.0, 0, 1],
	[0.9255342879439257, -1.527759714670797, -6.8862032173978776, 1.0, 1, 0],
	[0.9255342879439257, 1.2913181476869282, -5.860142787420871, 1.0, 1, 1],
	[-0.5255342879439258, -2.891318147686928, -3.139857212579129, 1.0, 1, 0],
	[-0.5255342879439258, -0.07224028532920279, -2.113796782602123, 1.0, 1, 1],
	[2.193389073166024, -2.457686272329131, -4.331250998480438, 1.0, 0, 0],
	[2.193389073166024, 0.36139159002859417, -3.3051905685034315, 1.0, 0, 1],
	[-1.793389073166024, -1.961391590028594, -5.6948094314965685, 1.0, 1, 0],
	[-1.793389073166024, 0.8576862723291312, -4.668749001519562, 1.0, 0, 0],
	[0.9255342879439257, -1.527759714670797, -6.8862032173978776, 1.0, 1, 1],
	[0.9255342879439257, 1.2913181476869282, -5.860142787420871, 1.0, 0, 1],
	[-0.5255342879439258, -2.891318147686928, -3.139857212579129, 1.0, 0, 0],
	[-0.5255342879439258, -0.07224028532920279, -2.113796782602123, 1.0, 1, 0],
	[2.193389073166024, -2.457686272329131, -4.331250998480438, 1.0, 0, 1],
	[2.193389073166024, 0.36139159002859417, -3.3051905685034315, 1.0, 1, 1],
];

var trigs = [
	{v0: verts[1], v1: verts[2], v2: verts[0], c: "#fff"},
	{v0: verts[1], v1: verts[3], v2: verts[2], c: "#fff"},
	{v0: verts[9], v1: verts[15], v2: verts[11], c: "#fff"},
	{v0: verts[9], v1: verts[13], v2: verts[15], c: "#fff"},
	{v0: verts[0], v1: verts[5], v2: verts[1], c: "#fff"},
	{v0: verts[0], v1: verts[4], v2: verts[5], c: "#fff"},
	{v0: verts[8], v1: verts[14], v2: verts[10], c: "#fff"},
	{v0: verts[8], v1: verts[12], v2: verts[14], c: "#fff"},
	{v0: verts[4], v1: verts[6], v2: verts[5], c: "#fff"},
	{v0: verts[5], v1: verts[6], v2: verts[7], c: "#fff"},
	{v0: verts[2], v1: verts[6], v2: verts[7], c: "#fff"},
	{v0: verts[2], v1: verts[7], v2: verts[3], c: "#fff"},
];

var cam = {vw: 2, vh: 2, near: 1, far: 100};
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
	var c = texture(u, v) * L;
	ctx5.fillStyle = "rgba(" + c + "," + c + "," + c + ", 1)";
	ctx5.fillRect(x, H-y, 1, 1);
}

function draw_trig(v0, v1, v2, n, color){
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

	/* compute lighting once */
	var L = dot_vec(light, n);

	for(var y=minY; y<=maxY; y+=256){
		for(var x=minX; x<=maxX; x+=256){
			var w0 = edge_fn(x1, y1, x2, y2, x, y) + bias0;
			var w1 = edge_fn(x2, y2, x0, y0, x, y) + bias1;
			var w2 = edge_fn(x0, y0, x1, y1, x, y) + bias2;
			if(w0 >= 0 && w1 >= 0 && w2 >= 0){
				var X = x >> 8;
				var Y = y >> 8;
				var k = 1 / (w0 + w1 + w2);
				var wr = v0[3]*w0*k + v1[3]*w1*k + v2[3]*w2*k;
				var uw = v0[4]*w0*k + v1[4]*w1*k + v2[4]*w2*k;
				var vw = v0[5]*w0*k + v1[5]*w1*k + v2[5]*w2*k;
				var u = uw / wr;
				var v = vw / wr;
				if(!Z_buffer[X][Y] || Z_buffer[X][Y] < wr){
					put_pixel(X, Y, u, v, L, color);
					Z_buffer[X][Y] = wr;
				}
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
