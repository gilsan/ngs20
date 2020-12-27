import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IComments } from '../models/comments';
import { CommentsService } from 'src/app/services/comments.service'; 

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  constructor( 
    private commentsService: CommentsService 
  ) { }
  lists$: Observable<IComments[]>;
  lists: IComments[];
  listComments: IComments[];
  benignInfo: IComments;
 
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

  deleteRow(id: string, gene: string): void {
    const result = confirm('삭제 하시겠습니까?');
    if (result) {
      if(id===""){ 
        this.lists = this.lists.slice(0,this.lists.length-1); 
      }else{ 
        this.commentsService.deleteCommentsList(id, gene)
          .subscribe((data) => {
          console.log('[170][benign 삭제]', data); 
          alert("삭제 되었습니다."); 
          this.search(gene); 
        }); 
      }  
    }  
  }

  updateRow(id: string): void {  
    
    const commentsType = document.getElementById("type"+id).value;
    const gene         = document.getElementById("gene"+id).value;
    const comment      = document.getElementById("comment"+id).value;
    const reference    = document.getElementById("reference"+id).value;

    if(id!==""){
        this.commentsService.updateCommentsList(id, commentsType, gene, comment, reference)
          .subscribe((data) => {
          console.log('[170][benign 수정]', data); 
          alert("수정 되었습니다.");
          this.search(gene);
        }); 
    }else{
        this.commentsService.insertCommentsList(id, commentsType, gene, comment, reference)
          .subscribe((data) => {
          console.log('[170][benign 저장]', data); 
          alert("저장 되었습니다."); 
          this.search('');
        });
    }    
  }

  insertRow(){  
    this.lists.push({'id':'', 'type':'', 'gene':'', 'comment':'', 'reference':''});  
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
    this.lists =  this.listComments.slice((Number(page)-1)*10,(Number(page))*10); 
  }  

  search(genes: string): void { 

    this.lists$ = this.commentsService.getCommentsList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][benign 검색]', data);
      this.lists = data;
      this.listComments = data;
      this.lists = data.slice(0,10);
      this.curPage = 1;
      this.totPage = Math.ceil(this.listComments.length/10);  
      this.pageLine = 0; 
    });

  }  
  
}
