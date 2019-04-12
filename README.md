# Project 2

Web Programming with Python and JavaScript

In this project, I built an online messaging service using Flask and SocketIO.

When a user visits my web application for the first time, they are prompted to type in a display name that are associated with every message the user sends. If a user closes the page and returns to my app later, the display name is still remembered, but in case if it is another user on the same machine, the name can be changed.

Any user is able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel. Also, users are able to see a list of all current channels, and selecting one allow the user to view the channels contents. Once a channel is selected, the user can see any messages that have already been sent in that channel, up to a maximum of 100 messages. My app only stores the 100 most recent messages per channel in server-side memory.

Once in a channel, users are able to send text messages to others in the channel. When a user sends a message, their display name and the timestamp of the message is associated with the message. All users in the channel see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages don't require reloading the page. Actualy, my application is a single page web application, so it doesn't requere reloading the page at all.

If a user is on a channel page, closes the web browser window, and goes back to my web application later, my application remembers what channel the user was on previously and take the user back to that channel if it still exists.

As a personal touch I have added a feature to announce every user if new user is connected (with display name and timestamp) while they are using my application.

For more details, please see my screencast and review my code.

Thank you!