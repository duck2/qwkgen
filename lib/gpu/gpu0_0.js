var ctx0 = document.getElementById("c0").getContext("2d");
ctx0.scale(4,4);
for(var i=0; i<32; i+=2){
	ctx0.fillStyle="rgba(0,0,0,0.08)";
	ctx0.fillRect(i, 0, 1, 32);
}
for(var i=0; i<32; i+=2){
	ctx0.fillStyle="rgba(0,0,0,0.08)";
	ctx0.fillRect(0, i, 32, 1);
}
ctx0.fillStyle = "#f00";
ctx0.fillRect(16,16,1,1);