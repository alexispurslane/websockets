var server = require('http').createServer(handler),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    moment = require('moment'),
    _ = require("underscore"),
    /* So you would do '_.template();'*/
    mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.min.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.jpeg': 'image/jpeg'
    },
    users = [{
        "username": "christopherdumas@sms.com",
        "password": "gortGort10!"
    }],
    online = [],
    toBR = function (string) {
        string.replace(/\n/, "<br />");
    },
    toNewline = function (string) {
        string.replace(/\<br \/\>/, "\n");
    },
    conversation = "";

server.listen(process.env.PORT || 8001);

function handler(request, response) {
    var lookup = url.parse(decodeURI(request.url)).pathname;

    lookup = ((lookup === '/') ? '/index.html' : lookup);
    lookup = lookup.substr(1);
    console.log(lookup)

    if (request.url.indexOf("?") !== -1) {
        console.log("yay. q")
        var data = lookup.substr(lookup.indexOf("?"), lookup.length)
        var datas = data.split("&");
        users.forEach(function (e) {
            if (e == user) {
                response.writeHead(200, {
                    'Location': 'https://websockets-c9-christopherdumas.c9.io/',
                    'Content-Type': 'text/html'
                });
                response.end();
            }
            else {
                users.push(user)
                response.writeHead(200, {
                    'Location': 'https://websockets-c9-christopherdumas.c9.io/',
                    'Content-Type': 'text/html'
                });
            }
        })
        var user = {
            "username": datas[0],
            "password": datas[1]
        }
        users.push(user);
    }
    fs.exists(lookup, function (exists) {
        if (exists) {
            fs.readFile(lookup, function (error, data) {
                if (error) {
                    response.writeHead(500, {
                        'Content-Type': 'text/html'
                    });
                    response.end('sorry, server error');

                    return;
                }

                response.writeHead(200, {
                    'Content-Type': mimeTypes[path.extname(lookup)]
                });
                console.log( mimeTypes[path.extname(lookup)])
                response.end(data);
            });

            return;
        }
        response.writeHead(200, {
            'Location': 'https://websockets-c9-christopherdumas.c9.io/404.html',
            'Content-Type': 'text/html'
        });
        response.end()
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        data = JSON.parse(data);
        online.push(data.by);
        online = _(online).uniq();
        online = _(online).sortBy("name");
        socket.broadcast.send(JSON.stringify({
            by: data.by,
            ts: moment().format('h:mm'),
            msg: data.msg,
            online: online,
            sents: data.sents
        }));
    });
    socket.on('disconnect', function () {
        online.splice(0, 1);
    });
});
