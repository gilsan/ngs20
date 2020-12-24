import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../../services/excelservice';

@Component({
  selector: 'app-excel-download',
  templateUrl: './excel-download.component.html',
  styleUrls: ['./excel-download.component.scss']
})
export class ExcelDownloadComponent implements OnInit {

  data: any = [{
    eid: 'e101',
    ename: 'ravi',
    esal: 1000
  }, {
    eid: 'e102',
    ename: 'ram',
    esal: 2000
  }, {
    eid: 'e103',
    ename: 'rajesh',
    esal: 3000
  }];

  constructor(
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
  }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(this.data, 'sample');
  }

}
