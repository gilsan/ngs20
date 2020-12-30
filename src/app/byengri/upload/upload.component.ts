import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/home/services/file-upload.service';
import { IFilteredOriginData } from '../models/patients';
import { UploadResponse } from '../models/uploadfile';
import { PathologyService } from '../services/pathology.service';
import { StorePathService } from '../store.path.service';
import { IGeneTire } from './../models/patients';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('uploadfile') uploadfile: ElementRef;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelected = new EventEmitter<void>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCanceled = new EventEmitter<void>();

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
  status$ = new Subject();
  status = [];
  filteredOriginData: IFilteredOriginData[] = [];
  prelevalentMutation = [];
  clinically = [];
  clinical: IGeneTire[] = [];
  prevalent = [];
  uploadfileList: string[] = [];

  tumorType: string;
  burden: string;


  constructor(
    // private fileUploadService: PathologyService,
    private pathologyService: PathologyService,
    private uploadfileService: FileUploadService,
    private store: StorePathService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.uploadfileList = [];
    // console.log('[55][upload][ngOnInit]', this.uploadfileList);

  }

  onConfirm(): void {
    this.onSelected.emit(null);
    // 파일 업로드후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
  }

  onCancel(): void {
    this.onCanceled.emit(null);
    // 파일 취소후 초기화
    this.uploadfileList = [];
    this.upload.files = [];
    this.uploadfile.nativeElement.value = '';
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
    this.pathologyNum = this.store.getPathologyNo();
    this.inputType = this.store.getType();

    formData.append('pathologyNum', this.pathologyNum);
    formData.append('type', this.inputType);
    formData.append('fileType', this.fileType);

    this.uploadfileService.pathDataUpload(formData)
      .pipe(
        filter(item => item.files !== undefined),
        filter(item => item.files.length > 0)
      )
      .subscribe(result => {
        this.upload = result;
        this.upload.files.forEach(item => {
          const { filename } = item;
          this.uploadfileList.push(filename);
        });
      });
  }

  onSelectedFile(event: any): void {
    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      const file = event.target.files[0];

      //  console.log('[fileupload][병리 파일명][96]', filename);
      if (filename === 'Statistic.txt') {
        // this.Statistic(file);
      } else {
        const diseaseFilename = filename.split('_');
        this.diseaseNumber = diseaseFilename[0];
        //  console.log('[fileupload][병리 파일분류][102]', diseaseFilename);
        this.pathologyNum = this.pathologyService.getPathologyNum();
        this.type = this.pathologyService.getType();

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
      // alert('파일이 등록 되었습니다.');
    }
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
      data.filter(list => list[0] !== 'Public data sources included in relevant therapies')
        .forEach((list, index) => {
          // console.log('[174][]', list);
          if (list[0].length > 0) {
            if (list[0].trim() === 'Sample Cancer Type') {
              this.tumorType = list[1].trim();
              // this.pathologyService.setTumortype(list[1].trim(), this.pathologyNum);
            }
            const temp1 = list[0].split('(');

            if (temp1[0].trim() === 'Tumor Mutational Burden' && temp1[1]) {
              const temp2 = temp1[1].split(' ');
              if (temp2[1] === 'Mut/Mb') {
                status = false;
                start = index;

                this.burden = temp2[0];
                console.log('[193][burden] ', this.burden);
              }
            }

            if (list[0] === 'Tumor Mutational Burden' && list[1] !== undefined) {
              const burden = list[1].split(' ');
              if (burden[1] === 'Mut/Mb') {
                this.burden = burden[0];
              }
            }

            if (list[0] === 'Genomic Alteration' && (list[1] === 'Gene Name')) {
              if (count > 0) {
                status = false;
              } else {
                status = true;
                start = index + 1;
              }
              count++;
            }

            if (list[4] === undefined) {
              status = false;
            }

            if (index >= start && status) {

              const len = this.checkListNum(list[0]);

              if (len === 1) {
                const filteredlist = list[0].trim().split(' ');
                const tier = list[2].substring(0, list[2].length - 1);
                // filteredlist 길이
                const filteredlistLen = filteredlist.length;
                if (filteredlistLen === 2 || filteredlistLen === 3) {
                  if (filteredlist[1] !== 'deletion' && filteredlist[1] !== 'stable') {
                    this.clinical.push({ gene: filteredlist[0], tier, frequency: list[3] });  // 티어
                    this.clinically.push(list[0]); // 유전자
                  }
                } else if (filteredlistLen === 4) {
                  if (filteredlist.includes('exon')) {
                    this.clinical.push({ gene: filteredlist[0], tier, frequency: list[3] });
                    this.clinically.push(list[0]);
                  }
                }

              } else if (len > 1) {
                const tempGene = list[0].split(';');
                const tempfre = list[3].split('(')[0].split(';');

                for (let i = 0; i < tempGene.length; i++) {
                  const onetier = list[2].substring(0, list[2].length - 1);
                  const tempfilteredlist = tempGene[i].trim().split(' ');
                  if (tempfilteredlist[1] !== 'deletion') {
                    this.clinical.push({ gene: tempfilteredlist[0], tier: onetier, frequency: tempfre[i].trim() });
                    this.clinically.push(tempGene[i].trim());
                  }

                }
              }

            }

            if (count === 2) { }

            if (list[0].trim() === 'Prevalent cancer biomarkers without relevant evidence based on included data sources') {
              nextline = index + 1;
            }

            if (nextline === index) {
              this.prevalent = list[0].replace(/&gt;/g, '>').split(';').filter(item => {
                const member = item.trim().split(' ');

                return member[1] !== 'deletion';
              });

              // console.log('[227][deletion]', this.prevalent);

            }
          }
        });  // End of ForEach

      this.pathologyService.setClinically(this.clinically, this.pathologyNum)
        .pipe(
          concatMap(() => this.pathologyService.setTumortype(this.tumorType, this.pathologyNum)),
          concatMap(() => this.pathologyService.setClinical(this.clinical, this.pathologyNum)),
          concatMap(() => this.pathologyService.setPrevalent(this.prevalent, this.pathologyNum)),
          concatMap(() => this.pathologyService.setTumorMutationalBurden(this.burden, this.pathologyNum))

        ).subscribe(result => {
          // console.log(result);
        });
    };
    reader.readAsText(file);
  }

  nonefilter(file: File): void {
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
          this.pathologyService.setTumortype(this.type, this.pathologyNum);
          this.status$.next('type');
        } else if (msiList[0] === 'CellularityAsAFractionBetween0-1') {
          this.percentage = parseFloat(msiList[1]) * 100;

          this.status$.next('percentage');
        }
      });

      this.pathologyService.setTumorCellPercentage(this.percentage.toString(), this.pathologyNum); // 퍼센트
    };
    reader.readAsText(file);

  }

  donefilter(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lists = [];

      const data = this.loadData(reader.result);
      // console.log('==== [313][filteredOriginData] ', data);
      // 기본자료 수집
      data.forEach((list, index) => {
        if (index >= 19) {
          // console.log('==== [313][filteredOriginData] ', list[12].trim());
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
          // console.log('==== [313][filteredOriginData] ', this.filteredOriginData);
        }

      });

      this.pathologyService.setFilteredTSV(this.filteredOriginData);
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
          // this.pathologyService.setMSIScore(this.msiScore, this.pathologyNum);
          this.status$.next('msi');
        }
      });
      this.pathologyService.setMSIScore(this.msiScore, this.pathologyNum);

      // console.log('[320][upload][msiScore]', this.msiScore);
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

  // 갯수확인
  checkListNum(genes: string): number {
    const num = genes.split(';');
    return num.length;
  }

  splitList(genes: string, percent: string) {

  }


}
