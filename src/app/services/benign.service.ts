import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class BenignService {

  constructor(
    private http: HttpClient
  ) { }

  deleteBenignList(id: string, genes: string): any { }
  updateBenignList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string): any { }

  insertBenignList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): any { }

  getBenignList(genes: string): any { }

}
