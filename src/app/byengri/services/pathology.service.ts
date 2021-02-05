
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IAmplification, IExtraction, IFilteredOriginData, IFusion, IIAmplification, IMutation, IPatient } from '../models/patients';
import { IIMutation, IGeneTire } from './../models/patients';
import { emrUrl } from './../../config';


@Injectable({
  providedIn: 'root',
})
export class PathologyService {

  patientInfo: IPatient[];
  pathologyNo: string;
  type: string; // OR or IR

  patientIndex: number;  // 검사자 인덱스
  tumortype: string; //
  index: number;

  tumorCellPercentage: string;
  // 검체정보
  exraction: IExtraction[];
  // mutation 검사결과
  mutation: IMutation[];
  // amplification 검사결과
  amplification: IAmplification[];
  // fusion 검사결과
  fusion: IFusion[];
  imutation: IMutation[];
  // amplification 검사결과
  iamplification: IAmplification[];
  // fusion 검사결과
  ifusion: IFusion[];

  // prevalent cancer
  iimutation: IIMutation;
  iiamplification: IIAmplification[];


  // 필터된 TSV파일에서 얻어온 정보
  filteredOriginData: IFilteredOriginData[];
  pathologyNum = 'none';   // 검체번호
  tumorMutationalBurden: string;
  msiScore: string;
  clinically = [];
  prevalent = [];
  clinical: IGeneTire[] = [];

  filteredOriginData$ = new Subject();
  filteredOriginDataObservable = this.filteredOriginData$.asObservable();

  pathlogyNum$ = new Subject();
  pathologyNumObservable = this.pathlogyNum$.asObservable();

  tumorMutationalBurden$ = new Subject();
  tumorMutationalBurdenObservable = this.tumorMutationalBurden$.asObservable();

  msiScore$ = new Subject();
  msiScoreObservable = this.msiScore$.asObservable();

  clinically$ = new Subject();
  clinicallyObservable = this.clinically$.asObservable();

  prevalent$ = new Subject();
  prevalentObservable = this.prevalent$.asObservable();

  patientInfo$ = new Subject();
  patientInfoObservable = this.patientInfo$.asObservable();


  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  // 병리 환자의 정보를 가져 온다.
  public getPatientList(): Observable<IPatient[]> {
    return this.http.get<IPatient[]>(`${this.apiUrl}/patients_path/list`).pipe(
      tap(data => this.patientInfo = data)
    );
  }

  // 날자별 환자ID, 검사ID 검사인 찿기
  public search(start: string, end: string, patientID: string = '', pathologyNo: string = ''): Observable<IPatient[]> {
    // console.log('[24][searchService][병리검색]:', start, end, patientID, pathologyNo);
    return this.http.post<IPatient[]>(`${this.apiUrl}/searchpatient_path/list`, { start, end, patientID, pathologyNo }).pipe(
      // tap(data => console.log('[검색서비스][환자정보]', data)),
      tap(data => this.patientInfo = data),
      shareReplay()
    );
  }

  // 검체번호로 환자 찿기
  findPatientinfo(pathologyNum: string): Observable<IPatient> {
    return this.http.post<IPatient>(`${this.apiUrl}/patients_path/patient`, { pathologyNum });
  }

  // 파일 업로드
  // tslint:disable-next-line: typedef
  fileUpload(formData: any) {
    return this.http.post(`${this.apiUrl}/pathfileUpload/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event)),
      //  catchError(this.handleError('fileUpload', null))
    );
  }

  private getEventMessage(event: HttpEvent<any>): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);
      case HttpEventType.Response:
        return event.body;
      default:
        return `Upload event: ${event.type}.`;
    }
  }

  private fileUploadProgress(event: any): any {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { progress: percentDone, files: [] };
  }



  // 검사자 index
  // tslint:disable-next-line: typedef
  public setPatientIndex(i: number) {

    this.index = i;
    console.log('[136][pathologyservice][]', this.index);
  }

  public getPatientInfo(): IPatient {
    return this.patientInfo[this.index];
  }

  // 검체번호 등록
  public setPathologyNo(id: string): void {
    this.pathologyNo = id;
    // console.log('[120][path service][검체번호]', this.pathologyNo);
  }

  public getPathologyNo(): string {
    return this.pathologyNo;
  }

  // type
  public setType(type: string): void {
    // console.log('[140][pathlogy.service][type]', type);
    this.type = type;
  }

  public getType(): string {
    return this.type;
  }


  // EMR 로 보고서 보내기
  // tslint:disable-next-line: typedef
  public sendEMR(patientInfo: IPatient, xmlData: string) {
    const patientid = patientInfo.patientID;
    console.log(patientInfo);
    const pathologyNum = patientInfo.pathology_num.replace(/-/g, '');
    const submitID = 'TXLII00124';
    const businessID = 'li';
    const instcd = '012';
    const spcno = pathologyNum;
    const formcd = '-';
    const rsltflag = 'O';
    const pid = patientid;
    const examcd = 'PMO12072';
    const examflag = 'P';
    const infflag = 'I';
    const userid = '20800531';
    const rsltdesc = xmlData;

    const emrdata = `http://emr012.cmcnu.or.kr/cmcnu/.live?submit_id=${submitID}&business_id=li&instcd=012&spcno=${spcno}&formcd=-&rsltflag=O&pid=${pid}&examcd=${examcd}&examflag=${examflag}&infflag=I&userid=${userid}&rsltdesc=${rsltdesc}`;

    const emr = `${this.apiUrl}/pathEMR/redirectEMR`;
    console.log('[service pathologyNum]', spcno);

    return this.http.post(`${emr}`, {
      submit_id: submitID,
      business_id: businessID,
      instcd,
      spcno,
      formcd,
      rsltflag,
      pid,
      examcd,
      examflag,
      infflag,
      userid,
      rsltdesc
    });

  }

  // Tumor Mutational Burden
  public setTumorMutationalBurden(tumorMutationalBurden: string, pathologyNum: string): any {

    this.tumorMutationalBurden = tumorMutationalBurden;
    this.tumorMutationalBurden$.next(this.tumorMutationalBurden);
    // console.log('[서비스][213][tumorMutationalBurden] ', this.tumorMutationalBurden);
    return this.http.post(`${this.apiUrl}/tumorMutationalBurden/insert`, { pathologyNum, tumorMutationalBurden });


  }
  public getTumorMutationalBurden(): string {

    return this.tumorMutationalBurden;
  }

  // MSI score
  public setMSIScore(msiscore: string, pathologyNum: string): void {
    this.msiScore = msiscore;
    this.msiScore$.next(this.msiScore);
    this.http.post(`${this.apiUrl}/msiscore/insert`, { pathologyNum, msiscore })
      .subscribe(result => {
        // console.log('[223][setMSIScore][insert]', result);
      });
  }

  public getMSIScore(): string {
    return this.msiScore;
  }

  // Tumor Cell Percentage
  public setTumorCellPercentage(percentage: string, pathologyNum: string): any {
    this.tumorCellPercentage = percentage;
    return this.http.post(`${this.apiUrl}/tumorcellpercentage/insert`, { percentage, pathologyNum })
      .subscribe(result => {
        console.log('[242][서비스][pathology.service][setTumorCellPercentage]', pathologyNum, percentage, result);
      });

  }

  // Tumor type
  public setTumortype(tumortype: string, pathologyNum: string): any {
    this.tumortype = tumortype;
    return this.http.post(`${this.apiUrl}/tumortype/insert`, { pathologyNum, tumortype });

  }

  public getTumortype(): string {
    return this.tumortype;
  }

  public getTumorCellPercentage(): string {
    return this.tumorCellPercentage;
  }

  // 필터링된 tsv에서 얻은 데이타
  public setFilteredTSV(data: IFilteredOriginData[]): void {
    this.filteredOriginData = data;
    this.filteredOriginData$.next(this.filteredOriginData);
    console.log('========== [서비스][267][filteredOriginData][저장]', this.filteredOriginData);
    this.http.post(`${this.apiUrl}/filteredOriginData/insert`, { data })
      .subscribe(result => {
        // console.log('[252][filteredOriginData][insert]', result);
      });
  }

  public getFilteredTSV(): IFilteredOriginData[] {
    return this.filteredOriginData;
  }

  // 환자정보와 검체번호 등록
  public setPersonalInfoandPathologyNum(i: number, pathologynum: string): void {
    this.pathologyNum = pathologynum;   // 검체번호
    this.patientIndex = i;  // 검사자 인덱스
    this.pathlogyNum$.next(this.pathologyNum);
    this.patientInfo$.next(this.patientInfo[this.patientIndex]);

  }

  public getPersonalInfo(): IPatient {
    return this.patientInfo[this.patientIndex];
  }
  // 검체번호등록
  // public setPathologyNum(pathologyNum): void {
  //   this.pathologyNum = pathologyNum;
  // }
  // 검체번호 찿기
  public getPathologyNum(): string {
    return this.pathologyNum;
  }

  // prevalent mutation
  public setPrevalentMutation(mutation): void {
    // console.log('[pathlology mutation][209] ', mutation);
    this.iimutation = mutation;
  }

  public getPrevalentMuation(): IIMutation {
    return this.iimutation;
  }
  // Clinically significant biomarkers
  public setClinically(clinically, pathologyNum: string): any {
    this.clinically = clinically;
    this.clinically$.next(this.clinically);
    console.log('======== [서비스][312][clinically 전송]', this.clinically);
    return this.http.post(`${this.apiUrl}/clinically/insert`, { pathologyNum, clinically });
  }

  public setClinically2(clinically, pathologyNum: string): any {
    this.clinically = clinically;
    this.clinically$.next(this.clinically);
    console.log('======== [서비스][312][clinically2 전송]', this.clinically);
    return this.http.post(`${this.apiUrl}/clinically/insert2`, { pathologyNum, clinically });
  }

  public getClinically(): any {
    return this.clinically;
  }

  // clincal
  public setClinical(clinical, pathologyNum: string): any {
    this.clinical = clinical;
    // console.log('======= [서비스 setClinical] [271]', this.clinical);
    return this.http.post(`${this.apiUrl}/clinical/insert`, { pathologyNum, clinical });

  }

  public getClinical(): any {
    return this.clinical;
  }

  // prevalent cancer biomarkers
  public setPrevalent(prevalent, pathologyNum: string): any {
    this.prevalent = prevalent;
    this.prevalent$.next(this.prevalent);
    // console.log('[서비스][338][prevalent]', this.prevalent);
    return this.http.post(`${this.apiUrl}/prevalent/insert`, { pathologyNum, prevalent });
  }

  // prevalent2
  public setPrevalent2(prevalent, pathologyNum: string): any {
    this.prevalent = prevalent;
    console.log('[서비스][345][prevalent2 전송]', this.prevalent);
    return this.http.post(`${this.apiUrl}/prevalent/insert2`, { pathologyNum, prevalent });
  }

  public getPrevalent(): any {
    return this.prevalent;
  }




}

