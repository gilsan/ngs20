import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators'; 
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class DetailFunctionsService {
  
  
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getInfoFunctionsList(functionId: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/detailFunctions/info`, { functionId });
  }

  public deleteDetailList(functionId: String, seq: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/detailFunctions/delete`, { functionId , seq});
  } 

  public getDetailFunctionsList(functionId: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/detailFunctions/list`, { functionId });
  }

  public insertDetailList(functionId: string,  variable: string, 
        dataType: string, leaveYn: string, innerVariable: string,
        condition: string, dataValue: string, outerCondition: string ): Observable<any> {  
    return this.http.post(`${this.apiUrl}/detailFunctions/insert`, { functionId,  variable, 
          dataType, leaveYn, innerVariable, condition, dataValue, outerCondition}); 
  }

  public updateDetailList(functionId: string, seq: string,  variable: string, 
        dataType: string, leaveYn: string, innerVariable: string,
        condition: string, dataValue: string, outerCondition: string): Observable<any> {   
    return this.http.post(`${this.apiUrl}/detailFunctions/update`, { functionId, seq, variable, 
        dataType, leaveYn, innerVariable, condition, dataValue, outerCondition }); 
  }
 
 
}

