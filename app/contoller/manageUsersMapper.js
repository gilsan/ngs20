// Beign 정보로 필요사항 가져오기 
const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfigMssql = require('./dbconfig-mssql.js');
const pool = new mssql.ConnectionPool(dbConfigMssql);
const poolConnect = pool.connect(); 

const listHandler = async (req) => {
    await poolConnect;  
    const userId			= req.body.userId; 
	const userNm			= req.body.userNm; 
	const startDay			= req.body.startDay; 
	const endDay			= req.body.endDay;
	
	let sql ="select id, user_id, password, user_nm, user_gb, dept, login_date, ";
	sql = sql + " case when dept ='P' then 'Pathology' when dept ='D' then 'Diagnostic' else '' end dept_nm ,"
	sql = sql + " case when user_gb  ='U' then 'User' when dept ='A' then 'Manager' else '' end user_gb_nm ,"
	sql = sql + " uuid , reg_date pickselect, case when part ='T' then 'Tester' when part = 'D' then 'Doctor' end part_nm ";
    sql = sql + " from users  ";
	sql = sql + " where 1 = 1 ";
	if(userId != "") 
		sql = sql + " and user_id like '%"+userId+"%'";
	if(userNm != "") 
		sql = sql + " and user_nm like '%"+userNm+"%'";
	/*
	if(startDay != "") 
		sql = sql + " and reg_date >= '"+startDay+"'";
	if(endDay != "") 
		sql = sql + " and reg_date <= '"+endDay+"'";
	*/

    sql = sql + " order by id";

	//console.log("sql", sql);
   try {
       const request = pool.request()
         .input('userId', mssql.VarChar, userId)
		 .input('userNm', mssql.VarChar, userNm)  ; 
       const result = await request.query(sql) 
       return result.recordset;
   } catch (err) {
       console.error('SQL error', err);
   }
 }

// insert
const insertHandler = async (req) => {  
 
     const user_id			= req.body.userId;
     const password			= req.body.password;
     const user_nm			= req.body.userNm;	
     const user_gb			= req.body.userGb;
     const dept				= req.body.dept;
     const uuid				= req.body.uuid;
     const pickselect		= req.body.pickselect;
     const part				= req.body.part; 
 
     let sql = "insert into users " ;
     sql = sql + " (id, user_id, password, user_nm, "
     sql = sql + " user_gb,dept, uuid, pickselect, part)  "
     sql = sql + " values( (select isnull(max(id),0)+1 from users), " 
	 sql = sql + " @user_id, @password, @user_nm, "
     sql = sql + " @user_gb, @dept, @uuid,@pickselect, @part )";
     
    try {
        const request = pool.request()
          .input('user_id', mssql.VarChar, user_id) 
          .input('password', mssql.VarChar, password) 
          .input('user_nm', mssql.NVarChar, user_nm) 
          .input('user_gb', mssql.VarChar, user_gb) 
          .input('dept', mssql.VarChar, dept) 
          .input('uuid', mssql.VarChar, uuid)
		  .input('pickselect', mssql.VarChar, pickselect)
		  .input('part', mssql.VarChar, part); 

        const result = await request.query(sql)
      //  console.dir( result); 
        return result;
    } catch (err) {
        console.error('SQL error', err);
    }
 }

// update
const updateHandler = async (req) => { 
	 const user_id			= req.body.userId;
     const password			= req.body.password;
     const user_nm			= req.body.userNm;	
     const user_gb			= req.body.userGb;
     const dept				= req.body.dept;
     const uuid				= req.body.uuid;
     const pickselect		= req.body.pickselect;
     const part				= req.body.part; 
 
     let sql = "update users set " ;
     sql = sql + " password = @password, user_nm= @user_nm, "
     sql = sql + " user_gb= @user_gb, dept= @dept, uuid= @uuid, pickselect= @pickselect, part= @part )";
     sql = sql + "where id = @id"
     
     try {
        const request = pool.request()
		  .input('user_id', mssql.VarChar, user_id) 
          .input('password', mssql.VarChar, password) 
          .input('user_nm', mssql.NVarChar, user_nm) 
          .input('user_gb', mssql.VarChar, user_gb) 
          .input('dept', mssql.VarChar, dept) 
          .input('uuid', mssql.VarChar, uuid)
		  .input('pickselect', mssql.VarChar, pickselect)
		  .input('part', mssql.VarChar, part); 

        const result = await request.query(sql)
        console.dir( result); 
        return result;
     } catch (err) {
        console.error('SQL error', err);
     }
 }

// Delete
const deleteHandler = async (req) => { 
	const id        = req.body.id; 
 
    let sql = "delete users  " ; 
    sql = sql + "where id = @id"; 

    try {
        const request = pool.request()
		  .input('id', mssql.VarChar, id) 
        const result = await request.query(sql)
        console.dir( result); 
        return result;
    } catch (err) {
        console.error('SQL error', err);
    }
 }


// List benign
 exports.listUsers = (req, res, next) => { 
  //  console.log('[200][listBenign]');
    const result = listHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Benign Insert
 exports.insertUsers = (req,res,next) => {
    const result = insertHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Benign Update
 exports.updateUsers = (req,res,next) => {
  //  console.log('[200][updateBenign]');

	const result = updateHandler(req);
    result.then(data => {
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
	
 };

// Benign Delete
 exports.deleteUsers = (req,res,next) => {
   // console.log('[200][deleteBenign]');

	const result = deleteHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
	
 };