import time
import xml.etree.ElementTree as ET
import sys

bspeed=7;
f_temp=121;
fuel_level=100;
s_temp=72;
humidity=100;
set_temp=5;
mode = "mod";
mod_mode = "blower";

def pull_data():
	global set_temp 
	global humidity
	global fuel_level
	global f_temp
	global s_temp
	#Open XML file
	try:
		tree = ET.parse('C:/School/Senior_Project/Software/DrySmart/static/main.xml')
	except ET.ParseError as err:
		print 'Error opening XML'
	root = tree.getroot();

	#Populate Values
	for item in root.iter('item'):	

		if (item[0].text == "blower_speed"):
			for value in item.iter('value'):
				bspeed = value.text

		if (item[0].text == "set_temp"):
			for value in item.iter('value'):
				 set_temp = value.text
				 print str(set_temp)
			
		if (item[0].text == "mode"):
			for value in item.iter('value'):
				mode = value.text

		if (item[0].text == "mod_mode"):
			for value in item.iter('value'):
				mod_mode = value.text

		if (item[0].text == "ftemp_data"):
			for value in item.iter('value'):
				f_temp = value.text

		if (item[0].text == "fuel_level_data"):
			for value in item.iter('value'):
				fuel_level = value.text

		if (item[0].text == "stemp_data"):
			for value in item.iter('value'):
				s_temp = value.text

		if (item[0].text == "humidity_data"):
			for value in item.iter('value'):
				humidity = value.text

def push_data():
	#Open XML file
	tree = ET.parse('C:/School/Senior_Project/Software/DrySmart/static/main.xml')
	root = tree.getroot();

	#Populate Values
	for item in root.iter('item'):	 
			

		if (item[0].text == "ftemp_data"):
			for value in item.iter('value'):
				value.text = str(f_temp )

		if (item[0].text == "fuel_level_data"):
			for value in item.iter('value'):
				value.text = str(fuel_level)

		if (item[0].text == "stemp_data"):
			for value in item.iter('value'):
				value.text = str(s_temp) 

		if (item[0].text == "humidity_data"):
			for value in item.iter('value'):
				value.text = str(humidity) 

		tree.write('C:/School/Senior_Project/Software/DrySmart/static/main.xml')


def adjust(count):
	max_temp = bspeed * 20;
	global set_temp 
	global humidity
	global fuel_level
	global f_temp
	global s_temp
	print str(set_temp)
	if set_temp is None:
		set_temp = 0
	ftemp = int(f_temp)
	hum = int(humidity)
	fl = int(fuel_level)
	st = int(s_temp)
	settemp = int(set_temp)
	#Adjust structure temp
	if(count%5 == 0):
		if (st < max_temp):
			st += 1
		else:
			st -= 1

	#Adjust structure humidity
	if(count%20 == 0):
		hum -= 1

	#Adjust Fuel Level
	if(i%25 == 0):
		fl -= 1

	#Adjust Furnace
	if(ftemp < settemp):
		ftemp += 1
	else:
		ftemp -= 1

	f_temp = ftemp
	humidity = hum
	fuel_level = fl
	s_temp = st
	set_temp = settemp

if __name__ == '__main__':
	i=0
	push_data()
	while(1):
		i += 1
		pull_data()
		time.sleep(1)
		adjust(i)
		push_data()

		print 'Blower Speed: '+str(bspeed)
		print 'Furnace Temp: '+str(f_temp)
		print 'Fuel Level: '+str(fuel_level)
		print 'Structure Temp: '+str(s_temp)
		print 'Humidity: '+str(humidity)
		print 'Set Temp: '+str(set_temp)
		print 'Mode of operation: '+str(mode)
		print 'Modulation Mode: '+str(mod_mode)
		print ''
		sys.stdout.flush()

		
