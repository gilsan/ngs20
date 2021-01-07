import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDList, IGeneList } from 'src/app/home/models/patients';
import { emrUrl } from 'src/app/config';
import { map, shareReplay, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private apiUrl = emrUrl;



  constructor(
    private http: HttpClient
  ) { }


  // 진검 유전체 관리
  getGeneList(type: string): Observable<any> {
    const genelists: IGeneList[] = [];
    let genelist: IGeneList = {
      g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: ''
    };
    let len: number;

    return this.http.post<{ gene: string, rowno: string }[]>(`${this.apiUrl}/diaggene/list`, { type })
      .pipe(
        map(list => {
          len = list.length - 1;
          for (let index = 0; index < list.length; index++) {
            const i = index % 10;
            if (i === 0) {
              genelist.g0 = list[index].gene;

            } else if (i === 1) {
              genelist.g1 = list[index].gene;
            } else if (i === 2) {
              genelist.g2 = list[index].gene;
            } else if (i === 3) {
              genelist.g3 = list[index].gene;
            } else if (i === 4) {
              genelist.g4 = list[index].gene;
            } else if (i === 5) {
              genelist.g5 = list[index].gene;
            } else if (i === 6) {
              genelist.g6 = list[index].gene;
            } else if (i === 7) {
              genelist.g7 = list[index].gene;
            } else if (i === 8) {
              genelist.g8 = list[index].gene;
            } else if (i === 9) {
              genelist.g9 = list[index].gene;
            }

            if (i === 9) {
              genelists.push(genelist);
              genelist = { g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: '' };
            } else if (len === index) {
              genelists.push(genelist);
            }
          } // End of for loop
          return genelists;
        })
      );
  }

  // 검진부서원 리스트 스토어에서 가져옴.
  // 검진 사용자 목록 가져오기
  getDiagList(): Observable<IDList[]> {
    return this.http.post<IDList[]>(`${this.apiUrl}/loginDiag/listDiag`, { dept: 'D' })
      .pipe(
        shareReplay()
      );
  }




}
