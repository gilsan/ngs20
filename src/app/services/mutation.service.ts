import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { combineLatest, from, Observable, of, Subject, } from 'rxjs';
import { concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { IMutation } from 'src/app/inhouse/models/mutation';
import { emrUrl } from 'src/app/config';

@Injectable({
  providedIn: 'root',
})
export class MutationService {

  mutationInfo: IMutation[];

  // private apiUrl = 'http://160.1.17.79:3000';  // EMR 서버
  // private apiUrl = 'http://112.169.53.30:3000';
  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  public getMutationList(genes: string, coding: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/list`, { genes, coding });
  }

  /* 2021.03.02
  public insertMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string,
    exac: string, exac_east_asia: string, krgdb: string, etc1: string, etc2: string, etc3: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/insert`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, exac, exac_east_asia, krgdb, etc1, etc2, etc3
    });
  }
  */

  public insertMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/insert`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId
    });
  }

  /*
  public updateMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string,
    exac: string, exac_east_asia: string, krgdb: string, etc1: string, etc2: string, etc3: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/update`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId, exac, exac_east_asia, krgdb, etc1, etc2, etc3
    });
    */
  public updateMutationList(id: string, buccal: string, name: string, registerNumber: string, fusion: string,
    gene: string, functionalImpact: string, transcript: string, exonIntro: string, nucleotideChange: string,
    aminoAcidChange: string, zygosity: string, vaf: string, reference: string,
    siftPolyphenMutationTaster: string, buccal2: string, igv: string, sanger: string, cosmicId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/update`, {
      id, buccal, name, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference,
      siftPolyphenMutationTaster, buccal2, igv, sanger, cosmicId
    });
  }

  public deleteMutationList(id: string, genes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mutation/delete`, { id });
  }

}

