import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-disease-to-db',
  templateUrl: './disease-to-db.component.html',
  styleUrls: ['./disease-to-db.component.scss']
})
export class DiseaseToDbComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;

  diseaseNumber: string;
  mutationScore: string;
  msiScore: string;
  type: string;
  percentage: number;
  status$ = new Subject();
  status = [];


  constructor(
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
    this.status$.subscribe(data => {
      if (data === 'statistic' || data === 'type' || data === 'type' || data === 'percentage' || data === 'msi') {
        this.status.push(data);
      }

      if (this.status.length === 4) {
        console.log('[' + this.mutationScore + '][' + this.msiScore + '][' + this.type + '][' + this.percentage + ']');
      } else {
        console.log('Not Full ...');
      }
    });

  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
    // console.log('Drag leave');
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }
    this.isActive = false;
  }

  onDroppedFile(droppedFiles: any) {
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }

    this.fileUploadService.pathDataUpload(formData)
      .subscribe(result => {
        this.upload = result;
      });
  }

  onSelectedFile(event: any) {

    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      const file = event.target.files[0];

      this.onDroppedFile(event.target.files);

      if (filename === 'Statistic.txt') {
        this.Statistic(file);
      } else {
        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];

        if (diseaseFilename.includes('RNA')) {
          this.nonefilter(file);
        } else {
          this.donefilter(file);
        }
      }
    }
  }

  // 보고서/결과지에 표시할 "tumor mutation burden" => 9.44
  Statistic(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);
      data.forEach(list => {
        const mutationList = list[0].split('=');

        if (mutationList[0] === 'Mutation Load (Mutations/Mb)') {
          this.mutationScore = mutationList[1];
          this.status$.next('statistic');
        }
      });
    };
    reader.readAsText(file);
  }


  //  ##sampleDiseaseType=Non-Small Cell Lung Cancer     //암종 비소세포폐암
  //  ##CellularityAsAFractionBetween0-1=0.600000           //cellularity x100% 로 표시. 60%
  // 보고서/결과지에 Tumor type
  // Tumor cell perentage 를 헤더에서 읽어서 표시한다
  nonefilter(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);
      data.forEach(item => {
        const checkshap = item.toString().indexOf('#');
        if (checkshap !== -1) {
          lists.push(item[0]);
        }
      });

      lists.forEach(list => {
        const msiList = list.split('##')[1].split('=');

        if (msiList[0] === 'sampleDiseaseType') {
          this.type = msiList[1].replace(/(\r\n|\r)/gm, '');
          this.status$.next('type');
        } else if (msiList[0] === 'CellularityAsAFractionBetween0-1') {
          this.percentage = parseFloat(msiList[1]) * 100;
          this.status$.next('percentage');
        }
      });

    };
    reader.readAsText(file);

  }

  // ##MSI Score=2.49       //보고서/결과지에 표시할 “MSI Score”
  donefilter(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];

      const data = this.loadData(reader.result);
      data.forEach(item => {
        const checkshap = item.toString().indexOf('#');
        if (checkshap !== -1) {
          lists.push(item[0]);
        }
      });

      lists.forEach(list => {
        const msiList = list.split('##')[1].split('=');
        if (msiList[0] === 'MSI Score') {
          this.msiScore = msiList[1];
          this.status$.next('msi');
        }
      });
    };
    reader.readAsText(file);

  }

  parse_tsv(s, f) {
    s = s.replace(/,/g, ';');
    let ixEnd = 0;
    for (let ix = 0; ix < s.length; ix = ixEnd + 1) {
      ixEnd = s.indexOf('\n', ix);
      if (ixEnd === -1) {
        ixEnd = s.length;
      }
      const row = s.substring(ix, ixEnd).split('\t');
      f(row);
    }
  }

  loadData(file: ArrayBuffer | string) {
    let rowCount = 0;
    const scenarios = [];
    this.parse_tsv(file, (row) => {
      rowCount++;
      if (rowCount >= 0) {
        scenarios.push(row);
      }
    });
    return scenarios;
  }

}
