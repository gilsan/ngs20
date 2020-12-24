import { Component, Input, OnInit } from '@angular/core';
import { IFilteredTSV } from 'src/app/home/models/patients';
import { ExcelService } from 'src/app/home/services/excelservice';

@Component({
  selector: 'app-filtered',
  templateUrl: './filtered.component.html',
  styleUrls: ['./filtered.component.scss']
})
export class FilteredComponent implements OnInit {

  @Input() tsvLists: IFilteredTSV[];
  constructor(
    private excel: ExcelService
  ) { }

  ngOnInit(): void {
  }

  excelDownload(): void {
    console.log('excel', this.tsvLists);
    this.excel.exportAsExcelFile(this.tsvLists, 'sample');
  }

}
