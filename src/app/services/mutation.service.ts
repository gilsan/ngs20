
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MutationService {
  constructor(
    private http: HttpClient
  ) { }

  deleteMutationList(id: string, genes: string): any { }
  updateMutationList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): any { }
  getMutationList(genes: string): any { }

}
