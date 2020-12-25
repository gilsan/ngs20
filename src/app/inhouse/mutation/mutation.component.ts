import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IMutation } from '../models/mutation';
import { MutationService } from 'src/app/services/mutation.service';

@Component({
  selector: 'app-mutation',
  templateUrl: './mutation.component.html',
  styleUrls: ['./mutation.component.scss']
})
export class MutationComponent implements OnInit {

  constructor(
    private mutationService: MutationService
  ) { }
  lists$: Observable<IMutation[]>;
  lists: IMutation[];
  mutationInfo: IMutation;

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
      this.mutationService.deleteMutationList(id, genes)
        .subscribe((data) => {
          console.log('[170][mutation 삭제]', data);
          alert('삭제 되었습니다.');
          this.search(genes);
        });
    }
  }

  updateRow(id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string): void {
    this.mutationService.updateMutationList(id, genes, locat, exon, transcript, coding, aminoAcidChange)
      .subscribe((data) => {
        console.log('[170][Mutation 수정]', data);
        alert('수정 되었습니다.');
        this.search(genes);
      });

  }

  insertRow(): void {
    // debugger;
  }

  search(genes: string): void {

    this.lists$ = this.mutationService.getMutationList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][Mutation 검색]', data);
      this.lists = data;
    });

  }

}
