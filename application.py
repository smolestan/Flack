import os
import requests

from flask import Flask, render_template, request, jsonify, flash
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

list = []

@app.route("/", methods=["GET"])
def index():
    return render_template('index.html', list=list)

@app.route("/add_channel", methods=["POST"])
def add_channel():
    new_channel = request.form.get("new_channel")
    if new_channel in list:
        return jsonify({"success": False})
    else:
        list.append(new_channel)
        return jsonify({"success": True})

@app.route('/channels/<string:channel>')
def channel(channel):
    return render_template('channel.html', channel=channel)

