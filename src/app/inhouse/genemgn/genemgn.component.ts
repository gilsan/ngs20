import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { map, tap } from 'rxjs/operators';
import { GeneService } from 'src/app/services/genemgn.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddgeneComponent } from './addgene/addgene.component';
import { UpdategeneComponent } from './updategene/updategene.component';
import { DeletegeneComponent } from './deletegene/deletegene.component';

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
  AML2 = [[10]];
  ALL2 = [[10]];
  LYM2 = [[10]];
  MDS2 = [[10]];
  lists2 = [[10]];

  genetype = 'AML';
  selectedgene: string;
  active = false;
  addDialogRef: MatDialogRef<any>;
  updateDialogRef: MatDialogRef<any>;
  deleteDialogRef: MatDialogRef<any>;
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
      this.AML2 = this.makegenelist2(data);
      this.lists2 = this.AML2;
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'ALL')),
    ).subscribe(data => {
      this.ALL = this.makegenelist(data);
      this.ALL2 = this.makegenelist2(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'LYM')),
    ).subscribe(data => {
      this.LYM = this.makegenelist(data);
      this.LYM2 = this.makegenelist2(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'MDS')),
    ).subscribe(data => {
      this.MDS = this.makegenelist(data);
      this.MDS2 = this.makegenelist2(data);
    });

  }


  genelists(type: string): void {
    if (type === 'ALL') {
      this.lists = this.ALL;
      this.genetype = 'ALL';
      this.lists2 = this.ALL2;
    } else if (type === 'AML') {
      this.lists = this.AML;
      this.genetype = 'AML';
      this.lists2 = this.AML2;
    } else if (type === 'LYM') {
      this.lists = this.LYM;
      this.genetype = 'LYM';
      this.lists2 = this.LYM2;
    } else if (type === 'MDS') {
      this.lists = this.MDS;
      this.genetype = 'MDS';
      this.lists2 = this.MDS2;
    }
  }

  makegenelist(lists: IGTYPE[]): IGENE[] {
    let len: number;
    const genelists: IGENE[] = [];
    let genelist: IGENE = {
      g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: ''
    };
    const listgenes: [string[]] = [[]];
    let listgene: string[] = [];
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        listgene[i] = lists[index].gene;
        genelist.g0 = lists[index].gene;
      } else if (i === 1) {
        listgene[i] = lists[index].gene;
        genelist.g1 = lists[index].gene;
      } else if (i === 2) {
        listgene[i] = lists[index].gene;
        genelist.g2 = lists[index].gene;
      } else if (i === 3) {
        listgene[i] = lists[index].gene;
        genelist.g3 = lists[index].gene;
      } else if (i === 4) {
        listgene[i] = lists[index].gene;
        genelist.g4 = lists[index].gene;
      } else if (i === 5) {
        listgene[i] = lists[index].gene;
        genelist.g5 = lists[index].gene;
      } else if (i === 6) {
        listgene[i] = lists[index].gene;
        genelist.g6 = lists[index].gene;
      } else if (i === 7) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g7 = lists[index].gene;
      } else if (i === 8) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g8 = lists[index].gene;
      } else if (i === 9) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g9 = lists[index].gene;
      }

      if (i === 9) {
        genelists.push(genelist);
        listgenes.push(listgene);
        genelist = { g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: '' };
        listgene = [];
      } else if (len === index) {
        genelists.push(genelist);
        listgenes.push(listgene);
      }
    } // End of for loop
    console.log(listgenes);
    return genelists;
    // return listgenes;
  }

  makegenelist2(lists: IGTYPE[]): any {
    let len: number;
    const genelists: IGENE[] = [];
    let genelist: IGENE = {
      g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: ''
    };
    const listgenes: [string[]] = [[]];
    let listgene: string[] = [];
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        listgene[i] = lists[index].gene;
        genelist.g0 = lists[index].gene;
      } else if (i === 1) {
        listgene[i] = lists[index].gene;
        genelist.g1 = lists[index].gene;
      } else if (i === 2) {
        listgene[i] = lists[index].gene;
        genelist.g2 = lists[index].gene;
      } else if (i === 3) {
        listgene[i] = lists[index].gene;
        genelist.g3 = lists[index].gene;
      } else if (i === 4) {
        listgene[i] = lists[index].gene;
        genelist.g4 = lists[index].gene;
      } else if (i === 5) {
        listgene[i] = lists[index].gene;
        genelist.g5 = lists[index].gene;
      } else if (i === 6) {
        listgene[i] = lists[index].gene;
        genelist.g6 = lists[index].gene;
      } else if (i === 7) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g7 = lists[index].gene;
      } else if (i === 8) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g8 = lists[index].gene;
      } else if (i === 9) {
        listgene[i] = lists[index].gene;
        listgene[i] = lists[index].gene;
        genelist.g9 = lists[index].gene;
      }

      if (i === 9) {
        genelists.push(genelist);
        listgenes.push(listgene);
        genelist = { g0: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '', g7: '', g8: '', g9: '' };
        listgene = [];
      } else if (len === index) {
        genelists.push(genelist);
        listgenes.push(listgene);
      }
    } // End of for loop
    console.log(listgenes);
    // return genelists;
    return listgenes;
  }



  genename(gene: string, i: number): void {
    this.selectedgene = gene;
    console.log(this.genetype, gene, i);
  }

  addOpenDialog(): void {
    const addDialogRef = this.dialog.open(AddgeneComponent, {
      width: '300px',
      height: '260px',
    });

    addDialogRef.afterClosed().subscribe(
      val => console.log('Add Dialog output:', val)
    );
  }

  updateOpenDialog(): void {
    const updateDialogRef = this.dialog.open(UpdategeneComponent, {
      width: '330px',
      height: '260px',
      data: this.selectedgene,
    });

    updateDialogRef.afterClosed().subscribe(
      val => console.log('Update Dialog output:', val)
    );
  }

  deleteOpenDialog(): void {
    const deleteDialogRef = this.dialog.open(DeletegeneComponent, {
      width: '300px',
      height: '220px',
      data: this.selectedgene,
    });

    deleteDialogRef.afterClosed().subscribe(
      val => console.log('Delete Dialog output:', val)
    );
  }

}


