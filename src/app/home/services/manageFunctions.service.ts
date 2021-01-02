import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators'; 
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class ManageFunctionsService {
  
  
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getManageFunctionsList(startDay: String, endDay: String, functionName: String): Observable<any> {   
    return this.http.post(`${this.apiUrl}/manageFunctions/list`, { startDay, endDay, functionName });
  }

  public updateManageFunctions(functionId: String, functionName: string, serviceStatus: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageFunctions/update`, { functionId , functionName, serviceStatus });
  } 
 
}

