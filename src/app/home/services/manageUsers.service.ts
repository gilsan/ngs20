import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IManageUsers } from 'src/app/home/models/manageUsers';
import { emrUrl } from 'src/app/config';
import { IPasswd } from 'src/app/byengri/models/patients';

@Injectable({
  providedIn: 'root',
})
export class ManageUsersService {

  manageUsersInfo: IManageUsers[];


  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getManageUsersList(startDay: string, endDay: string, userId: string, userNm: string, dept: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/manageUsers/list`, { startDay, endDay, userId, userNm, dept });
  }


  public setManageUsersApproved(id: string, approved: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/manageUsers/approved`, { id, approved });
  }

  // tslint:disable-next-line:max-line-length
  public updateMangeUser(id: string, userId: string, password: string, userNm: string, userGb: string, dept: string, pickselect: string = 'N', part: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/manageUsers/update`, { id, userId, password, userNm, userGb, dept, pickselect, part });
  }
}

