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

  weekdays: string[] = ['#', 'Monday', 'Thusday', 'Wednesday', 'Thursday', 'Friday']
  times: string[] = ['8:30 - 9:15', '9:15 - 10:00', '10:15 - 11:00', '11:00 - 11:45', '12:30 - 13:15', '13:15 - 14:00', '14:15 - 15:00']
  weekdaysForClick: string[] = ['Monday', 'Thusday', 'Wednesday', 'Thursday', 'Friday'];
  wasClicked = false;

  AML2 = [][10];
  ALL2 = [][10];
  LYM2 = [][10];
  MDS2 = [][10];
  lists2 = [][10];

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
      this.AML2 = this.makegenelist(data);
      this.lists2 = this.AML2;
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'ALL')),
    ).subscribe(data => {
      this.ALL2 = this.makegenelist(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'LYM')),
    ).subscribe(data => {
      this.LYM2 = this.makegenelist(data);
    });

    allList$.pipe(
      map(lists => lists.filter(list => list.type === 'MDS')),
    ).subscribe(data => {
      this.MDS2 = this.makegenelist(data);
    });

  }


  genelists(type: string): void {
    if (type === 'ALL') {
      this.genetype = 'ALL';
      this.lists2 = this.ALL2;
    } else if (type === 'AML') {
      this.genetype = 'AML';
      this.lists2 = this.AML2;
    } else if (type === 'LYM') {
      this.genetype = 'LYM';
      this.lists2 = this.LYM2;
    } else if (type === 'MDS') {
      this.genetype = 'MDS';
      this.lists2 = this.MDS2;
    }
  }

  makegenelist(lists: IGTYPE[]): any {
    let len: number;
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
        listgenes.push(listgene);
        listgene = [];
      } else if (len === index) {
        listgenes.push(listgene);
      }
    } // End of for loop
    return listgenes;
  }



  genename(gene: string, i: number, j: number): void {

    this.selectedgene = gene;
    console.log(this.genetype, gene, i, j);
  }

  mystyle(i: number, j: number): any {
    let len;
    if (this.genetype === 'ALL') {
      len = this.ALL2.length;
    } else if (this.genetype === 'AML') {
      len = this.AML2.length;
    } else if (this.genetype === 'LYM') {
      len = this.LYM2.length;
    } else if (this.genetype === 'MDS') {
      len = this.MDS2.length;
    }

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

  // tslint:disable-next-line:member-ordering
  selected: '';
  onClick(weekday, time): void {
    console.log(this.selected, weekday);
    if (this.selected === weekday) {
      this.selected = '';
    } else {
      this.selected = weekday;
    }
  }



}


