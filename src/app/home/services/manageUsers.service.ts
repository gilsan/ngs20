import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IManageUsers } from 'src/app/home/models/manageUsers';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class ManageUsersService {

  manageUsersInfo: IManageUsers[];
  
 
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getManageUsersList(startDay: String, endDay: String, userId: String, userNm: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/list`, { startDay, endDay, userId, userNm });
  }

  
  public setManageUsersApproved(id: string, approved: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/approved`, {  id, approved }); 
  }

   
}

