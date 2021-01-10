import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { emrUrl } from 'src/app/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IFilteredOriginData, Ipolymorphism } from '../models/patients';



@Injectable({
  providedIn: 'root'
})
export class FilteredService {

  private apiUrl = emrUrl;
  constructor(
    private http: HttpClient
  ) { }

  //  filteredOriginData/list,  POST { pathologyNum: "123456" }
  getfilteredOriginDataList(pathologyNum: string): Observable<IFilteredOriginData[]> {
    return this.http.post<IFilteredOriginData[]>(`${this.apiUrl}/filteredOriginData/list`, { pathologyNum });
  }

  //  msiscore/list   POST { pathologyNum: "123456" }
  getMsiScroe(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/msiscore/list`, { pathologyNum });
  }

  // tumorcellpercentage/list POST { pathologyNum: "123456" }
  getTumorcellpercentage(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumorcellpercentage/list`, { pathologyNum });
  }

  // tumorMutationalBurden/list   POST { pathologyNum: "123456" }
  getTumorMutationalBurden(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumorMutationalBurden/list`, { pathologyNum })
      .pipe(
        tap(data => console.log('service tap', data))
      );
  }

  // tumortype/list   POST { pathologyNum: "123456" }
  getTumorType(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tumortype/list`, { pathologyNum });
  }

  // clinically/list   POST { pathologyNum: "123456" }
  getClinically(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clinically/list`, { pathologyNum });
  }



  // clinical/list   POST { pathologyNum: "123456" }
  getClinical(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clinical/list`, { pathologyNum });
  }

  //  prevalent/list   POST { pathologyNum: "123456" }
  getPrevalent(pathologyNum: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/prevalent/list`, { pathologyNum });
  }

  // polymorphism/list GET
  getPolymorphism(): Observable<Ipolymorphism[]> {
    return this.http.get<Ipolymorphism[]>(`${this.apiUrl}/polymorphism/list`);
  }



}
