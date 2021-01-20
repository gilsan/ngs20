import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IList, IMsg, IPatient } from '../models/patients';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  private apiUrl = emrUrl;

  // 병리 환자목록
  patientInfo: IPatient[];

  constructor(
    private http: HttpClient
  ) { }


  // 날자별 환자ID, 검사ID 검사인 찿기
  public search(start: string, end: string, patientID: string, pathologyNo: string): Observable<IPatient[]> {
    console.log('[24][searchService][병리검색]:', start, end, patientID, pathologyNo);
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_path/list`, { start, end, patientID, pathologyNo }).pipe(
      tap(data => this.patientInfo = data),
      shareReplay()
    );
  }

  // mentlist 찿기
  getPathmentlist(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathmentlist/list`, { pathologyNum: pathologyNo });
  }



  // mutation_c 찿기
  getMutationC(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/mutationC`, { pathologyNum: pathologyNo });
  }


  // amplification_c 찿기
  getAmplificationC(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/amplificationC`, { pathologyNum: pathologyNo });
  }
  // fusion_c 찿기
  getFusionC(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/fusionC`, { pathologyNum: pathologyNo });
  }
  // mutation_p 찿기
  getMutationP(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/mutationP`, { pathologyNum: pathologyNo });
  }
  // amplification_p 찿기
  getAmplificationP(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/amplificationP`, { pathologyNum: pathologyNo });
  }

  // fusion_p 찿기
  getFusionP(pathologyNo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathologyReportSearch/fusionP`, { pathology_num: pathologyNo });
  }

  // 병리 DB 저장 하기 screenstatus =1 로 변경
  public screenPathologyEmrUpdate(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathEmrUpdate/pathologyEmrSendUpdate`, { pathologyNum });
  }
  // 병리 EMR 전송 screenstatus =2 로 변경
  public screenPathologyUpdate(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathEmrUpdate/pathologyReportUpdate`, { pathologyNum });
  }

  // 병리 EMR 전송 screenstatus =3 로 변경
  public finishPathologyEMRScreen(pathologyNum: string, userid: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pathEmrUpdate/finishPathologyEMRScreen`, { pathologyNum, userid });
  }

  // 검진 수정버튼 누를때 screenstatus = 0 번호 변경
  resetscreenstatus(pathologyNum: string, num: string): any {
    return this.http.post(`${this.apiUrl}/patients_path/resetPath`, { pathologyNum, num });
  }

  // 현재 설정된 screenstatus 상태 가져오기
  getScreenStatus(pathologyNum: string): any {
    return this.http.post(`${this.apiUrl}/patients_path/screenstatusPath`, { pathologyNum });
  }

  // 병리 사용자 리스트
  public listPath(): Observable<IList[]> {
    return this.http.post<IList[]>(`${this.apiUrl}/loginPath/listpath`, { dept: 'P' });
  }

  // 병리 사용자 갱신
  public updatePickselect(userId: string, pickselect: string, part: string): Observable<IMsg> {
    return this.http.post<IMsg>(`${this.apiUrl}/loginPath/listPathUpdate`, { userId, pickselect, part });
  }

  // 병리 그림 경로 가져오기
  public getPathImage(pathologynum: string): any {
    return this.http.post<IMsg>(`${this.apiUrl}/pathologyimage/lists`, { pathologynum });
  }



}

