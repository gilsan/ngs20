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
  benignInfo: IComments;

  genes: string;

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
      this.commentsService.deleteCommentsList(id, gene)
        .subscribe((data) => {
          console.log('[170][benign 삭제]', data);
          alert('삭제 되었습니다.');
          this.search(gene);
        });
    }
  }

  updateRow(id: string, commentsType: string, gene: string, comment: string, reference: string): void {
    if (id !== '') {
      this.commentsService.updateCommentsList(id, commentsType, gene, comment, reference)
        .subscribe((data) => {
          console.log('[170][benign 수정]', data);
          alert('수정 되었습니다.');
          this.search(gene);
        });
    } else {
      this.commentsService.insertCommentsList(id, commentsType, gene, comment, reference)
        .subscribe((data) => {
          console.log('[170][benign 저장]', data);
          alert('저장 되었습니다.');
          this.search(gene);
        });
    }

  }

  insertRow(): void {
    this.lists.push({ id: '', type: '', gene: '', comment: '', reference: '' });
  }

  search(genes: string): void {

    this.lists$ = this.commentsService.getCommentsList(genes);
    this.lists$.subscribe((data) => {
      console.log('[170][benign 검색]', data);
      this.lists = data;
    });

  }


}
