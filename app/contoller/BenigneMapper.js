// Beign 정보로 필요사항 가져오기 
const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfigMssql = require('./dbconfig-mssql.js');
const pool = new mssql.ConnectionPool(dbConfigMssql);
const poolConnect = pool.connect(); 

const listHandler = async (req) => {
    await poolConnect;  
    const genes			= req.body.genes; 
	
	let sql ="select id, genes, location, exon, transcript, coding, amino_acid_change ";
    sql = sql + " from benign ";
	if(genes != "") 
		sql = sql + " where genes like '%"+genes+"%'";
    sql = sql + " order by id";

	//console.log("sql", sql);
   try {
       const request = pool.request()
         .input('genes', mssql.VarChar, genes); 
       const result = await request.query(sql) 
       return result.recordset;
   } catch (err) {
       console.error('SQL error', err);
   }
 }

// insert
const insertHandler = async (req) => { 
     const genes             = req.body.genes;
     const locat	         = req.body.locat;
     const exon              = req.body.exon;
     const transcript        = req.body.transcript;
     const coding            = req.body.coding;
     const aminoAcidChange   = req.body.aminoAcidChange;
 
     let sql = "insert into benign " ;
     sql = sql + " (id, genes, location, exon, "
     sql = sql + " transcript,coding, amino_acid_change)  "
     sql = sql + " values( (select isnull(max(id),0)+1 from benign), " 
	 sql = sql + " @genes, @locat, @exon, "
     sql = sql + " @transcript, @coding, @aminoAcidChange)";
     
    try {
        const request = pool.request()
          .input('genes', mssql.VarChar, genes) 
          .input('locat', mssql.VarChar, locat) 
          .input('exon', mssql.VarChar, exon) 
          .input('transcript', mssql.VarChar, transcript) 
          .input('coding', mssql.VarChar, coding) 
          .input('aminoAcidChange', mssql.VarChar, aminoAcidChange); 
        const result = await request.query(sql)
      //  console.dir( result); 
        return result;
    } catch (err) {
        console.error('SQL error', err);
    }
 }

// update
const updateHandler = async (req) => { 
	 const id                = req.body.id;
     const genes             = req.body.genes;
     const locat			 = req.body.locat;
     const exon              = req.body.exon;
     const transcript        = req.body.transcript;
     const coding            = req.body.coding;
     const aminoAcidChange   = req.body.aminoAcidChange;
 
     let sql = "update benign set " ;
     sql = sql + "  genes = @genes, location = @locat, exon =  @exon "
     sql = sql + "  ,transcript = @transcript ,coding = @coding  "
     sql = sql + "  ,amino_acid_change =  @aminoAcidChange "
     sql = sql + "where id = @id";
     
     try {
        const request = pool.request()
		  .input('id', mssql.VarChar, id) 
          .input('genes', mssql.VarChar, genes) 
          .input('locat', mssql.VarChar, locat) 
          .input('exon', mssql.VarChar, exon) 
          .input('transcript', mssql.VarChar, transcript) 
          .input('coding', mssql.VarChar, coding) 
          .input('aminoAcidChange', mssql.VarChar, aminoAcidChange); 
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
 
    let sql = "delete benign  " ; 
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
 exports.listBenign = (req, res, next) => { 
  //  console.log('[200][listBenign]');
    const result = listHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Benign Insert
 exports.insertBenign = (req,res,next) => {
    const result = insertHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Benign Update
 exports.updateBenign = (req,res,next) => {
  //  console.log('[200][updateBenign]');

	const result = updateHandler(req);
    result.then(data => {
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
	
 };

// Benign Delete
 exports.deleteBenign = (req,res,next) => {
   // console.log('[200][deleteBenign]');

	const result = deleteHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
	
 };