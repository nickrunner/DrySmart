
//Variables representing Sensor Data
var bspeed=0;
var set_temp=0;
var f_temp=0;
var fuel_level=0;
var s_temp=0;
var humidity=0;
var mode = "mod";
var mod_mode = "blower";
var max_blower_speed = 10;
var max_furnace_temp = 300;
var cutoff_temp = 300;
var mouseDown = 0;
var inc_time = 1000;

var users =[];


//User Object Declaration
/*var user ={
	email,
	pn
};*/

//User Object Constructer
function user(email, pn){
	this.email = email;
	this.pn = pn;
	this.add = function(email, pn){
		//users.push(this.email);
		alert("Added user");
	};
	this.remove = function(email, pn){
		/*int i = 0;
		for(i=0; i<users.length; i++){
			if(users[i].email == this.email){
				users.splice(i, 1);
			}
		}*/
		alert("Removed User");
	};
	this.edit = function(email, pn){
		this.email = email;
		this.pn = pn;
		alert("Edited user")
	};
}


function pull_data(){
	bspeed = $("#bspeed_data").val();
	set_temp = $("#set_temp").val();
	f_temp = $("#ftemp_data").val();
	fuel_level = $("#fuel_level_data").val();
	s_temp = $("#set_temp").val();
	humidity = $("#humidity_data").val();
}

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

//MouseHold Plugin
jQuery.fn.mousehold = function(timeout, f) {
	if (timeout && typeof timeout == 'function') {
		f = timeout;
		timeout = 100;
	}
	if (f && typeof f == 'function') {
		var timer = 0;
		var fireStep = 0;
		return this.each(function() {
			jQuery(this).mousedown(function() {
				fireStep = 1;
				var ctr = 0;
				var t = this;
				timer = setInterval(function() {
					ctr++;
					f.call(t, ctr);
					fireStep = 2;
				}, timeout);
			})

			clearMousehold = function() {
				clearInterval(timer);
				if (fireStep == 1) f.call(this, 1);
				fireStep = 0;
			}
			
			jQuery(this).mouseout(clearMousehold);
			jQuery(this).mouseup(clearMousehold);
		})
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

	//Click Blower Up Arrow
	$("#blower_up_arrow").click(function(){
		if(bspeed<max_blower_speed){
			bspeed++;
		}
		$("#bspeed").text(bspeed);
	});


	//Click Blower Down Arrow
	$("#blower_down_arrow").click(function(){
		if(bspeed>0){
			bspeed--;
		}
		$("#bspeed").text(bspeed);
	}, inc_time);

	//Click cutoff Up Arrow
	$("#cutoff_up_arrow").mousehold(function(){
		if(cutoff_temp<max_furnace_temp){
			cutoff_temp++;
		}
		$("#cutoff_temp").text(cutoff_temp+("\u00B0"));
	}, inc_time);


	//Click cutoff down Arrow
	$("#cutoff_down_arrow").mousehold(function(){
		if(cutoff_temp>0){
			cutoff_temp--;
		}
		$("#cutoff_temp").text(cutoff_temp+("\u00B0"));
	}, inc_time);

	//Click target Up Arrow
	$("#target_up_arrow").mousehold(function(){
		if(set_temp<max_furnace_temp){
			set_temp++;
		}
		$("#set_temp").text(set_temp+("\u00B0"));
	}, inc_time);

	//Click target down Arrow
	$("#target_down_arrow").mousehold(function(){
		if(set_temp>0){
			set_temp--;
		}
		$("#set_temp").text(set_temp+("\u00B0"));
	}, inc_time);


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

	//Click Add User Submit Button
	$("#submit_user").click(function(){
		new_user = new user($("#emailInput").text(), $("#phoneInput".text()))
		users.push(new_user);
		alert("New User Added!");
	});	

	//Click Remove user 1 button
	$("#user1_remove").click(function(){
		users.splice(1, 1);
		alert("User 1 Removed");
	});	

	//Click Remove user 2 button
	$("#user2_remove").click(function(){
		users.splice(2, 1);
	});

	//Click Remove user 3 button
	$("#user3_remove").click(function(){
		users.splice(3, 1);
	});

	//Click Remove user 4 button
	$("#user4_remove").click(function(){
		users.splice(4, 1);
	});

	//Click edit user 1 button
	$("#user1_edit").click(function(){

	});	

	//Click edit user 2 button
	$("#user2_edit").click(function(){

	});

	//Click edit user 3 button
	$("#user3_edit").click(function(){

	});

	//Click edit user 4 button
	$("#user4_edit").click(function(){

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

	//Add User "Submit" button
	$("#send_btn").click(function(){

	});

	//Refresh Function
	window.setInterval(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	}, 20000);

})