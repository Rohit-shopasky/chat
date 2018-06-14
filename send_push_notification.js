module.exports = {

convert_to_string:function convert_to_string(int_value)
                   {
	                 var converted_string=int_value.toString();
	                 return converted_string;
                   },
				   
				   
  push:function push (user_id,new_chat_detail_id){
	
   var mysql = require('mysql');
   var moment = require('moment');
   var con=require("./db.js");
   var con = mysql.createConnection({
  host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
  user     : 'rd_live',
  password : 'reeldeal1',
  database : 'reeldeal',
  port     : process.env.RDS_PORT
  }); 
  var admin = require('firebase-admin');
  var serviceAccount = require('./fcm.json');
 
	
	
	var sql="SELECT * FROM users where user_id=" +user_id;
	
	con.query(sql,function(error,result){
		var receiver_push_id=result[0].push_notification;
		var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
		con.query(sql,function(error,result){
			
			 var registrationToken =receiver_push_id;
			 
			 // data to convert in string
			var chat_detail_id   =  module.exports.convert_to_string(result[0].chat_detail_id);
			var chat_room_id     =  module.exports.convert_to_string(result[0].chat_room_id);
            var sender_id        =  module.exports.convert_to_string(result[0].sender_id);
            var receiver_id      =  module.exports.convert_to_string(result[0].receiver_id);
            var sent_at          =  module.exports.convert_to_string(result[0].sent_at);
            var delivered_at     =  module.exports.convert_to_string(result[0].delivered_at);
            var seen_at          =  module.exports.convert_to_string(result[0].seen_at);
            var attachment_type  =  module.exports.convert_to_string(result[0].attachment_type);
   			var attachment_url   =  module.exports.convert_to_string(result[0].attachment_url);
			var message_status   =  module.exports.convert_to_string(result[0].message_status);
			var created_at       =  module.exports.convert_to_string(result[0].created_at);
			var updated_at       =  module.exports.convert_to_string(result[0].created_at);
			
             
             var message = {
				 
				 notification: {
                 title: result[0].name, //name of sender
                 body: result[0].text
                 },
             data:{name:result[0].name,"image_url":result[0].image_url,"text":result[0].text,"chat_detail_id":chat_detail_id,
			 chat_room_id:chat_room_id,sender_id:sender_id,receiver_id:receiver_id,sent_at:sent_at,delivered_at:delivered_at,seen_at:seen_at,attachment_type:attachment_type,attachment_url:attachment_url,message_status:message_status,created_at,created_at,updated_at},
             token: registrationToken,
			 
			 android: {   // android push notification
                   ttl: 3600 * 1000,
                      notification: {
                                        icon: 'stock_ticker_update',
                                         color: '#f45342',
                                    },
                         },
                apns: {               // sending push notification for apple devices
                payload: {
                     aps: {
                           badge: 42,
                          },
                        },
                     },
             };

             admin.messaging().send(message)
            .then((response) => {
    
              console.log('Successfully sent message:', response);
              })
              .catch((error) => {
               console.log('Error sending message:', error);
              });
			
		});
	    
	});
 },
 
  
 
 


};