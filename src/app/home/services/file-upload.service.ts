import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UploadResponse } from '../models/uploadfile';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {
  // private apiUrl = 'http://112.169.53.30:3000';
  // private apiUrl = 'http://160.1.17.79:3000'; // EMR 서버
  private apiUrl = emrUrl;
  // private handleError: HandlerError;

  httpOptions = {
    header: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  redirectUrl: string;

  constructor(
    private http: HttpClient,
    // private httpErrorHandler: HttpErrorHandler
  ) {
    // this.handleError = this.httpErrorHandler.createHandleError('FileUploadService');
  }

  fileUpload(formData: any): any {
    return this.http.post(`${this.apiUrl}/fileUpload/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event)),
      //  catchError(this.handleError('fileUpload', null))
    );
  }

  inhouseDataUpload(formData: any): any {
    return this.http.post(`${this.apiUrl}/inhouseUplad/inhousetodb`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }

  pathDataUpload(formData: any): Observable<UploadResponse> {
    // console.log('[49][file-upload][pathDataUpload]', formData);
    return this.http.post(`${this.apiUrl}/pathfileUpload/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event))
    );
  }

  private getEventMessage(event: HttpEvent<any>): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);
      case HttpEventType.Response:
        return event.body;
      default:
        return `Upload event: ${event.type}.`;
    }
  }

  private fileUploadProgress(event: any): any {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { progress: percentDone, files: [] };
  }




}
