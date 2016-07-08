
//Variables representing Sensor Data
var bspeed=0;
var set_temp=0;
var f_temp=0;
var fuel_level=0;
var s_temp=0;
var humidity=0;
var set_temp=0;
var mode = "mod";
var mod_mode = "blower";

//AJAX XML file parsing
function pull_data(){

	//Gather Data from main.xml and store into variables
	$.ajax({
		type: "GET",
		url: "static/main.xml",
		//dataType: "xml",
		async: false,
		cache: false,
		success: function(xml){
			$(xml).find('item').each(function(){
				var id = $(this).find('id').text();
				switch(id){
					case "ftemp_data":
						f_temp = $(this).find('value').text();
						break;
					case "stemp_data":
						s_temp = $(this).find('value').text();
						break;
					case "fuel_level_data":
						fuel_level = $(this).find('value').text();
						break;
					case "humidity_data":
						humidity = $(this).find('value').text();
						break;
					case "blower_speed":
						bspeed = $(this).find('value').text();
						break;
					case "mod_mode":
						mod_mode = $(this).find('value').text();
						break;
					case "mode":
						mode = $(this).find('value').text();
						break;
					case "set_temp":
						set_temp = $(this).find('value').text();
				}
			});

			//Populate HTML with JS variables
			$("#ftemp_data").text(f_temp+("\u00B0"));
			$("#stemp_data").text(s_temp+("\u00B0"));
			$("#fuel_level_data").text(fuel_level+"%");
			$("#humidity_data").text(humidity+"%");
			$("#bspeed_data").text(bspeed);
			$("#bspeed").text(bspeed);
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});
}

//AJAX XML file posting
function push_data(){
	$.ajax({
		url: "/xml_pop",
		data: { 'bspeed': bspeed, 
				'set_temp': set_temp, 
				'mode': mode, 
				'modmode': mod_mode
			},
		type: "POST", 
		async: false,	
		success: function(xml){
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});
}

//Function that enables the correct panel based on what mode we are in
function enable_mode(){
	if(mode == 'mod'){
		$("#manmode").fadeTo('fast', 0.5);
		$("#modmode").fadeTo('fast', 1);
		$("#manmode").css({"box-shadow": "0px 0px 0px"});
		$("#modmode").css({"box-shadow": "5px 5px 5px #888888"});
		$("#bspeed").text(bspeed);
	}
	else{
		$("#manmode").fadeTo('fast', 1);
		$('#modmode').fadeTo('fast', 0.5);
		$("#modmode").css({"box-shadow": "0px 0px 0px"});
		$("#manmode").css({"box-shadow": "5px 5px 5px #888888"});
		$("#bspeed").text(bspeed);
	}
}

function check_alarm_states(){
	//Check Furnace
	if(f_temp>300 ){
			$("#notifier").html("WARNING: Furnace Overheating!");
			$("#notifier").css({"background-color": "#ff4d4d"});
			$("#ftemp_data").css({"color": "#cc0000"});
		}
		else if(f_temp<75){
			$("#notifier").html("WARNING: Furnace Malfunctioning");
			$("#notifier").css({"background-color": "#ff4d4d"});
			$("#ftemp_data").css({"color": "#cc0000"});
		}
		else{
			$("#ftemp_data").css({"color": "Navy"});
		}


		//Check Fuel
		var fuel_alarm =  $("#fuelAlarm").val()
		if(parseInt(fuel_level) < parseInt(fuel_alarm)){
			$("#notifier").html("WARNING: Low Fuel");
			$("#notifier").css({"background-color": "#ff4d4d"});
			$("#fuel_level_data").css({"color": "#cc0000"});
		}
		else{
			$("#fuel_level_data").css({"color": "Navy"});
		}

		//Check Structure Temp
		var max = $("#st_input_max").val();
		var min = $("#st_input_max").val();
		if(parseInt(s_temp)>parseInt(max)){
			$("#notifier").html("WARNING: Structure too HOT");
			$("#notifier").css({"background-color": "#ff4d4d"});
			$("#stemp_data").css({"color": "#cc0000"});
		}
		else if(parseInt(s_temp)<parseInt(max)){
			$("#notifier").html("WARNING: Cool Structure, Furnace may be off");
			$("#notifier").css({"background-color": "#ff4d4d"});
			$("#stemp_data").css({"color": "#cc0000"});
		}
		else{
			$("#stemp_data").css({"color": "Navy"});
		}
}

$(document).ready(function(){

	
	//Initialize variables from main.xml
	pull_data();
	//Initialize HMI to correct mode
	enable_mode();
	//Look For Alarms
	check_alarm_states();
	
	//Click on Manual Mode
	$("#manmode").click(function(){
		//Disable Modulation Mode
		mode = "man";
		enable_mode();
	});

	//Click on Modulation Mode
	$("#modmode").click(function(){
		//Disable Manual Mode
		mode = "mod";
		enable_mode();
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

	//Click Start Button
	$("#start_btn").click(function(){

	});	

	//Click Stop Button
	$("#stop_btn").click(function(){

	});	

	//Click Refresh Button
	$("#refresh_btn").click(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	});	

	//Click Send Button
	$("#send_btn").click(function(){
		set_temp = $("#set_temp").val();
		if(set_temp > 300){
			alert("Set Temperature too high");
		}
		else{
			push_data();
		}
	});	

	//Hover-over bspeed
	$("#bspeed_well").mouseenter(function(){
		$("#notifier").html("Blower functioning normally");
		$("#notifier").css({"background-color": "#00e64d"});
	});

	//Hover-over f_temp
	$("#f_temp_well").mouseenter(function(){
		if(f_temp>300 ){
			$("#notifier").html("WARNING: Furnace Overheating!");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else if(f_temp<75){
			$("#notifier").html("WARNING: Furnace Malfunctioning");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else{
			$("#notifier").html("Furnace functioning normally");
			$("#notifier").css({"background-color": "#00e64d"});
		}
	});

	//Hover-over fuel_level
	$("#fuel_level_well").mouseenter(function(){
		var fuel_alarm =  $("#fuelAlarm").val()
		if(parseInt(fuel_level) < parseInt(fuel_alarm)){
			$("#notifier").html("WARNING: Low Fuel");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else{
			$("#notifier").html("High Fuel");
			$("#notifier").css({"background-color": "#00e64d"});
		}

	});

	//Hover-over s_temp
	$("#s_temp_well").mouseenter(function(){
		var max = $("#st_input_max").val();
		var min = $("#st_input_max").val();
		if(parseInt(s_temp)>parseInt(max)){
			$("#notifier").html("WARNING: Structure too HOT");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else if(parseInt(s_temp)<parseInt(max)){
			$("#notifier").html("WARNING: Cool Structure, Furnace may be off");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else{
			$("#notifier").html("Normal Structure Temperature");
			$("#notifier").css({"background-color": "#00e64d"});
		}
	});
	

	//Hover-over humidity
	$("#humidity_well").mouseenter(function(){
		$("#notifier").html("Normal Humidity");
		$("#notifier").css({"background-color": "#00e64d"});
	});

	//Refresh Function
	window.setInterval(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	}, 20000);

})