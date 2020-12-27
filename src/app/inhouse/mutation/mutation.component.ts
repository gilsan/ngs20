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
  listMutations: IMutation[];
  mutationInfo: IMutation;
 
  genes: string;
  curPage:  number;
  totPage:  number;
  pageLine: number;

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
        alert("삭제 되었습니다.");
        this.search(genes); 
      }); 
    }  
  }

  updateRow(id: string): void {
   
    debugger; 
    const buccal			    = document.getElementById("buccal"+id).value;
    const patientName			= document.getElementById("patientName"+id).value;	
    const registerNumber	= document.getElementById("registerNumber"+id).value;
    const fusion			    = document.getElementById("fusion"+id).value;
    const gene				    = document.getElementById("gene"+id).value;
    const functionalImpact= document.getElementById("functionalImpact"+id).value;
    const transcript			= document.getElementById("transcript"+id).value;
    const exonIntro			  = document.getElementById("exonIntro"+id).value;
    const nucleotideChange= document.getElementById("nucleotideChange"+id).value;
    const aminoAcidChange	= document.getElementById("aminoAcidChange"+id).value;	
    const zygosity			  = document.getElementById("zygosity"+id).value;
    const vaf				      = document.getElementById("vaf"+id).value;
    const reference			  = document.getElementById("reference"+id).value;
    const cosmicId			  = document.getElementById("cosmicId"+id).value;
    const siftPolyphenMutationTaster	= document.getElementById("siftPolyphenMutationTaster"+id).value;	
    const buccal2			    = document.getElementById("buccal2"+id).value; 
    const igv				      = document.getElementById("igv"+id).value;
    const sanger			    = document.getElementById("sanger"+id).value;

    if(id!==""){
      this.mutationService.updateMutationList(id, buccal, patientName, registerNumber, fusion, gene,
        functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference, 
        siftPolyphenMutationTaster, buccal2, igv, sanger  )
        .subscribe((data) => {
          console.log('[170][Mutation 수정]', data); 
        alert("수정 되었습니다.");
        this.search(gene);
      }); 
    }else{
      this.mutationService.insertMutationList(id, buccal, patientName, registerNumber, fusion, gene,
        functionalImpact, transcript, exonIntro, nucleotideChange, aminoAcidChange, zygosity, vaf, reference, 
        siftPolyphenMutationTaster, buccal2, igv, sanger)
        .subscribe((data) => {
        console.log('[170][Mutation 저장]', data); 
        alert("저장 되었습니다.");
        this.search(genes);
      }); 
    }   
  }

  insertRow(){ 
    debugger;  
  } 

  goPage(page: string): void {    
    if(page ==="<" &&  this.pageLine >0 ) { 
       this.pageLine--; 
       this.curPage = this.pageLine *10-1;
       if(this.curPage <1) this.curPage = 1;
    }else if(page ===">" &&  this.pageLine < Math.ceil(this.totPage/10)-1  ) { 
       this.pageLine++;
       this.curPage = this.pageLine *10+1;
    } else {
      if( page !="<" && page !=">" ) 
         this.curPage = Number(page); 
    }
    page =  this.curPage +""; 
    this.lists =  this.listMutations.slice((Number(page)-1)*10,(Number(page))*10); 
  }  
  search(genes: string): void { 

    this.lists$ = this.mutationService.getMutationList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][Mutation 검색]', data);
      this.lists = data;
      this.listMutations = data;
      this.lists = data.slice(0,10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listMutations.length/10);  
      this.pageLine = 0; 
    });

  }   
  
}
