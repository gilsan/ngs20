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
  
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }
 
  public getManageUsersList(startDay: String, endDay: String, userId: String, userNm: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/list`, { startDay, endDay, userId, userNm });
  }

  public insertManageUsersList(id: string, userId: string, password: string, userNm: string, userGb: 
        string, dept: string, uuid: string, regDate: string, pickselect: string, part: string ): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/insert`, { id, userId, password, userNm, userGb, 
        dept, uuid, regDate, pickselect , part}); 
  }

  public updateManageUsersList(id: string, userId: string, password: string, userNm: string, userGb: 
    string, dept: string, uuid: string, regDate: string, pickselect: string, part: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/update`, {  id, userId, password, userNm, userGb, 
      dept, uuid, regDate, pickselect , part }); 
  }

  public deleteManageUsersList(id: String, genes: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/manageUsers/delete`, { id });
  } 
}

