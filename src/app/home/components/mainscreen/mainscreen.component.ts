import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { emrUrl } from 'src/app/config';
import { StoreService } from 'src/app/forms/store.current';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
import * as moment from 'moment';
@Component({
  selector: 'app-mainscreen',
  templateUrl: './mainscreen.component.html',
  styleUrls: ['./mainscreen.component.scss']
})
export class MainscreenComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  lists$: Observable<IPatient[]>;
  lists: IPatient[] = [];
  tempLists: IPatient[] = [];
  specimenNo = '';
  patientID = '';
  isVisible = true;
  startday = '';
  endday = '';
  specimenno = '';
  patientid = '';
  status = ''; // 시작, 스크린판독, 판독완료, EMR전송
  sheet = ''; // AML ALL LYN MDS

  storeStartDay: string;
  storeEndDay: string;
  storePatientID: string;
  storeSpecimenID: string;

  private apiUrl = emrUrl;
  constructor(
    private patientsList: PatientsListService,
    private router: Router,
    private store: StoreService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
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
    this.lists$ = this.patientsList.getPatientList();
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        map(list => {
          if (list.test_code === 'LPE545') {
            return { ...list, test_code: 'ALL' };
          } else if (list.test_code === 'LPE471') {
            return { ...list, test_code: 'AML' };
          } else if (list.test_code === 'LPE473') {
            return { ...list, test_code: 'MDS/MPN' };
          } else if (list.test_code === 'LPE474') {
            return { ...list, test_code: 'Lymphoma' };
          } else {
            return { ...list };
          }
        }),
        // tap(list => console.log(list)),
      )
      .subscribe((data) => {
        // console.log(data);
        this.lists.push(data);
        // console.log('[mainscreen][환자정보]', this.lists);
      });
  }

  onSelected(): void {
    // 리스트 업데이트 함
    this.lists = [];
    console.log('[87][onSelected]', this.lists, this.startday, this.endday);
    if (this.startday.length && this.endday.length) {
      this.search(this.startday, this.endday, this.specimenno, this.patientid);
    } else {
      this.init();
    }
    this.isVisible = true;
  }

  onCanceled(): void {
    this.isVisible = true;
  }
  // tslint:disable-next-line: typedef
  goUploadpage(specimenNo: string, patientid: string) {
    this.specimenNo = specimenNo;
    this.patientID = patientid;
    this.store.setPatientID(patientid);
    this.store.setSpecimentNo(specimenNo);
    // this.router.navigate(['/diag', 'fileupload', specimenNo]);  // 기존
    this.isVisible = !this.isVisible;  // 신규
  }

  // tslint:disable-next-line: typedef
  goReporter(i: number) {
    console.log('[111][mainscreen][goReporter]', this.lists[i]);
    const specimenno = this.store.getSpecimenNo();
    // if (this.lists[i].specimenNo === specimenno || specimenno === 'none') {
    this.patientsList.setTestedID(this.lists[i].specimenNo); // 검체번호
    this.patientsList.setTestcode(this.lists[i].test_code);  // 검사지 타입 AML ALL
    this.router.navigate(['/diag', 'jingum', this.lists[i].test_code]);
    // } else {
    //   alert('검체번호가 일치 하지 않습니다.' + this.lists[i].specimenNo + ',' + specimenno);
    // }
  }

  goReporterClass(idx: number): any {
    const specimenno = this.store.getSpecimenNo();
    // console.log('[154][main][goReporterClass]', idx, pathNum);
    if (this.lists[idx].specimenNo === specimenno) {
      return { btn_report: true };
    } else {
      return { btn_report: false };
    }
  }

  // tslint:disable-next-line: typedef
  getDate(event) {
    // console.log(event.toString().replace(/-/gi, ''));
  }

  // tslint:disable-next-line: typedef
  today() {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    // const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + day).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now;
  }

  startToday(): string {
    const oneMonthsAgo = moment().subtract(1, 'months');

    const yy = oneMonthsAgo.format('YYYY');
    const mm = oneMonthsAgo.format('MM');
    const dd = oneMonthsAgo.format('DD');

    const now1 = yy + '-' + mm + '-' + dd;
    if (this.storeStartDay) {
      return this.storeStartDay;
    }
    return now1;
  }

  endToday(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const day = today.getDay() - 1;  // 요일
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;

    if (this.storeEndDay) {
      return this.storeEndDay;
    }
    return now;
  }

  getUrl(list: IPatient, type: string): SafeResourceUrl {
    // http://112.169.53.30:3000//
    // path/2020/12/05
    // M20-11575_v1_faf05a1d-f4da-4bed-9023-63b11029114a_2020-10-11_19-10-25-443_All_OR.tsv

    const irpath = list.path;
    const irfilename = list.tsvFilteredFilename;
    const irurl = this.apiUrl + '/download?path=' + irpath + '&filename=' + irfilename;
    return this.sanitizer.bypassSecurityTrustResourceUrl(irurl);

  }

  checkStore(): void {
    this.storeStartDay = this.store.getSearchStartDay();
    this.storeEndDay = this.store.getSearchEndDay();
    this.storePatientID = this.store.getamlPatientID();
    this.storeSpecimenID = this.store.getamlSpecimenID();
    this.startday = this.storeStartDay;
    this.endday = this.storeEndDay;
    this.specimenno = this.storeSpecimenID;
    this.patientid = this.patientID;
    console.log('[208][mainscreen][echeckStore] ', this.storeStartDay, this.storeEndDay);
    this.lists = [];
    if (this.storeStartDay && this.storeEndDay) {

      //  this.search(this.storeStartDay, this.storeEndDay, this.storeSpecimenID, this.storePatientID);
    }
  }

  // tslint:disable-next-line: typedef
  search(start: string, end: string, specimenNo: string, patientId: string, status: string = '', sheet: string = '') {
    let testCode;
    this.startday = start;
    this.endday = end;
    this.specimenno = specimenNo;
    this.patientid = patientId;
    this.status = status;
    this.sheet = sheet;
    if (status === 'ALL') {
      testCode = 'LPE545';
    } else if (status === 'AML') {
      testCode = 'LPE471';
    } else if (status === 'LYM') {
      testCode = 'LPE474';
    } else if (status === 'MDS') {
      testCode = 'LPE473';
    }

    this.store.setSearchStartDay(start);
    this.store.setSearchEndDay(end);
    this.store.setamlSpecimenID(specimenNo);
    this.store.setamlPatientID(patientId);
    this.store.setStatus(status);
    this.store.setSheet(sheet);
    this.lists = [];
    // console.log('[121][search]', this.startday, this.endday, this.specimenNo, this.patientID);
    //
    const startdate = start.toString().replace(/-/gi, '');
    const enddate = end.toString().replace(/-/gi, '');
    // console.log('[97][진검검색]', startdate, enddate, specimenNo, patientId);

    if (patientId !== undefined) {
      patientId = patientId.trim();
    }
    if (specimenNo !== undefined) {
      specimenNo = specimenNo.trim();
    }
    this.lists$ = this.patientsList.search(startdate, enddate, patientId, specimenNo, testCode, sheet);
    this.subs.sink = this.lists$
      .pipe(
        switchMap(item => of(item)),
        switchMap(list => from(list)),
        filter(list => list.test_code === 'LPE545' || list.test_code === 'LPE471' || list.test_code === 'LPE473' || list.test_code === 'LPE474'),
        map(list => {
          if (list.test_code === 'LPE545') {
            return { ...list, test_code: 'ALL' };
          } else if (list.test_code === 'LPE471') {
            return { ...list, test_code: 'AML' };
          } else if (list.test_code === 'LPE473') {
            return { ...list, test_code: 'MDS/MPN' };
          } else if (list.test_code === 'LPE474') {
            return { ...list, test_code: 'Lymphoma' };
          } else {
            return { ...list };
          }
        }),
        // tap(list => console.log(list)),
      ).subscribe((data) => {
        // console.log('[237][mainscreen][검색]', data);
        // this.lists = data;

        this.lists.push(data);
        this.patientID = '';
        this.specimenNo = '';
      });

  }
  // 환자ID
  getPatientID(id: string): void {
    this.patientID = id;
  }
  // 검체 ID
  getTestedID(id: string): void {
    this.specimenNo = id;
  }

  processingStatus(i: number): string {
    const status = this.lists[i].screenstatus;
    const filename = this.lists[i].tsvFilteredFilename;
    if (parseInt(status, 10) === 0 && filename.length) {
      return '시작';
    } else if (parseInt(status, 10) === 1) {
      return '스크린판독';
    } else if (parseInt(status, 10) === 2) {
      return '판독확정';
    } else if (parseInt(status, 10) === 3) {
      return '검사완료';
    }
  }

  isDisabled(i: number): boolean {
    const status = this.lists[i].screenstatus;
    const filename = this.lists[i].tsvFilteredFilename;
    if (parseInt(status, 10) === 0 && filename.length) {
      return false;
    } else if (parseInt(status, 10) === 1) {
      return false;
    } else if (parseInt(status, 10) === 2) {
      return false;
    } else if (parseInt(status, 10) === 3) {
      return true;
    }
  }

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }




}
