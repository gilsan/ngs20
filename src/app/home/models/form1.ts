
export interface IForm1 {
  patientInfo: {
    name: string;
    registerNum: string;
    sex: string;
    age: string;
  };

  result: string;

  overview: {
    leukemiaAssociatedFusion: string;
    FLT3_ITD: string;
    chromosomalAnalysis: string;
  };

  testInformation: {
    targetDisease: string;
    method: string;
    specimen: string;
    request: string;
  }[];

  detectedVariants: {
    gene: string;
    functionaImpact: string;
    transcript: string;
    exonIntron: string;
    nuceleotideChange: string;
    aminoAcidChange: string;
    zygosity: string;
    vaf: string;
    references: string;
    cosmicId: string;
  };

  methods: string[];
  generalLimitationsOfTheTechniaue: string[];
  targetGenes: string[];


}
