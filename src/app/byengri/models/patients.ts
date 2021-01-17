export interface IGeneTire {
  gene: string;
  tier: string;
  frequency: string;
}
export interface IFilteredOriginData {
  type: string;
  locus: string;    // breakpoint
  readcount: string;   // read count
  oncomine: string;    // functions
  OncomineVariant: string; // Deletion
  gene: string;
  aminoAcidChange: string;
  coding: string;
  frequency: string;
  comsmicID: string;
  cytoband: string;
  variantID: string;
  variantName: string;
  pathologyNum: string;
}


export interface IBasicInfo {
  name: string;
  registerNum: string;
  gender: string;
  pathologyNum: string;
  age?: string;

}
// 검체정보
export interface IExtraction {
  dnarna: string;
  managementNum: string;
  keyblock: string;
  tumorcellpercentage: string;
  organ: string;
  tumortype: string;
  diagnosis: string;
  msiscore?: string;
  tumorburden?: string;
}

// 검사결과 mutation
export interface IMutation {
  gene: string;
  aminoAcidChange: string;
  nucleotideChange: string;
  variantAlleleFrequency: string;
  ID: string;
  tier?: string;
  seq?: string;
}

// 검사결과 amplication
export interface IAmplification {
  gene: string;
  region: string;
  copynumber: string;
  tier?: string;
  seq?: string;
}
// 검사결과 fusion
export interface IFusion {
  gene: string;
  breakpoint: string;
  readcount?: string;
  functions?: string;
  tier?: string;
  seq?: string;
}
// Prevent cancer biomarkers of unknow significance
// Mutation
export interface IIMutation {
  gene: string;
  aminoAcidChange: string;
  nucleotidChange: string;
  variantAlleleFrequency: string;
  ID: string;
  tier?: string;
  seq?: string;
}

// Amplification
export interface IIAmplification {
  gene: string;
  region: string;
  copynumber: string;
  note?: string;
  seq?: string;
}

// Fusion
export interface IIFusion {
  gene: string;
  breakpoint: string;
  readcount?: string;
  functions: string;
  tier?: string;
  seq?: string;
}


export interface IPatient {
  id?: number;
  name: string;
  patientID: string;
  age: string;
  appoint_doc?: string;
  gender: string;
  testedNum?: string;
  leukemiaAssociatedFusion?: string;
  IKZK1Deletion?: string;
  chromosomalAnalysis?: string;
  targetDisease?: string;
  method?: string;
  specimen?: string;
  examin?: string; // 검사자
  recheck?: string; // 확인자
  pathological_dx: string;
  pathology_num: string;
  prescription_code: string;
  prescription_date: string;
  prescription_no: string;
  rel_pathology_num: string;
  dna_rna_ext?: string;
  key_block?: string;
  organ?: string;
  request?: string;
  sendEMR?: string;
  sendEMRDate?: Date;
  createDate?: Date;
  tsvFilteredDate?: Date;
  tsvFilteredFilename?: string;
  tsvFilteredStatus?: string;
  tsvirfilename?: string;
  tsvorfilename?: string;
  orpath?: string;
  irpath?: string;
  bamFilename?: string;
  tumor_cell_per?: string;
  tumor_type?: string;
  worker?: string;
  test_code?: string;
  accept_date?: null;
  screenstatus?: string;
  msiscore?: string;
  tumorburden?: string;
}

export interface IFilteredTSV {
  id: string;
  locus: string;
  genotype: string;
  filter: string;
  ref: string;
  observed_allele: string;
  type: string;
  no_call_reason: string;
  genes: string;
  locations: string;
  loc1: string;
  loc2: string;
  loc3: string;
  loc4: string;
  loc5: string;
  loc6: string;
  loc7: string;
  length: string;
  info: string;
  variant_id: string;
  variant_name: string;
  frequency: string;
  strand: string;
  exon: string;
  transcript: string;
  coding: string;
  amino_acid_change: string;
  variant_effect: string;
  phylop: string;
  sift: string;
  grantham: string;
  polyphen: string;
  fathmm: string;
  pfam: string;
  dbsnp: string;
  dgv: string;
  maf: string;
  emaf: string;
  amaf: string;
  gmaf: string;
  ucsc_common_snps: string;
  exac_laf: string;
  exac_eaaf: string;
  exac_oaf: string;
  exac_efaf: string;
  exac_saaf: string;
  exac_enfaf: string;
  exac_aa: string;
  exac_gaf: string;
  cosmic: string;
  omim: string;
  gene_ontology: string;
  drugbank: string;
  clinvar: string;
  allele_coverage: string;
  allele_ratio: string;
  p_value: string;
  phred_qual_score: string;
  coverage: string;
  ref_ref_var_var: string;
  homopolymer_length: string;
  subset_of: string;
  krgdb_622_lukemia: string;
  krgdb_1100_leukemia: string;
  filename: string;
  testedID: string;
  createdate?: string;

}

export interface Ipolymorphism {
  id?: string;
  gene: string;
  aminoAcidChange: string;
  amino_acid_change?: string;
  necleotideChange: string;
  nucleotide_change?: string;
  reason?: string;
}

export interface IList {
  user_id: string;
  user_nm: string;
  part?: string;
  pickselect: string;
}
export interface IMsg {
  message: string;
}

export interface IMent {
  id?: string;
  title: string;
  content: string;
}




