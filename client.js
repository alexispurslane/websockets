var socket = null,
    sents = 0,
    dontadds = [],
    conversation = "",
    toBR = function(string) {
        string.replace(/\n/, "<br />");
    },
    toNewline = function(string) {
        string.replace(/\<br \/\>/, "\n");
    },
    log = function(data) {
        var msgTemplate = _.template('\<<%= by %>@<%= ts %>\> <%= msg %><br />'),
            mailToTemplate = _.template('<a target="_blank" href="mailto:<%= by %> "><%= by %></a>');

        if (typeof data === 'string') {
            document.getElementById('log').innerHTML += data + '<br />';
        }
        else {
            document.getElementById('log').innerHTML += msgTemplate({
                by: (
                mailToTemplate({
                    by: data.by
                })),
                ts: data.ts,
                msg: data.msg
            });
        }
        for (var i = 0; i < data.online; i++) {
            var it = data.online[i];
            console.log(it);
        }
    },
    promptName = function() {
        do {
            localStorage.name = prompt('Please enter your email address:', 'name@domain.com');
        } while (!localStorage.name || localStorage.name === 'null' || localStorage.name === 'name@domain.com')

        return localStorage.name;
    },
    logStatus = function(statusConnected) {
        document.getElementById('status').textContent = (statusConnected) ? 'Connected to main server.' : 'Disconnected... Reload page?';
        if (statusConnected) {
            document.getElementById('status').setAttribute('class', 'text-info');
        } else {
            document.getElementById('status').setAttribute('class', 'text-danger');
        }
        clearLog();
    },
    clearLog = function() {
        var e = document.getElementById('log');

        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }

    },
    send = function(arg, arg2) {
        var msg = arg || document.getElementById('textarea').value,
            dto = {
                by: localStorage.name || promptName(),
                msg: msg,
                ts: moment().format('h:mm a'),
                sents: sents,
                firstTime: arg2,
                conversation:conversation
            };
        var msgTemplate = _.template('[<%= by %>@<%= ts %> ]:<%= msg %><br />'),
                    mailToTemplate = _.template('<a target="_blank" href="mailto:<%= by %> "><%= by %></a>');
                conversation += msgTemplate({
                    by: (
                    mailToTemplate({
                        by: dto.by
                    })),
                    ts: dto.ts,
                    msg: dto.msg
                });;

        if (socket && socket.socket.connect) {
            socket.send(JSON.stringify(dto));
            log(dto);
            console.log("sent: ", dto)
        }
        else {
            log('Error: Not connected -check connection-');
        }
        document.getElementById('textarea').value = '';
    },
    onerror = function(msg) {
        log(msg);
    },
    connect = function() {

        var sendWrapper = function() {
            if (document.getElementById('status').textContent === "Connected to main server.") {
                if (document.getElementById('textarea').value === '') {
                    alert('Enter text before sending, Please.');
                } else {
                    sents++
                    document.getElementById("sents").innerHTML = sents;
                    send();
                }
            } else {
                alert("You are disconnected from the main server, you cannot send messages!");
            }
        };

        /*window.onkeyup = function (evt) {
            var r = true;

            if (evt.which === 13) {
                sendWrapper();
                r = false;
            }

            return r;
        };*/
        document.getElementById('send').onclick = sendWrapper;
        document.getElementById('clear').onclick = clearLog;
        document.getElementById('textarea').focus();

        if (socket === null) {
            socket = window.io.connect(null, {
                'auto connect': false
            });
            socket.on('connect', function() {
                logStatus(true);
            });
            socket.on('message', function(data) {
                data = JSON.parse(data);
                log(data);
                console.log("Recived: ", data);
                dontadds = _.uniq(dontadds);
                console.log(data.online);
                var msgTemplate = _.template('[<%= by %>@<%= ts %> ]:<%= msg %><br />'),
                    mailToTemplate = _.template('<a target="_blank" href="mailto:<%= by %> "><%= by %></a>');
                    conversation += data.conversation;
                conversation += msgTemplate({
                    by: (
                    mailToTemplate({
                        by: data.by
                    })),
                    ts: data.ts,
                    msg: data.msg
                });
                for (var i = 0; i < data.online.length; i++) {
                    var str = data.online[i];
                    console.log(str);
                    if (str !== localStorage.name && _.indexOf(dontadds, str) == -1) {
                        document.getElementById("connected").innerHTML += "\
                        <a href='mailto:"+data.by+"' class=\"list-group-item\">\
                            <span id='" + data.by + "' class=\"badge\">" + data.sents + "</span>\
                            <span class='glyphicon glyphicon-user'></span> " + str + "\
                        </a>";
                        dontadds.push(str);
                        if (data.firstTime) {
                            send("Ok");
                        }
                    }
                    else {

                    }
                }
                console.log(data.by, data.sents);
                document.getElementById(data.by).textContent = data.sents;
                console.log(document.getElementById(data.by).textContent);
            });
        }
        socket.socket.connect();
        socket.on('disconnect', function() {
            logStatus(false);
        });
        updateMe();
        send("[" + moment().format('h:mm a') + "] User " + localStorage.name + " Joined", true);
    },
    updateMe = function() {
        console.log(conversation, document.getElementById("log").innerHTML);
        document.getElementById("log").innerHTML = conversation + document.getElementById("log").innerHTML;
    };

window.onload = connect;