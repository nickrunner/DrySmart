$(document).ready(function(){

	var bspeed = 0;

	//Click on Manual Mode
	$("#manmode").click(function(){
		//Disable Modulation Mode
		$("#manmode").fadeTo('fast', 1);
		$('#modmode').fadeTo('fast', 0.5);
		$("#modmode").css({"box-shadow": "0px 0px 0px"});
		$("#manmode").css({"box-shadow": "5px 5px 5px #888888"});
	});

	//Click on Modulation Mode
	$("#modmode").click(function(){
		//Disable Manual Mode
		$("#manmode").fadeTo('fast', 0.5);
		$("#modmode").fadeTo('fast', 1);
		$("#manmode").css({"box-shadow": "0px 0px 0px"});
		$("#modmode").css({"box-shadow": "5px 5px 5px #888888"});
	});

	//Click Up Arrow
	$("#up_arrow").click(function(){
		if(bspeed<10){
			bspeed++;
		}
		$("#bspeed").text(bspeed);
	});

	//Click Down Arrow
	$("#down_arrow").click(function(){
		if(bspeed>0){
			bspeed--;
		}
		$("#bspeed").text(bspeed);
	});

})