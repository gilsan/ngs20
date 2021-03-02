export interface IMutation {
  id: string;
  buccal: string;
  patient_name: string;
  register_number: string;
  fusion: string;
  gene: string;
  functional_impact: string;
  transcript: string;
  exon_intro: string;
  nucleotide_change: string;
  amino_acid_change: string;
  zygosity: string;
  vaf: string;
  reference: string;
  cosmic_id: string;
  sift_polyphen_mutation_taster: string;
  buccal2: string;
  igv: string;
  sanger: string;
  exac?: string;
  exac_east_asia?: string;
  krgdb?: string;
  etc1?: string;
  etc2?: string;
  etc3?: string;
}
