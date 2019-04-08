import os
import requests
import json
import datetime

from flask import Flask, render_template, request, jsonify, flash
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

dictionary = {}

@app.route("/", methods=["GET"])
def index():
    return render_template('index.html')

@app.route("/add_channel", methods=["POST"])
def add_channel():
    new_channel = request.form.get("new_channel")
    if new_channel in dictionary:
        return jsonify({"success": False})
    else:
        dictionary[new_channel] = ["channel created"]
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
    new_message = data["new_message"]
    channel = data["channel"]
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
