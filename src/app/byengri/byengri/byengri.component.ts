import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IPatient } from '../models/patients';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';

@Component({
  selector: 'app-byengri',
  templateUrl: './byengri.component.html',
  styleUrls: ['./byengri.component.scss']
})
export class ByengriComponent implements OnInit {

  constructor(
    private router: Router,
    private store: StorePathService
  ) { }

  ngOnInit(): void {

  }

  logout(): void {
    localStorage.removeItem('userpart');
    this.router.navigateByUrl('/login');
    // storage 시간동기화
    this.startToday();
    this.endToday();
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



}
