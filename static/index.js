document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#CreateChannelButton').onclick = createchannel;

    // By default, Change Name button is disabled, it appears only if the page was reloaded (as it is a possibility of a new user on the same machine) and a Display Name is already stored (and possibly needs to be changed)
    document.querySelector('#ChangeName').style.display = "none";

    // By default, add channel form is disabled
    document.querySelector('#CreateChannelForm').style.display = "none";

    // By default, submit button is disabled
    document.querySelector('#submit').disabled = true;
    document.querySelector('#CreateChannel').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    }

    document.querySelector('#new_channel').onkeyup = () => {
        if (document.querySelector('#new_channel').value.length > 0)
            document.querySelector('#CreateChannel').disabled = false;
        else
            document.querySelector('#CreateChannel').disabled = true;
    }
    
    function register() {
        var name = document.querySelector('#name').value;
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name;
        localStorage.setItem('name', name);
        document.querySelector('#loginform').style.display = "none";
        // Hide Change name button after changing before next page reload (as it may be new user)
        document.querySelector('#ChangeName').style.display = "none";
        // Stop form from submitting
        document.querySelector('#greeting').innerHTML = "Please, choose an existing channel, or create a new one";
        document.querySelector('#list').style.display = "initial";
        return false;
    }

    function changename() {
        document.querySelector('#loginform').style.display = "initial";
        document.querySelector('#info').style.display = "none";
        document.querySelector('#greeting').innerHTML = "Please, provide new name";
        document.querySelector('#loginform').onsubmit = register;
    }

    function createchannel() {
        document.querySelector('#CreateChannelForm').style.display = "initial";
        document.querySelector('#CreateChannelForm').onsubmit = () => {
            const request = new XMLHttpRequest();
            const new_channel = document.querySelector('#new_channel').value;
            request.open('POST', '/add_channel');
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if (data.success) {
                    document.querySelector('#greeting').innerHTML = "Channel created";
                }
                else {
                    document.querySelector('#greeting').innerHTML = "Channel already exists";
                }
            }
            const data = new FormData();
            data.append('new_channel', new_channel);
            request.send(data);
            return false;
        };
    };

    if (localStorage.getItem('name')) {
        let name = localStorage.getItem('name')
        document.querySelector('#brand').innerHTML = "Flack" + ": " + name;
        document.querySelector('#loginform').style.display = "none";
        document.querySelector('#ChangeName').style.display = "initial";
        document.querySelector('#ChangeName').onclick = changename;

    } else {
        document.querySelector('#greeting').innerHTML = "Welcome! <br>Please introduce yourself";
        document.querySelector('#list').style.display = "none";
        document.querySelector('#loginform').onsubmit = register;
    }
});