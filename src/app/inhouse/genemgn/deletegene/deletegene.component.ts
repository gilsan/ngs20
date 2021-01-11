import { getSyntheticPropertyName } from '@angular/compiler/src/render3/util';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generate } from 'rxjs';
@Component({
  selector: 'app-deletegene',
  templateUrl: './deletegene.component.html',
  styleUrls: ['./deletegene.component.scss']
})
export class DeletegeneComponent implements OnInit {

  genename: string;
  constructor(
    public dialogRef: MatDialogRef<DeletegeneComponent>,
    @Inject(MAT_DIALOG_DATA) public gene: string,
  ) { }

  ngOnInit(): void {
    this.genename = this.gene;
    console.log('[delete]', this.gene);
  }

  save(): void {
    const result = confirm('정말로 지우시겠습니까?');
    if (result) {
      this.dialogRef.close({ message: 'YES' });
    } else {
      this.dialogRef.close({ message: 'NO' });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
