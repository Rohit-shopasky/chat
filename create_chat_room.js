module.exports={

    update_or_insert_chat_room:function update_or_insert_chat_room(item_id,buyer_id,seller_id,socket)
    {
		
		
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
		 
	    var sql="SELECT * FROM chat_room WHERE item_id=" +item_id + " AND seller_id=" +seller_id + " AND buyer_id=" +buyer_id+";";
			  
			  con.query(sql,function(error,result){
				 console.log("check if combination exsist" +result.length)
				 if(result.length != 0) // combination exsist
				 { console.log("comination exsist");
					 var chat_room_id=result[0].chat_room_id; 
					 socket.emit("user_joined",{chat_room_id:chat_room_id});
				 }
				 else   //combination doesn't exsist
				 {
					  console.log("combination doesn't exsist");
					   var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
					 var sql="INSERT INTO chat_room SET ?";
					 var values={
						  'item_id':item_id,
				          'buyer_id':buyer_id,
				          'seller_id':seller_id,
						  'created_at':time,
						  'updated_at':time
						  
					 }
					 con.query(sql,values,function(error,result){
						 console.log(result);
						var inserted_chat_room_id=result.insertId;
                          socket.emit("user_joined",{chat_room_id:inserted_chat_room_id});
					 });
				 } 

			  });
			 
	}

};