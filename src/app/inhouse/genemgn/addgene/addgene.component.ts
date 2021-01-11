import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-addgene',
  templateUrl: './addgene.component.html',
  styleUrls: ['./addgene.component.scss']
})
export class AddgeneComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddgeneComponent>
  ) { }

  ngOnInit(): void {
  }

  save(gene: string): void {
    this.dialogRef.close({ gene });
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
