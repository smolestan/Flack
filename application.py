import os
import requests
import json
import datetime

from flask import Flask, render_template, request, jsonify, flash
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# In main dictionary all the messages are stored
dictionary = {}
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

@app.route("/", methods=["GET"])
def index():
    return render_template('index.html')

# This route adds new channels to the list
@app.route("/add_channel", methods=["POST"])
def add_channel():
    new_channel = request.form.get("new_channel")
    name = request.form.get("name")
    if new_channel in dictionary:
        # And check if it is not already exists
        return jsonify({"success": False})
    else:
        # and add timestamp and author's name
        first_msg = timestamp + " - " + "Channel created" " by " + name
        dictionary[new_channel] = [first_msg]
        return jsonify({"success": True})

# This route returns stored channel list
@app.route('/channels', methods=["POST"])
def channels():
    if dictionary:
        channellist = []
        for x in dictionary:
            channellist.append(x)
        return jsonify({"success": True, "channellist": channellist})
    else:
        return jsonify({"success": False})

# This route is working realtime and broadcast new messages to all connected sockets
@socketio.on("submit message")
def new_message(data):
    # before storing message to the dictionary adding timestamp from the servers clock
    new_message = timestamp + " - " + data["new_message"]
    channel = data["channel"]
    # we have to store only last 100 messages for each channel, so checking to it
    if len(dictionary[channel]) < 100:
        dictionary[channel].append(new_message)
    else:
        del dictionary[channel][0]
        dictionary[channel].append(new_message)
    emit("announce message", {"new_message": new_message, "channel": channel}, broadcast=True)

# This route return stored messages history for particular channel
@app.route('/content', methods=["POST"])
def content():
    if dictionary:
        data = json.loads(request.data)
        channel = data["channel"]
        messages = dictionary[channel]
        return jsonify({"success": True, "content": messages})
    else:
        return jsonify({"success": False})

# This route is working with user connections and broadcast changes
@socketio.on("login")
def login(data):
    if data["new_user"]:
        new_user = timestamp + " - " + data["new_user"] + " connected"
        emit("announce new user", {"new_user": new_user}, broadcast=True)
    
