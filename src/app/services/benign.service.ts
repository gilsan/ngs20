import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IBenign } from 'src/app/inhouse/models/benign';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class BenignService {

  benignInfo: IBenign[];

  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getBenignList(genes: string, coding): Observable<any> {
    return this.http.post(`${this.apiUrl}/benign/list`, { genes, coding });
  }

  public insertBenignList(id: string, genes: string, locat: string, exon: string,
    transcript: string, coding: string, aminoAcidChange: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/benign/insert`, {
      id, genes, locat, exon, transcript,
      coding, aminoAcidChange
    });
  }

  public updateBenignList(id: string, genes: string, locat: string, exon: string,
    transcript: string, coding: string, aminoAcidChange: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/benign/update`, {
      id, genes, locat, exon, transcript,
      coding, aminoAcidChange
    });
  }

  public deleteBenignList(id: string, genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/benign/delete`, { id });
  }

}

