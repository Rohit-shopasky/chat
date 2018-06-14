module.exports={

	fetch_from_chat_details:function fetch_from_chat_details(sql,socket)
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
		
		con.query(sql,function(error,result){
			 
			 if(error) throw error;
			  var chat_details=result;
			 
			   console.log(chat_details);
			   socket.emit("chat_history",chat_details);
		  }); 
	}
} //this is history