import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StorePathService {

  startDay = '';
  endDay = '';
  patientID = '';   // 환자번호
  pathologyNo = ''; // 검체번호
  pathologyNum = ''; // 등록, 재등록시 검체번호
  isDBSaved = false;
  type: string;

  examiner = 'none';    // 검사자
  examinerid = '';      // 검사자 아이디
  rechecker = 'none';   // 확인자
  recheckerid = '';     // 검사자 아이디

  usesearch = 'N';

  whichstate = 'mainscreen'; // mainscreen, searchscreen

  scrolly = 0;
  // list.pathology_num, i, 'N')">파일등록/변환
  // 화일등록/변환 저장
  fileuploadInfo: { pathologyNum: string, i: number, type: string } = {
    pathologyNum: '', // 화일등록/변환 검체번호
    i: 0,  // 화일등록/변환 인덱스번호
    type: '', // 화일등록/변환 타입 'N',
  };

  // main의 검색항목 저장
  // 시작날자, 종료날자, 검체번호, 환자번호
  public setSearchStartDay(day: string): void {
    this.startDay = day;
    // console.log('[store][setSearchStartDay]', this.amlStartDay);
  }

  public getSearchStartDay(): string {
    // console.log('[store][getSearchStartDay]', this.amlEndDay);
    return this.startDay;
  }
  public setSearchEndDay(day: string): void {
    this.endDay = day;
    // console.log('[store][setSearchEndDay]', this.amlEndDay);
  }

  public getSearchEndDay(): string {
    // console.log('[store][getSearchEndDay]', this.amlEndDay);
    return this.endDay;
  }

  public setPatientID(id: string): void {
    this.patientID = id;
  }

  public getPatientID(): string {
    return this.patientID;
  }

  // public setPathologyNo(id: string): void {
  //   this.pathologyNo = id;
  // }

  // public getPathologyNo(): string {
  //   return this.pathologyNo;
  // }

  // DB 저장 여부
  public setDBSaved(isSaved: boolean): void {
    this.isDBSaved = isSaved;
  }

  public getDBSaved(): boolean {
    return this.isDBSaved;
  }

  // 등록, 재등록시 pathologyNum 저장
  public setPathologyNum(pathologyNum: string): void {
    this.pathologyNum = pathologyNum;
  }

  public getPathologyNum(): string {
    return this.pathologyNum;
  }

  // 파일등록/변환 임시등록

  public setUploadpageInfo(num: string, i: number, type: string): void {
    this.fileuploadInfo.pathologyNum = num;
    this.fileuploadInfo.i = i;
    this.fileuploadInfo.type = type;
  }

  public getUploadpageInfo(): any {
    return this.fileuploadInfo;
  }

  // 검체번호 등록
  public setPathologyNo(id: string): void {
    this.pathologyNo = id;
    console.log('[102][path service][검체번호저장]', this.pathologyNo);
  }

  public getPathologyNo(): string {
    console.log('[106][path service][검체번호알림]', this.pathologyNo);
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


  // 검사자 정보 저장
  public setExamin(examinerName: string, id: string): void {
    this.examiner = examinerName;
    this.examinerid = id;
  }

  public getExam(): string {
    return this.examiner;
  }

  public getExamin(): string {
    return this.examiner + '_' + this.examinerid;
  }

  // 확인자 정보 저장
  public setRechecker(rechecker: string, id: string): void {
    this.rechecker = rechecker;
    this.recheckerid = id;
  }

  public getRecheck(): string {
    return this.rechecker;
  }

  public getRechecker(): string {
    return this.rechecker + '_' + this.recheckerid;
  }

  public setUseSearch(type: string): void {
    this.usesearch = type;
  }

  public getUseSearch(): string {
    return this.usesearch;
  }

  // 조회상태에서 검색인지, 주화면에서 선택했는지 확인
  setWhichstate(state: string): void {
    this.whichstate = state;
  }

  getWhichstate(): string {
    return this.whichstate;
  }

  // scroll 위치 저장
  setScrollyPosition(position: number): void {
    // console.log('scroll....', position);
    this.scrolly = position;
  }

  getScrollyPosition(): number {
    return this.scrolly;
  }











}

