document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure sending information
    socket.on('connect', () => {

        // Sending information about connected user
        let name = localStorage.getItem('name');
        socket.emit('login', {'new_user': name});

        // Sending messages on submission
        document.querySelector('#MessageForm').onsubmit = () => {
            var new_message = document.querySelector('#new_message').value
            let channel = localStorage.getItem('channel');
            let name = localStorage.getItem('name');
            full_message = name + ": " + new_message;
            socket.emit('submit message', {'new_message': full_message, 'channel': channel});
            document.querySelector('#new_message').value = '';
            return false;
        };
    });

    // When a new message is announced, add to the list
    socket.on('announce message', data => {
        msg = `${data.new_message}`
        if (channel == data.channel) {
            mli = document.createElement('li');
            mli.setAttribute('class', 'mli list-group-item-light')
            mli.innerHTML = msg;
            document.querySelector('#messages').append(mli);
            items = document.querySelectorAll(".mli");
            last = items[items.length-1];
            last.scrollIntoView();
        }
    })
    
    // When a new user is connected announce about it for 3 sec
    socket.on('announce new user', data => {
        document.querySelector('#footer').style.display = "initial";
        document.querySelector('#fh6').innerHTML = `${data.new_user}`
        setTimeout(function() {
            document.querySelector('#footer').style.display = "none";
        }, 3000);
    })

    // Creating a new channel
    document.querySelector('#CreateChannelForm').onsubmit = () => {
        const request = new XMLHttpRequest();
        var new_channel = document.querySelector('#new_channel').value;
        // Special route for adding new channels
        request.open('POST', '/add_channel');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            // Check if such channel is unique
            if (data.success) {    
                document.querySelector('#greeting').innerHTML = "Channel created";
                // Adding new channel as a row to the table
                var row = document.createElement('tr');
                var cell = document.createElement('td');
                var link = document.createElement('a');
                link.setAttribute('class', 'channel-change');
                link.setAttribute('data-channel', new_channel);
                link.setAttribute('href', "#")
                var cellText = document.createTextNode(new_channel);
                link.appendChild(cellText);
                cell.appendChild(link);
                row.appendChild(cell);
                document.querySelector('#channeltablebody').appendChild(row);

                // Adding onclick behaviour for the channel name row in the table
                document.querySelectorAll('.channel-change').forEach(function(a) {
                    a.onclick = function() {
                        let channel = a.dataset.channel;
                        localStorage.setItem('channel', channel);
                        ChannelView(channel, name);
                    };
                });
        }
            else {
                document.querySelector('#greeting').innerHTML = "Channel already exists";
            }
        }
        // Sending request to the server
        const data = new FormData();
        let name = localStorage.getItem('name');
        data.append('new_channel', new_channel);
        data.append('name', name);
        request.send(data);
        document.querySelector('#new_channel').value = '';
        return false;
    };

    // User can change the name, if it is not him
    document.querySelector('#ChangeNameButton').onclick = () => {
        localStorage.clear();
        document.querySelector('#name').value = '';
        SaveNameView();
        document.querySelector('#loginform').onsubmit = () => {
            var name = document.querySelector('#name').value;
            if (name) {
                // Storing the name to the clients local storage
                localStorage.setItem('name', name);
                socket.emit('login', {'new_user': name});
                ChannelListView(name);
            }
            else {
                SaveNameView();
            }
            return false;
        };    
    };
    
    document.querySelector('#ChannelListButton').onclick = function() {
        ChannelListView();
    };

    // By default, all submit buttons is disabled
    document.querySelector('#submit').disabled = true;
    document.querySelector('#CreateChannelButton').disabled = true;
    document.querySelector('#SendMessage').disabled = true;

    // Enable submit buttons only if there is text in the input field
    // New display name button
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    }
    // New channel button
    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#new_channel').value.length > 0)
            document.querySelector('#CreateChannelButton').disabled = false;
        else
            document.querySelector('#CreateChannelButton').disabled = true;
    }
    // New message button
    document.querySelector('#new_message').onkeyup = () => {
        if (document.querySelector('#new_message').value.length > 0)
            document.querySelector('#SendMessage').disabled = false;
        else
            document.querySelector('#SendMessage').disabled = true;
    }
    
    // Making Channel View to show messages in particular channel
    function ChannelView() {
        name = localStorage.getItem('name');
        channel = localStorage.getItem('channel');
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name + " @ " + channel + " channel";
        document.querySelector('#greeting').innerHTML = "Please, be polite and funny";
        document.querySelector('#MessagesList').style.display = "initial";
        document.querySelector('#loginform').style.display = "none";
        document.querySelector('#CreateChannelForm').style.display = "none";
        document.querySelector('#ChannelList').style.display = "none";
        document.querySelector('#ChannelListButton').style.display = "initial";
        document.querySelector('#ChangeNameButton').style.display = "initial";

        // Making initial request to create history message list
        const request = new XMLHttpRequest();
        request.open('POST', '/content');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {  
                // Clear the list before filling in
                root = document.querySelector('#messages');
                while( root.firstChild ){
                    root.removeChild( root.firstChild );
                  }
                // Creating list items for every message
                data.content.forEach(createMsgRow);
                function createMsgRow(value) {
                    mli = document.createElement('li');
                    mli.setAttribute('class', 'mli list-group-item-light')
                    mli.innerHTML = value;
                    document.querySelector('#messages').append(mli);
                    // Scrolling message list to the bottom
                    items = document.querySelectorAll(".mli");
                    last = items[items.length-1];
                    last.scrollIntoView();            
                }
            }
        }
        // Requesting messages from particular channel
        var data = JSON.stringify({'channel': channel});
        request.send(data);
    }

    // Making Channel List View to show all existing channels
    function ChannelListView() {
        name = localStorage.getItem('name');
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name;
        document.querySelector('#greeting').innerHTML = "Please, choose an existing channel, or create a new one";
        document.querySelector('#loginform').style.display = "none";
        document.querySelector('#CreateChannelForm').style.display = "initial";
        document.querySelector('#ChannelList').style.display = "initial";
        document.querySelector('#ChannelListButton').style.display = "none";
        document.querySelector('#ChangeNameButton').style.display = "initial";
        document.querySelector('#MessagesList').style.display = "none";

        // Making a request to get existing channels list
        const request = new XMLHttpRequest();
        request.open('POST', '/channels');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {   
                // Clearing the table with channel list before filling in
                var rowCount = channelsTable.rows.length;
                for (var i = rowCount - 1; i > 0; i--) {
                    channelsTable.deleteRow(i);
                } 
                // Creating rows with channel names to the table
                data.channellist.forEach(createRow);
                function createRow(value) {
                    var row = document.createElement('tr');
                    var cell = document.createElement('td');
                    var link = document.createElement('a');
                    link.setAttribute('class', 'channel-change');
                    link.setAttribute('data-channel', value);
                    link.setAttribute('href', "#")
                    var cellText = document.createTextNode(value);
                    link.appendChild(cellText);
                    cell.appendChild(link);
                    row.appendChild(cell);
                    document.querySelector('#channeltablebody').appendChild(row);

                     // Adding onclick behaviour for the channel name row in the table
                    document.querySelectorAll('.channel-change').forEach(a => {
                        a.onclick = () => {
                            let channel = a.dataset.channel;
                            localStorage.setItem('channel', channel);
                            ChannelView(channel, name);
                        };
                    });
                
                } 
            }
            else {
                document.querySelector('#greeting').innerHTML = "There are no channels yet, please create";
            }
        }
        const data = new FormData();
        request.send(data);

    }
    // View for asking to provide display name
    function SaveNameView() {
        document.querySelector('#brand').innerHTML = "Flack";
        document.querySelector('#greeting').innerHTML = "Welcome! <br>Please, introduce yourself";
        document.querySelector('#loginform').style.display = "initial";
        document.querySelector('#CreateChannelForm').style.display = "none";
        document.querySelector('#ChannelList').style.display = "none";
        document.querySelector('#ChannelListButton').style.display = "none";
        document.querySelector('#ChangeNameButton').style.display = "none";
        document.querySelector('#MessagesList').style.display = "none";
    }

    // Last channel condition
    if (localStorage.getItem('channel')) {
        let channel = localStorage.getItem('channel');
        let name = localStorage.getItem('name');

        const request = new XMLHttpRequest();
        request.open('POST', '/content');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {  
                ChannelView(channel, name);
            }
            else {
                ChannelListView(name);
            }
        }
        var data = JSON.stringify({'channel': channel});
        request.send(data);

    }
    // Channel list condition
    else if (localStorage.getItem('name')) {
        let name = localStorage.getItem('name');
        ChannelListView(name);
    }
    // New user condition
    else {
        SaveNameView();
        document.querySelector('#loginform').onsubmit = () => {
            var name = document.querySelector('#name').value;
            if (name) {
                localStorage.setItem('name', name);
                socket.emit('login', {'new_user': name});
                ChannelListView(name);
            }
            else {
                SaveNameView();
            }
            return false;
        };
    }
});