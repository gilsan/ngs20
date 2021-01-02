import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IDetailFunctions } from 'src/app/home/models/detailFunctions';  
import { DetailFunctionsService } from 'src/app/home/services/detailFunctions.service';  
import { ManageFunctionsService } from '../../services/manageFunctions.service';
 
@Component({
  selector: 'app-detail-functions',
  templateUrl: './detail-functions.component.html',
  styleUrls: ['./detail-functions.component.scss']
})
             
export class DetailFunctionsComponent implements OnInit {
  [x: string]: any;
  
  lists$: Observable<IDetailFunctions[]>;
  lists: IDetailFunctions[];
  listDetailFunctions: IDetailFunctions[];
  detailFunctions: IDetailFunctions; 
  
  curPage:  number;
  totPage:  number;
  pageLine: number;
  totRecords: number;

  startday: string;
  endday: string;
  storeStartDay: string;
  storeEndDay: string;
  functionId : string;  
  functionName : string; 
  serviceStatus : string;

  constructor( 
    private manageFunctionsService: ManageFunctionsService ,
    private detailFunctionsService: DetailFunctionsService ,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log('Called Constructor');
    this.route.queryParams.subscribe(params => { 
        this.functionId = params.functionId;
    }); 
   }

  ngOnInit(): void {
      this.init(); 
  }
  

  init(): void {  
    this.info(this.functionId);
  }


  deleteRow(seq: string): void {
    const result = confirm('삭제 하시겠습니까?');
    if (result) { 
      if(seq===""){ 
          this.lists = this.lists.slice(0,this.lists.length-1); 
      }else{  
        this.detailFunctionsService.deleteDetailList(this.functionId, seq)
          .subscribe((data) => {
          console.log('[170][benign 삭제]', data); 
          alert("삭제 되었습니다.");
          this.search(this.functionId); 
        });  
      }
    }  
  }

  updateRow(seq: string): void {  
     
    const variable: HTMLInputElement = document.getElementById("variable"+seq) as HTMLInputElement; 
    const dataType: HTMLInputElement = document.getElementById("dataType"+seq) as HTMLInputElement; 
    const leaveYn: HTMLInputElement = document.getElementById("leaveYn"+seq) as HTMLInputElement; 
    const innerVariable: HTMLInputElement = document.getElementById("innerVariable"+seq) as HTMLInputElement; 
    const condition: HTMLInputElement = document.getElementById("condition"+seq) as HTMLInputElement;  
    const dataValue: HTMLInputElement = document.getElementById("dataValue"+seq) as HTMLInputElement; 
    const outerCondition: HTMLInputElement = document.getElementById("outerCondition"+seq) as HTMLInputElement;  
   
   
    if(variable.value ==""){
      alert("필드명은 필수 입니다.");
      return;
    }
     

    if(seq!==""){ 
          this.detailFunctionsService.updateDetailList(this.functionId, seq , variable.value
              , dataType.value, leaveYn.value, innerVariable.value
              , condition.value, dataValue.value, outerCondition.value )
          .subscribe((data) => {
            console.log('[170][benign 수정]', data); 
            alert("수정 되었습니다."); 
            this.search(this.functionId);
          }); 
    } else{
          this.detailFunctionsService.insertDetailList(this.functionId, variable.value
            , dataType.value, leaveYn.value, innerVariable.value
            , condition.value, dataValue.value, outerCondition.value)
          .subscribe((data) => {
            console.log('[170][benign 저장]', data); 
            alert("저장 되었습니다.");
            this.search(this.functionId);
          });  
    } 
  }

  confirm(serviceStatus: string) { 
    this.serviceStatus = serviceStatus; 
  }

  insertRow(){  
    this.lists.push({'seq':'', 'function_id':'','function_name':'','service_status':'', 'variable':'', 'data_type':'', 'leave_yn':''
                    ,'inner_variable':'', 'condition':'', 'data_value':'', 'outer_condition':'' });  
  } 
  
  save(){ 
    const functionName: HTMLInputElement = document.getElementById("functionName") as HTMLInputElement;  
     this.lists$ = this.manageFunctionsService.updateManageFunctions(this.functionId, functionName.value, this.serviceStatus );
     this.lists$.subscribe((data) => {
        alert("정상적으로 저장되었습니다."); 
        debugger; 
        let item = {
          url : '/diag/managefunctions'
        };
        this.router.navigateByUrl(item.url); 
   });   
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
    this.lists =  this.listDetailFunctions.slice((Number(page)-1)*10, (Number(page))*10); 
 }  

 info(functionId: string ): void {   
      this.totRecords = 0;
      this.lists$ = this.detailFunctionsService.getInfoFunctionsList(functionId );
      this.lists$.subscribe((data) => {
      console.log('[170][Users 검색]', data);
      
      if(data.length >0) {
        this.functionName = data[0].function_name; 
        this.serviceStatus= data[0].service_status; 
        this.search(functionId);
      }
    }); 
}  
 
 search(functionId: string ): void {   
      this.totRecords = 0;
      this.lists$ = this.detailFunctionsService.getDetailFunctionsList(functionId );
      this.lists$.subscribe((data) => {
      console.log('[170][Users 검색]', data);
      this.listDetailFunctions = data;
      this.lists = data.slice(0,10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listDetailFunctions.length/10);  
      this.pageLine = 0; 
      this.totRecords = this.listDetailFunctions.length; 
    }); 
  }  
 

  toggle(i: number): any {

    if (i % 2 === 0) {
      return { table_bg: true };
    }
    return { table_bg: false };
  }

}


