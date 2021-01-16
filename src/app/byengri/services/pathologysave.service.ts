import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAmplification, IBasicInfo, IExtraction, IFusion, IIAmplification, IMutation, IPatient } from '../models/patients';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root'
})
export class PathologySaveService {

  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  savePathologyData(
    pathologyNum: string,
    patientinfo: IPatient,
    mutationc: IMutation[],
    amplificationc: IAmplification[],
    fusionc: IFusion[],
    mutationp: IMutation[],
    amplificationp: IIAmplification[],
    fusionp: IFusion[],
    extraction: IExtraction,
    generalReport: string,
    specialment: string,
    notement: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/pathologyReportInsert/insert`, {
      pathology_num: pathologyNum,
      patientinfo,
      mutation_c: mutationc,
      amplification_c: amplificationc,
      fusion_c: fusionc,
      mutation_p: mutationp,
      amplification_p: amplificationp,
      fusion_p: fusionp,
      extraction,
      generalReport,
      specialment,
      notement
    });

  }

  updatePathologyData(
    pathologyNum: string,
    patientinfo: IPatient,
    mutationc: IMutation[],
    amplificationc: IAmplification[],
    fusionc: IFusion[],
    mutationp: IMutation[],
    amplificationp: IIAmplification[],
    fusionp: IFusion[],
    extraction: IExtraction,
    generalReport: string,
    specialment: string,
    notement: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/pathologyReportInsert/update`, {
      pathology_num: pathologyNum,
      patientinfo,
      mutation_c: mutationc,
      amplification_c: amplificationc,
      fusion_c: fusionc,
      mutation_p: mutationp,
      amplification_p: amplificationp,
      fusion_p: fusionp,
      extraction,
      generalReport,
      specialment,
      notement
    });

  }



  // 저장된 정보 불러오기
  getPathologyData(pathologyNum: string, type: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/pathologyReportSearch/${type}`, {
      pathology_num: pathologyNum
    });

  }



}
