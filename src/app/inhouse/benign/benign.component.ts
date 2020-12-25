import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IBenign } from '../models/benign';
import { BenignService } from 'src/app/services/benign.service';
import { $ } from 'protractor';

@Component({
  selector: 'app-benign',
  templateUrl: './benign.component.html',
  styleUrls: ['./benign.component.scss']
})
export class BenignComponent implements OnInit {


  constructor(
    private benignService: BenignService
  ) { }

  lists$: Observable<IBenign[]>;
  lists: IBenign[];
  benignInfo: IBenign;

  genes: string;

  private apiUrl = emrUrl;

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.init();
  }

  init(): void {
    this.search('');
  }

  search(genes: string): void {
    this.lists$ = this.benignService.getBenignList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][benign 검색]', data);
      this.lists = data;
    });
  }

  deleteRow(id: string, genes: string): void {
    const result = confirm('삭제 하시겠습니까?');
    if (result) {
      this.benignService.deleteBenignList(id, genes)
        .subscribe((data) => {
          console.log('[170][benign 삭제]', data);
          alert('삭제 되었습니다.');
          this.search(genes);
        });
    }
  }

  updateRow(id: string, genes: string, locat: string, exon: string, transcript: string, coding: string, aminoAcidChange: string): void {
    // debugger;
    if (id !== '') {
      this.benignService.updateBenignList(id, genes, locat, exon, transcript, coding, aminoAcidChange)
        .subscribe((data) => {
          console.log('[170][benign 수정]', data);
          alert('수정 되었습니다.');
          this.search(genes);
        });
    } else {
      this.benignService.insertBenignList(id, genes, locat, exon, transcript, coding, aminoAcidChange)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data);
          alert('저장 되었습니다.');
          this.search(genes);
        });
    }
  }

  insertRow(): void {
    this.lists.push({ id: '', genes: '', location: '', exon: '', transcript: '', coding: '', amino_acid_change: '' });
  }


}
