
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

var plc_dt = "http://192.168.1.100/dt";



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


/*function pull_data(){
	bspeed = $("#bspeed_data").val();
	set_temp = $("#set_temp").val();
	f_temp = $("#ftemp_data").val();
	fuel_level = $("#fuel_level_data").val();
	s_temp = $("#set_temp").val();
	humidity = $("#humidity_data").val();
}*/

//AJAX GET Request
function pull_data(){

	var post_data = "<files><data tag=\"TWD_FurnTemp\" count=\"-1\"/><data tag=\"TWD_StructureTemp\" count=\"-1\"/><data tag=\"TWD_FuelLevel\" count=\"-1\"/><data tag=\"TWD_Blower_Speed\" count=\"-1\"/><data tag=\"TWD_StructPercentH\" count=\"-1\"/></files>";

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
				var tag = $(this).getAttribute('tag');
				switch(tag){
					case "TWD_FurnTemp":
						f_temp = $(this).value();
						break;
					case "TWD_StructureTemp":
						s_temp = $(this).value();
						break;
					case "TWD_FuelLevel":
						fuel_level = $(this).value();
						break;
					case "TWD_StructPercentH":
						humidity = $(this).value();
						break;
					case "TWD_Blower_Speed":
						bspeed = $(this).value();
						break;
					case "mode":
						mode = $(this).value();
						break;
					case "TargetAirTemp":
						set_temp = $(this).value();
					case "FurnaceCutoffTemp":
						cutoff_temp = $(this).value();
				}
			}
		)},
			error: function(data){
				alert("AJAX failed: "+ data.status + ' ' + data.statusText);
			}
	});

	/*//Pull Furnace Temp
	$.ajax({
		type: "GET",
		url: "http://192.168.1.100/dt/TWD_FurnTemp?count=-1",
		//dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			f_temp = $(xml).find('data').value();
			$("#ftemp_data").text(f_temp+("\u00B0"));			
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});

	//Pull Structure Temp
	$.ajax({
		type: "GET",
		url: "http://192.168.1.100/dt/TWD_StructureTemp?count=-1",
		//dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			s_temp = $(xml).find('data').value();
			$("#stemp_data").text(s_temp+("\u00B0"));			
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});

	//Pull Fuel Level
	$.ajax({
		type: "GET",
		url: "http://192.168.1.100/dt/TWD_FuelLevel?count=-1",
		//dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			fuel_level = $(xml).find('data').value();
			$("#fuel_level_data").text(fuel_level+("\u00B0"));			
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});

	//Pull Blower Speed
	$.ajax({
		type: "GET",
		url: "http://192.168.1.100/dt/TWD_Blower_Speed?count=-1",
		//dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			bspeed = $(xml).find('data').value();
			//Refresh blower speed in well
			$("#bspeed_data").text(bspeed+("\u00B0"));
			//Refresh blower speed in panel
			$("#bspeed").text(bspeed);			
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});

	//Pull Humidity
	$.ajax({
		type: "GET",
		url: "http://192.168.1.100/dt/TWD_StructPercentH?count=-1",
		//dataType: "xml",
		async: true,
		cache: false,
		success: function(xml){
			humidity = $(xml).find('data').value();
			$("#humidity_data").text(humidity+("\u00B0"));			
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});*/
}

//AJAX XML file posting
function push_data(){

	var put_data = "<files><data tag=\"TWD_Blower_Speed\" count=\"-1\">"+bspeed+"</data><data tag=\"TargetAirTemp\" count=\"-1\">"+set_temp+"</data><data tag=\"mode\" count=\"-1\">"+mode+"</data><data tag=\"FurnaceCutoffTemp\" count=\"-1\">"+cutoff_temp+"</data></files>";

	$.ajax({
		url: plc_dt,
		data: put_data,
		type: "PUT", 
		async: true,	
		success: function(xml){
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});
}

//Function that enables the correct panel based on what mode we are in
function enable_mode(){
	//'1' for mod '0' for man
	if(mode == 1){
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

//Ajax PUT when button gets pressed
function button_callback(button_data){
	$.ajax({
		url: plc_dt,
		data: button_data,
		type: "PUT", 
		async: true,	
		success: function(xml){
		},
		error: function(data){
			alert("AJAX failed: "+ data.status + ' ' + data.statusText);
		}
	});
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
		mode = 0;
		enable_mode();
	});

	//Click on Modulation Mode
	$("#modmode").click(function(){
		//Disable Manual Mode
		mode = 1;
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
	});

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
		var start_data = "<files><data tag=\"Start\" count=\"1\">1</data></files>"
		button_callback(start_data);
	});


	//Click Stop Button
	$("#stop_btn").click(function(){
		var shutdown_data = "<files><data tag=\"Stop\" count=\"1\">1</data></files>"
		button_callback(shutdown_data);
	});	

	//Click Refresh Button
	$("#refresh_btn").click(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	});	

	//Click Send Button
	$("#send_btn").click(function(){
		push_data();
	});	

	//Click E-Stop Button
	$("#e_stop").click(function(){
		var e_stop_data = "<files><data tag=\"Estop\" count=\"1\">1</data></files>"
		button_callback(e_stop_data);
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
	/*window.setInterval(function(){
		pull_data();
		enable_mode();
		check_alarm_states();
	}, 20000);*/

})