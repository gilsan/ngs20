import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IMutation } from '../models/mutation';
import { MutationService } from 'src/app/services/mutation.service';
import { ExcelService } from 'src/app/home/services/excelservice';

@Component({
  selector: 'app-mutation',
  templateUrl: './mutation.component.html',
  styleUrls: ['./mutation.component.scss']
})
export class MutationComponent implements OnInit {

  constructor(
    private mutationService: MutationService,
    private excel: ExcelService,
  ) { }
  lists$: Observable<IMutation[]>;
  lists: IMutation[];
  listMutations: IMutation[];
  mutationInfo: IMutation;


  genes: string;
  curPage: number;
  totPage: number;
  pageLine: number;
  totRecords: number;

  private apiUrl = emrUrl;

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.search('');
  }

  deleteRow(id: string, genes: string, patientName: string): void {

    if (id === "") {
      const result = confirm('삭제 하시겠습니까?');
      if (result) {
        this.lists = this.lists.slice(0, this.lists.length - 1);
      }
    } else {
      const result = confirm(patientName + '를 삭제 하시겠습니까?');
      if (result) {
        this.mutationService.deleteMutationList(id, genes)
          .subscribe((data) => {
            console.log('[170][mutation 삭제]', data);
            alert("삭제 되었습니다.");
            this.search(genes);
          });
      }
    }
  }

  updateRow(id: string): void {

    const buccal: HTMLInputElement = document.getElementById("buccal" + id) as HTMLInputElement;
    const patientName: HTMLInputElement = document.getElementById("patientName" + id) as HTMLInputElement;
    const registerNumber: HTMLInputElement = document.getElementById("registerNumber" + id) as HTMLInputElement;
    const fusion: HTMLInputElement = document.getElementById("fusion" + id) as HTMLInputElement;
    const gene: HTMLInputElement = document.getElementById("gene" + id) as HTMLInputElement;
    const functionalImpact: HTMLInputElement = document.getElementById("functionalImpact" + id) as HTMLInputElement;
    const transcript: HTMLInputElement = document.getElementById("transcript" + id) as HTMLInputElement;
    const exonIntro: HTMLInputElement = document.getElementById("exonIntro" + id) as HTMLInputElement;
    const nucleotideChange: HTMLInputElement = document.getElementById("nucleotideChange" + id) as HTMLInputElement;
    const aminoAcidChange: HTMLInputElement = document.getElementById("aminoAcidChange" + id) as HTMLInputElement;
    const zygosity: HTMLInputElement = document.getElementById("zygosity" + id) as HTMLInputElement;
    const vaf: HTMLInputElement = document.getElementById("vaf" + id) as HTMLInputElement;
    const reference: HTMLInputElement = document.getElementById("reference" + id) as HTMLInputElement;
    const cosmicId: HTMLInputElement = document.getElementById("cosmicId" + id) as HTMLInputElement;
    const siftPolyphen: HTMLInputElement = document.getElementById("siftPolyphenMutationTaster" + id) as HTMLInputElement;
    const buccal2: HTMLInputElement = document.getElementById("buccal2" + id) as HTMLInputElement;
    const igv: HTMLInputElement = document.getElementById("igv" + id) as HTMLInputElement;
    const sanger: HTMLInputElement = document.getElementById("sanger" + id) as HTMLInputElement;
    /* 03.02
    const exac: HTMLInputElement = document.getElementById('exac' + id) as HTMLInputElement;
    // tslint:disable-next-line:variable-name
    const exac_east_asia: HTMLInputElement = document.getElementById('exac_east_asia' + id) as HTMLInputElement;
    const krgdb: HTMLInputElement = document.getElementById('krgdb' + id) as HTMLInputElement;
    const etc1: HTMLInputElement = document.getElementById('etc1' + id) as HTMLInputElement;
    const etc2: HTMLInputElement = document.getElementById('etc2' + id) as HTMLInputElement;
    const etc3: HTMLInputElement = document.getElementById('etc3' + id) as HTMLInputElement;
    */
    /*
        if(buccal.value ==""){
          alert("buccal 값은 필수 입니다.");
          return;
        }
    */
    if (patientName.value == "") {
      alert("patient Name 값은 필수 입니다.");
      return;
    }
    if (gene.value == "") {
      alert("gene 값은 필수 입니다.");
      return;
    }
    if (transcript.value == "") {
      alert("transcript 값은 필수 입니다.");
      return;
    }

    if (id !== '') {
/* 2021.03.02
      this.mutationService.updateMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
        functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
        zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value,
        exac.value, exac_east_asia.value, krgdb.value, etc1.value, etc2.value, etc3.value)
        */
        this.mutationService.updateMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
          functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
          zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value)
          .subscribe((data) => {
          console.log('[170][Mutation 수정]', data);
          alert('수정 되었습니다.');
          this.search(gene.value);
        });
    } else {
      /* 2021.03.02
      this.mutationService.insertMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
        functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
        zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value,
        exac.value, exac_east_asia.value, krgdb.value, etc1.value, etc2.value, etc3.value)
      */
        this.mutationService.insertMutationList(id, buccal.value, patientName.value, registerNumber.value, fusion.value, gene.value,
          functionalImpact.value, transcript.value, exonIntro.value, nucleotideChange.value, aminoAcidChange.value,
          zygosity.value, vaf.value, reference.value, siftPolyphen.value, buccal2.value, igv.value, sanger.value, cosmicId.value)
        .subscribe((data) => {
          console.log('[170][Mutation 저장]', data);
          alert('저장 되었습니다.');
          this.search(gene.value);
        });
    }
  }

  insertRow(): void {
    this.lists.push({
      id: '',
      buccal: '',
      patient_name: '',
      register_number: '',
      fusion: '',
      gene: '',
      functional_impact: '',
      transcript: '',
      exon_intro: '',
      nucleotide_change: '',
      amino_acid_change: '',
      zygosity: '',
      vaf: '',
      reference: '',
      cosmic_id: '',
      sift_polyphen_mutation_taster: '',
      buccal2: '',
      igv: '',
      sanger: '',
      exac: '',
      exac_east_asia: '',
      krgdb: '',
      etc1: '',
      etc2: '',
      etc3: '',
    });
  }
  myFunc(status: string) {
    console.log("function called" + status);
  }

  goPage(page: string): void {
    if (page === "<" && this.pageLine > 0) {
      this.pageLine--;
      this.curPage = this.pageLine * 10 - 1;
      if (this.curPage < 1) this.curPage = 1;
    } else if (page === ">" && this.pageLine < Math.ceil(this.totPage / 10) - 1) {
      this.pageLine++;
      this.curPage = this.pageLine * 10 + 1;
    } else {
      if (page != "<" && page != ">")
        this.curPage = Number(page);
    }
    page = this.curPage + "";
    this.lists = this.listMutations.slice((Number(page) - 1) * 10, (Number(page)) * 10);
  }
  search(genes: string, coding: string = ''): void {
    this.totRecords = 0;
    this.lists$ = this.mutationService.getMutationList(genes, coding);
    this.lists$.subscribe((data) => {
      // console.log('[170][Mutation 검색]', data);
      this.lists = data;
      this.listMutations = data;
      this.lists = data.slice(0, 10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listMutations.length / 10);
      this.pageLine = 0;
      this.totRecords = this.listMutations.length;
    });

  }

  excelDownload(): void {
    // console.log('excel', this.listMutations);
    this.excel.exportAsExcelFile(this.listMutations, 'mutation');
  }

}
