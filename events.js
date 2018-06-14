module.exports = (function(io) {
    'use strict';
	
// libreary
var router = require('express').Router();
var express=require("express");
var app=express();
var mysql = require('mysql');
var moment = require('moment');
var con = mysql.createConnection({
  host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
  user     : 'rd_live',
  password : 'reeldeal1',
  database : 'reeldeal',
  port     : process.env.RDS_PORT
}); 
 var admin = require('firebase-admin');
var serviceAccount = require('./fcm.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

// routung
//var sql_queries=require("./sql_queries");
 // console.log(sql_queries.xyz());
  
  var send_push_notification  =   require("./send_push_notification");
  var connect_user            =   require("./connect_user.js");
  var create_chat_room        =   require("./create_chat_room.js");
  var new_message             =   require("./new_message");
  var chat_history            =   require("./chat_history.js");
  

function insert_into_table(sql,values)
{
	con.query(sql,values,function(error,result){
		if(error) throw error;
		console.log(result);
	});
}

function fetch_from_table(sql)
{ var return_result;
  con.query(sql,function(error,result){
	 // console.log(result);
	  return_result= result;
  });
  return return_result;
}

function update_table(sql)
{
	con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("record updated" +result.affectedRows);
                  }); 
}


/*
function fetch_from_chat_details(sql,socket)
{
	con.query(sql,function(error,result){
			 
			 if(error) throw error;
			  var chat_details=result;
			 
			   console.log(chat_details);
			   socket.emit("chat_history",chat_details);
		  }); 
} */


function typing_response_to_client(chat_room_id,user_id,typing_status,socket)
{
	 
	   var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
	   con.query(sql,function(error,result){
		   
		   var buyer_id=result[0].buyer_id;
		   var seller_id=result[0].seller_id;
		   
		   var sql="SELECT * FROM chat_master WHERE user_id=" +user_id + " OR user_id=" +buyer_id;
		   con.query(sql,function(error,result){
			  
               for(var i=0;i<result.length;i++)
			   {
				   var user_id=result[i].user_id;
				   var socket_id=result[i].socket_id;
				   
				   var sql="SELECT * FROM users WHERE user_id="+user_id;
				   con.query(sql,function(error,result){
					   var user_name=result[0].name;
					   socket.broadcast.to(socket_id).emit("typing",{user_name:user_name,status:typing});
				   });
				   
			   }
                  			  
		   });
		   
	   })
	 
		
}


// Events starts
 io.on("connection",function(socket){
	
	 // here user is connected
	  var user_id=socket.handshake.query.user_id;
	  var socket_id=socket.id;
	 
	  var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	  connect_user.update_or_insert_chat_master(user_id,socket_id,time);
	  
	
	  socket.on("create_chat_room",function(packet){

		  var buyer_id=packet.buyer_id;
		  var seller_id=packet.seller_id;
		  var item_id=packet.item_id;
		  var s_id=socket.id;
		 // console.log(buyer_id + " " +seller_id + " " +item_id);
		 create_chat_room.update_or_insert_chat_room(item_id,buyer_id,seller_id,socket);

	  });
	  
	  
	  
	  socket.on("new_message",function(packet){
		  
		  var chat_room_id=packet.chat_room_id;
		  var sender_id=packet.sender_id;
		  var text=packet.text;
	      new_message.insert_into_chat_details(chat_room_id,sender_id,text,socket);
	  });
	  
	  
	  // make user disconnect
	 socket.on("disconnect",function(){
		 var s_id=socket.id;
		 var sql = "UPDATE chat_master SET status=0 WHERE socket_id='" +s_id +"';";
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 console.log("Record updated---status is 0 in chat_master table");
			 socket.emit("disconnect_user",{status:'success'});
		 }); 
		
	 });
	 
	 
	 socket.on("get_message_history",function(packet){
		 
          var chat_room_id=packet.chat_room_id;
          var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_room_id="+chat_room_id;
		  
		  chat_history.fetch_from_chat_details(sql,socket);
		  
           
	  });
	  
	  
	  socket.on("typing",function(packet){
		  var chat_room_id = packet.chat_room_id;
		  var user_id      = packet.user_id;
		  
		 // console.log(chat_room_id + " " +user_id + " typing called" );
		  typing_response_to_client(chat_room_id,user_id,"typing",socket);
	  });
	  
	  socket.on("stop_typing",function(packet){
		  var chat_room_id = packet.chat_room_id;
		  var user_id      = packet.user_id;
		  
		 // console.log(chat_room_id + " " +user_id + " typing called" );
		  typing_response_to_client(chat_room_id,user_id,"stop_typing",socket);
	  });
	 
	
	 
 
});

  
  
  
  
  

    return router;
});