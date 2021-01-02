

export interface IPatient {
  id?: number;
  name: string;
  patientID: string;
  age: string;
  gender: string;
  testedNum: string;
  leukemiaAssociatedFusion?: string;
  leukemiaassociatedfusion?: string;
  IKZK1Deletion: string;
  FLT3ITD: string;
  chromosomalAnalysis: string;
  chromosomalanalysis?: string;
  targetDisease: string;
  method: string;
  accept_date: string;
  specimen: string;
  detected?: string;
  request: string;
  tsvFilteredFilename?: string;
  path?: string;
  createDate?: Date;
  tsvFilteredStatus?: string;
  tsvFilteredDate?: Date;
  bamFilename?: string;
  sendEMR?: string;
  sendEMRDate?: string;
  report_date?: string;
  specimenNo: string;
  test_code?: string;
  screenstatus: string;
  recheck?: string; // 확인자
  examin?: string; // 검사자
}

export interface IProfile {
  leukemia: string;
  flt3itd: string;
  chron: string;
  IKZK1Deletion?: string;
}

export interface IAMLProfile {
  leukemia: string;
  flt3itd: string;
  chron: string;
  IKZK1Deletion?: string;
}

export interface IALLProfile {
  leukemia: string;
  chron: string;
  IKZK1Deletion?: string;
}

export interface IMDSProfile {
  diagnosis: string;
  genetic: string;
  chron: string;
}

export interface ILyphoma {
  bone: string;
  chron: string;
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

export interface IAFormVariant {
  id?: string;
  igv?: string;
  sanger?: string;
  type?: string;
  name?: string;
  patientID?: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  references: string;
  cosmicID: string;
  functional_impact?: string;
  exon_intro?: string;
  amino_acid_change?: string;
  vaf?: string;
  reference?: string;
  cosmic_id?: string;
}

export interface IFitering {
  id: string;
  gene1: string;
  gene2: string;
  item: IFilteredTSV;
}

export interface IMutation {
  name: string;
  patientID: string;
  gene: string;
  functionalImpact: string;
  transcript: string;
  exonIntro: string;
  nucleotideChange: string;
  aminoAcidChange: string;
  zygosity: string;
  vafPercent: string;
  references: string;
  cosmicID: string;
}

export interface IGeneCoding {
  id?: string;
  gene1: string;
  gene2: string;
  coding: string;
  tsv: IFilteredTSV;
}

export interface IRecoverVariants {
  amino_acid_change: string;
  cosmic_id: string;
  type: string;
  exon: string;
  functional_impact: string;
  gene: string;
  id?: string;
  igv: string;
  nucleotide_change: string;
  reference: string;
  report_date: string;
  sanger: string;
  specimenNo: string;
  transcript: string;
  vaf: string;
  zygosity: string;
}

export interface IDetectedVariants {
  gene?: string;
  functional_impact: string;
  transcript: string;
  exon_intro: string;
  nucleotide_change?: string;
  amino_acid_change?: string;
  zygosity: string;
  vaf: string;
  reference: string;
  cosmic_id: string;
}

export interface IComment {
  gene: string;
  comment: string;
  reference: string;
  variant_id: string;
  variants?: string;
  id?: string;
  type?: string;
}

export interface IIComment {
  gene: string;
  id?: string;
  report_date: string;
  specimenNo: string;
  variants: string;
  type?: string;
}

export interface IList {
  name: string;
  qty: number;
}

export interface IDList {
  user_nm: string;
  part: string;
}


export interface IExamPart {
  part: string;
  name: string;
}
