import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IPatient } from '../models/patients';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { SearchService } from './../services/search.service';
import { SubSink } from 'subsink';
import * as moment from 'moment';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {

  private subs = new SubSink();
  lists$: Observable<IPatient[]>;
  lists: IPatient[];
  patientInfo: IPatient;
  patientID: string;
  pathologyNo = '';
  type = '';  // N:신규입력, R: 재입력

  isVisible = false;
  isSelected = false; // 화일등록이 되었는지 확인하는 플래그
  startday: string;
  endday: string;
  pathologyno = '';
  patientid = '';

  usesearch = 'N';
  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storePathologyNo: string;

  private apiUrl = emrUrl;

  @ViewChild('pbox100', { static: true }) pbox100: ElementRef;
  constructor(
    private pathologyService: PathologyService,
    private serachService: SearchService,
    private router: Router,
    private store: StorePathService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {

    this.checkStore();
    if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
    }

    // console.log('[57][main]', this.pathologyno, this.patientid);
    if (this.pathologyno.length === 0 && this.patientid.length === 0) {
      this.search(this.startToday(), this.endToday(), '', '');
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const scrolly = this.store.getScrollyPosition();
      this.pbox100.nativeElement.scrollTop = scrolly;
    }, 300);

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    // console.log('65 init');
    this.lists$ = this.pathologyService.getPatientList();

    this.subs.sink = this.lists$.subscribe(data => {
      this.lists = data;
      // console.log('[병리 환자번호][69] ', data);
    });
  }

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    return now;
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(3, 'months');
    // console.log(oneMonthsAgo.format('YYYY-MM-DD'));
    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');
    // console.log('[115][오늘날자]년[' + yy + ']월[' + mm + ']일[' + dd + ']');
    const now1 = yy + '-' + mm + '-' + dd;
    return now1;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);

    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    if (this.storeEndDay) {
      return this.storeEndDay;
    }
    return now;
  }



  saveUploadPageInfo(pathologyNum: string, i: number, type: string): void {
    this.store.setUploadpageInfo(pathologyNum, i, type);
  }

  goUploadpage(pathologyNo: string, i: number, type: string): void {
    console.log('[125][main][환자검체정보]goUploadpage]', pathologyNo, type, i, this.isSelected);
    this.store.setPathologyNo(pathologyNo);
    this.store.setType(type);
    if (this.isSelected) {
      this.pathologyService.setPathologyNo(pathologyNo);
      this.pathologyService.setType(type); // // N:신규입력, R: 재입력
      this.type = type;
      console.log('[130][main][goUploadpage]', pathologyNo, type, i);

      this.pathologyService.setPersonalInfoandPathologyNum(i, pathologyNo);
    } else {

      this.saveUploadPageInfo(pathologyNo, i, type);
    }

    this.isVisible = !this.isVisible; // 신규
  }

  goReporter(idx: number): void {

    // 검체번호를 확인한다.
    const pathNum = this.pathologyService.getPathologyNum();
    this.pathologyService.setPatientIndex(idx);
    this.router.navigate(['/pathology', 'report', this.lists[idx].pathology_num]);
  }

  // 선택된 결과지 보고서
  goReporterClass(idx: number): any {
    const pathNum = this.pathologyService.getPathologyNum();
    // console.log('[154][main][goReporterClass]', idx, pathNum);
    if (this.lists[idx].pathology_num === pathNum) {
      return { btn_report: true };
    } else {
      return { btn_report: false };
    }
  }

  getDate(event): void {
    // console.log(event.value);
  }

  // 환자 정보
  setPatientID(id: number): void {
    this.patientInfo = this.lists[id];
  }

  // 검체번호 설정
  setPathologyNo(pathologyNo: string): void {
    this.pathologyNo = pathologyNo;
  }

  search(start: string, end: string, pathologynum: string = '', patient: string = '', saveStore = 'N'): void {
    console.log('[177][main] [찿기]', start, end, pathologynum, patient, saveStore);
    this.startday = start;
    this.endday = end;
    this.pathologyNo = pathologynum;
    this.patientid = patient;
    this.store.setWhichstate('searchscreen');
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setPathologyNo(pathologynum);
    this.store.setPatientID(patient);
    if (saveStore === 'Y') {
      this.store.setUseSearch('Y');
    }


    console.log('=== [183][검색조건저장]', this.startday, this.endday, this.pathologyNo, this.patientid);
    this.lists = []; // 리스트 초기화
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    // console.log('[176][main][search]', startdate, enddate, patient, pathologynum);
    if (patient !== undefined && patient !== null) {
      patient = patient.trim();
    }

    if (pathologynum !== undefined && pathologynum !== null) {
      pathologynum = pathologynum.trim();
    }
    this.lists$ = this.pathologyService.search(startdate, enddate, patient, pathologynum);
    this.subs.sink = this.lists$.subscribe((data) => {
      // console.log('[197][병리검색]', data);
      this.lists = data;
      console.log('[208][MAIN][SEARCH][리스트]: ', this.lists);
    });

  }

  onSelected(): void {
    console.log('[207] [onSelected]');

    this.startday = this.store.getSearchStartDay();
    this.endday = this.store.getSearchEndDay();
    this.pathologyNo = this.store.getPathologyNo();
    this.patientid = this.store.getPatientID();
    this.lists = []; // 리스트 초기화

    const status = this.store.getUseSearch();
    console.log('[onSelected][ 상태] ', status);
    if (status === 'N') {
      this.pathologyNo = '';
      this.patientid = '';

    } else {
      this.store.setUseSearch('N');
    }
    console.log('[212][]', this.startday, this.endday, this.pathologyNo, this.patientid.length);
    if (this.startday.length && this.endday.length && this.pathologyNo && this.patientid) {
      this.search(this.startday, this.endday, this.pathologyno, this.patientid, 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length && this.patientid.length === 0) {
      this.search(this.startday, this.endday, this.pathologyNo, '', 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length === 0 && this.patientid.length) {
      this.search(this.startday, this.endday, '', this.patientid, 'N');
    } else if (this.startday.length && this.endday.length && this.pathologyNo.length === 0 && this.patientid.length === 0) {
      this.search(this.startday, this.endday, '', '', 'N');
    } else {
      this.init();
    }

    this.isVisible = true;

    this.isSelected = true;
    const uploadInfo = this.store.getUploadpageInfo();

    this.goUploadpage(uploadInfo.pathologyNum, uploadInfo.i, uploadInfo.type);

  }

  onCanceled(): void {
    this.isVisible = false;
    this.isSelected = false;
  }

  checkStore(): void {
    console.log('[231][checkStore]');
    const status = this.store.getWhichstate();
    this.storeStartDay = this.store.getSearchStartDay();
    this.storeEndDay = this.store.getSearchEndDay();

    const pid = this.store.getPatientID();
    if (pid === undefined || pid === null) {
      this.storePatientID = '';
    } else {
      this.storePatientID = this.store.getPatientID();
    }

    const pnum = this.store.getPathologyNo();
    if (pnum === undefined || pnum === null) {
      this.storePathologyNo = '';
    } else {
      this.storePathologyNo = this.store.getPathologyNo();
    }


    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.pathologyno = this.storePathologyNo;
    this.patientid = this.storePatientID;

    console.log('=== [289][저장된것 불러온값]', this.startday, this.endday, this.pathologyno, this.patientid);
    if (this.storeStartDay && this.storeEndDay) {
      this.search(this.storeStartDay, this.storeEndDay, this.storePathologyNo, this.storePatientID);
    }

  }

  getUrl(list: IPatient, type: string): SafeResourceUrl {

    if (type === 'OR') {
      const orpath = list.orpath;
      const orfilename = list.tsvorfilename;
      const orurl = this.apiUrl + '/download?path=' + orpath + '&filename=' + orfilename;
      return this.sanitizer.bypassSecurityTrustResourceUrl(orurl);
    }
    const irpath = list.irpath;
    const irfilename = list.tsvirfilename;
    const irurl = this.apiUrl + '/download?path=' + irpath + '&filename=' + irfilename;
    return this.sanitizer.bypassSecurityTrustResourceUrl(irurl);

  }

  processingStatus(i: number): string {
    // console.log('=== [292][main][processingStatus][screenstatus]', this.lists[i]);
    if (this.lists.length > 0) {
      const status = this.lists[i].screenstatus;
      const filename = this.lists[i].tsvirfilename;
      if (parseInt(status, 10) === 0 && filename.length) {
        return '시작';
      } else if (parseInt(status, 10) === 1) {
        return '저장';
      } else if (parseInt(status, 10) === 2) {
        return '저장';
      } else if (parseInt(status, 10) === 3) {
        return 'EMR전송완료';
      } else {
        return '';
      }
    }

  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

  searchData(start: string, end: string, pathologynum: string, patient: string, saveStore = 'N'): void {
    console.log('[326] [search]');
    this.startday = start;
    this.endday = end;
    this.pathologyNo = pathologynum;
    this.patientid = patient;
    this.store.setWhichstate('searchscreen');
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setPathologyNo(pathologynum);
    this.store.setPatientID(patient);
    if (saveStore === 'Y') {
      this.store.setUseSearch('Y');
    }


    console.log('=== [341][검색조건저장]', this.startday, this.endday, this.pathologyNo, this.patientid);
    this.lists = []; // 리스트 초기화
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    // console.log('[345][main][search]', startdate, enddate, patient, pathologynum);
    if (patient !== undefined && patient !== null) {
      patient = patient.trim();
    }

    if (pathologynum !== undefined && pathologynum !== null) {
      pathologynum = pathologynum.trim();
    }
    this.lists$ = this.pathologyService.search(startdate, enddate, patient, pathologynum);
    this.subs.sink = this.lists$.subscribe((data) => {
      // console.log('[197][병리검색]', data);
      this.lists = data;
      console.log('[357][MAIN][SEARCH][리스트]: ', this.lists);
    });

  }

}
