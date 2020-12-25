
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IMutation } from 'src/app/inhouse/models/mutation';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root'
})
export class MutationService {

  mutationInfo: IMutation[];
  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient
  ) { }

  deleteMutationList(id: string, genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/delete`, { id });
  }

  updateMutationList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/update`, { id, genes, locat, exon, transcript, coding, aminoAcidChange });
  }

  getMutationList(genes: string): Observable<any> {
    // debugger;
    return this.http.post(`${this.apiUrl}/mutation/list`, { genes });
  }

}
