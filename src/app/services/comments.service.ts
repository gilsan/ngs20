import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IComments } from 'src/app/inhouse/models/comments';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {

  commentsInfo: IComments[];
  
  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getCommentsList(genes: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/comments/list`, { genes });
  }

  public insertCommentsList(id: string, commentsType: string, gene: string, comment: string, reference: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/comments/insert`, { id, commentsType, gene, comment, reference }); 
  }

  public updateCommentsList(id: string, commentsType: string, gene: string, comment: string, reference: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/comments/update`, { id, commentsType, gene, comment, reference }); 
  }
   
  public deleteCommentsList(id: String, genes: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/comments/delete`, { id });
  }
 
}

