import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { IALLTYPE, IAMLTYPE, ILYMTYPE, IMDSTYPE } from './type.models';



@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  // 검체자 분석데이타 가져오기
  getAanlysisAMLInfo(specimenNo: string): Observable<IAMLTYPE[]> {
    return this.http.post<IAMLTYPE[]>(`${this.apiUrl}/report_patient/list`, { specimenNo, type: 'AML' });
  }

  getAanlysisALLInfo(specimenNo: string): Observable<IALLTYPE[]> {
    return this.http.post<IALLTYPE[]>(`${this.apiUrl}/report_patient/list`, { specimenNo, type: 'ALL' });
  }

  getAanlysisLYMInfo(specimenNo: string): Observable<ILYMTYPE[]> {
    return this.http.post<ILYMTYPE[]>(`${this.apiUrl}/report_patient/list`, { specimenNo, type: 'LYM' });
  }

  getAanlysisMDSInfo(specimenNo: string): Observable<IMDSTYPE[]> {
    return this.http.post<IMDSTYPE[]>(`${this.apiUrl}/report_patient/list`, { specimenNo, type: 'MDS' });
  }


  putAnalysisAML(
    specimenNo: string,
    leukemiaassociatedfusion: string,
    FLT3ITD: string,
    chromosomalanalysis: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/report_patient/insert`, {
      specimenNo, type: 'AML', leukemiaassociatedfusion, FLT3ITD, chromosomalanalysis
    });

  }

  putAnalysisALL(
    specimenNo: string,
    leukemiaassociatedfusion: string,
    IKZK1Deletion: string,
    chromosomalanalysis: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/report_patient/insert`, {
      specimenNo, type: 'ALL', leukemiaassociatedfusion, IKZK1Deletion, chromosomalanalysis
    });
  }

  putAnalysisLYM(
    specimenNo: string,
    bonemarrow: string,
    chromosomalanalysis: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/report_patient/insert`, {
      specimenNo, type: 'LYM', bonemarrow, chromosomalanalysis
    });
  }

  putAnalysisMDS(
    specimenNo: string,
    diagnosis: string,
    genetictest: string,
    chromosomalanalysis: string
  ): Observable<any> {

    return this.http.post(`${this.apiUrl}/report_patient/insert`, {
      specimenNo, type: 'MDS', diagnosis, genetictest, chromosomalanalysis
    });
  }


}


