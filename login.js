var express = require('express');
var request = require('request');
const querystring = require('querystring');

var CHANNEL_ACCESS_TOKEN = ["bqdkQdplTECriQ225N+frhzctNQVXWoNoFPRD4mH2WSPHM8nhM5cQJspmyB4vGcdCXaQXbpTeuFwdSwk/APQSl66BifptuEXg+e2MwfZgbnSN7V1P0xl431M3gEs9yidGe4V+lcqIaBGyRxaXlHlTQdB04t89/1O/w1cDnyilFU="];

var channel_array =[];
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
/**
 * expected result:
 *  user:@ok     
 *  bot:googleform
 *  user:done
 * 
 */

//SQL
/**
     angle_nickname |   angle_id    | master_name     |master_group|  master_id   | department | email              | head_url |self_intro|name  |phone           |score  |ticket |Group|problem|location_problem|problem_count|location_count                      
    ----------------+---------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    友安            | 0123456789012 | 另友安           |        7   | 123456789012 | phys/psy   |xu.6u.30@gmail.com  |url      |longtext  |劉友安 |0926372361       |0      |0      |  8  |0      |0              |      <6       |     <6 
    /
*/  

//login message with recpt function:
function create_member(email,line_id){
    psql("INSERT INTO ACCOUNT (email,angle_id,self_intro,angle_nickname,master_id,master_name,head_url,department,problem,location_problem,score,problem_count,location_count,ticket,groupindex,name,phone) VALUES (\'"
    +email+"\',\'"+line_id+"\',\'none\',\'預設某個人\',\'\',\'\',\'https://i.imgur.com/PAoZtFc.jpg\',\'phys\',"+
    Math.floor(6*Math.random())+","+Math.floor(6*Math.random())
    +",0,0,0,0,9,\'none\',\'none\');")    
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
    const domain="https://angleline-hall.herokuapp.com";  
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
                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                    members =>{

                        let gate = false;
                        if(members[0].head_url.replace(/\s+/g, "")=='https://i.imgur.com/PAoZtFc.jpg'){gate=true};

                        psql("UPDATE ACCOUNT SET head_url=\'"+ data.url +"\' WHERE angle_id=\'" + line_id +"\';").then(
                            res=>{
                                let text2 = {
                                    "type":"text",
                                    "text":"已選取圖片"
                                }
                                
                                let bubble ={
                                    "type": "bubble",
                                    "header": {
                                      "type": "box",
                                      "layout": "vertical",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "你的小天使"
                                        }
                                      ]
                                    },
                                    "hero": {
                                      "type": "image",
                                      "url": data.url,
                                    },
                                    "body": {
                                      "type": "box",
                                      "layout": "vertical",
                                      "contents": [
                                        
                                            {//暱稱
                                                "type": "text",
                                                "text": "暱稱： "+members[0].angle_nickname.replace(/\s+/g, ""),
                                              },
                                      ]
                                    }
                                    
                                };
                                
                                let self_intro =                
                                {//自我介紹
                                    "type": "text",
                                    "text": "自我介紹： "+ members[0].self_intro,
                                };
        
                                let msg2 ={  
                                    "type": "flex",
                                    "altText": "大講堂有消息，請借台手機開啟",
                                    "contents":bubble 
                                };
                                
                                let msg =[text2,msg2,self_intro];
                                
                                if(gate){

                                    let text ={
                                        "type":"text",
                                        "text":""
                                    }
                                    text.text ="成功註冊!";
                                    msg.push(text);
                                    var ad_msg_angle;
                                    var ad_msg_info;
                                    var ad_msg_master;
                                    if( members[0].department.replace(/\s+/g, "") == "psy"){

                                        ad_msg_angle = {  
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
                                                        "text": "按按鈕加小天使為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40hnc0868c"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_master = {  
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
                                                        "text": "按按鈕加小主人為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40rpu9491f"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_info = {  
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
                                                        "text": "按按鈕加詢問站為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40hbl3061e"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };

                                    }else{

                                        ad_msg_angle = {  
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
                                                        "text": "按按鈕加小天使為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40zpf3150n"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_master = {  
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
                                                        "text": "按按鈕加小主人為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40dwg5277m"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_info = {  
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
                                                        "text": "按按鈕加詢問站為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40vdg2092y"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                    }
                                                                                   
                                    
                                    pushmessage([ad_msg_angle,ad_msg_master,ad_msg_info],line_id);
                                    
                                
                                setTimeout(() => {
                                    pushmessage(msg,line_id);
                                }, 3000);
                                rres.end("OK")
                              } 
                            }                    
                        )
                        
                    }
                )
                
            }
        }
        
        if (posttype == 'join' || posttype == 'follow'){ 
            
            let text = {
                "type":"text",
                "text":"感謝您加入遊戲，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
            }
            var ad_youtube = {  
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

            let text = {
                "type":"text",
                "text":"請點選上面的按鈕，進到瀏覽器註冊，之後注意andriod手機請點選open in other app(如下圖)，iOS則不用"
            }
            replymessage(text);
            if(false){
                
                if(channel_array.indexOf(line_id)== -1){

                    psql("SELECT * FROM ACCOUNT WHERE angle_id=\'" + line_id +"\';")
                    .then( recpt =>{
                        if( recpt.length == 0)   
                        {
                            if(post.events[0].message.type == 'text'){
                                var email = post.events[0].message.text;
                                psql("SELECT * FROM ACCOUNT WHERE email=\'" + email +"\';").then(recpt=>{
                                    var emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
                                    if( recpt.length == 0)
                                    {   
                                        if(post.events[0].message.text == '嗨'){

                                            let text = {
                                                "type":"text",
                                                "text":"感謝您加入遊戲(嗨不能是電子郵件)，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
                                            }
                                            var ad_youtube = {  
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
                                                "text":"請點選上面的按鈕，進到瀏覽器註冊，之後注意andriod手機請點選open in other app(如下圖)，iOS則不用"
                                            }
                                            let img = {
                                                "type": "image",
                                                "originalContentUrl": "https://i.imgur.com/rGsgMqc.jpg",
                                                "previewImageUrl": "https://i.imgur.com/rGsgMqc.jpg"
                                            }
                                            let login_button ={
                                                "type": "template",
                                                "altText": "大講堂有消息，請借台手機開啟",
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
                                                        "uri": "https://angleline-hall.herokuapp.com/formhtml"
                                                    },
                                                    "actions": [
                                                        {
                                                          "type": "uri",
                                                          "label": "註冊",
                                                          "uri": "https://angleline-hall.herokuapp.com/formhtml"
                                                        }
                                                    ]
                                                }
                                            }
                                            let relogin_button =
                                                {
                                                    "type": "template",
                                                    "altText": "大講堂有消息，請借台手機開啟",
                                                    "template": {
                                                        "type": "buttons",                            
                                                        "text": "如果註冊失敗，可按我重新註冊",                            
                                                        "actions": [                                    
                                                            {
                                                                "type": "uri",
                                                                "label": "點我重新註冊",
                                                                "uri":"https://angleline-hall.herokuapp.com/formhtml"     
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
                                    "text":"您已經註冊了，註冊階段本站功能尚未啟用，敬請見諒"
                                }
                                replymessage([text]); 
                                rres.end("OK")                     
                        }    
                    });                    
                }else{
                    if(post.events[0].message.text == '嗨'){

                        let text = {
                            "type":"text",
                            "text":"感謝您加入遊戲(嗨不能是電子郵件)，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
                        }
                        replymessage([text])
                        delete channel_array[line_id]
                    }else{
                        let text = {
                            "type":"text",
                            "text":"您已經註冊了，註冊階段本站功能尚未啟用，敬請見諒(您是第"+channel_array.indexOf(line_id)+"位註冊者)"
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
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+ post.email +"\';").then(
            angles =>{
                if(angles.length ==0 || angles[0].angle_id==''){
                    rres.sendFile(__dirname+'/error_email.html')
                }else{
                    psql("UPDATE ACCOUNT SET (phone,angle_nickname,department,self_intro,groupindex,name"
                    +")=(\'"+ post.phone +"\',\'"+post.nickname+"\',\'"+post.dept+"\',\'"+post['self-intro']+"\',\'"+post.group
                    +"\',\'"+post.name+"\') WHERE email=\'" + post.email +"\';").then(
                        aa =>{       
                            //main:
                            let msg =[];
                            for(let url of graph_url){
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
                                                "text": "選擇圖片"
                                                }
                                            ]
                                            },
                                            "hero": {
                                                "type": "image",
                                                "url": url, //use 圖片位址
                                            } ,
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
                                                    "type": "postback",
                                                    "label": "按我選圖片",
                                                    "data": "url="+url
                                                },
                                                "style": "primary",
                                                "color": "#ffbb00"
                                                }
                                            ]
                                            }             
                                        }
                                };
                                pushmessage([graph],angles[0].angle_id);
                            }
                            let text ={
                                "type":"text",
                                "text":""
                            }
                            text.text ="請選擇頭貼(選項如上，選錯了再選一次可以cover原先選擇)，或是自行上傳頭貼(下面按鈕)";
                            
                            var upload_page = {  
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
                                                "uri": "https://angleline-hall.herokuapp.com/imgGiver"
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
                            setTimeout(()=>{pushmessage(msg,angles[0].angle_id);},3000)
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
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+post.email+"\';").then(
            members =>{
                let gate = false;
                if(members[0].head_url.replace(/\s+/g, "")=='https://i.imgur.com/PAoZtFc.jpg'){
                    gate = true;
                }
                
                psql("UPDATE ACCOUNT SET head_url=\'"+ post.url +"\' WHERE email=\'" + post.email +"\';").then(
                    aa =>{
                       psql("SELECT * FROM ACCOUNT WHERE email=\'"+post.email+"\';").then(
                           res =>{
                                let text2 = {
                                    "type":"text",
                                    "text":"已上傳圖片為頭貼"
                                }                       
                                

                                let bubble ={
                                    "type": "bubble",
                                    "header": {
                                      "type": "box",
                                      "layout": "vertical",
                                      "contents": [
                                        {
                                          "type": "text",
                                          "text": "你的小天使"
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
                                                "text": "暱稱： "+res[0].angle_nickname.replace(/\s+/g, ""),
                                              },
                                      ]
                                    }
                                    
                                };
                                
                                let self_intro =                
                                {//自我介紹
                                    "type": "text",
                                    "text": "自我介紹： "+ res[0].self_intro,
                                };
        
                                let msg2 ={  
                                    "type": "flex",
                                    "altText": "大講堂有消息，請借台手機開啟",
                                    "contents":bubble 
                                };

                                let msg =[text2,msg2,self_intro];

                                if(gate){
                                    let text ={
                                        "type":"text",
                                        "text":""
                                    }
                                    text.text ="成功註冊!";
                                    msg.push(text);

                                    var ad_msg_angle;
                                    var ad_msg_info;
                                    var ad_msg_master;

                                    if( members[0].department.replace(/\s+/g, "") == "psy"){

                                        ad_msg_angle = {  
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
                                                        "text": "按按鈕加小天使為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40hnc0868c"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_master = {  
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
                                                        "text": "按按鈕加小主人為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40rpu9491f"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_info = {  
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
                                                        "text": "按按鈕加詢問站為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40hbl3061e"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };

                                    }else{

                                        ad_msg_angle = {  
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
                                                        "text": "按按鈕加小天使為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40zpf3150n"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_master = {  
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
                                                        "text": "按按鈕加小主人為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40dwg5277m"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                        ad_msg_info = {  
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
                                                        "text": "按按鈕加詢問站為好友"
                                                        }
                                                    ]
                                                    },
                                                    "hero": {
                                                        "type": "image",
                                                        "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                                    } ,
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
                                                            "label": "按我加好友",
                                                            "uri": "https://line.me/R/ti/p/%40vdg2092y"
                                                        },
                                                        "style": "primary",
                                                        "color": "#ff3333"
                                                        }
                                                    ]
                                                    }             
                                                }
                                        };
                                    }   
                                    pushmessage([ad_msg_angle,ad_msg_master,ad_msg_info],res[0].angle_id);
                                }                              

                               setTimeout( () => {
                                pushmessage(msg,res[0].angle_id);
                               }, 3000);
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
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+post.email+"\';").then(
            members =>{
                
                if(members[0].self_intro.replace(/\s+/g, "")=='none'){
                    rres.end("no")
                }else{
                    rres.end("yes")
                }              
               
            }
        )
                
    });
    
}

