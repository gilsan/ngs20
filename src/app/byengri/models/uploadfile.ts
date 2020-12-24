export class UploadResponse {
  progress: number;
  files: [];
}

export interface Patientinfo {
  name: string;
  patientNumber: string;
  age: number;
  sex: string;
  testDiseasenum: string;
  ikzk1Detection: string;
  chormosomalAlanalysis: string;
  targetDisease: string;
  method: string;
  specimen: string;
  request: string;
}
