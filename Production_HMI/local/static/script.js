/*************************************************************************
 * 
 * DRYSMART CONTROL INTERFACE 
 * Client-side logic script
 * __________________
 * 
 *	
 *	Author: Nick Schrock 
 *	GVSU Senior Design Team
 *
 *  2016 DrySmart LLC 
 *  All Rights Reserved.
 * 	
 ************************************************************************/


//Global Sensor Data Variables 
var f_temp=0;
var fuel_level=0;
var s_temp=0;
var humidity=0;

//Global User-entered Variables(from HMI)
var mode = 0;
var cutoff_temp = 300;
var bspeed=1;
var target_bspeed=1;
var set_temp=200;

//Definition for rate of change when holding down arrow buttons 
var inc_time = 1000;

//Definitions for maximum values
var max_blower_speed = 10;
var min_blower_speed = 1;
var max_furnace_temp = 300;
var min_furnace_temp = 100;

//User Defined Alarm Variables
var st_temp_max = 125;
var st_temp_min = 0;
var fuel_alarm = 15;

//Data Table location for PLC (IP address could change for different HW)
var plc_dt = "http://192.168.1.100/dt";

//Data Table address definitions DO NOT ALTER
var bspeed_data_ad = "N27:6";
var bspeed_ad = "N27:7";
var f_temp_ad = "N27:0";
var s_temp_ad = "N27:1";
var fuel_level_ad = "N27:4";
var humidity_ad = "N27:4";
var mode_ad = "B003/000028";
var cutoff_temp_ad = "N27:8";
var set_temp_ad = "N27:10";
var start_btn_ad = "B0003/000004";
var stop_btn_ad = "B0003/000025";
var e_stop_btn_ad = "B0003/000005";
var st_temp_min_ad = "N27:3"
var st_temp_max_ad = "N27:2"
var fuel_alarm_ad = "N27:5";	
var email_ad_a = "ST0016:0002";
var email_ad_b = "ST0016:0006";
var email_ad_c = "ST0016:0007";
var email_ad_d = "ST0016:0008";


//Notification Messages
var furnace_hot_message = "WARNING: FURNACE OVERHEATING";
var furnace_cold_message = "Low output air temperature. Furnace may be malfunctioning ";
var struct_hot_message = "WARNING: STRUCTURE OVERHEATING";
var struct_cool_message = "Structure temperature below threshold";
var low_fuel_message = "WARNING: Low Fuel";
var high_fuel_message = "Adequate Fuel";
var humidity_message = "% Relative humidity inside structure";
var bspeed_message = "Actual blower speed on a 1-10 scale";

var flash = 0;

//refresh rate in ms
var refresh_rate = 1000;

function user(email, pn, carrier, address){
	this.email=email;
	this.pn=pn;
	this.carrier=carrier;
	this.address=address;
}

//AJAX GET Request
function pull_data(){

	post_data = "<files>";
	post_data += "<data ad=\""+f_temp_ad+"\" count=\"1\"/>";
	post_data += "<data ad=\""+s_temp_ad+"\" count=\"1\"/>";
	post_data += "<data ad=\""+fuel_level_ad+"\" count=\"1\"/>";
	post_data += "<data ad=\""+bspeed_data_ad+"\" count=\"1\"/>";
	post_data += "<data ad=\""+humidity_ad+"\" count=\"1\"/>";

	post_data += "</files>";

	console.log(post_data);

	//Gather Data from main.xml and store into variables
	$.ajax({
		type: "POST",
		url: plc_dt,
		data: post_data,
		dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			$(xml).find('data').each(function(){
				var ad = $(this).attr('ad');
				switch(ad){
					case f_temp_ad:
						f_temp = $(this).text();
						$("#ftemp_data").text(f_temp+("\u00B0")+("F"));
						break;
					case s_temp_ad:
						s_temp = $(this).text();
						$("#stemp_data").text(s_temp+("\u00B0")+("F"));
						break;
					case fuel_level_ad:
						fuel_level = $(this).text();
						$("#fuel_level_data").text(fuel_level+("%"));
						break;
					case humidity_ad:
						humidity = $(this).text();
						$("#humidity_data").text(humidity+("%"));
						break;
					case bspeed_data_ad:
						//rescale_bspeed();
						bspeed = $(this).text();
						//Refresh blower speed in well
						$("#bspeed_data").text(bspeed);
						//Refresh blower speed in panel
						//$("#bspeed").text(bspeed);	
						break;
					case mode_ad:
						mode = $(this).text();
						break;
					case set_temp_ad:
						set_temp = $(this).text();
						$("#set_temp").text(set_temp);
					case cutoff_temp_ad:
						cutoff_temp = $(this).text();
						$("#cutoff_temp").text(cutoff_temp);

				}
			}
		)},
			error: function(data){
				alert("AJAX POST failed: "+ data.status + ' ' + data.statusText);
			}
	});
}

/*function pull_users(){

	post_data = "<files>";
	post_data += "<data ad=\""+email_ad_a+"\" count=\"1\"/>";
	post_data += "<data ad=\""+email_ad_b+"\" count=\"1\"/>";
	post_data += "<data ad=\""+email_ad_c+"\" count=\"1\"/>";
	post_data += "<data ad=\""+email_ad_d+"\" count=\"1\"/>";

	$.ajax({
		type: "POST",
		url: plc_dt,
		data: post_data,
		dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			$(xml).find('data').each(function(){
				var ad = $(this).attr('ad');
				switch(ad){
					case email_ad_a:
						$("#email_a").text($this.text());

				}
			})},
			error: function(data){
				alert("AJAX POST failed: "+ data.status + ' ' + data.statusText);
			}
	});
}*/

//AJAX PUT request to send data to PLC
function push_data(data){

	console.log("Sending Data to PLC");
	console.log(data);

	$.ajax({
		url: plc_dt,
		data: data,
		type: "PUT", 
		async: true,	
		success: function(xml){
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});
}



function scale_bspeed(){
	range = max_blower_speed-min_blower_speed;
	bspeed = (bspeed-min_blower_speed)/range*10;
}

function rescale_bspeed(){
	range = max_blower_speed-min_blower_speed;
	bspeed = int((bspeed/10*range)+min_blower_speed);
}

//Function that enables the correct panel based on what mode we are in
function enable_mode(){
	//'0' for mod '1' for man
	if(mode == 0){
		$("#manmode").fadeTo('fast', 0.5);
		$("#modmode").fadeTo('fast', 1);
		$("#manmode").css({"box-shadow": "0px 0px 0px"});
		$("#modmode").css({"box-shadow": "5px 5px 5px #888888"});
		$("#bspeed").text(target_bspeed);
	}
	else{
		$("#manmode").fadeTo('fast', 1);
		$('#modmode').fadeTo('fast', 0.5);
		$("#modmode").css({"box-shadow": "0px 0px 0px"});
		$("#manmode").css({"box-shadow": "5px 5px 5px #888888"});
		$("#bspeed").text(target_bspeed);
	}
}

function check_alarm_states(){
	//Check Furnace
	if(f_temp>max_furnace_temp){
		$("#notifier").html(furnace_hot_message);
		$("#notifier").css({"background-color": "#ff4d4d"});
		$("#ftemp_data").css({"color": "#cc0000"});
		flash_screen();
	}
	else if(f_temp<min_furnace_temp){
		$("#notifier").html(furnace_cold_message);
		$("#notifier").css({"background-color": "#ff4d4d"});
		$("#ftemp_data").css({"color": "#cc0000"});
	}
	else{
		$("#ftemp_data").css({"color": "Navy"});
	}


	//Check Fuel
	if(parseInt(fuel_level) < parseInt(fuel_alarm)){
		$("#notifier").html(low_fuel_message);
		$("#notifier").css({"background-color": "#ff4d4d"});
		$("#fuel_level_data").css({"color": "#cc0000"});
	}
	else{
		$("#fuel_level_data").css({"color": "Navy"});
	}

	//Check Structure Temp
	if(parseInt(s_temp)>parseInt(st_temp_max)){
		$("#notifier").html(struct_hot_message);
		$("#notifier").css({"background-color": "#ff4d4d"});
		$("#stemp_data").css({"color": "#cc0000"});
	}
	else if(parseInt(s_temp)<parseInt(st_temp_min)){
		$("#notifier").html(struct_cool_message);
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

function flash_screen(){
	if(flash == 1){
		$("html, body, .jumbotron").css({"background-color": "#ff4d4d"});
		flash = 0;
	}
	else{
		$("html, body, .jumbotron").css({"background-color": "White"});
		flash = 1;
	}
	
}

function disable_send(){
	$("#send_btn").prop('disabled', true);
}

function enable_send(){
	$("#send_btn").prop('disabled', false);
}

$(document).ready(function(){

	//Initialize variables from main.xml
	pull_data();
	//Initialize HMI to correct mode
	enable_mode();
	//Look For Alarms
	check_alarm_states();

	//Disable send button because page is just loaded
	disable_send();
	
	//Click on Manual Mode
	$("#manmode").click(function(){
		//Disable Modulation Mode
		mode = 1;
		enable_mode();
		enable_send();
	});

	//Click on Modulation Mode
	$("#modmode").click(function(){
		//Disable Manual Mode
		mode = 0;
		enable_mode();
		enable_send();
	});

	//Click Blower Up Arrow
	$("#blower_up_arrow").mousehold(function(){
		if(target_bspeed<max_blower_speed){
			target_bspeed++;
		}
		$("#bspeed").text(target_bspeed);
		enable_send();
	}, inc_time);


	//Click Blower Down Arrow
	$("#blower_down_arrow").mousehold(function(){
		if(target_bspeed>min_blower_speed){
			target_bspeed--;
		}
		$("#bspeed").text(target_bspeed);
		enable_send();
	}, inc_time);

	//Click cutoff Up Arrow
	$("#cutoff_up_arrow").mousehold(function(){
		if(cutoff_temp<max_furnace_temp){
			cutoff_temp++;
		}
		$("#cutoff_temp").text(cutoff_temp+("\u00B0"));
		enable_send();
	}, inc_time);


	//Click cutoff down Arrow
	$("#cutoff_down_arrow").mousehold(function(){
		if(cutoff_temp>0){
			cutoff_temp--;
		}
		$("#cutoff_temp").text(cutoff_temp+("\u00B0"));
		enable_send();
	}, inc_time);

	//Click target Up Arrow
	$("#target_up_arrow").mousehold(function(){
		if(set_temp<max_furnace_temp){
			set_temp++;
		}
		$("#set_temp").text(set_temp+("\u00B0"));
		enable_send();
	}, inc_time);

	//Click target down Arrow
	$("#target_down_arrow").mousehold(function(){
		if(set_temp>0){
			set_temp--;
		}
		$("#set_temp").text(set_temp+("\u00B0"));
		enable_send();
	}, inc_time);


	//Click Start Button
	$("#start_btn").click(function(){
		var start_data = "<files><data ad=\""+start_btn_ad+"\" count=\"1\">1</data></files>"
		push_data(start_data);
	});


	//Click Stop Button
	$("#stop_btn").click(function(){
		var shutdown_data = "<files><data ad=\""+stop_btn_ad+"\" count=\"1\">1</data></files>"
		push_data(shutdown_data);
		disable_send();
	});	

	//Click Refresh Button
	$("#refresh_btn").click(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	});	

	//Click Send Button
	$("#send_btn").click(function(){
		//scale_bspeed();
		var data = "<files>";
		data += "<data ad=\""+bspeed_ad+"\" count=\"1\">"+target_bspeed+"</data>";
		data += "<data ad =\""+set_temp_ad+"\" count=\"1\">"+set_temp+"</data>";
		data += "<data ad=\""+mode_ad+"\" count=\"1\">"+mode+"</data>";
		data += "<data ad=\""+cutoff_temp_ad+"\" count=\"1\">"+cutoff_temp+"</data>";
		data += "</files>";
		//var data = "<files>"+TWD_Blower_Speed+TargetAirTemp+_mode+FurnaceCutoffTemp+"</files>";
		disable_send();
		push_data(data);
	});	

	//Click E-Stop Button
	$("#e_stop").click(function(){
		//alert("WARNING: Continuing will shut off power to the system requiring a manual restart. Are you sure you want to continue?");
		var e_stop_data = "<files><data ad=\""+e_stop_btn_ad+"\" count=\"1\">1</data></files>"
		push_data(e_stop_data);
		disable_send();
	});	

	//Click Add User Submit Button
	$("#submit_user").click(function(){

		//var emails = [$("#email_a").val(), $("#email_b").val(), $("#email_c").val(), $("#email_d").val()];
		var i;
		var user_data = "<files>";
		
		count = 1;

		user_a = new user($("#email_a").val(), $("#pn_a").val(), $("#carrier_a").val(), email_ad_a);
		user_b = new user($("#email_b").val(), $("#pn_b").val(), $("#carrier_b").val(), email_ad_b);
		user_c = new user($("#email_c").val(), $("#pn_c").val(), $("#carrier_c").val(), email_ad_c);
		user_d = new user($("#email_d").val(), $("#pn_d").val(), $("#carrier_d").val(), email_ad_d);

		users = [user_a, user_b, user_c, user_d];

		for (i in users){
			var email_data = "<str>";
			if (users[i].email.length >= 40){
				alert("Email address must be less than 40 characters");
				break;
			}
			email_data += users[i].email;
			console.log("email: "+users[i].email);
			console.log("pn: "+users[i].pn);
			console.log("carrier:"+users[i].carrier);
			if(users[i].pn != ""){
				if(users[i].carrier != "Select Carrier"){
					email_data += ",";
					email_data += users[i].pn;
					switch(users[i].carrier){
						case "AT&T":
							email_data += "@txt.att.net";
							break;
						case "Verizon":
							email_data += "@vtext.com";
							break;
						case "Sprint":
							email_data += "@messaging.sprintpcs.com";
							break;
						case "US Cellular":
							email_data += "@email.uscc.net";
							break;
						case "Boost Mobile":
							email_data += "@myboostmobile.com";
							break;
						case "Virgin USA":
							email_data += "@vmobl.com";
							break;
						case "T-Mobile":
							email_data += "@tmomail.net";
							break;
					}
				}	
			}

			email_data += "</str>"
			user_data += "<data ad=\""+users[i].address+"\" count=\""+count+"\">"+email_data+"</data>";
		}	

		//email_data += "</str>"
		//user_data += "<data ad=\""+email_ad+"\" count=\""+count+"\">"+email_data+"</data>";			
		user_data += "</files>";

		push_data(user_data);

	});	

	//Click Submit Alarm
	$("#submit_alarm").click(function(){
		st_temp_max = $("#st_input_max").val();
		st_temp_min = $("#st_input_min").val();
		fuel_alarm =  $("#fuelAlarm").val();

		data = "<files>";

		data += "<data ad=\""+st_temp_max_ad+"\" count=\"1\">"+st_temp_max+"</data>";
		data += "<data ad=\""+st_temp_min_ad+"\" count=\"1\">"+st_temp_min+"</data>";
		data += "<data ad=\""+fuel_alarm_ad+"\" count=\"1\">"+fuel_alarm+"</data>";
		
		data += "</files>";

		push_data(data);
	});

	

	//Hover-over bspeed
	$("#bspeed_well").mouseenter(function(){
		$("#notifier").html(bspeed_message);
		$("#notifier").css({"background-color": "#00e64d"});
	});

	//Hover-over f_temp
	$("#f_temp_well").mouseenter(function(){
		if(f_temp>max_furnace_temp ){
			$("#notifier").html("WARNING: Furnace Overheating!");
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else if(f_temp<min_furnace_temp){
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
		//var fuel_alarm =  $("#fuelAlarm").val()
		if(parseInt(fuel_level) < parseInt(fuel_alarm)){
			$("#notifier").html(low_fuel_message);
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else{
			$("#notifier").html(high_fuel_message);
			$("#notifier").css({"background-color": "#00e64d"});
		}

	});

	//Hover-over s_temp
	$("#s_temp_well").mouseenter(function(){
		var max = $("#st_input_max").val();
		var min = $("#st_input_max").val();
		if(parseInt(s_temp)>parseInt(max)){
			$("#notifier").html(struct_hot_message);
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else if(parseInt(s_temp)<parseInt(max)){
			$("#notifier").html(struct_cool_message);
			$("#notifier").css({"background-color": "#ff4d4d"});
		}
		else{
			$("#notifier").html("Normal Structure Temperature");
			$("#notifier").css({"background-color": "#00e64d"});
		}
	});
	

	//Hover-over humidity
	$("#humidity_well").mouseenter(function(){
		$("#notifier").html(humidity_message);
		$("#notifier").css({"background-color": "#00e64d"});
	});


	//Refresh Function
	window.setInterval(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	}, refresh_rate);

})