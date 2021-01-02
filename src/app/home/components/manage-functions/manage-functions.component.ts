import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IManageFunctions } from 'src/app/home/models/manageFunctions';  
import { ManageFunctionsService } from 'src/app/home/services/manageFunctions.service';  
 
@Component({
  selector: 'app-manage-functions',
  templateUrl: './manage-functions.component.html',
  styleUrls: ['./manage-functions.component.scss']
})
export class ManageFunctionsComponent implements OnInit {

  lists$: Observable<IManageFunctions[]>;
  lists: IManageFunctions[];
  listManageFunctions: IManageFunctions[];
  manageFunctions: IManageFunctions; 
 
  curPage:  number;
  totPage:  number;
  pageLine: number;
  totRecords: number;

  startday: string;
  endday: string;
  storeStartDay: string;
  storeEndDay: string;


  constructor( 
    private manageFunctionsService: ManageFunctionsService ,
    private router: Router
  ) { }

  ngOnInit(): void {
   // if (this.storeStartDay === null || this.storeEndDay === null) {
      this.init();
   // } 
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

    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));	// 한달 전  

    const year = oneMonthAgo.getFullYear(); // 년도
    const month = oneMonthAgo.getMonth()+ 1 ;  // 월
    const date = oneMonthAgo.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '-' + newmon + '-' + newday;
     
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

  init(): void { 
    this.search(this.startToday(), this.endToday(), '');
  }
 
  goPage(page: string): void {    
    if(page ==="<" &&  this.pageLine >0 ) { 
       this.pageLine--; 
       this.curPage = this.pageLine *10-1;
       if(this.curPage <1) this.curPage = 1;
    }else if(page ===">" &&  this.pageLine < Math.ceil(this.totPage/10)-1  ) { 
       this.pageLine++;
       this.curPage = this.pageLine *10+1;
    } else {
      if( page !="<" && page !=">" ) 
         this.curPage = Number(page); 
    }
    page =  this.curPage +""; 
    this.lists =  this.listManageFunctions.slice((Number(page)-1)*10, (Number(page))*10); 
 }  
 
  search(startDay: string, endDay: string, functionName: string ): void {   
      this.totRecords = 0; 
      this.lists$ = this.manageFunctionsService.getManageFunctionsList(startDay.replace(/-/gi,''), endDay.replace(/-/gi,''), functionName );
      this.lists$.subscribe((data) => {
      console.log('[170][Users 검색]', data);
      this.listManageFunctions = data;
      this.lists = data.slice(0,10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listManageFunctions.length/10);  
      this.pageLine = 0; 
      this.totRecords = this.listManageFunctions.length;
    }); 
  }  
 
  detail(functionId: string): void {  
      let item = {
        url : '/diag/detailfunctions?functionId='+functionId
      };
      this.router.navigateByUrl(item.url); 
  } 

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

}


