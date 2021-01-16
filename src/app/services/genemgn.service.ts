import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { emrUrl } from '../config';
import { filter, shareReplay, switchMap } from 'rxjs/operators';

export interface IGene {
  type: string;
  gene: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeneService {
  private apiUrl = emrUrl;

  constructor(
    private http: HttpClient
  ) { }


  geneAllList(): Observable<IGene[]> {
    return this.http.get<IGene[]>(`${this.apiUrl}/diagGene/listall`)
      .pipe(
        shareReplay(),
      );
  }

  geneInsert(type: string, gene: string): any {
    return this.http.post(`${this.apiUrl}/diagGene/insert`, { type, gene });
  }

  geneUpdate(type: string, gene: string, newgene: string): any {
    return this.http.post(`${this.apiUrl}/diagGene/update`, { type, gene, newgene });
  }

  geneDelete(type: string, gene: string): any {
    return this.http.post(`${this.apiUrl}/diagGene/delete`, { type, gene });
  }

  geneDuplicate(type: string, gene: string): any {
    return this.http.post(`${this.apiUrl}/diagGene/duplicate`, { type, gene });
  }



}
