import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IRegister } from 'src/app/home/models/register';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  registerInfo: IRegister[];
  
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public registerUser(user_id: string, password: string, user_nm: string, dept: string, part: string ): Observable<any> {  
    return this.http.post(`${this.apiUrl}/register/registeruser`, { user_id, password, user_nm, dept, part}); 
  }
 
}

