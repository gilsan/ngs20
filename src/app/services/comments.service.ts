import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(
    private http: HttpClient
  ) { }

  deleteCommentsList(id: string, gene: string): any { }
  updateCommentsList(id: string, commentsType: string, gene: string, comment: string, reference: string): any { }
  insertCommentsList(id: string, commentsType: string, gene: string, comment: string, reference: string): any { }
  getCommentsList(genes: string): any { }

}
