"use strict";

var c6 = document.getElementById("c6");
var ctx6 = c6.getContext("2d");
var W = c6.width;
var H = c6.height;

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
	var v = norm_vec([x, y, z, 0]);
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

/* UI stuff */

function draw_grid(){
	ctx6.fillStyle="rgba(0,0,0,0.12)";
	for(var i=0; i<W; i+=8){
		ctx6.fillRect(i, 0, 4, H);
	}
	for(var i=0; i<H; i+=8){
		ctx6.fillRect(0, i, W, 4);
	}
}

var animating = false;
function draw_button(){
	ctx6.fillStyle="#fff";
	ctx6.strokeStyle="#000";
	ctx6.fillRect(W-16, H-16, 16, 16);
	ctx6.strokeRect(W-16, H-16, 16, 16);
	if(animating){
		ctx6.fillStyle="#c60";
		ctx6.fillRect(W-12, H-12, 8, 8);
	}else{
		ctx6.beginPath();
		ctx6.moveTo(W-11, H-3);
		ctx6.lineTo(W-11, H-13);
		ctx6.lineTo(W-3, H-8);
		ctx6.lineTo(W-11, H-3);
		ctx6.fillStyle="#0c6";
		ctx6.fill();
	}
}

function draw_fps(ms){
	ctx6.font = "12px monospace";
	ctx6.fillStyle = "#000";
	ctx6.fillText((1000/ms).toFixed(1) + " fps", W-60, 14);
}

c6.onclick = function(e){
	var rect = c6.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	if(x > W-16 && y > H-16){
		if(!animating) window.requestAnimationFrame(draw);
		animating = !animating;
	}
};

/* scene setup */

var verts = [];
for(var i=0; i<teapot_verts.length; i++){
	var v = teapot_verts[i];
	verts.push([v[0], v[1], v[2], 1]);
}

var trigs = [];
for(var i=0; i<teapot_trigs.length; i++){
	var t = teapot_trigs[i];
	var v0 = verts[t[0]];
	var v1 = verts[t[1]];
	var v2 = verts[t[2]];
	var n = norm_vec(cross_vec(sub_vec(v1, v0), sub_vec(v2, v0)));
	trigs.push([t[0], t[1], t[2], n]);
}

var cam = {vw: 2, vh: 2, near: 1, far: 1000};
var light = norm_vec([1, 1, 1, 0]);

/* rasterizer things */
var Z_buffer = [];
for(i=0; i<W; i++){
	Z_buffer[i] = [];
}

function texture(u, v){
	var x = (u*(1 << 2)|0) & 1;
	var y = (v*(1 << 2)|0) & 1;
	return x ^ y ? 0 : 255;
}

function put_pixel(x, y, u, v, L){
	var c = 20 + 235 * L;
	ctx6.fillStyle = "rgba(" + (c-20) + "," + (c-20) + "," + c + ", 1)";
	ctx6.fillRect(x, H-y, 1, 1);
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

/* actual rendering */
var prev_ms = 0;
function draw(ms){
	ms = ms || 0;
	ctx6.clearRect(0, 0, W, H);
	draw_grid();
	render(ms);
	draw_button();
	if(ms){
		if(prev_ms) draw_fps(ms - prev_ms);
		prev_ms = ms;
	}
	if(animating)
		window.requestAnimationFrame(draw);
}

function render(t){
	for(i=0; i<W; i++){
		Z_buffer[i] = [];
	}
	var verts_world = [];
	var phi = t * 360 / 2000; /* 0.5 Hz */
	var M = matmul(trs(0, -1.5, -6), rot(phi, 0, 1, 0));
	/* model to world, recompute normals */
	for(var i=0; i<verts.length; i++){
		verts_world.push(mat4x4_mul_vec4(M, verts[i]));
	}
	for(var i=0; i<trigs.length; i++){
		var t = trigs[i];
		var v0 = verts_world[t[0]];
		var v1 = verts_world[t[1]];
		var v2 = verts_world[t[2]];
		var n = norm_vec(cross_vec(sub_vec(v1, v0), sub_vec(v2, v0)));
		trigs[i][3] = n;
	}
	/* world to clip */
	var verts_clip = [];
	for(var i=0; i<verts_world.length; i++){
		verts_clip.push(mat4x4_mul_vec4(P, verts_world[i]));
	}
	/* skipped clipping for now */
	/* clip to viewport */
	var verts_vp = [];
	for(var i=0; i<verts_clip.length; i++){
		verts_vp.push(viewport(wnorm(verts_clip[i]), W, H));
	}
	/* rasterize */
	for(var i=0; i<trigs.length; i++){
		var t = trigs[i];
		draw_trig(verts_vp[t[0]], verts_vp[t[1]], verts_vp[t[2]], t[3]);
	}
}

draw();


