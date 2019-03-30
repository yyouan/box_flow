//引入http websocket
var http = require('http');
var ws = require('websocket').server;

// 建立server 並監聽Port 12345
var PORT = 12345;
var server = http.createServer().listen(PORT)

// 產生websocketServer
webSocketServer = new ws({
    httpServer: server
});

//當使用者連入時 觸發此事件
webSocketServer.on('request', function(request) {
    var connection = request.accept('echo-protocol', request.origin);

    //當websocket server收到訊息時 觸發此事件
    connection.on('message', function(message) {
        console.log(message)
        connection.send("我收到了: " + message.utf8Data);
    });

    //當使用者socket連線中斷時 例如：關閉瀏覽器 觸發此事件
    connection.on('close', function(reasonCode, description) {
        console.log('Close');
    });
});