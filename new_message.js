module.exports={


  insert_into_chat_details:function insert_into_chat_details(chat_room_id,sender_id,text,socket){
  
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
      var send_push_notification  =   require("./send_push_notification");


       	   var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		   var sql="INSERT INTO chat_details SET ?";
		   var values={
			            'chat_room_id':chat_room_id,
						'sender_id'   :sender_id,
						'text'        :text,
						'sent_at'     :time,
					'message_status'  :0,
					'created_at'      :time,
                    'updated_at'      :time					
		   }
		   con.query(sql,values, function (err, result) {
                     if (err) throw err; 
                      //console.log(result.insertId);
	                   var new_chat_detail_id=result.insertId
					  
					  
                                           
					                        var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
		                                    con.query(sql,function(error,result){
			                                 
                                             if(error) throw error;
											
											 var chat_room_id=result[0].chat_room_id;
											 console.log(chat_room_id + " <--chat_room_id" );
											 
											 var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
											 con.query(sql,function(error,result){
												
												var buyer_id=result[0].buyer_id;
                                               var seller_id=result[0].seller_id;
												
												var sql="SELECT *FROM chat_master WHERE user_id='" +buyer_id +"' OR user_id='"+seller_id + "'";
												
												con.query(sql,function(error,result){
													
													var chat_master_result=result;
													
													var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
													
													con.query(sql,function(error,result){
														
													  for(var i=0;i<chat_master_result.length;i++)
													   {
														 if(chat_master_result[i].status==1)
														 {  // send socket msg
															 socket.broadcast.to(chat_master_result[i].socket_id).emit("new_message",result);
															 
															 if(i==0)
															 {socket.emit("new_message",result);}
														 }
														 else
														 {
															 // send push notification
															 send_push_notification.push(chat_master_result[i].user_id,new_chat_detail_id);
														 }
													      
													   } 
													});
													
													
													
													
												});
												
											 });
											 
												 
										
		                         });
					    
                    });

	  
  
  }


}