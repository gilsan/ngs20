import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { map, tap } from 'rxjs/operators';
import { GeneService } from 'src/app/services/genemgn.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddgeneComponent } from './addgene/addgene.component';
import { UpdategeneComponent } from './updategene/updategene.component';
import { DeletegeneComponent } from './deletegene/deletegene.component';

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

  AML = [][10];
  ALL = [][10];
  LYM = [][10];
  MDS = [][10];
  lists2 = [][10];
  row = 0;
  col = 0;
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
      this.lists2 = this.AML;
      this.selectedgene = this.lists2[0][0];
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
      this.genetype = 'ALL';
      this.lists2 = this.ALL;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'AML') {
      this.genetype = 'AML';
      this.lists2 = this.AML;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'LYM') {
      this.genetype = 'LYM';
      this.lists2 = this.LYM;
      this.selectedgene = this.lists2[0][0];
    } else if (type === 'MDS') {
      this.genetype = 'MDS';
      this.lists2 = this.MDS;
      this.selectedgene = this.lists2[0][0];
    }
  }

  makegenelist(lists: IGTYPE[]): any {
    let len: number;
    let count = 0;
    const listgenes = [[]];
    let listgene = [];
    len = lists.length - 1;
    for (let index = 0; index < lists.length; index++) {
      const i = index % 10;
      if (i === 0) {
        listgene[i] = lists[index].gene;
      } else if (i === 1) {
        listgene[i] = lists[index].gene;
      } else if (i === 2) {
        listgene[i] = lists[index].gene;
      } else if (i === 3) {
        listgene[i] = lists[index].gene;
      } else if (i === 4) {
        listgene[i] = lists[index].gene;
      } else if (i === 5) {
        listgene[i] = lists[index].gene;
      } else if (i === 6) {
        listgene[i] = lists[index].gene;
      } else if (i === 7) {
        listgene[i] = lists[index].gene;
      } else if (i === 8) {
        listgene[i] = lists[index].gene;
      } else if (i === 9) {
        listgene[i] = lists[index].gene;
      }

      if (i === 9) {
        listgenes[count] = listgene;
        listgene = [];
        count++;
      } else if (len === index) {
        listgenes[count] = listgene;
      }
    } // End of for loop
    return listgenes;
  }



  genename(gene: string, i: number, j: number): void {
    this.selectedgene = gene;
    this.row = i;
    this.col = j;
  }

  mystyle(i: number, j: number): any {
    let len;
    if (this.genetype === 'ALL') {
      len = this.ALL.length;
    } else if (this.genetype === 'AML') {
      len = this.AML.length;
    } else if (this.genetype === 'LYM') {
      len = this.LYM.length;
    } else if (this.genetype === 'MDS') {
      len = this.MDS.length;
    }

  }
  // 생성 다이얼로그
  addOpenDialog(): void {
    const addDialogRef = this.dialog.open(AddgeneComponent, {
      width: '300px',
      height: '260px',
      disableClose: true
    });

    addDialogRef.afterClosed().subscribe(val => {
      if (this.genetype === 'ALL') {
        const alen = this.ALL.length;
        const blen = this.ALL[alen - 1].length;
        this.addNewgene('ALL', alen, blen, val.gene);
      } else if (this.genetype === 'AML') {
        const alen = this.AML.length;
        const blen = this.AML[alen - 1].length;
        this.addNewgene('AML', alen, blen, val.gene);
      } else if (this.genetype === 'LYM') {
        const alen = this.LYM.length;
        const blen = this.LYM[alen - 1].length;
        this.addNewgene('LYM', alen, blen, val.gene);
      } else if (this.genetype === 'MDS') {
        const alen = this.MDS.length;
        const blen = this.MDS[alen - 1].length;
        this.addNewgene('MDS', alen, blen, val.gene);
      }
      this.geneService.geneInsert(this.genetype, val.gene)
        .subscribe(data => console.log(data));
    });
  }

  addNewgene(type: string, alen: number, blen: number, gene: string): void {
    if (type === 'ALL') {
      if (blen < 10) {
        this.ALL[alen - 1].push(gene);
      } else {
        this.ALL.push([gene]);
      }
    } else if (type === 'AML') {
      if (blen < 10) {
        this.AML[alen - 1].push(gene);
      } else {
        this.AML.push([gene]);
      }
    } else if (type === 'LYM') {
      if (blen < 10) {
        this.LYM[alen - 1].push(gene);
      } else {
        this.LYM.push([gene]);
      }
    } else if (type === 'MDS') {
      if (blen < 10) {
        this.MDS[alen - 1].push(gene);
      } else {
        this.MDS.push([gene]);
      }
    }
  }

  // 수정 다이얼로그
  updateOpenDialog(): void {
    const updateDialogRef = this.dialog.open(UpdategeneComponent, {
      width: '330px',
      height: '260px',
      data: this.selectedgene,
      disableClose: true
    });

    updateDialogRef.afterClosed().subscribe(val => {
      if (this.genetype === 'ALL') {
        this.updateGene(val.newgene);
      } else if (this.genetype === 'AML') {
        this.updateGene(val.newgene);
      } else if (this.genetype === 'LYM') {
        this.updateGene(val.newgene);
      } else if (this.genetype === 'MDS') {
        this.updateGene(val.newgene);
      }
      this.geneService.geneUpdate(this.genetype, val.oldgene, val.newgene)
        .subscribe(data => console.log('[갱신]', data));
    });

  }

  updateGene(newgene: string): void {
    if (this.genetype === 'ALL') {
      this.ALL[this.row][this.col] = newgene;
    } else if (this.genetype === 'AML') {
      this.AML[this.row][this.col] = newgene;
    } else if (this.genetype === 'LYM') {
      this.LYM[this.row][this.col] = newgene;
    } else if (this.genetype === 'MDS') {
      this.MDS[this.row][this.col] = newgene;
    }
  }
  // 삭제 다이얼로그
  deleteOpenDialog(): void {
    const deleteDialogRef = this.dialog.open(DeletegeneComponent, {
      width: '300px',
      height: '220px',
      data: this.selectedgene,
      disableClose: true
    });

    deleteDialogRef.afterClosed().subscribe(val => {
      if (val.message === 'YES') {
        const gene = val.gene;
        if (this.genetype === 'ALL') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'AML') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'LYM') {
          this.deleteGene(val.gene);
        } else if (this.genetype === 'MDS') {
          this.deleteGene(val.gene);
        }
      }
    });

  }

  deleteGene(gene: string): void {
    if (this.genetype === 'ALL') {
      this.ALL[this.row].splice(this.col, 1);
      this.geneService.geneDelete('ALL', gene)
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'AML') {
      this.AML[this.row].splice(this.col, 1);
      this.geneService.geneDelete('AML', gene)
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'LYM') {
      this.LYM[this.row].splice(this.col, 1);
      this.geneService.geneDelete('LYM', gene)
        .subscribe(() => {
          this.init();
        });
    } else if (this.genetype === 'MDS') {
      this.MDS[this.row].splice(this.col, 1);
      this.geneService.geneDelete('MDS', gene)
        .subscribe(() => {
          this.init();
        });
    }
  }

  // 중복체크
  checkDuplicate(type: string, alen: number, blen: number, gene: string): boolean {
    if (this.genetype === 'ALL') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.ALL[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'AML') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.AML[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'LYM') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.LYM[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    } else if (this.genetype === 'MDS') {
      for (let i = 0; i < alen; i++) {
        for (let j = 0; j < blen; j++) {
          if (this.MDS[i][j] === gene) {
            return true;
          }
        }
      }
      return false;
    }
  }


}


