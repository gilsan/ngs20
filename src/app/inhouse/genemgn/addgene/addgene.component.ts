import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneService } from 'src/app/services/genemgn.service';
@Component({
  selector: 'app-addgene',
  templateUrl: './addgene.component.html',
  styleUrls: ['./addgene.component.scss']
})
export class AddgeneComponent implements OnInit {

  constructor(
    private geneService: GeneService,
    public dialogRef: MatDialogRef<AddgeneComponent>,
    @Inject(MAT_DIALOG_DATA) public type: string,
  ) { }


  ngOnInit(): void {
    console.log(this.type);
  }

  save(gene: string): void {
    this.geneService.geneDuplicate(this.type, gene)
      .subscribe((data: { count: number }[]) => {
        console.log(data);
        if (data[0].count === 1) {
          alert('유전자가 중복 되었습니다.');
        } else {
          this.dialogRef.close({ gene });
        }
      });

  }

  cancel(): void {
    this.dialogRef.close({ gene: '' });
  }

}
