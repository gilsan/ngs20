import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../forms/store.current';
import { PatientsListService } from './services/patientslist';
import { StorePathService } from '../byengri/store.path.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private dstore: StoreService,
    private patientsListService: PatientsListService,
    private store: StorePathService
  ) { }

  ngOnInit(): void {
    this.patientsListService.getDiagList().subscribe((data) => {
      this.dstore.setDiagList(data);
    });
  }

  logout(): void {
    console.log('로그아웃');
    this.startToday();
    this.endToday();
    localStorage.removeItem('userpart');
    this.router.navigateByUrl('/login');

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

}
