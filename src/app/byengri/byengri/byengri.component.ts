import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IPasswd, IPatient } from '../models/patients';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { MatDialog } from '@angular/material/dialog';
import { PwchangeComponent } from '../pwchange/pwchange.component';
import { ManageUsersService } from 'src/app/home/services/manageUsers.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-byengri',
  templateUrl: './byengri.component.html',
  styleUrls: ['./byengri.component.scss']
})
export class ByengriComponent implements OnInit {

  userid: string;
  username: string;
  dept = '병리';
  work = '';
  passwdInfo: IPasswd;

  constructor(
    private router: Router,
    private store: StorePathService,
    public dialog: MatDialog,
    private service: ManageUsersService,
  ) { }

  ngOnInit(): void {
    const userinfo = localStorage.getItem('pathuser');
    this.userid = JSON.parse(userinfo).userid;
    const pw = JSON.parse(userinfo).pw;

    this.service.getManageUsersList('', '', this.userid, '', 'P')
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
    localStorage.removeItem('userpart');
    localStorage.removeItem('pathuser');
    this.router.navigateByUrl('/login');
    // storage 시간동기화
    this.startToday();
    this.endToday();
    this.store.setPathologyNo('');
    this.store.setPatientID('');
    this.store.setWhichstate('mainscreen');
    this.store.setSearchStartDay('');
    this.store.setSearchEndDay('');
    this.store.setScrollyPosition(0);
  }

  goHome(): void {
    this.router.navigate(['/pathology']);
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

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PwchangeComponent, {
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
        this.service.updateMangeUser(id, this.userid, passwd, userNm, userGb, 'P', pickselect, part)
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
