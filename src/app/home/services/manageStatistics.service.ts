import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IManageStatistics } from 'src/app/home/models/manageStatistics';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class ManageStatisticsService {

  statisticsInfo: IManageStatistics[];
  
 
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getManageStatisticsList(startDay: String, endDay: String, userId: String, userNm: String): Observable<any> { 
    return this.http.post(`${this.apiUrl}/manageStatistics/list`, { startDay, endDay, userId, userNm });
  } 
 
  public updateManageFunctions(functionId: String, functionName: string, serviceStatus: string): Observable<any> {  
    debugger;
    return this.http.post(`${this.apiUrl}/manaageFunctions/update`, { functionId , functionName, serviceStatus });
  }
  
}

