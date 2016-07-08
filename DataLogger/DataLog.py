from lxml import html
import urllib2
import requests
import time
import sys
import Tkinter, tkFileDialog
import threading
from Tkinter import *
import csv
from lxml import etree

app = 'http://192.168.1.72:5000'
interval = 2
default_dir = "C:/"
current_dir = default_dir
default_filename = "DrySmartLog.csv"
filename = default_filename
header = 0

def startCallBack():

	global header 
	global directory

	threading.Timer(interval, startCallBack).start()

	#lxml

	#Retrieve Web Page
	#page = requests.get('http://192.168.1.72:5000')
	#tree = html.fromstring(page.content)


	#IMPORTANT: cURL request will be different on each piece of hardware
	headers = {
	    'Accept-Encoding': 'gzip, deflate, sdch',
	    'Accept-Language': 'en-US,en;q=0.8',
	    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
	    'Accept': '*/*',
	    'Referer': 'http://192.168.1.72:5000/',
	    'X-Requested-With': 'XMLHttpRequest',
	    'Connection': 'keep-alive',
	}

	page = (requests.get('http://192.168.1.72:5000/static/main.xml?_=1467833140400', headers=headers))
	root = etree.fromstring(page.content)
	
	
	date = time.strftime("%m/%d/%Y")
	current_time = time.strftime("%H:%M:%S")

	#Populate Values
	for item in root.iter('item'):	

		if (item[0].text == "blower_speed"):
			for value in item.iter('value'):
				blower_speed = value.text

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
				furnace_temp = value.text

		if (item[0].text == "fuel_level_data"):
			for value in item.iter('value'):
				fuel_level = value.text

		if (item[0].text == "stemp_data"):
			for value in item.iter('value'):
				structure_temp = value.text

		if (item[0].text == "humidity_data"):
			for value in item.iter('value'):
				humidity = value.text

	print "Date: "+date
	print "Time: "+current_time
	print "Blower Speed: ", blower_speed
	print "Furnace Temp: ", furnace_temp
	print "Fuel Level: ", fuel_level
	print "Structure Temp: ", structure_temp
	print "Humidity: ", humidity 

	sys.stdout.flush()

	#Export to CSV
	filename = file_field.get()
	fieldnames = ["Date", "Time", "Blower_Speed", "Furnace_Temperature", "Fuel_Level", "Structure_Temperature", "Humidity"]
	
	with open(current_dir+'/'+filename,'a') as csvfile:
		#writer = csv.writer(csvfile, delimiter=' ', quotechar='|', quoting=csv.QUOTE_MINIMAL)
		writer = csv.writer(csvfile)
		if header == 0:
			writer.writerow(fieldnames)
			header = 1
		else:
			writer.writerow([date, 
							current_time, 
							blower_speed, 
							furnace_temp,
							fuel_level,
							structure_temp,
							humidity])


def stopCallBack():
	print "Placeholder"
	sys.stdout.flush()

def browseCallBack():

	global current_dir

	directory = tkFileDialog.askdirectory(title="Select a Directory", initialdir = default_dir)

	if directory:
		try:
			dir_field.insert(0, directory)
			current_dir = directory
		except:
			tkMessageBox.showerror("Failed to open directory")




#Init
top = Tkinter.Tk()
img = PhotoImage(file="C:/School/Senior_Project/Software/DrySmart/static/images/Icon.gif")
top.tk.call('wm', 'iconphoto', top._w, img)

#Declare/Initialize Widgets
dir_field = Entry(top)
file_field = Entry(top)
start_button = Tkinter.Button(top, text="Logging On", command=startCallBack)
stop_button = Tkinter.Button(top, text="Logging Off", command = stopCallBack)
browse_button = Tkinter.Button(top, text="Browse", command = browseCallBack)


#Pack Widgets to GUI
start_button.pack()
stop_button.pack()
browse_button.pack()
dir_field.pack()
dir_field.delete(0, END)
dir_field.insert(0, default_dir)
file_field.delete(0, END)
file_field.insert(0, default_filename)
file_field.pack()

top.mainloop() 