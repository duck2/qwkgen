var ctx1 = document.getElementById("c1").getContext("2d");
ctx1.scale(4,4);
for(var i=0; i<32; i+=2){
	ctx1.fillStyle="rgba(0,0,0,0.08)";
	ctx1.fillRect(i, 0, 1, 32);
}
for(var i=0; i<32; i+=2){
	ctx1.fillStyle="rgba(0,0,0,0.08)";
	ctx1.fillRect(0, i, 32, 1);
}
ctx1.fillStyle = "#000";
ctx1.fillRect(8,28,1,1);
ctx1.fillRect(15,3,1,1);
ctx1.fillRect(25,10,1,1);
