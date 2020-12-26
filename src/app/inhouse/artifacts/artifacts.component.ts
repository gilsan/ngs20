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
  listArtfacts: IArtifacts[];
  artifact: IArtifacts; 
 
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
      debugger;
      if(id===""){ 
          this.lists = this.lists.slice(0,this.lists.length-1); 
      }else{ 
        this.artifactsService.deleteArtifactsList(id, genes)
          .subscribe((data) => {
          console.log('[170][benign 삭제]', data); 
          alert("삭제 되었습니다.");
          this.search(genes); 
        }); 
      }
    }  
  }

  updateRow(id: string): void {  
    /*
    if(id!==""){  
          this.artifactsService.updateArtifactsList(id, document.getElementById("genes"+id).value
            , document.getElementById("location"+id).value, document.getElementById("exon"+id).value
            , document.getElementById("transcript"+id).value, document.getElementById("coding"+id).value
            , document.getElementById("aminoAcidChange"+id).value )
          .subscribe((data) => {
            console.log('[170][benign 수정]', data); 
            alert("수정 되었습니다."); 
            this.search(document.getElementById("genes"+id).value);
          }); 
    } else{
        this.artifactsService.insertArtifactsList(id, document.getElementById("genes"+id).value
        , document.getElementById("location"+id).value, document.getElementById("exon"+id).value
        , document.getElementById("transcript"+id).value, document.getElementById("coding"+id).value
        , document.getElementById("aminoAcidChange"+id).value)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data); 
          alert("저장 되었습니다.");
          this.search(document.getElementById("genes"+id).value);
        });  
    }  
*/
  }
  insertRow(){ 
    this.lists.push({'id':'', 'genes':'', 'location':'', 'exon':'', 'transcript':'', 'coding':'', 'amino_acid_change':''});  
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
     this.lists =  this.listArtfacts.slice((Number(page)-1)*10,(Number(page))*10); 
  }  

  search(genes: string): void {   
    this.lists$ = this.artifactsService.getArtifactsList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][benign 검색]', data);
      this.listArtfacts = data;
      this.lists = data.slice(0,10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listArtfacts.length/10);  
      this.pageLine = 0; 
    }); 
  }  
}
