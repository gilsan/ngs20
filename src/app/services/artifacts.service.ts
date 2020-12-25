import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class ArtifactsService {

  constructor(
    private http: HttpClient
  ) { }

  deleteArtifactsList(id: string, genes: string): any {

  }

  updateArtifactsList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string
  ): any { }

  insertArtifactsList(
    id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string): any { }

  getArtifactsList(genes: string): any { }



}
