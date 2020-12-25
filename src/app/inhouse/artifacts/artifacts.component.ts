import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IArtifacts } from '../models/artifacts';
import { ArtifactsService } from 'src/app/services/artifacts.service';

@Component({
  selector: 'app-artifacts',
  templateUrl: './artifacts.component.html',
  styleUrls: ['./artifacts.component.scss']
})
export class ArtifactsComponent implements OnInit {

  constructor(
    private artifactsService: ArtifactsService
  ) { }
  lists$: Observable<IArtifacts[]>;
  lists: IArtifacts[];
  artifact: IArtifacts;

  genes: string;

  private apiUrl = emrUrl;

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.search('');
  }

  deleteRow(id: string, genes: string): void {
    const result = confirm('삭제 하시겠습니까?');
    if (result) {
      this.artifactsService.deleteArtifactsList(id, genes)
        .subscribe((data) => {
          console.log('[170][benign 삭제]', data);
          alert('삭제 되었습니다.');
          this.search(genes);
        });
    }
  }

  updateRow(id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string): void {

    if (id !== '') {
      this.artifactsService.updateArtifactsList(id, genes, locat, exon, transcript, coding, aminoAcidChange)
        .subscribe((data) => {
          console.log('[170][benign 수정]', data);
          alert('수정 되었습니다.');
          this.search(genes);
        });
    } else {
      this.artifactsService.insertArtifactsList(id, genes, locat, exon, transcript, coding, aminoAcidChange)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data);
          alert('저장 되었습니다.');
          this.search(genes);
        });
    }
  }

  insertRow(): void {
    this.lists.push({ 'id': '', 'genes': '', 'location': '', 'exon': '', 'transcript': '', 'coding': '', 'amino_acid_change': '' });
  }

  search(genes: string): void {

    this.lists$ = this.artifactsService.getArtifactsList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][benign 검색]', data);
      this.lists = data;
    });

  }


}
