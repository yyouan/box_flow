var express = require('express');
var request = require('request');
const querystring = require('querystring');

var CHANNEL_ACCESS_TOKEN = ["bqdkQdplTECriQ225N+frhzctNQVXWoNoFPRD4mH2WSPHM8nhM5cQJspmyB4vGcdCXaQXbpTeuFwdSwk/APQSl66BifptuEXg+e2MwfZgbnSN7V1P0xl431M3gEs9yidGe4V+lcqIaBGyRxaXlHlTQdB04t89/1O/w1cDnyilFU="];

var channel_array =[];
var pay_array =[];

var withdraw_array =[];
var channel_array_2 ={};
var channel_array_3 ={};
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});
const pool_2 = new Pool({
    connectionString: process.env.HEROKU_POSTGRESQL_CRIMSON_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.use(express.static(__dirname)); //get every file

app.post('/' , loginParser); // POST 方法**/
app.post('/form',FormReceiver);
app.get('/formhtml',FormGiver);
app.get('/imgGiver',ImgGiver);
app.post('/img',imgReceiver);
app.post('/check',checkReceiver);
//app.get('/uploadhtml',UploadPage_giver)
app.post('')

/**SQL
 *  email | phone | nickname_or_mark | balance | cash_array | line_id
-------+-------+--------------+------------------+---------+------------
 */


//login message with recpt function:
function create_member(email,line_id){
    psql("INSERT INTO CLIENT (email,line_id,face_url,phone,nickname_or_mark,balance,cash_array) VALUES (\'"
    +email+"\',\'"+line_id+"\',\'https://i.imgur.com/PAoZtFc.jpg\',\'\',\'\',0,\'\');");    
}

function pushToSuv(recpt){

    psql_2("SELECT * FROM SUPERVISOR;").then(
  
      (groups) =>{
  
        for(group of groups){
  
          recpt.forEach(element => {
            console.log("pushmessage:"+element);
          });
          

            var options = {
                url: "https://api.line.me/v2/bot/message/push",
                method: 'POST',
                headers: {
                  'Content-Type':  'application/json', 
                  'Authorization':'Bearer ' + "+act2uqFxj9eXRsREj62KlPeKGLHhZathXvdYQX3TjIPGiv0KtZubUngPx4Bgr97DvFe7mfC/1Xg1nZGSXCJCcD81A2ffu+Scqzgx1G2XatW12luzYLz7qaaI9LvSCisP0UmGC2qhuhFEDtLK7SYdQdB04t89/1O/w1cDnyilFU="
                },
                json: {
                    "to": group.group_id.replace(/\s+/g, ""),
                    'messages': recpt
                }
              };
            console.log(options);
            request(options, function (error, response, body) {
                if (error) throw error;
                console.log("(line)");
                console.log(body);
            });

          
          
  
        }      
      }
    );
  }

function pushmessage(recpt,id){

    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
    for(let token of CHANNEL_ACCESS_TOKEN){

        var options = {
            url: "https://api.line.me/v2/bot/message/push",
            method: 'POST',
            headers: {
              'Content-Type':  'application/json', 
              'Authorization':'Bearer ' + token
            },
            json: {
                "to": id.replace(/\s+/g, ""),
                'messages': recpt
            }
          };
          console.log(options);
          request(options, function (error, response, body) {
              if (error) throw error;
              console.log("(line)");
              console.log(body);
          });

    }    
  
}
function psql_2(command){
   
    return new Promise((resolve,reject)=>{
        //while(is_conn_psql){console.log("(psql):pararell gate");};
        //if(!is_conn_psql){client.connect();is_conn_psql = true;}
        let recpt =[];
        let error;
        console.log("(psql):" + command );
        pool_2.connect()
        .then(client=>{            
            client.query(command)
            .then(res => {
                client.release();
                for (let row of res.rows) {                
                    recpt.push(row);
                    console.log( "(psql-query):"+ JSON.stringify(row));
                }
                resolve(recpt);
                for(let row of recpt){
                    console.log( "(psql-query-recpt):"+ JSON.stringify(row));
                }
                console.log( "(psql-query-recpt):"+ recpt.length);    
            })
            .catch(e => {client.release(); console.error("(psql):" + e.stack);reject(e);});            
        });
    });
    
    
}
function psql(command){
   
    return new Promise((resolve,reject)=>{
        //while(is_conn_psql){console.log("(psql):pararell gate");};
        //if(!is_conn_psql){client.connect();is_conn_psql = true;}
        let recpt =[];
        let error;
        console.log("(psql):" + command );
        pool.connect()
        .then(client=>{            
            client.query(command)
            .then(res => {
                client.release();
                for (let row of res.rows) {                
                    recpt.push(row);
                    console.log( "(psql-query):"+ JSON.stringify(row));
                }
                resolve(recpt);
                for(let row of recpt){
                    console.log( "(psql-query-recpt):"+ JSON.stringify(row));
                }
                console.log( "(psql-query-recpt):"+ recpt.length);    
            })
            .catch(e => {client.release(); console.error("(psql):" + e.stack);reject(e);});            
        });
    });
    
    
}

function loginParser(req ,rres){
    //route
    var nwimg;
    const domain="https://boxflow.herokuapp.com";  
    //var adrr="/";
    
    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';     
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function(chunk){   
        post += chunk;
    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){    
        post = JSON.parse(post);
        console.log(post.events[0]);
        var replyToken = post.events[0].replyToken;
        var posttype = post.events[0].type;
        var line_id = post.events[0].source.userId;
        if( post.events[0].source.type == 'group'){
            line_id = post.events[0].source.groupId;
        } 
        /**var userMessage = post.events[0].message.text;
        console.log(replyToken);
        console.log(userMessage);**/
        if (typeof replyToken === 'undefined') {
            return;
        }

        if(posttype == 'postback'){
            let rawdata = post.events[0].postback.data;
            let data = querystring.parse(rawdata);

            if("url" in data) {
                psql("SELECT * FROM CLINET WHERE line_id=\'"+line_id+"\';").then(
                    members =>{

                        let gate = false;
                        if(members[0].head_url.replace(/\s+/g, "")=='https://i.imgur.com/PAoZtFc.jpg'){gate=true};

                        
                        
                    }
                )
                
            }
            if("item" in data){
                let price = parseInt(data.price);
                let item = data.item;
                let money_in = channel_array_3[post.events[0].source.userId];
                let money_out= post.events[0].source.userId;
                psql("SELECT * FROM CLIENT WHERE line_id=\'"+money_out+"\';").then(
                    clients =>{
                        psql("UPDATE CLIENT SET balance=\'"+ (clients[0].balance-price) +"\' WHERE line_id=\'" + line_id +"\';").then(
                            a =>{
                                let text={
                                    "type":"text",
                                    "text":"成功消費"
                                }
                                pushmessage([text],money_out);
                                rres.end("OK")
                            }
                        )
                    }
                );
                psql("SELECT * FROM CLIENT WHERE line_id=\'"+money_in+"\';").then(
                    clients =>{
                        psql("UPDATE CLIENT SET balance=\'"+ (clients[0].balance+price) +"\' WHERE line_id=\'" + line_id +"\';").then(
                            a =>{
                                let text={
                                    "type":"text",
                                    "text":"訂單成立－－品項："+item
                                }
                                pushmessage([text],money_in);
                                rres.end("OK")
                            }
                        )
                    }
                );       
            }
        }
        
        if (posttype == 'join' || posttype == 'follow'){ 
            
            let text = {
                "type":"text",
                "text":"感謝您加入boxflow，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
            }
            var ad_youtube = {  
                "type": "flex",
                "altText": "boxflow有消息，請借台手機開啟",
                "contents":
                    {
                        "type": "bubble",
                        "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                            "type": "text",
                            "text": "可以先看功能介紹影片"
                            }
                        ]
                        },
                        "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                            "type": "spacer",
                            "size": "xl"
                            },
                            {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "看影片",
                                "uri": "https://www.youtube.com/playlist?list=PLfJYz57jQuEn0ZaX7HdD8hGR9xudTxAuo"
                            },
                            "style": "primary",
                            "color": "#ff3333"
                            }
                        ]
                        }             
                    }
            };
            replymessage([ad_youtube,text])
            rres.end("OK")   
        }

        if (posttype == 'message'){
                        
            if(true){
                
                if(channel_array.indexOf(line_id)== -1){

                    psql("SELECT * FROM CLIENT WHERE line_id=\'" + line_id +"\';")
                    .then( recpt =>{
                        if( recpt.length == 0)   
                        {
                            if(post.events[0].message.type == 'text'){
                                var email = post.events[0].message.text;
                                psql("SELECT * FROM CLIENT WHERE email=\'" + email +"\';").then(recpt=>{
                                    var emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
                                    if( recpt.length == 0)
                                    {   
                                        if(post.events[0].message.text == '嗨'){

                                            let text = {
                                                "type":"text",
                                                "text":"感謝您加入BoxFlow，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
                                            }
                                            var ad_youtube = {  
                                                "type": "flex",
                                                "altText": "BoxFlow有消息，請借台手機開啟",
                                                "contents":
                                                    {
                                                        "type": "bubble",
                                                        "header": {
                                                        "type": "box",
                                                        "layout": "vertical",
                                                        "contents": [
                                                            {
                                                            "type": "text",
                                                            "text": "可以先看功能介紹影片"
                                                            }
                                                        ]
                                                        },
                                                        "footer": {
                                                        "type": "box",
                                                        "layout": "vertical",
                                                        "contents": [
                                                            {
                                                            "type": "spacer",
                                                            "size": "xl"
                                                            },
                                                            {
                                                            "type": "button",
                                                            "action": {
                                                                "type": "uri",
                                                                "label": "看影片",
                                                                "uri": "https://www.youtube.com/playlist?list=PLfJYz57jQuEn0ZaX7HdD8hGR9xudTxAuo"
                                                            },
                                                            "style": "primary",
                                                            "color": "#ff3333"
                                                            }
                                                        ]
                                                        }             
                                                    }
                                            };
                                            replymessage([ad_youtube,text])

                                        }else if(post.events[0].message.text.substr(0,1) == '@'){

                                            let text = {
                                                "type":"text",
                                                "text":"功能尚未啟用，請先輸入郵件信箱。"
                                            }
                                            replymessage([text])

                                        }
                                        else if(email.search(emailRule) == -1){

                                            let text = {
                                                "type":"text",
                                                "text":"請輸入正確的電子郵件格式"
                                            }
                                            replymessage([text])

                                        }
                                        else{                                            
                                            create_member(email,line_id);
                                            let text2 = {
                                                "type":"text",
                                                "text":"成功註冊郵箱!"
                                            }                                            

                                            let text = {
                                                "type":"text",
                                                "text":"請點選上面的按鈕，進到瀏覽器註冊"
                                            }
                                            let img = {
                                                "type": "image",
                                                "originalContentUrl": "https://i.imgur.com/rGsgMqc.jpg",
                                                "previewImageUrl": "https://i.imgur.com/rGsgMqc.jpg"
                                            }
                                            let login_button ={
                                                "type": "template",
                                                "altText": "BoxFlow有消息，請借台手機開啟",
                                                "template": {
                                                    "type": "buttons",
                                                    "thumbnailImageUrl": "https://i.imgur.com/XQgkcW5.jpg",
                                                    "imageAspectRatio": "rectangle",
                                                    "imageSize": "cover",
                                                    "imageBackgroundColor": "#FFFFFF",
                                                    "text": "按我註冊",
                                                    "defaultAction": {
                                                        "type": "uri",
                                                        "label": "註冊",
                                                        "uri": "https://boxflow.herokuapp.com/formhtml"
                                                    },
                                                    "actions": [
                                                        {
                                                          "type": "uri",
                                                          "label": "註冊",
                                                          "uri": "https://boxflow.herokuapp.com/formhtml"
                                                        }
                                                    ]
                                                }
                                            }
                                            let relogin_button =
                                                {
                                                    "type": "template",
                                                    "altText": "BoxFlow有消息，請借台手機開啟",
                                                    "template": {
                                                        "type": "buttons",                            
                                                        "text": "如果註冊失敗，可按我重新註冊",                            
                                                        "actions": [                                    
                                                            {
                                                                "type": "uri",
                                                                "label": "點我重新註冊",
                                                                "uri":"https://boxflow.herokuapp.com/formhtml"     
                                                            }
                                                        ]
                                                    }
                                            };
                                            pushmessage([text2,login_button,relogin_button,text,img],line_id)
                                            channel_array.push(line_id)
                                        }
                                    }else{
                                        let text ={
                                            "type":"text",
                                            "text":""
                                        }
                                        text.text ="您似乎使用和他人相同的電子郵件，請換個郵件註冊!\n有問題請洽詢問站";
                                        replymessage([text]);                                                                
                                    }
                                    rres.end("OK")
                                });
                            }else{
                                let text ={
                                    "type":"text",
                                    "text":""
                                }
                                text.text ="EASTER_EGG!請輸入註冊的郵件信箱";
                                replymessage([text]);
                                rres.end("OK")
                            }                        

                        }else{
                            
                                let text ={
                                    "type":"text",
                                    "text":"暫未開放隨便聊天，敬請見諒"
                                }
                                replymessage([text]);
                                channel_array.push(line_id); 
                                rres.end("OK")                     
                        }    
                    });                    
                }else{
                    if(post.events[0].message.text == '嗨'){

                        let text = {
                            "type":"text",
                            "text":"感謝您加入BoxFlow，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
                        }
                        replymessage([text])
                        delete channel_array[line_id]
                    }else if(post.events[0].message.text == '@增加機器'){
                        channel_array_2[post.events[0].source.userId]="增加機器";
                        let text = {
                            "type":"text",
                            "text":"請輸入Box_id:"
                        }
                        replymessage([text]);
                    }else if(post.events[0].message.text == '@新增菜單'){
                        channel_array_2[post.events[0].source.userId]="新增菜單";
                        let text = {
                            "type":"text",
                            "text":"替菜單取個名字:"
                        }
                        replymessage([text]);
                    }else if(post.events[0].message.text == '@支付'){
                        channel_array_2[post.events[0].source.userId]="支付";
                        let text = {
                            "type":"text",
                            "text":"選擇箱子裡的菜單？"
                        }
                        psql("SELECT * FROM BOX;").then(
                            recpt =>{
                                let respond =
                                    {
                                        "type": "text", // ①
                                        "text": "Select your favorite food category or send me your location!",
                                        "quickReply": { // ②
                                          "items": [                                                       
                                          ]
                                        }
                                      }
                                for(box of recpt){
                                    let box_option ={
                                        "type": "action", // ③
                                        "imageUrl": "https://i.imgur.com/UkqNa9B.jpg",
                                        "action": {
                                          "type": "message",
                                          "label": box.box_id,
                                          "text": box.box_id
                                        }
                                    };                                                 
                                    
                                    respond.quickReply.items.push(box_option);
                                }
                                replymessage([text,respond])
                            }
                        );
                        
                    }
                    else if(post.events[0].message.text == '@領錢'){
                                               
                        if(withdraw_array.length == 0){
                            var text_2 = {
                                "type":"text",
                                "text":"長按按鈕，開始領錢"
                            }
                            
                            withdraw_array.push(post.events[0].source.userId);
                        }else{
                            var text_2 = {
                                "type":"text",
                                "text":"有人在領錢請排隊"
                            }
                        }
                        replymessage([text_2]);
                    }
                    else if(post.events[0].message.text == '@儲值'){
                        
                        let text = {
                            "type":"text",
                            "text":"開始儲值"
                        }
                        
                        if(pay_array.length == 0){
                            var text_2 = {
                                "type":"text",
                                "text":"請打開盒子進行儲值100元"
                            }
                            
                            pay_array.push(post.events[0].source.userId);
                        }else{
                            var text_2 = {
                                "type":"text",
                                "text":"有人在儲值請排隊"
                            }
                        }                              
                        replymessage([text,text_2]);
                        
                    }
                    else if(post.events[0].message.text == '@取消' || post.events[0].message.text == '@取消新增菜單'){
                        channel_array_2[post.events[0].source.userId]="取消";
                    }
                    else if(post.events[0].source.userId in channel_array_2){

                        let msg = post.events[0].message;                                    
                        let type = msg.type;
                        let msgid = msg.id;                                
                        let receiver_id = channel_array_2[post.events[0].source.userId];
                        let gate = false;
        
                        if(post.events[0].message.type == 'text'){
        
                            let box_id = post.events[0].message.text;                                      
                            if(channel_array_2[post.events[0].source.userId]=="增加機器"){

                                psql("SELECT * FROM CLIENT WHERE line_id=\'" + post.events[0].source.userId +"\';").then(recpt=>{

                                    let reply_button =
                                    {
                                        "type": "template",
                                        "altText": "BoxFlow有消息，請借台手機開啟",
                                        "template": {
                                            "type": "buttons",                            
                                            "text": "請決定",                            
                                            "actions": [
                                                {
                                                    "type": "postback",
                                                    "label": "允許",
                                                    "data": "send=1"+"&boxid="+box_id+"&line_id="+post.events[0].source.userId
                                                }                                         
                                            ]
                                        }
                                    };

                                    let text ={
                                        "type":"text",
                                        "text":"允許增加"+recpt[0].nickname_or_mark.replace(/\s+/g, "")+":mail:"+recpt[0].email+":box:"+box_id
                                    }   
                                
                                    pushToSuv([reply_button,text]);

                                });
                                
                            }else if(channel_array_2[post.events[0].source.userId]=="新增菜單"){

                                psql("CREATE TABLE "+post.events[0].message.text+"(item char(50),price int);").then(recpt=>{

                                    let text = {
                                        "type":"text",
                                        "text":"輸入箱子:"
                                    }
                                    
                                
                                    channel_array_2[post.events[0].source.userId]="輸入箱子";
                                    channel_array_3[post.events[0].source.userId]=post.events[0].message.text;
                                    psql("SELECT * FROM BOX WHERE connect_line_id=\'"+post.events[0].source.userId+"\';").then(
                                        recpt =>{
                                            let respond =
                                                {
                                                    "type": "text", // ①
                                                    "text": "Select your favorite food category or send me your location!",
                                                    "quickReply": { // ②
                                                      "items": [                                                       
                                                      ]
                                                    }
                                                  }
                                            for(box of recpt){
                                                let box_option ={
                                                    "type": "action", // ③
                                                    "imageUrl": "https://i.imgur.com/UkqNa9B.jpg",
                                                    "action": {
                                                      "type": "message",
                                                      "label": box.box_id,
                                                      "text": box.box_id
                                                    }
                                                };                                                 
                                                
                                                respond.quickReply.items.push(box_option);
                                            }
                                            replymessage([text,respond])
                                        }
                                    );
                                    
                                });
                                
                            }else if(channel_array_2[post.events[0].source.userId]=="輸入箱子"){

                                psql("UPDATE BOX SET menu_name=\'"+ channel_array_3[post.events[0].source.userId]  +"\' WHERE box_id=\'"+post.events[0].message.text+"\';").then(recpt=>{

                                    let text = {
                                        "type":"text",
                                        "text":"品項:"
                                    }
                                    replymessage([text]);                                    
                                    channel_array_2[post.events[0].source.userId]="新增品項";

                                });
                                
                            }
                            else if(channel_array_2[post.events[0].source.userId]=="新增品項"){

                                psql("INSERT INTO "+channel_array_3[post.events[0].source.userId]+" (item) VALUES (\'"
                                +post.events[0].message.text +"\');").then(recpt=>{

                                    let text = {
                                        "type":"text",
                                        "text":"價位:"
                                    }
                                    replymessage([text]);                                   
                                    channel_array_2[post.events[0].source.userId]="新增價位";
                                    channel_array_3[post.events[0].source.userId]=post.events[0].message.text;

                                });
                                
                            }
                            else if(channel_array_2[post.events[0].source.userId]=="支出"){

                                psql("SELECT * FROM BOX WHERE box_id=\'"+post.events[0].message.text+"\';").then(recpt=>{

                                    boxes =>{
                                        channel_array_3[post.events[0].source.userId] = boxes.connect_line_id;
                                        psql("SELECT * FROM " +boxes[0].menu_name+";" ).then(
                                            items=>{
                                                for(item of items){

                                                    let graph = {

                                                        "type": "flex",
                                                        "altText": "大講堂有消息，請借台手機開啟",
                                                        "contents":
                                                            {
                                                                "type": "bubble",
                                                                "header": {
                                                                "type": "box",
                                                                "layout": "vertical",
                                                                "contents": [
                                                                    {
                                                                    "type": "text",
                                                                    "text": "選擇品項"
                                                                    }
                                                                ]
                                                                },
                                                                "footer": {
                                                                "type": "box",
                                                                "layout": "vertical",
                                                                "contents": [
                                                                    {
                                                                    "type": "spacer",
                                                                    "size": "xl"
                                                                    },
                                                                    {
                                                                    "type": "button",
                                                                    "action": { 
                                                                        "type":"postback",
                                                                        "label":item.item,
                                                                        "data":"price="+item.price+"&item="+item.item,
                                                                     },
                                                                    "style": "primary",
                                                                    "color": "#ffbb00"
                                                                    }
                                                                ]
                                                                }             
                                                            }
                                                    };
                                                }
                                            }
                                        );
                                    }

                                });
                                channel_array_2[post.events[0].source.userId]=="取消";
                            }
                            else if(channel_array_2[post.events[0].source.userId]=="新增價位"){

                               

                                    let text = {
                                        "type":"text",
                                        "text":"品項:"
                                    }
                                    
                                    psql("UPDATE "+channel_array_3[post.events[0].source.userId]+" SET price="+ int(post.events[0].message.text) +" WHERE item=\'"+channel_array_3[post.events[0].source.userId]+"\';").then(
                                        aa=>{
                                            replymessage([text]);                                            
                                        }
                                    )
                                    channel_array_2[post.events[0].source.userId]="新增品項";

                                                                
                            }
                            else if(channel_array_2[post.events[0].source.userId]=="增加機器"){

                                psql("SELECT * FROM CLIENT WHERE line_id=\'" + post.events[0].source.userId +"\';").then(recpt=>{

                                    let reply_button =
                                    {
                                        "type": "template",
                                        "altText": "BoxFlow有消息，請借台手機開啟",
                                        "template": {
                                            "type": "buttons",                            
                                            "text": "請決定",                            
                                            "actions": [
                                                {
                                                    "type": "postback",
                                                    "label": "允許",
                                                    "data": "send=1"+"&boxid="+box_id+"&line_id="+post.events[0].source.userId
                                                }                                            
                                            ]
                                        }
                                    };
                                    let text ={
                                        "type":"text",
                                        "text":recpt[0].nickname_or_mark+":mail:"+recpt[0].email+":box:"+box_id
                                    }
                                
                                    pushToSuv([reply_button]);

                                });
                                
                            }                     
                            else{
                                let text = {
                                    "type":"text",
                                    "text":"您已經註冊了，尚未開放隨便聊天，敬請見諒(您是第"+channel_array.indexOf(line_id)+"位註冊者)"
                                }
                                replymessage([text])
                            }
                                                
                        }        
                        
        
                    }
                    else{
                        let text = {
                            "type":"text",
                            "text":"您已經註冊了，尚未開放隨便聊天，敬請見諒(您是第"+channel_array.indexOf(line_id)+"位註冊者)"
                        }
                        replymessage([text])
                    }
                    rres.end("OK")                    
                }              
            }
        }
        function replymessage(recpt){ //recpt is message object
            
          for(let token of CHANNEL_ACCESS_TOKEN){

            var options = {
                url: "https://api.line.me/v2/bot/message/reply ",
                method: 'POST',
                headers: {
                  'Content-Type':  'application/json', 
                  'Authorization':'Bearer ' + token
                },
                json: {
                    'replyToken': replyToken,
                    'messages': recpt
                }
              };  
              request(options, function (error, response, body) {
                  if (error) throw error;
                  console.log("(line)");
                  console.log(body);
              });

          }
          
          
        }        
    
    
    });
    
}
//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!!!

//-----------------html part --------------------------------
function FormGiver(req,res){
    res.sendFile(__dirname+'/Form/index.html');//Linux on server
}
/**function UploadPage_giver(req,res){
    res.sendFile(__dirname+'/Imgur-Upload-master/index.html');//Linux on server
}**/
function FormReceiver(req,rres){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    console.log('post')
    req.on('data', function(chunk){
        console.log('data')   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
    
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        console.log('end')
        post = querystring.parse(post);    
        console.log(post);
        psql("SELECT * FROM CLIENT WHERE email=\'"+ post.email +"\';").then(
            angles =>{
                if(angles.length ==0 || angles[0].line_id==''){
                    rres.sendFile(__dirname+'/error_email.html')
                }else{
                    psql("UPDATE CLIENT SET (phone,nickname_or_mark"
                    +")=(\'"+ post.phone +"\',\'"+post.nickname_or_mark+"\') WHERE email=\'" + post.email +"\';").then(
                        aa =>{       
                            //main:
                            let msg =[];
                            
                            let text ={
                                "type":"text",
                                "text":""
                            }
                            text.text ="請上傳自拍照，先開Line外面的相機自拍";
                            
                            var upload_page = {  
                                "type": "flex",
                                "altText": "BoxFlow有消息，請借台手機開啟",
                                "contents":
                                    {
                                        "type": "bubble",
                                        "header": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                            "type": "text",
                                            "text": "點我自行上傳圖片"
                                            }
                                        ]
                                        },
                                        "hero": {
                                            "type": "image",
                                            "url": "https://i.imgur.com/M6s5AhN.png", //use 圖片位址
                                        },
                                        "body": {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                              {
                                                "type": "text",
                                                "text": "!!! andriod記得open in other app",
                                              },
                                              {
                                                "type": "text",
                                                "text": "=/\\= 如上圖 =/\\=",
                                              }
                                            ]
                                        }
                                        ,                                        
                                        "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "spacer",
                                                "size": "xl"
                                            },
                                            {
                                            "type": "button",
                                            "action": {
                                                "type": "uri",
                                                "label": "按我傳圖片",
                                                "uri": "https://boxflow.herokuapp.com/imgGiver"
                                            },
                                            "style": "primary",
                                            "color": "#ff3333"
                                            }
                                        ]
                                        }             
                                    }
                            };
                            msg.push(text);
                            msg.push(upload_page);                            
                            setTimeout(()=>{pushmessage(msg,angles[0].line_id);},1000);
                            rres.sendFile(__dirname+'/relogin.html');                                                                 
                        }
                    );
                
                }
                  
            }
        );
                                        
        
    });
        
}
function ImgGiver(req,rres){
    rres.sendFile(__dirname+'/Imgur-Upload-master/index.html');
}

function imgReceiver(req,rres){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("SELECT * FROM CLIENT WHERE email=\'"+post.email+"\';").then(
            members =>{
                let gate = false;
                if(members[0].face_url.replace(/\s+/g, "")=='https://i.imgur.com/PAoZtFc.jpg'){
                    gate = true;
                }
                
                psql("UPDATE CLIENT SET face_url=\'"+ post.url +"\' WHERE email=\'" + post.email +"\';").then(
                    aa =>{
                       psql("SELECT * FROM CLIENT WHERE email=\'"+post.email+"\';").then(
                           res =>{
                                let text2 = {
                                    "type":"text",
                                    "text":"已上傳圖片為臉照"
                                }                       
                                

                                let bubble ={
                                    "type": "bubble",
                                    "header": {
                                      "type": "box",
                                      "layout": "vertical",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "你的臉照"
                                        }
                                      ]
                                    },
                                    "hero": {
                                      "type": "image",
                                      "url": post.url,
                                    },
                                    "body": {
                                      "type": "box",
                                      "layout": "vertical",
                                      "contents": [
                                        
                                            {//暱稱
                                                "type": "text",
                                                "text": "暱稱： "+res[0].nickname_or_mark.replace(/\s+/g, ""),
                                              },
                                      ]
                                    }
                                    
                                };                                
                               
        
                                let msg2 ={  
                                    "type": "flex",
                                    "altText": "大講堂有消息，請借台手機開啟",
                                    "contents":bubble 
                                };

                                let msg =[text2,msg2];

                                if(gate){
                                    let text ={
                                        "type":"text",
                                        "text":""
                                    }
                                    text.text ="成功註冊!";
                                    msg.push(text);                                    
                                }                              
                               pushmessage(msg,res[0].line_id.replace(/\s+/g, ""));
                               rres.end("OK") 
                           }
                       ) 
                       
                    }
                   );
            }
        )
                
    });
    
}


function checkReceiver(req,rres){
    // check balance
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("SELECT * FROM CLIENT WHERE email=\'"+post.email+"\';").then(
            members =>{
                
                if(members[0].balance==0){
                    rres.end("0")
                }else{
                    rres.end(members[0].balance)
                }              
               
            }
        )
                
    });
    
}

//socket

//當使用者連入時 觸發此事件
app.post('/deposit', (req,rres)=>{
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    console.log('post')
    req.on('data', function(chunk){
        console.log('data')   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }
    });
    
    req.on('end', function(){
        
        msg = JSON.parse(post);
          
        console.log(msg);
        console.log("deposit" in msg);
        if("deposit" in msg && pay_array.length == 1){
                console.log("deposit");
                let line_id = pay_array[0];
                pay_array = [];
                psql("SELECT * FROM CLIENT WHERE line_id=\'"+line_id+"\';").then(
                    clients =>{
                        psql("UPDATE CLIENT SET balance=\'"+ (clients[0].balance+100) +"\' WHERE line_id=\'" + line_id +"\';").then(
                            a =>{
                                let text={
                                    "type":"text",
                                    "text":"成功儲值"
                                }
                                pushmessage([text],line_id);
                                rres.end("OK")
                            }
                        )
                    }
                );
                psql("INSERT INTO "+msg.box_id+"_cash (cash_id) VALUES (\'"
                +msg.deposit+"\');");
                psql("INSERT INTO cash (id,line_id_in,line_id_out) VALUES (\'"
                +msg.deposit+"\',\'"+line_id+"\',\'\');");
                
        }else{
            rres.end("OK")
        }
    });
    
});

app.post('/withdraw', (req,rres)=>{

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    console.log('post')
    req.on('data', function(chunk){
        console.log('data')   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }
    });
    
    req.on('end', function(){
        
        msg = JSON.parse(post);
          
        // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
        if(withdraw_array.length !=0){
            let line_id = withdraw_array[0];
            withdraw_array = [];
            psql("SELECT * FROM CLIENT WHERE line_id=\'"+line_id+"\';").then(
                clients =>{
                    psql("SELECT * FROM "+msg.box_id+"_cash;").then(
                        cashes =>{
                            if(clients[0].balance >= 100*cashes.length){
                                for(cash of cashes){
                                    psql("UPDATE CASH SET line_id_out=\'"+ line_id +"\' WHERE id=\'" + cash.cash_id +"\' and line_id_out=\'\';")
                                }
                                psql("UPDATE CLIENT SET balance=\'"+ ( clients[0].balance - 100*cashes.length )+"\' WHERE line_id=\'" + line_id +"\';")
                                psql("DELETE FROM "+msg.box_id+"_cash;")
                                let text ={
                                    "type":"text",
                                    "text":"成功領錢"+(100*cashes.length)
                                }
                                pushmessage([text],line_id);
                                rres.end("OK");
                            }else{
                                rres.end("NOT OK")
                            }                            
                        }
                    )                    
                }
            )
        }else{
            rres.end("NOT OK");
        }
   });    
    
});