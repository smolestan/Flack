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

dictionary = {}
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')


@app.route("/", methods=["GET"])
def index():
    return render_template('index.html')

@app.route("/add_channel", methods=["POST"])
def add_channel():
    new_channel = request.form.get("new_channel")
    name = request.form.get("name")
    if new_channel in dictionary:
        return jsonify({"success": False})
    else:
        first_msg = timestamp + " - " + "Channel created" " by " + name
        dictionary[new_channel] = [first_msg]
        return jsonify({"success": True})

@app.route('/channels', methods=["POST"])
def channels():
    if dictionary:
        channellist = []
        for x in dictionary:
            channellist.append(x)
        return jsonify({"success": True, "channellist": channellist})
    else:
        return jsonify({"success": False})

@socketio.on("submit message")
def new_message(data):
    new_message = timestamp + " - " + data["new_message"]
    channel = data["channel"]
    if len(dictionary[channel]) < 100:
        dictionary[channel].append(new_message)
    else:
        del dictionary[channel][0]
        dictionary[channel].append(new_message)
    emit("announce message", {"new_message": new_message}, broadcast=True)

@app.route('/content', methods=["POST"])
def content():
    if dictionary:
        data = json.loads(request.data)
        channel = data["channel"]
        messages = dictionary[channel]
        return jsonify({"success": True, "content": messages})
    else:
        return jsonify({"success": False})
