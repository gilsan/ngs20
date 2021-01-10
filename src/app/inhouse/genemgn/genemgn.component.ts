import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { map, tap } from 'rxjs/operators';
import { GeneService } from 'src/app/services/genemgn.service';
import { MatDialog } from '@angular/material/dialog';
import { AddgeneComponent } from './addgene/addgene.component';

export interface IGENE {
  g0: string;
  g1: string;
  g2: string;
  g3: string;
  g4: string;
  g5: string;
  g6: string;
  g7: string;
  g8: string;
  g9: string;
}

export interface IGTYPE {
  gene: string;
  type: string;
}
@Component({
  selector: 'app-genemgn',
  templateUrl: './genemgn.component.html',
  styleUrls: ['./genemgn.component.scss']
})
export class GenemgnComponent implements OnInit {

  AML: IGENE[];
  ALL: IGENE[];
  LYM: IGENE[];
  MDS: IGENE[];

  lists: IGENE[];
  genetype = 'AML';

  constructor(
    private geneService: GeneService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.init();


  }

  init(): void {
    const allList$ = this.geneService.geneAllList();

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'AML')),
    ).subscribe(data => {
      this.AML = this.makegenelist(data);
      this.lists = this.AML;
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'ALL')),
    ).subscribe(data => {
      this.ALL = this.makegenelist(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'LYM')),
    ).subscribe(data => {
      this.LYM = this.makegenelist(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'MDS')),
    ).subscribe(data => {
      this.MDS = this.makegenelist(data);
    });

  }


  genelists(type: string): void {
    if (type === 'ALL') {
      this.lists = this.ALL;
      this.genetype = 'ALL';
    } else if (type === 'AML') {
      this.lists = this.AML;
      this.genetype = 'AML';
    } else if (type === 'LYM') {
      this.lists = this.LYM;
      this.genetype = 'LYM';
    } else if (type === 'MDS') {
      this.lists = this.MDS;
      this.genetype = 'MDS';
    }
  }

  makegenelist(lists: IGTYPE[]): IGENE[] {
    let len: number;
    const genelists: IGENE[] = [];
    let genelist: IGENE = {
      g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: ''
    };
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        genelist.g0 = lists[index].gene;
      } else if (i === 1) {
        genelist.g1 = lists[index].gene;
      } else if (i === 2) {
        genelist.g2 = lists[index].gene;
      } else if (i === 3) {
        genelist.g3 = lists[index].gene;
      } else if (i === 4) {
        genelist.g4 = lists[index].gene;
      } else if (i === 5) {
        genelist.g5 = lists[index].gene;
      } else if (i === 6) {
        genelist.g6 = lists[index].gene;
      } else if (i === 7) {
        genelist.g7 = lists[index].gene;
      } else if (i === 8) {
        genelist.g8 = lists[index].gene;
      } else if (i === 9) {
        genelist.g9 = lists[index].gene;
      }

      if (i === 9) {
        genelists.push(genelist);
        genelist = { g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: '' };
      } else if (len === index) {
        genelists.push(genelist);
      }
    } // End of for loop
    return genelists;
  }

  genename(gene: string): void {
    console.log(this.genetype, gene);
  }

  addOpenDialog(): void {
    const dialogRef = this.dialog.open(AddgeneComponent, {
      width: '500px',
      height: '400px',
    });
  }

}


