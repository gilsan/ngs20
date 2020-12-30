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
  
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getManageStatisticsList(startDay: String, endDay: String, userId: String, userNm: String): Observable<any> { 
    return this.http.post(`${this.apiUrl}/manageStatistics/list`, { startDay, endDay, userId, userNm });
  } 
 
}

