import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-updategene',
  templateUrl: './updategene.component.html',
  styleUrls: ['./updategene.component.scss']
})
export class UpdategeneComponent implements OnInit {

  form: FormGroup;
  genename: string;

  constructor(
    public dialogRef: MatDialogRef<UpdategeneComponent>,
    @Inject(MAT_DIALOG_DATA) public gene: string,
    private fb: FormBuilder
  ) { }



  ngOnInit(): void {
    this.genename = this.gene;
    this.init();
  }

  init(): void {
    this.form = this.fb.group({
      gene: []
    });
  }

  save(gene: string): void {
    this.dialogRef.close({ oldgene: this.genename, newgene: gene });
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
