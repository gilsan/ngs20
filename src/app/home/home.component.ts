import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../forms/store.current';
import { PatientsListService } from './services/patientslist';
import { StorePathService } from '../byengri/store.path.service';

import { MatDialog } from '@angular/material/dialog';

import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { IPasswd } from '../byengri/models/patients';
import { DiagpasswdchangeComponent } from './diagpasswdchange/diagpasswdchange.component';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userid: string;
  username: string;
  dept = '진검';
  work = '';
  passwdInfo: IPasswd;

  constructor(
    private router: Router,
    private dstore: StoreService,
    private patientsListService: PatientsListService,
    private store: StorePathService,
    public dialog: MatDialog,
    private service: ManageUsersService,
  ) { }

  ngOnInit(): void {
    const userinfo = localStorage.getItem('diaguser');
    this.userid = JSON.parse(userinfo).userid;
    const pw = JSON.parse(userinfo).pw;

    console.log(this.userid, pw);
    this.service.getManageUsersList('', '', this.userid, '', 'D')
      .pipe(
        map(values => values.filter(val => val.user_id === this.userid && val.password === pw)),
        map(datas => datas.map(data => {
          if (data.pickselect === null) {
            data.pickselect = '';
            return data;
          }
          return data;
        }))
      )
      .subscribe(data => {
        if (data.length > 0) {
          this.passwdInfo = data[0];
          this.username = data[0].user_nm;
          if (data[0].part_nm === 'Tester') {
            this.work = '임상병리사';
          } else if (data[0].part_nm === 'Doctor') {
            this.work = '의사';
          }
        }
      });
  }

  logout(): void {
    console.log('로그아웃');
    this.startToday();
    this.endToday();
    localStorage.removeItem('userpart');
    localStorage.removeItem('diaguser');
    this.router.navigateByUrl('/login');
    this.dstore.setamlPatientID('');
    this.dstore.setamlSpecimenID('');
    this.dstore.setStatus('');
    this.dstore.setSheet('');
    this.dstore.setWhichstate('mainscreen');
    this.dstore.setSearchStartDay('');
    this.dstore.setSearchEndDay('');
    this.dstore.setScrollyPosition(0);

  }

  goHome(): void {
    this.router.navigate(['/diag']);
  }

  startToday(): void {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth();  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    this.store.setSearchStartDay(now);
    console.log('home logout:', this.store.getSearchStartDay());
  }

  endToday(): void {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜
    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
    // console.log(date, now);
    this.store.setSearchEndDay(now);
    console.log('home logout:', this.store.getSearchEndDay());
  }

  link(url: string): void {
    let item = {
      url: '/diag/' + url + 'Component'
    };
    this.router.navigateByUrl(item.url);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DiagpasswdchangeComponent, {
      height: '480px',
      width: '800px',
      data: {
        userid: this.userid,
        username: this.username,
        dept: this.dept,
        work: this.work,
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      // console.log('[dialogRef]', this.passwdInfo, data);
      if (data !== undefined) {
        const id = this.passwdInfo.id;
        const passwd = data.newpassword;
        const userNm = data.username;
        const userGb = this.passwdInfo.user_gb;

        const pickselect = this.passwdInfo.pickselect;
        const tempPart = this.passwdInfo.part_nm;
        let part = '';

        if (tempPart === 'Tester') {
          part = 'T';
        } else {
          part = 'D';
        }
        this.service.updateMangeUser(id, this.userid, passwd, userNm, userGb, 'D', pickselect, part)
          .subscribe(val => {
            console.log(val.rowsAffected[0]);
            if (Number(val.rowsAffected[0]) === 1) {
              alert('변경 되었습니다.');
            }
          });
      }
    });
  }




}
