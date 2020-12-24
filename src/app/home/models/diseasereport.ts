

export interface IDiseaseReport {
  patientInfo: {
    name: string;
    registerNum: string;
    sex: string;
    age: string;
    diseaseNum: string;
  };
  overviewInfo: {
    dnaAndRnaExtraction: string;
    diseaseNum: string;
    keyBlock: string;
    tumorCellPercentage: string;
    organ: string;
    tumorType: string;
    pathologicalDigonsis: string
  };

  test_result_1: {
    mutation: {
      gene: string;
      aminoAcidChange: string;
      nucleotideChange: string;
      variantAlleleFrequency: string;
      ID: string;
      tier: string;
    };

    ampliflication: {
      gene: string;
      region: string;
      estimatedCopyNumber: string;
      tier: string;
    };

    fusion: {
      gentExon: string;
      breakpoint: string;
      readCounts: string;
      function: string;
      tier: string;
    };
  };

  test_result_2: {
    mutation: {
      gene: string;
      aminoacidChange: string;
      nucleotideChange: string;
      variantAlleleFrequency: string;
      ID: string;
      tier: string;
    };

    ampliflication: {
      gene: string;
      region: string;
      estimatedCopyNumber: string;
      tier: string;
    };

    fusion: {
      gentExon: string;
      breakpoint: string;
      readCounts: string;
      function: string;
      tier: string;
    };
  };

  tumorMutationalBurden: string;
  msi_score: string;
  essentialGenomic: string[];
  reportin: string[];

}
