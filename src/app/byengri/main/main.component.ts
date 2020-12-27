import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IPatient } from '../models/patients';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { SearchService } from './../services/search.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

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
  pathologyno: string;
  patientid: string;

  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storePathologyNo: string;

  private apiUrl = emrUrl;

  constructor(
    private pathologyService: PathologyService,
    private serachService: SearchService,
    private router: Router,
    private store: StorePathService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // <a [href]="fileUrl" download="file.txt">DownloadFile</a>
    // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl()
    this.checkStore();
    if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
    }

    this.search(this.startToday(), this.endToday(), '', '');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.lists$ = this.pathologyService.getPatientList();

    this.subs.sink = this.lists$.subscribe(data => {
      this.lists = data;
      console.log('[병리 환자번호][69] ', data);
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
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth();  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log('[' + date + '][' + now + '][' + this.storeStartDay + ']');
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now;
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

  // getUploadPageInfo(i: number): any {
  //   const uploadInfo = this.store.getUploadpageInfo();
  // }

  goUploadpage(pathologyNo: string, i: number, type: string): void {

    if (this.isSelected) {
      this.pathologyService.setPathologyNo(pathologyNo);
      this.pathologyService.setType(type); // // N:신규입력, R: 재입력
      this.type = type;
      console.log('[118][main][goUploadpage]', pathologyNo, type, i);

      this.pathologyService.setPersonalInfoandPathologyNum(i, pathologyNo);
    } else {
      this.store.setPathologyNo(pathologyNo);
      this.store.setType(type);
      this.saveUploadPageInfo(pathologyNo, i, type);
    }
    // this.router.navigate(['/pathology', 'fileupload', pathologyNo + '_' + type]); //   기존것
    this.isVisible = !this.isVisible; // 신규
  }

  goReporter(idx: number): void {
    //  console.log('[병리 Main:][39] ', this.lists[idx]);
    // 검체번호를 확인한다.
    const pathNum = this.pathologyService.getPathologyNum();
    // console.log(this.lists);
    // console.log('[레포트]: ', pathNum);
    // if (this.lists[idx].pathology_num === pathNum || pathNum === 'none') {
    this.pathologyService.setPatientIndex(idx);
    this.router.navigate(['/pathology', 'report', this.lists[idx].pathology_num]);
    // } else {
    //   alert('검체번호가 일치 하지 않습니다.' + this.lists[idx].name + ' ' + pathNum);
    // }

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

  search(start: string, end: string, pathologynum: string, patient: string): void {
    this.startday = start;
    this.endday = end;
    this.pathologyNo = pathologynum;
    this.patientid = patient;
    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setPathologyNo(pathologynum);
    this.store.setPatientID(patient);

    this.lists = []; // 리스트 초기화
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    // console.log('[176][main][search]', startdate, enddate, patient, pathologynum);
    if (patient !== undefined) {
      patient = patient.trim();
    }

    if (pathologynum !== undefined) {
      pathologynum = pathologynum.trim();
    }
    this.lists$ = this.pathologyService.search(startdate, enddate, patient, pathologynum);
    this.subs.sink = this.lists$.subscribe((data) => {
      // console.log('[170][병리검색]', data);
      this.lists = data;
    });

  }

  onSelected(): void {
    // console.log('[209][main][onSelected] onSelected.... ');
    this.startday = this.store.getSearchStartDay();
    this.endday = this.store.getSearchEndDay();

    if (this.startday.length && this.endday.length) {
      this.search(this.startday, this.endday, this.pathologyno, this.patientid);
    } else {
      this.init();
    }
    this.isVisible = true;

    this.isSelected = true;
    const uploadInfo = this.store.getUploadpageInfo();
    // console.log('[222][main][onSelected]', uploadInfo, this.isVisible);
    this.goUploadpage(uploadInfo.pathologyNum, uploadInfo.i, uploadInfo.type);

  }

  onCanceled(): void {
    this.isVisible = false;
    this.isSelected = false;
  }

  checkStore(): void {
    this.storeStartDay = this.store.getSearchStartDay();
    this.storeEndDay = this.store.getSearchEndDay();
    this.storePatientID = this.store.getPatientID();
    this.storePathologyNo = this.store.getPathologyNo();
    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.pathologyno = this.storePathologyNo;
    this.patientid = this.patientID;

    if (this.storeStartDay && this.storeEndDay) {
      this.search(this.storeStartDay, this.storeEndDay, this.storePathologyNo, this.storePatientID);
    }
  }

  getUrl(list: IPatient, type: string): SafeResourceUrl {
    // http://112.169.53.30:3000//
    // path/2020/12/05
    // M20-11575_v1_faf05a1d-f4da-4bed-9023-63b11029114a_2020-10-11_19-10-25-443_All_OR.tsv
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
    const status = this.lists[i].screenstatus;
    const filename = this.lists[i].tsvirfilename;
    if (parseInt(status, 10) === 0 && filename.length) {
      return '시작';
    } else if (parseInt(status, 10) === 1) {
      return '1차완료';
    } else if (parseInt(status, 10) === 2) {
      return '2차완료';
    } else if (parseInt(status, 10) === 3) {
      return 'EMR전송완료';
    }
  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

}
