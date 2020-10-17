var ctx2 = document.getElementById("c2").getContext("2d");
ctx2.scale(4,4);

/* draw grid */
for(var i=0; i<32; i+=2){
	ctx2.fillStyle="rgba(0,0,0,0.08)";
	ctx2.fillRect(i, 0, 1, 32);
}
for(var i=0; i<32; i+=2){
	ctx2.fillStyle="rgba(0,0,0,0.08)";
	ctx2.fillRect(0, i, 32, 1);
}

var v0 = {x: 8, y: 28};
var v1 = {x: 15, y: 3};
var v2 = {x: 25, y: 10};

ctx2.fillStyle = "#000";
ctx2.fillRect(8,28,1,1);
ctx2.fillRect(15,3,1,1);
ctx2.fillRect(25,10,1,1);

function edge_fn(v0, v1, p){
	return (v0.y - v1.y)*p.x + (v1.x - v0.x)*p.y + (v0.x*v1.y - v1.x*v0.y);
}

ctx2.fillStyle="#f00";
for(var i=0; i<32; i++){
	for(var j=0; j<32; j++){
		p = {x: i, y: j};
		if(edge_fn(v0, v1, p) >= 0 &&
			edge_fn(v1, v2, p) >= 0 &&
			edge_fn(v2, v0, p) >= 0){
			/* put pixel */
			ctx2.fillRect(i, j, 1, 1);
		}
	}
}
