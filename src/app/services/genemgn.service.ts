import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { emrUrl } from '../config';

export interface IGene {
  type: string;
  gene: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeneService {
  private apiUrl = emrUrl;
  AML: string[] = [];
  ALL: string[] = [];
  LYM: string[] = [];
  MDS: string[] = [];
  constructor(
    private http: HttpClient
  ) { }


  geneList(type: string): Observable<IGene[]> {
    return this.http.post<IGene[]>(`${this.apiUrl}/diagGene/list`, { type });
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

}
