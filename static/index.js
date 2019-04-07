document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#CreateChannelForm').onsubmit = () => {
        const request = new XMLHttpRequest();
        var new_channel = document.querySelector('#new_channel').value;
        request.open('POST', '/add_channel');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {    
                document.querySelector('#greeting').innerHTML = "Channel created";
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
        const data = new FormData();
        data.append('new_channel', new_channel);
        request.send(data);
        document.querySelector('#new_channel').value = '';
        return false;
    };

    document.querySelector('#ChangeNameButton').onclick = () => {
        var name = document.querySelector('#name').value;
        if (name) {
            localStorage.setItem('name', name);
            ChannelListView(name);
        }
        else {
            SaveNameView();
        }
        return false;
    };
    
    document.querySelector('#ChannelListButton').onclick = ChannelListView;

    // By default, submit button is disabled
    document.querySelector('#submit').disabled = true;
    document.querySelector('#CreateChannelButton').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    }

    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#new_channel').value.length > 0)
            document.querySelector('#CreateChannelButton').disabled = false;
        else
            document.querySelector('#CreateChannelButton').disabled = true;
    }
    
    function ChannelView(channel, name) {
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name + " @ " + channel + " channel";
        document.querySelector('#greeting').innerHTML = "Please, be polite and humorous";
        document.querySelector('#loginform').style.display = "none";
        document.querySelector('#CreateChannelForm').style.display = "none";
        document.querySelector('#ChannelList').style.display = "none";
        document.querySelector('#ChannelListButton').style.display = "initial";
        document.querySelector('#ChangeNameButton').style.display = "initial";
    }

    function ChannelListView(name) {
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name;
        document.querySelector('#greeting').innerHTML = "Please, choose an existing channel, or create a new one";
        document.querySelector('#loginform').style.display = "none";
        document.querySelector('#CreateChannelForm').style.display = "initial";
        document.querySelector('#ChannelList').style.display = "initial";
        document.querySelector('#ChannelListButton').style.display = "none";
        document.querySelector('#ChangeNameButton').style.display = "initial";

        const request = new XMLHttpRequest();
        request.open('POST', '/channels');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {    
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

                    document.querySelectorAll('.channel-change').forEach(function(a) {
                        a.onclick = function() {
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

    function SaveNameView() {
        document.querySelector('#brand').innerHTML = "Flack";
        document.querySelector('#greeting').innerHTML = "Welcome! <br>Please, introduce yourself";
        document.querySelector('#loginform').style.display = "initial";
        document.querySelector('#CreateChannelForm').style.display = "none";
        document.querySelector('#ChannelList').style.display = "none";
        document.querySelector('#ChannelListButton').style.display = "none";
        document.querySelector('#ChangeNameButton').style.display = "none";
    }

    // Last channel condition
    if (localStorage.getItem('channel')) {
        let channel = localStorage.getItem('channel');
        let name = localStorage.getItem('name');
        ChannelView(channel, name);
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
            ChannelListView(name);
        }
        else {
            SaveNameView();
        }
        return false;};
    }
});