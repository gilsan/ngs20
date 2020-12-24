import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { emrUrl } from '../config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient,
  ) { }

  public loginDiag(user: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/loginDiag/loginuser`, { user, password });
  }

  public loginPath(user: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/loginPath/loginpath`, { user, password });
  }

  public register(user: string, password: string): Observable<any> {
    console.log(user, password);
    return this.http.post(`${this.apiUrl}/register/registeruser`, { user, password });
  }


}
