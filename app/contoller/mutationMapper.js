const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const dbConfigMssql = require('./dbconfig-mssql.js');
const pool = new mssql.ConnectionPool(dbConfigMssql);
const poolConnect = pool.connect();

// list
const listHandler = async (req) => {
    await poolConnect;  
    const genes			= req.body.genes; 
	
	let sql ="select id	"
				+"	,buccal "
				+"	,patient_name "
				+"	,register_number "
				+"	,fusion "
				+"	,gene "
				+"	,functional_impact "
				+"	,transcript "
				+"	,exon_intro "
				+"	,nucleotide_change "
				+"	,amino_acid_change "
				+"	,zygosity "
				+"	,vaf "
				+"	,reference "
				+"	,cosmic_id "
				+"	,sift_polyphen_mutation_taster "
				+"	,buccal2 ";
    sql = sql + " from mutation ";
	if(genes != "") 
		sql = sql + " where gene like '%"+genes+"%'";
    sql = sql + " order by id";
  //  console.log("sql", sql);
    try {
       const request = pool.request()
         .input('gene', mssql.VarChar, genes); 
       const result = await request.query(sql) 
       return result.recordset;
   } catch (err) {
       console.error('SQL error', err);
   }
 }

// insert 
const  insertHandler = async (req) => {
  await poolConnect; // ensures that the pool has been created
  const buccal			  = req.body.buccal;
  const patient_name      = req.body.patientName;
  const register_number   = req.body.registerNumber;
  const fusion			  = req.body.fusion;
  const gene              = req.body.gene;
  const functional_impact = req.body.functionalImpact;
  const transcript        = req.body.transcript;
  const exon_intro        = req.body.exonIntro;
  const nucleotide_change = req.body.nucleotideChange;
  const amino_acid_change = req.body.aminoAcidChange;
  const zygosity          = req.body.zygosity;
  const vaf               = req.body.vafPercent;
  const reference         = req.body.references;
  const cosmic_id         = req.body.cosmicId;
  const	sift_polyphen_mutation_taster  = req.body.siftPolyphenMutationTaster;
  const buccal2			  = req.body.buccal2;
  const igv				  = req.body.igv;
  const sanger			  = req.body.sanger;

  console.log(patient_name,register_number,gene,functional_impact,transcript,exon_intro,nucleotide_change,amino_acid_change,zygosity,vaf,reference,cosmic_id);

  let sql ="insert into mutation   ";
  sql = sql + " (id, buccal,patient_name,register_number,  ";
  sql = sql + " fusion,gene,functional_impact,transcript,  ";
  sql = sql + " exon_intro,nucleotide_change,  ";
  sql = sql + " amino_acid_change,zygosity,vaf,  ";
  sql = sql + " reference,cosmic_id,sift_polyphen_mutation_taster,buccal2,igv,sanger)   ";
  sql = sql + " values ( (select isnull(max(id),0)+1 from mutation), ";
  sql = sql + " @buccal, @patient_name, @register_number,  ";
  sql = sql + " @gene, @functional_impact, @transcript,  ";
  sql = sql + " @exon_intro, @nucleotide_change,  ";
  sql = sql + " @amino_acid_change, @zygosity, @vaf,  ";
  sql = sql + " @reference,@cosmic_id,@sift_polyphen_mutation_taster,@buccal2,@igv,@sanger)";

  try {
      const request = pool.request()
        .input('buccal', mssql.VarChar, buccal) 
        .input('patient_name', mssql.NVarChar, patient_name) 
        .input('register_number', mssql.VarChar, register_number) 
		.input('fusion', mssql.VarChar, fusion) 
        .input('gene', mssql.VarChar, gene) 
        .input('functional_impact', mssql.VarChar, functional_impact) 
        .input('transcript', mssql.VarChar, transcript) 
        .input('exon_intro', mssql.VarChar, exon_intro) 
        .input('nucleotide_change', mssql.VarChar, nucleotide_change) 
        .input('amino_acid_change', mssql.VarChar, amino_acid_change) 
        .input('zygosity', mssql.VarChar, zygosity) 
        .input('vaf', mssql.VarChar, vaf) 
        .input('reference', mssql.VarChar, reference)  
        .input('cosmic_id', mssql.VarChar, cosmic_id) 
	    .input('sift_polyphen_mutation_taster', mssql.VarChar, sift_polyphen_mutation_taster) 
	    .input('buccal2', mssql.VarChar, buccal2) 
		.input('igv', mssql.VarChar, igv) 
        .input('sanger', mssql.VarChar, sanger) ; 

      const result = await request.query(sql)
     // console.dir( result);
      
      return result;
  } catch (err) {
      console.error('SQL error', err);
  }
}
 
// update 
const  updateHandler = async (req) => {
  await poolConnect; // ensures that the pool has been created
  const id				  = req.body.id;
  const buccal			  = req.body.buccal;
  const patient_name      = req.body.patientName;
  const register_number   = req.body.registerNumber;
  const fusion			  = req.body.fusion;
  const gene              = req.body.gene;
  const functional_impact = req.body.functionalImpact;
  const transcript        = req.body.transcript;
  const exon_intro        = req.body.exonIntro;
  const nucleotide_change = req.body.nucleotideChange;
  const amino_acid_change = req.body.aminoAcidChange;
  const zygosity          = req.body.zygosity;
  const vaf               = req.body.vafPercent;
  const reference         = req.body.references;
  const cosmic_id         = req.body.cosmicId;
  const	sift_polyphen_mutation_taster  = req.body.siftPolyphenMutationTaster;
  const buccal2			  = req.body.buccal2;
  const igv				  = req.body.igv;
  const sanger			  = req.body.sanger;

  console.log(patient_name,register_number,gene,functional_impact,transcript,exon_intro,nucleotide_change,amino_acid_change,zygosity,vaf,reference,cosmic_id);

  let sql ="update mutation set  ";
  sql = sql + " buccal = @buccal, patient_name= @patient_name, register_number = @register_number,  ";
  sql = sql + " fusion = @fusion, gene = @gene, functional_impact = @functional_impact, transcript = @transcript,  ";
  sql = sql + " exon_intro = @exon_intro, nucleotide_change= @nucleotide_change,  ";
  sql = sql + " amino_acid_change = @amino_acid_change, zygosity= @zygosity, vaf= @vaf,  ";
  sql = sql + " reference = @reference, cosmic_id = @cosmic_id, sift_polyphen_mutation_taster = @sift_polyphen_mutation_taster, "
  sql = sql + " buccal2 = @buccal2, igv= @igv, sanger= @sanger ";
  sql = sql + " where id = @id ";

  try {
      const request = pool.request()
		.input('id', mssql.VarChar, id)  
        .input('buccal', mssql.VarChar, buccal) 
        .input('patient_name', mssql.NVarChar, patient_name) 
        .input('register_number', mssql.VarChar, register_number) 
        .input('fusion', mssql.VarChar, fusion) 
		.input('gene', mssql.VarChar, gene) 
        .input('functional_impact', mssql.VarChar, functional_impact) 
        .input('transcript', mssql.VarChar, transcript) 
        .input('exon_intro', mssql.VarChar, exon_intro) 
        .input('nucleotide_change', mssql.VarChar, nucleotide_change) 
        .input('amino_acid_change', mssql.VarChar, amino_acid_change) 
        .input('zygosity', mssql.VarChar, zygosity) 
        .input('vaf', mssql.VarChar, vaf) 
        .input('reference', mssql.VarChar, reference)  
        .input('cosmic_id', mssql.VarChar, cosmic_id) 
	    .input('sift_polyphen_mutation_taster', mssql.VarChar, sift_polyphen_mutation_taster) 
	    .input('buccal2', mssql.VarChar, buccal2) 
		.input('igv', mssql.VarChar, igv) 
        .input('sanger', mssql.VarChar, sanger) ; 

      const result = await request.query(sql)
     // console.dir( result);
      
      return result;
  } catch (err) {
      console.error('SQL error', err);
  }
}

// Delete
const deleteHandler = async (req) => { 
	const id        = req.body.id; 
 
    let sql = "delete mutation  " ; 
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

 

// List Mutation
 exports.listMutation = (req, res, next) => { 
 //   console.log('[200][listMutation]');
    const result = listHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Mutation Insert
 exports.insertMutation = (req,res,next) => {
    const result = insertHandler(req);
    result.then(data => { 
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
 };

// Mutation Update
 exports.updateMutation = (req,res,next) => {
  //  console.log('[200][updateBenign]');

	const result = updateHandler(req);
    result.then(data => {
          res.json(data);
     })
     .catch( err  => res.sendStatus(500));
	
 };
  
exports.deleteMutation = (req, res, next) => {
      
     const result = deleteHandler(req);
     result.then(data => {
 
       //  console.log(json.stringfy());
         res.json(data);
     })
     .catch( err  => res.sendStatus(500));

}
