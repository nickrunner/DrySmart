from __future__ import print_function
from flask import Flask, render_template
import xml.etree.ElementTree as ET
import sys
from flask import request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/xml_pop', methods=['POST'])
def xml_pop():

	print ('Entered XML pop function!', file=sys.stderr)

	#Open XML file
	try:
		tree = ET.parse('C:/School/Senior_Project/Software/DrySmart/static/main.xml')
	except ET.ParseError as err:
		print (err.code, file=sys.stderr)
	print ('Parsed XML file', file=sys.stderr)
	root = tree.getroot();
	print ('Found Root', file=sys.stderr)

	#Modifiy Tags with AJAX data
	bspeed = request.form.get('bspeed')
	set_temp = request.form.get('set_temp')
	mode = request.form.get('mode')
	mod_mode = request.form.get('modmode')

	for item in root.iter('item'):	
		if (item[0].text == "blower_speed"):
			for value in item.iter('value'):
				value.text = bspeed
				print ('Populated bspeed value ', file=sys.stderr)
			#item[3].text = '5'#
			print ('Populating bspeed', file=sys.stderr)
		if (item[0].text == "set_temp"):
			for value in item.iter('value'):
				value.text = set_temp
				print ('Set Temp:'+set_temp, file=sys.stderr)
			#item[3].text = '3' #request.args.get('set_temp')
			print ('Populating set_temp', file=sys.stderr)
		if (item[0].text == "mode"):
			for value in item.iter('value'):
				value.text = mode
			#item[3].text = 'man'#request.args.get('mode')
			print ('Populating mode', file=sys.stderr)
		if (item[0].text == "mod_mode"):
			for value in item.iter('value'):
				value.text = mod_mode
			#item[3].text = 'furnace'#request.args.get('mod_mode')
			print ('Populating mod_mode', file=sys.stderr)
		tree.write('C:/School/Senior_Project/Software/DrySmart/static/main.xml')
	
	return 'success'

if __name__ == '__main__':
	print ('Starting server', file=sys.stderr)
	app.run(debug=True, host='0.0.0.0')
