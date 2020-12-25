import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IArtifacts } from 'src/app/inhouse/models/artifacts';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root'
})
export class ArtifactsService {

  artifactsInfo: IArtifacts[];
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getArtifactsList(genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/artifacts/list`, { genes });
  }

  public insertArtifactsList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/artifacts/insert`, { id, genes, locat, exon, transcript, coding, aminoAcidChange });
  }

  public updateArtifactsList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/artifacts/update`, { id, genes, locat, exon, transcript, coding, aminoAcidChange });
  }

  public deleteArtifactsList(id: string, genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/artifacts/delete`, { id });
  }


}
