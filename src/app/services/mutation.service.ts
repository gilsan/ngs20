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

  public getMutationList(genes: String): Observable<any> {  
    return this.http.post(`${this.apiUrl}/mutation/list`, { genes });
  }

  public insertMutationList(id: string, buccal: string, patientName: string, registerNumber: string, fusion: string, 
        gene : string, functionalImpact: string,  transcript: string, exonIntro: String, nucleotideChange: string, aminoAcidChange: string,
        zygosity : string, vaf : string, reference : String, siftPolyphenMutationTaster: String, buccal2: string, igv: string, sanger: string ): Observable<any> {  
     return this.http.post(`${this.apiUrl}/mutation/insert`, { id, buccal, patientName, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference, 
      siftPolyphenMutationTaster, buccal2, igv, sanger }); 
  }

  public updateMutationList(id: string, buccal: string, patientName: string, registerNumber: string, fusion: string, 
    gene : string, functionalImpact: string,  transcript: string, exonIntro: String, nucleotideChange: string, aminoAcidChange: string,
    zygosity : string, vaf : string, reference : String, siftPolyphenMutationTaster: String, buccal2: string, igv: string, sanger: string ): Observable<any> {  
    return this.http.post(`${this.apiUrl}/mutation/update`, { id, buccal, patientName, registerNumber, fusion, gene,
      functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference, 
      siftPolyphenMutationTaster, buccal2, igv, sanger }); 
  }

  public deleteMutationList(id: String, genes: string): Observable<any> {  
    return this.http.post(`${this.apiUrl}/mutation/delete`, { id });
  }
 
}

