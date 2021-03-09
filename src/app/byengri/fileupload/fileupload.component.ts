
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/home/services/file-upload.service';
import { IFilteredOriginData } from '../models/patients';
import { UploadResponse } from '../models/uploadfile';
import { PathologyService } from '../services/pathology.service';
import { IGeneTire } from './../models/patients';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  pathologyNum: string;
  inputType: string; // N:신규입력, R: 재입력
  fileType: string;  // IR, OR
  diseaseNumber: string;
  mutationScore: string;
  msiScore: string;
  type: string;
  percentage: number;
  // status$ = new Subject();
  status = [];
  filteredOriginData: IFilteredOriginData[] = [];
  prelevalentMutation = [];
  clinically = [];
  clinical: IGeneTire[] = [];
  prevalent = [];
  uploadfileList = [];

  tumorType: string;
  burden: string;

  constructor(
    private fileUploadService: PathologyService,
    private uploadfileService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(route => route.get('id'))
    ).subscribe(data => {
      const temp = data.split('_');
      this.pathologyNum = temp[0];  // 검체번호
      this.inputType = temp[1];   // 입력형식 
    });

  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
    // console.log('Drag leave');
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }
    this.isActive = false;
  }

  onDroppedFile(droppedFiles: any): void {
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }
    formData.append('pathologyNum', this.pathologyNum);
    formData.append('type', this.inputType);
    formData.append('fileType', this.fileType);

    this.uploadfileService.pathDataUpload(formData)
      .subscribe(result => {
        this.upload = result;
      });
  }

  onSelectedFile(event: any): void {
    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      const file = event.target.files[0];
      // this.onDroppedFile(event.target.files);
      console.log('[fileupload][병리 파일명][96]', filename);
      if (filename === 'Statistic.txt') {
        // this.Statistic(file);
      } else {
        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];
        console.log('[fileupload][병리 파일분류][102]', diseaseFilename);

        if (diseaseFilename.includes('RNA')) {
          this.nonefilter(file);
        } else if (diseaseFilename.includes('All')) {
          this.fileType = 'OR';
          this.allOR(file);
        } else {
          this.fileType = 'IR';
          this.donefilter(file);
        }
      }
      this.onDroppedFile(event.target.files);
    }
  }

  goHome(): void {
    this.router.navigate(['/pathology']);
  }


  // 보고서/결과지에 표시할 "tumor mutation burden" => 9.44
  // tslint:disable-next-line: typedef
  allOR(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);

      let start = 0;
      let status = false;
      let count = 0;
      let nextline;
      data.forEach((list, index) => {
        console.log('[142]', list);
        if (list[0].trim() === 'Sample Cancer Type') {
          // console.log('[upload] ', list[1]);
          this.tumorType = list[1].trim();
          // this.fileUploadService.setTumortype(list[1].trim(), this.pathologyNum);
        }
        const temp1 = list[0].split('(');

        if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) {
          console.log('[150][Mutaional] ', temp1);
          status = false;
          start = index;

          const burden = temp1[1].split(' ');
          this.burden = burden[0];
          // this.fileUploadService.setTumorMutationalBurden(burden[0], this.pathologyNum);
        }



        if (list[0] === 'Genomic Alteration' && (list[1] !== 'Finding' || list[1] === undefined)) {
          if (count > 0) {
            status = false;
          } else {
            status = true;
            start = index + 1;
          }
          count++;
        }

        if (index >= start && status) {
          //  console.log('[163][]', list);
          const filteredlist = list[0].trim().split(' ');
          const tier = list[2].substring(0, list[2].length - 1);
          // console.log('[clinical][164] ', filteredlist, tier);
          if (filteredlist[1] !== 'deletion') {
            this.clinical.push({ gene: filteredlist[0], tier, frequency: list[3] });  // 티어
            this.clinically.push(list[0]); // 유전자
            console.log('[clinical][170] ', this.clinical, this.clinically);
            // this.fileUploadService.setClinically(this.clinically, this.pathologyNum);
            // this.fileUploadService.setClinical(this.clinical, this.pathologyNum);
          }

        }

        if (count === 2) {
          // console.log(this.clinically);
          // this.fileUploadService.setClinically(this.clinically);
        }

        if (list[0].trim() === 'Prevalent cancer biomarkers without relevant evidence based on included data sources') {
          nextline = index + 1;

        }

        if (nextline === index) {
          console.log('[187][]', list[0].replace(/&gt;/g, '>'));
          const deletion = list[0].replace(/&gt;/g, '>').split(';').filter(item => {
            const member = item.trim().split(' ');

            return member[1] !== 'deletion';
          });

          console.log('[201][deletion]====== ', deletion);
          // this.fileUploadService.setPrevalent(deletion, this.pathologyNum);
        }


      });  // End of ForEach
      /*
       this.fileUploadService.setTumortype(this.tumorType, this.pathologyNum);
       this.fileUploadService.setTumorMutationalBurden(this.burden, this.pathologyNum);
       this.fileUploadService.setClinically(this.clinically, this.pathologyNum);
       this.fileUploadService.setClinical(this.clinical, this.pathologyNum);
       */
    };
    reader.readAsText(file);
  }

  // tslint:disable-next-line: typedef
  Statistic(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];
      const data = this.loadData(reader.result);
      data.forEach(list => {
        const mutationList = list[0].split('=');

        if (mutationList[0] === 'Mutation Load (Mutations/Mb)') {
          this.mutationScore = mutationList[1];
          // this.status$.next('statistic');
        }
      });
    };
    reader.readAsText(file);
  }


  //  ##sampleDiseaseType=Non-Small Cell Lung Cancer     //암종 비소세포폐암
  //  ##CellularityAsAFractionBetween0-1=0.600000           //cellularity x100% 로 표시. 60%
  // 보고서/결과지에 Tumor type
  // Tumor cell perentage 를 헤더에서 읽어서 표시한다
  // tslint:disable-next-line: typedef
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
          // this.fileUploadService.setTumortype(this.type, this.pathologyNum);
          // this.status$.next('type');
        } else if (msiList[0] === 'CellularityAsAFractionBetween0-1') {
          this.percentage = parseFloat(msiList[1]) * 100;
          // this.fileUploadService.setTumorCellPercentage(this.percentage.toString());  // 퍼센트
          //  this.status$.next('percentage');
        }
      });
      this.fileUploadService.setTumorCellPercentage(this.percentage.toString(), this.pathologyNum);  // 퍼센트
    };
    reader.readAsText(file);

  }


  // ##MSI Score=2.49       //보고서/결과지에 표시할 “MSI Score”
  // tslint:disable-next-line: typedef
  donefilter(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];

      const data = this.loadData(reader.result);
      console.log(data);
      // 기본자료 수집

      data.forEach((list, index) => {
        if (index >= 19) {
          this.filteredOriginData.push({
            locus: list[0].trim(),
            readcount: list[21].trim(),
            OncomineVariant: list[12].trim(),
            oncomine: list[13].trim(),
            type: list[5].trim(),
            gene: list[9].trim(),
            aminoAcidChange: list[20].trim(),
            coding: list[35].trim(),
            frequency: list[19].trim(),
            comsmicID: list[30].trim(),
            cytoband: list[15].trim(),
            variantID: list[17].trim(),
            variantName: list[18].trim(),
            pathologyNum: this.pathologyNum,
          });
        }

      });
      // console.log('[upload][]', this.filteredOriginData);
      this.fileUploadService.setFilteredTSV(this.filteredOriginData);


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
          this.fileUploadService.setMSIScore(this.msiScore, this.pathologyNum);
          // this.status$.next('msi');
        }
      });
    };
    reader.readAsText(file);

  }


  parse_tsv(s, f): void {
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

  // tslint:disable-next-line: typedef
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
