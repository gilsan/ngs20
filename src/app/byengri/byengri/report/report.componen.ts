import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Items } from '@clr/angular/data/datagrid/providers/items';
import { Observable, combineLatest, concat, partition, of } from 'rxjs';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import * as converter from 'xml-js';
import { SubSink } from 'subsink';
import { makeReport } from '../../models/dataset';
import {
  IAmplification, IBasicInfo, IExtraction, IFilteredOriginData,
  IFusion, IGeneTire, IIAmplification, IList, IMent, IMutation, IPatient, Ipolymorphism
} from '../../models/patients';
import { FilteredService } from '../../services/filtered.service';
import { PathologyService } from '../../services/pathology.service';
import { PathologySaveService } from '../../services/pathologysave.service';
import { SearchService } from '../../services/search.service';
import { StorePathService } from '../../store.path.service';
import { mentlists } from '../special-ment';
import { clinically, msiScore, patientInfo, prevalent, tsvData, tumorcellpercentage, tumorMutationalBurden, tumortype } from './mockData';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationServie } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('examine', { static: true }) examine: ElementRef;
  @ViewChild('rechecked', { static: true }) rechecked: ElementRef;
  @ViewChild('report', { static: true }) report: HTMLTextAreaElement;
  @ViewChild('diagnosis', { static: true }) diagnosis: HTMLTextAreaElement;

  polymorphismList: Ipolymorphism[];

  ments: IMent[] = mentlists;
  private subs = new SubSink();
  doctor: string;
  engineer: string;
  filteredOriginData: IFilteredOriginData[] = [];
  index: number;
  patientInfo: IPatient;
  muTier: string;
  ampTier: string;
  fuTier: string;
  clinically = [];
  tempClinically: { clinically: string, seq: string }[] = [];
  clinical: IGeneTire[] = [];
  tempPrevalent: { prevalent: string, seq: string }[] = [];
  prevalent = [];
  status = false;
  screenstatus: string;
  pathologyNum: string;  // 검체번호
  basicInfo: IBasicInfo = {
    name: '',
    registerNum: '',
    gender: '',
    pathologyNum: ''
  };
  dnanrna: string; // DNA and RNA extraction
  organ: string; // Organ

  // 검체정보
  extraction: IExtraction = {
    dnarna: '',
    managementNum: '',
    keyblock: '',
    tumorcellpercentage: '',
    organ: '',
    tumortype: '',
    diagnosis: '',
    msiscore: '',
    tumorburden: '',
  };

  mutation: IMutation[] = []; // 0: "ERBB2 p.(I655V) c.1963A>G" 양식으로 된것
  amplifications: IAmplification[] = [];
  fusion: IFusion[] = [];
  imutation: IMutation[] = [];
  iamplifications: IIAmplification[] = [];
  ifusion: IFusion[] = [];

  tumorMutationalBurden = '';
  msiScore = '';
  tumorcellpercentage: string;

  examedno: string;
  examedname: string;
  checkeredno: string;
  checkername: string;
  examin: string; // 검사자
  examinSeq: number;

  examTeam0 = true;
  examTeam1 = false;
  examTeam2 = false;
  examTeam3 = false;
  examTeam4 = false;

  recheck: string; // 확인자
  recheckSeq: number;

  mt: IList[];
  dt: IList[];

  generalReport = ``;  // 해석적 보고
  specialment = ``; // genes were not found
  notement = `[NOTE1]
본 검체에서 추출 된 RNA는 일부 QC를 만족하지 못하여 51개의 유전자(AKT2, ALK, AR, AXL, BRCA1, BRCA2, BRAF, CDKN2A, EGFR, ERBB2, ERBB4, ERG, ESR1, ETV1, ETV4, ETV5, FGFR1, FGFR2, FGFR3, FGR, FLT3, JAK2, KRAS, MDM4, MET, MYB, MYBL1, NF1, NOTCH1, NOTCH4, NRG1, NTRK1, NTRK2, NTRK3, NUTM1, PDGFRA, PDGFRB, PIK3CA, PRKACA, PRKACB, PTEN, PPARG, RAD51B, RAF1, RB1, RELA, RET, ROS1, RSPO2, RSPO3, TERT)에 대한 fusion은 확인 할 수 없었습니다. 결과에 참고하시기 바랍니다. 

[NOTE2]
종양세포밀도가 50% 미만(XX%)의 검체에서 얻어진 결과이므로, amplification 해석에 주의가 필요합니다.`; // note

  noneMu = 'None';
  noneAm = 'None';
  msgAm = `Deletion의 경우 Note와 이미지 보고서를 참고해주시기 바랍니다.`;
  noneFu = 'None';
  noneIMu = 'None';
  noneIAm = 'None';
  noneIFu = 'None';
  barcodefont = 'gulim';
  constructor(
    private pathologyService: PathologyService,
    private router: Router,
    private savepathologyService: PathologySaveService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private store: StorePathService,
    private route: ActivatedRoute,
    private filteredService: FilteredService,
    private sanitizer: DomSanitizer,
    private navigationServie: NavigationServie
  ) {
    this.getParams();
  }

  mutationForm: FormGroup;
  amplificationsForm: FormGroup;
  fusionForm: FormGroup;
  imutationForm: FormGroup;
  iamplificationsForm: FormGroup;
  ifusionForm: FormGroup;

  // <a [href]="fileUrl" download="file.txt">DownloadFile</a>
  // this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl()

  ngOnInit(): void {

    // this.pathologyService.getPatientList().subscribe();
    this.loadForm();
    // this.getParams();
    this.checker();
  }


  ngAfterViewInit(): void {
    // this.checker();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  back(): void {
    this.navigationServie.back();
  }

  getParams(): void {
    this.filteredService.getPolymorphism()
      .subscribe(data => {
        this.polymorphismList = data;
        // console.log(this.polymorphismList);
      });

    this.route.paramMap.pipe(
      map(route => route.get('pathologyNum'))
    ).subscribe(pathologyNum => {
      // console.log('[167][getParams]', pathologyNum);
      this.pathologyNum = pathologyNum; // 검체번호 저장
      this.patientInfo = this.pathologyService.patientInfo.filter(item => item.pathology_num === pathologyNum)[0];
      console.log('[169]', this.patientInfo);
      this.init(pathologyNum);
    });
  }

  getUrl(): SafeResourceUrl {
    const url = 'http://10.10.56.106:3729/';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  checkingMent(title: string): void {
    // this.extraction.tumortype
    // const type = 'Ovarian cancer';
    this.ments.forEach(item => {
      // console.log('[147][checkingMent][item]', item, title);
      const tempItem = item.title.toLowerCase();
      const tempTitle = title.toLowerCase();
      if (tempItem === tempTitle) {
        this.specialment = item.content;
        // console.log('[150][checkingMent][item]', item, title);
      }
    });
  }

  init(pathologyNum: string): void {
    // filtered 된 데이터 서비스에서 가져옴
    if (parseInt(this.patientInfo.screenstatus, 10) >= 1) {
      // 서비스에서 저장된 값을 가져온다.
      this.status = true;

      this.screenstatus = this.patientInfo.screenstatus;
      // 검체정보
      console.log('[178][환자정보], ', this.patientInfo);
      this.extraction.dnarna = 'FFPE tissue';
      this.extraction.managementNum = this.patientInfo.rel_pathology_num;
      // console.log('[216]', this.patientInfo.key_block);
      if (this.patientInfo.key_block === undefined || this.patientInfo.key_block === null) {
        this.extraction.keyblock = '';
      } else if (this.patientInfo.key_block.length > 0) {
        this.extraction.keyblock = this.patientInfo.key_block;
      } else {
        this.extraction.keyblock = '';
      }

      if (this.patientInfo.tumor_cell_per === undefined || this.patientInfo.tumor_cell_per === null) {
        this.extraction.tumorcellpercentage = '';
      } else {
        this.extraction.tumorcellpercentage = this.patientInfo.tumor_cell_per; // 공백 없앰
      }

      if (this.extraction.organ === undefined || this.extraction.organ === null) {
        this.extraction.organ = '';
      } else {
        this.extraction.organ = this.patientInfo.organ;
      }

      if (this.extraction.tumortype === undefined || this.extraction.tumortype === null) {
        this.extraction.tumortype = '';
      } else {
        this.extraction.tumortype = this.patientInfo.tumor_type;
      }

      if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
        this.extraction.diagnosis = '';
      } else {
        this.extraction.diagnosis = this.patientInfo.pathological_dx;
      }

      this.tumorMutationalBurden = this.patientInfo.tumorburden;
      this.msiScore = this.patientInfo.msiscore;
      this.extraction.tumorburden = this.tumorMutationalBurden;
      this.extraction.msiscore = this.msiScore;

      this.examin = this.patientInfo.examin;
      this.recheck = this.patientInfo.recheck;

      this.basicInfo.name = this.patientInfo.name;
      this.basicInfo.registerNum = this.patientInfo.patientID;
      this.basicInfo.gender = this.patientInfo.gender;
      this.basicInfo.pathologyNum = this.patientInfo.pathology_num;
      this.basicInfo.age = this.patientInfo.age;

      this.checkingMent(this.patientInfo.tumor_type);
      this.getDataFromDB(this.patientInfo);

    } else if (parseInt(this.patientInfo.screenstatus, 10) === 0) {
      // this.initByFile();
      this.initByDB(pathologyNum);
      // this.status = this.store.getDBSaved();
    }
  }

  loadForm(): void {
    this.mutationForm = this.fb.group({
      mutationLists: this.fb.array([]),
    });

    this.amplificationsForm = this.fb.group({
      amplificationsLists: this.fb.array([]),
    });


    this.fusionForm = this.fb.group({
      fusionLists: this.fb.array([]),
    });

    this.imutationForm = this.fb.group({
      imutationLists: this.fb.array([]),
    });

    this.iamplificationsForm = this.fb.group({
      iamplificationsLists: this.fb.array([]),
    });

    this.ifusionForm = this.fb.group({
      ifusionLists: this.fb.array([]),
    });
  }

  checker(): void {
    // this.report.nativeElement.selectionEnd = 5;
    // this.report.selectionStart += 200;
    this.report.selectionEnd = 200;
    const medi$ = this.searchService.listPath().pipe(
      shareReplay()
    );

    const mt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'T'))
    ).subscribe(mt => {
      this.mt = mt;
      this.mt.forEach(list => {
        if (list.pickselect === 'Y') {
          this.examedno = list.user_id;
          this.examedname = list.user_nm;
        }
      });
    });

    const dt$ = medi$.pipe(
      map(lists => lists.filter(list => list.part === 'D')),
    ).subscribe(dt => {
      this.dt = dt;
      this.dt.forEach(list => {
        if (list.pickselect === 'Y') {
          this.checkeredno = list.user_id;
          this.checkername = list.user_nm;
        }
      });
    });

  }

  getDataFromDB(info: IPatient): void {
    const pathologyNo = info.pathology_num;
    console.log('[272][report][ getDataFromDB][] ', pathologyNo);
    this.searchService.getPathmentlist(pathologyNo)
      .subscribe(data => {
        // console.log('[275][멘트리스트][]', data);
        if (data.message !== 'no data') {
          this.generalReport = data[0].generalReport;
          this.specialment = data[0].specialment;
          this.notement = data[0].notement;
        }
      });
    this.subs.sink = this.searchService.getMutationC(pathologyNo) // mutation 리스트
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempmu;
          if (data.length > 1) {
            tempmu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempmu = data;
          }
          tempmu.forEach((item, index) => {
            this.mutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              seq: index
            });
            this.mutationLists().push(this.createMutaion({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
            }, index));
          });
        } else {
          this.mutation = [];
        }
      });

    this.subs.sink = this.searchService.getAmplificationC(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempam;
          if (data.length > 1) {
            tempam = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempam = data;
          }
          tempam.forEach((item, index) => {
            this.amplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier,
              seq: index
            });

            this.amplificationsLists().push(this.createAmplifications({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              tier: item.tier
            }, index));

          });
        } else {
          this.amplifications = [];
        }
      });

    this.subs.sink = this.searchService.getFusionC(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempfu;
          if (data.length > 1) {
            tempfu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempfu = data;
          }
          tempfu.forEach((item, index) => {
            this.fusion.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              readcount: item.readcount,
              functions: item.fusion_function,
              tier: item.tier
            }, index);

            this.fusionLists().push(this.createFusion({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              functions: item.fusion_function,
              tier: item.tier
            }, index));
          });
        } else {
          this.fusion = [];
        }
      });

    this.subs.sink = this.searchService.getMutationP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempimu;
          if (data.length > 1) {
            tempimu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempimu = data;
          }
          tempimu.forEach((item, index) => {

            this.imutation.push({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier
            }, index);
            this.imutationLists().push(this.createIMutaion({
              gene: item.gene,
              aminoAcidChange: item.amino_acid_change,
              nucleotideChange: item.nucleotide_change,
              variantAlleleFrequency: item.variant_allele_frequency,
              ID: item.variant_id,
              tier: item.tier,
              seq: item.index
            }, index));
          });

        } else {
          this.imutation = [];
        }
      });

    this.subs.sink = this.searchService.getAmplificationP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempiam;
          if (data.length > 1) {
            tempiam = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempiam = data;
          }
          tempiam.forEach((item, index) => {
            this.iamplifications.push({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            }, index);

            this.iamplificationsLists().push(this.createIAmplifications({
              gene: item.gene,
              region: item.region,
              copynumber: item.estimated_copy_num,
              note: item.note
            }, index));

          });
        } else {
          this.iamplifications = [];
        }
      });

    this.subs.sink = this.searchService.getFusionP(pathologyNo)
      .subscribe(data => {
        if (data.message !== 'no data') {
          let tempifu;
          if (data.length > 1) {
            tempifu = data.sort((a, b) => {
              return parseInt(a.seq, 10) - parseInt(b.seq, 10);
            });
          } else {
            tempifu = data;
          }
          tempifu.forEach((item, index) => {
            console.log('[425]', item, item.gene, item.fusion_breakpoint, item.fusion_function, item.tier);
            this.ifusion.push({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              functions: item.fusion_function,
              tier: item.tier
            }, index);

            this.ifusionLists().push(this.createIFusion({
              gene: item.gene,
              breakpoint: item.fusion_breakpoint,
              functions: item.fusion_function,
              tier: item.tier,
            }, index));
          });
        } else {
          this.ifusion = [];
        }
      });
  }

  // tsv 화일에서 분류한 것을 디비에 저장후, 디비에서 불러온것
  initByDB(pathologynum: string): void {
    let tumortypes;
    console.log('[469][initByDB][tsv화일 올린후]', pathologynum);

    const filteredOriginaData$ = this.filteredService.getfilteredOriginDataList(pathologynum)
      .pipe(
        tap(itemlists => console.log('[473][tab]', itemlists)),
        map((orgitems) => orgitems.filter(item => item.OncomineVariant !== 'Deletion')),
        tap(itemlists => console.log('[475][tab]', itemlists))
      );

    const msiscore$ = this.filteredService.getMsiScroe(pathologynum);
    const tumorMutationalBurden$ = this.filteredService.getTumorMutationalBurden(pathologynum);
    const tumortype$ = this.filteredService.getTumorType(pathologynum);
    const clinically$ = this.filteredService.getClinically(pathologynum);
    const clinical$ = this.filteredService.getClinical(pathologynum);
    const prevalent$ = this.filteredService.getPrevalent(pathologynum);
    const tumorcellpercentage$ = this.filteredService.getTumorcellpercentage(pathologynum);

    combineLatest([filteredOriginaData$, msiscore$, tumorMutationalBurden$,
      tumortype$, clinically$, clinical$, prevalent$, tumorcellpercentage$])
      .subscribe(([filteredOriginaDataVal, msiscoreVal, tumorMutationalBurdenVal,
        tumortypeVal, clinicallyVal, clinicalVal, prevalentVal, tumorcellpercentageVal]) => {
        this.filteredOriginData = filteredOriginaDataVal; // filtered 된 데이터 가져옴
        // MSISCORE
        console.log('==== [509][MSI SCORE]', msiscoreVal);
        if (msiscoreVal.length > 0) {
          this.msiScore = msiscoreVal[0].msiscore; // MSI Score
          this.extraction.msiscore = msiscoreVal[0].msiscore;
        } else {
          this.msiScore = '';
          this.extraction.msiscore = '';
        }

        if (tumorMutationalBurdenVal.length > 0) {
          this.tumorMutationalBurden = tumorMutationalBurdenVal[0].tumorMutationalBurden;
          this.extraction.tumorburden = tumorMutationalBurdenVal[0].tumorMutationalBurden;
        } else {
          this.tumorMutationalBurden = '';
          this.extraction.tumorburden = '';
        }

        if (tumortypeVal.length > 0) {
          tumortypes = tumortypeVal[0].tumortype;
          this.checkingMent(tumortypeVal[0].tumortype); // 유전자에 따른 멘트 찿음
        } else {
          tumortypes = '';
        }

        console.log('[553][tumorcellpercentage]', tumorcellpercentageVal);
        if (tumorcellpercentageVal.length > 0) {
          console.log('-------[603][트림검사]');
          this.tumorcellpercentage = tumorcellpercentageVal[0].tumorcellpercentage.trim(); // 공백 없앰
          console.log('-------[605][트림검사]');
        } else {
          this.tumorcellpercentage = '';
        }
        this.screenstatus = this.patientInfo.screenstatus;
        // this.clinically = clinicallyVal;
        this.tempClinically = clinicallyVal;
        this.clinical = clinicalVal;
        // this.prevalent = prevalentVal;
        this.tempPrevalent = prevalentVal;
        this.basicInfo.name = this.patientInfo.name;
        this.basicInfo.registerNum = this.patientInfo.patientID;
        this.basicInfo.gender = this.patientInfo.gender;
        this.basicInfo.pathologyNum = this.patientInfo.pathology_num;
        this.basicInfo.age = this.patientInfo.age;
        // 순번대로 정렬
        console.log('[616][tempClinically ]', this.tempClinically);
        if (this.tempClinically.length > 1) {
          const tempClinically = this.tempClinically.sort((a, b) => {
            return parseInt(a.seq, 10) - parseInt(b.seq, 10);
          });
          console.log('[620][tempClinically ]', tempClinically);
          tempClinically.forEach(item => {
            this.clinically.push(item.clinically);
          });
        } else if (this.tempClinically.length === 1) {
          this.clinically.push(this.tempClinically[0].clinically);
        } else {
          this.clinically = [];
        }

        if (this.tempPrevalent.length > 1) {
          const tempPrevalent = this.tempPrevalent.sort((a, b) => {
            return parseInt(a.seq, 10) - parseInt(b.seq, 10);
          });
          console.log('[636][tempPrevalent ]', tempPrevalent);
          tempPrevalent.forEach(item => {
            this.prevalent.push(item.prevalent);
          });
        } else if (this.tempPrevalent.length === 1) {
          this.prevalent.push(this.tempPrevalent[0].prevalent);
        } else {
          this.prevalent = [];
        }

        console.log('[보고서 유전자정보]', this.filteredOriginData);
        console.log('[보고서][msiscore]', this.msiScore);
        console.log('[보고서][tumorcellpercentage]', this.tumorcellpercentage);
        console.log('[보고서][tumorMutationalBurden]', this.tumorMutationalBurden);
        console.log('[보고서][tumortype]', tumortypes);
        console.log('[보고서][clinically]', this.clinically);
        console.log('[보고서][clinical]', this.clinical);
        console.log('[보고서][prevalent]', this.prevalent);
        console.log('[보고서][환자정보]', this.patientInfo);

        // 검체정보
        this.extraction.dnarna = 'FFPE tissue';
        this.extraction.managementNum = this.patientInfo.rel_pathology_num;

        // console.log('[570]', this.patientInfo.key_block);
        if (this.patientInfo.key_block === undefined || this.patientInfo.key_block === null) {
          this.extraction.keyblock = '';
        } else if (this.patientInfo.key_block.length > 0) {
          const firstChar = this.patientInfo.key_block.charAt(0);
          if (firstChar === '#') {
            this.extraction.keyblock = this.patientInfo.key_block;
          } else {
            this.extraction.keyblock = '#' + this.patientInfo.key_block;
          }
        } else {
          this.extraction.keyblock = '';
        }

        // % 관리
        if (this.tumorcellpercentage === undefined || this.tumorcellpercentage === null) {
          this.extraction.tumorcellpercentage = '';
        } else if (this.tumorcellpercentage.length > 0) {
          const lastChar = this.tumorcellpercentage.charAt(this.tumorcellpercentage.length - 1);
          if (lastChar === '%') {
            this.extraction.tumorcellpercentage = this.tumorcellpercentage;
          } else {
            this.extraction.tumorcellpercentage = this.tumorcellpercentage + '%';
          }
        } else {
          this.extraction.tumorcellpercentage = '';
        }
        this.extraction.organ = this.patientInfo.organ;
        this.extraction.tumortype = tumortypes;
        if (this.patientInfo.pathological_dx === undefined || this.patientInfo.pathological_dx === null) {
          this.patientInfo.pathological_dx = '';
        } else {
          this.extraction.diagnosis = this.patientInfo.pathological_dx;
        }
        // OR파일에서 가져온 유전자 정보
        // tslint:disable-next-line:prefer-const

        this.clinically.forEach(item => {
          console.log('-------[698][트림 검사]', item);
          const members = item.trim().split(' ');
          console.log('-------[709][트림 검사]', members);
          const gene = members[0].trim().replace(/"/g, '');
          console.log('-------[702][트림 검사]', gene);
          const type = members[1].trim().replace(/"/g, '');
          console.log('-------[708][트림검사]', type);
          // console.log('====[552][clinically]: ', item, gene, type);
          if (type.charAt(0) === 'p' || type === 'exon') {
            // const indexm = this.findGeneInfo(gene);
            let indexm: number;
            let nucleotideChange: string;
            let customid = '';
            let variantAlleleFrequency = '';
            const tier = this.findTier(gene);  // clinical 에서 gene, tier, frequency 찿기

            const itemMembers = item.split(' ');

            let aminoAcidChange = itemMembers[1];
            const tempAminoAcidChange = itemMembers[1];
            // console.log('====[569][clinically]: ', gene, tempAminoAcidChange);
            if (type === 'exon') {
              nucleotideChange = '';
            } else {
              nucleotideChange = itemMembers[2];
            }

            variantAlleleFrequency = this.findFrequency(gene);
            if (type === 'exon') {
              indexm = this.findGeneInfo(gene);
              nucleotideChange = this.filteredOriginData[indexm].coding;
            } else {
              indexm = this.withGeneCoding(gene, nucleotideChange);
            }
            // console.log('==== [582][indexm]', gene, type, indexm);
            if (indexm !== -1) {
              customid = this.filteredOriginData[indexm].variantID;
              if (customid === undefined || customid === null) { customid = ''; }
              console.log('==== [586][]', gene, tempAminoAcidChange, type);
              if (gene === 'TERT' && tempAminoAcidChange === 'p.(?)') {
                aminoAcidChange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempAminoAcidChange === 'p.(?)') {
                aminoAcidChange = 'Splicing mutant';
              } else {
                // aminoAcidChange 값이 없으면 원래것을 사용
                aminoAcidChange = this.filteredOriginData[indexm].aminoAcidChange;
                // if (aminoAcidChange === undefined || aminoAcidChange === null || aminoAcidChange === '') {
                //   aminoAcidChange = tempAminoAcidChange;
                // }
              }
            } else {
              if (gene === 'TERT' && tempAminoAcidChange === 'p.(?)') {
                aminoAcidChange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempAminoAcidChange === 'p.(?)') {
                aminoAcidChange = 'Splicing mutant';
              }
              customid = '';
            }
            // console.log('[557][유전자]' + gene, aminoAcidChange, nucleotideChange);
            // gene, aminoAcidChange, nucleotideChange 조합으로 해당 되는것 삭제
            const result = this.removeGeneCheck(gene, aminoAcidChange, nucleotideChange);
            if (result === -1) {
              //  vc.novel.1169, 계열은 ID 에 빈공간으로 만듬.
              if (customid.indexOf('vc.novel') !== -1) {
                customid = '';
              }
              console.log('==== [684][mutation] ', gene);
              this.mutation.push({
                gene,
                aminoAcidChange,
                nucleotideChange,
                variantAlleleFrequency,
                ID: customid,
                tier
              });

            }

          } else if (type === 'amplification') {

            const indexa = this.findGeneInfo(gene);
            const atier = this.findTier(gene);
            console.log(' ####### [697][amplification] ', gene, indexa, atier);
            if (indexa !== -1) {
              const cytoband = this.filteredOriginData[indexa].cytoband.split(')');
              this.amplifications.push({
                gene: this.filteredOriginData[indexa].gene,
                region: cytoband[0] + ')',
                copynumber: cytoband[1],
                tier: atier
              });
            }
          } else if (type === 'fusion') {
            let oncomine;
            // if (gene === 'PTPRZ1-MET') {
            //   // gene = 'PTPRZ1(1) - MET(2)';
            // }
            // const index = this.findGeneInfo(gene);
            const index = this.findFusionInfo(gene);
            const ftier = this.findTier(gene);
            console.log('****** [719][FUSION][', type, gene, index);

            if (index !== -1) {  // 여기주의
              if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
                oncomine = 'Loss';
              } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
                oncomine = 'Gain';
              }

              this.fusion.push({
                gene: this.filteredOriginData[index].gene,
                breakpoint: this.filteredOriginData[index].locus,
                readcount: this.filteredOriginData[index].readcount,
                functions: oncomine,
                tier: ftier
              });
              // console.log('=====[645][fusion]', this.fusion);
            }

          }

        });

        if (this.mutation.length) {
          console.log('====== [742][mutation]', this.mutation);
          this.mutation.forEach((mItem, index) => {
            this.mutationLists().push(this.createMutaion(mItem, index.toString()));
          });
        }

        if (this.amplifications.length) {
          console.log('###### [742][amplifications]', this.amplifications);
          this.amplifications.forEach((aItem, index) => {
            this.amplificationsLists().push(this.createAmplifications(aItem, index.toString()));
          });
        }


        if (this.fusion.length) {
          console.log('******* [757][fusion]', this.fusion);
          this.fusion.forEach((fItem, index) => {
            this.fusionLists().push(this.createFusion(fItem, index.toString()));
          });
        } else {
          this.fusion = [];
          // console.log('[614][initByFile][fusion]', this.fusion.length);

        }

        this.prevalent.forEach(item => {
          console.log('-------[852][트림검사]');
          const members = item.trim().split(',');
          console.log('-------[854][트림검사]');
          const temps = members[0].split(' ');
          console.log('-------[856][트림검사]');
          const gene = temps[0].trim().replace(/"/g, '');
          console.log('-----[858][트림검사]', gene);
          const type = temps[1].trim().replace(/"/g, '');
          console.log('-------[849][트림검사]');
          // console.log('[561][prevalent]', gene, type);
          if (type.charAt(0) === 'p') {
            let customid = '';
            let variantAlleleFrequency = '';
            const items = members[0].split(' ');
            let aminoAcidchange = items[1];
            const tempaminoAcidchange = items[1];
            const nucleotidechange = items[2];

            // console.log('[546][prevalent]', gene, aminoAcidchange, nucleotidechange);
            // 유전자와 nucleotidechange 2개로 찿는다.
            const indexm = this.withGeneCoding(gene, nucleotidechange);

            if (indexm !== -1) {
              customid = this.filteredOriginData[indexm].variantID;
              if (customid === undefined || customid === null) { customid = ''; }

              variantAlleleFrequency = this.filteredOriginData[indexm].frequency;
              if (variantAlleleFrequency === undefined || variantAlleleFrequency === null || variantAlleleFrequency === '') {
                variantAlleleFrequency = '';
              }
              if (gene === 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Splicing mutant';
              } else {
                // aminoAcidchange 값이 없으면 원래것을 사용
                aminoAcidchange = this.filteredOriginData[indexm].aminoAcidChange;
                if (aminoAcidchange === undefined || aminoAcidchange === null || aminoAcidchange === '') {
                  aminoAcidchange = tempaminoAcidchange;
                }

              }
            } else {
              if (gene === 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Promotor mutant';
              } else if (gene !== 'TERT' && tempaminoAcidchange === 'p.(?)') {
                aminoAcidchange = 'Splicing mutant';
              }
              customid = '';
            }

            const result = this.removeGeneCheck(gene, aminoAcidchange, nucleotidechange);
            if (result === -1) {
              //  vc.novel.1169, 계열은 ID 에 빈공간으로 만듬.
              if (customid.indexOf('vc.novel') !== -1) {
                customid = '';
              }
              // console.log('[680][vc.novel] ', customid);
              let tempVariantAlleleFrequency;
              if (variantAlleleFrequency.length === 0) {
                tempVariantAlleleFrequency = variantAlleleFrequency;
              } else {
                tempVariantAlleleFrequency = variantAlleleFrequency + '%';
              }
              this.imutation.push({
                gene,
                aminoAcidChange: aminoAcidchange,
                nucleotideChange: nucleotidechange,
                variantAlleleFrequency: tempVariantAlleleFrequency,
                ID: customid,
                tier: ''
              });
            }

          } else if (type === 'amplification') {
            const indexa = this.findGeneInfo(gene);
            console.log(' ######[840][prevelant][amplification] ', gene);
            if (indexa !== -1) {
              const cytoband = this.filteredOriginData[indexa].cytoband.split(')');
              this.iamplifications.push({
                gene: this.filteredOriginData[indexa].gene,
                region: cytoband[0] + ')',
                copynumber: cytoband[1],
                note: ''
              });
            }
          } else if (type === 'fusion') {
            let oncomine;
            // if (gene === 'PTPRZ1-MET') {
            // gene = 'PTPRZ1(1) - MET(2)';
            // }
            const index = this.findFusionInfo(gene);

            // const index = this.findGeneInfo(gene);

            if (index !== -1) {
              if (this.filteredOriginData[index].oncomine === 'Loss-of-function') {
                oncomine = 'Loss';
              } else if (this.filteredOriginData[index].oncomine === 'Gain-of-function') {
                oncomine = 'Gain';
              }
              this.ifusion.push({
                gene: this.filteredOriginData[index].gene,
                breakpoint: this.filteredOriginData[index].locus,
                readcount: this.filteredOriginData[index].readcount,
                functions: oncomine
              });
            }
          }
        });

        if (this.imutation.length) {
          console.log('===== [876][prevalent][imutation]', this.imutation);
          this.imutation.forEach((mItem, index) => {
            this.imutationLists().push(this.createIMutaion(mItem, index.toString()));
          });
        }

        if (this.iamplifications.length) {
          console.log('######## [883][prevalent][iamplifications]', this.iamplifications);
          this.iamplifications.forEach((aItem, index) => {
            this.iamplificationsLists().push(this.createIAmplifications(aItem, index.toString()));
          });
        }

        if (this.ifusion.length) {
          console.log('******* [890][prevalent][ifusion]', this.ifusion);
          this.ifusion.forEach((fItem, index) => {
            this.ifusionLists().push(this.createIFusion(fItem, index.toString()));
          });
        }

      }); // End of Subscirbe;

  }

  /*

    */
  withGeneCoding(gene: string, coding: string): number {
    const idx = this.filteredOriginData.findIndex(item => item.gene === gene && item.coding === coding);
    return idx;
  }
  // Fusion 검색은 variant ID 값을 파싱하여 비교한다.
  //
  findFusionInfo(gene: string): number {
    const idx = this.filteredOriginData.findIndex(item => gene === item.variantID.split('.')[0]);
    return idx;
  }


  findGeneInfo(gene: string): number {
    let tempGene;
    if (gene === 'PTPRZ1-MET') {
      tempGene = 'PTPRZ1(1) - MET(2)';
      gene = tempGene;
    } else if (gene === 'KIF5B-RET') {
      tempGene = 'KIF5B(18) - RET(12)';
      gene = tempGene;
    }
    const idx = this.filteredOriginData.findIndex(item => item.gene === gene);
    return idx;
  }

  // tslint:disable-next-line:member-ordering
  private visitedGene = [];
  findFrequency(gene): string {
    console.log('[1012]', this.visitedGene, gene);
    const ix = this.visitedGene.findIndex(name => name === gene);
    if (ix === -1) {
      const idx = this.clinical.findIndex(list => list.gene === gene);
      if (idx === -1) {
        this.visitedGene.push(gene);
        return 'none';
      }
      this.visitedGene.push(gene);
      return this.clinical[idx].frequency;
    } else {
      return this.findBackFrequency(gene);
    }

  }

  findBackFrequency(gene): string {
    // const idx = this.clinical.lastIndexOf(gene);
    const idx = this.clinical.reverse().findIndex(list => list.gene === gene);
    console.log('[1027][findBackFrequency]' + idx);
    if (idx === -1) {
      return 'none';
    }
    return this.clinical[idx].frequency;
  }

  findTier(gene): string {
    // console.log('[246][findTier]', this.clinical, gene);
    const idx = this.clinical.findIndex(list => list.gene === gene);
    // console.log('[248][findTier]', this.clinical[idx]);
    if (idx === -1) {
      return 'none';
    }
    return this.clinical[idx].tier;
  }
  ///////////////////////////////////////
  // DNA and RNA extraction

  setDNAandRNAextraction(dna: string): void {
    // console.log('[663][setDNAandRNAextraction]', dna);
    this.extraction.dnarna = dna;
  }

  // tslint:disable-next-line:variable-name
  setManagementNum(rel_pathology_num: string): void {
    this.extraction.managementNum = rel_pathology_num;
    console.log('********* [906][환자병리번호]', this.extraction.managementNum);
  }

  setKeyblock(keyblock: string): void {
    this.extraction.keyblock = keyblock;
  }

  setTumorpercentage(percentage): void {
    // const temp = percentage[percentage.length - 1];
    // console.log('[909][PERCENTAGE] ', percentage);
    // if (temp === '%') {
    //   this.extraction.tumorcellpercentage = percentage.slice(0, -1);
    // } else {
    // 
    // }
    const per = percentage.replace('/\%/g', '');
    this.extraction.tumorcellpercentage = per;
    console.log('******* [916][PERCENTAGE] ', this.extraction.tumorcellpercentage);
  }
  setOrgan(organ: string): void {
    // console.log('[672][setDNAandRNAextraction]', organ);
    this.extraction.organ = organ;
  }

  setTumorType(type: string): void {
    this.extraction.tumortype = type;
  }

  setDiagnosis(diagnosis: string): void {
    console.log('[901][diagnosis]', diagnosis);
    this.extraction.diagnosis = diagnosis;
  }
  diagnosisFocus(): void {
    this.diagnosis.selectionStart += 30;
    console.log('======= [diagnosi]', this.extraction.diagnosis);
  }

  convertFormData(): void {
    const mControl = this.mutationForm.get('mutationLists') as FormArray;
    // this.mutation = mControl.getRawValue();
    const tempMu = mControl.getRawValue();
    const tempMuLen = tempMu.length;
    this.mutation = [];
    if (tempMuLen > 0) {
      tempMu.forEach((item, index) => {
        item.seq = index;
        this.mutation.push(item);
      });
    }

    const aControl = this.amplificationsForm.get('amplificationsLists') as FormArray;
    // this.amplifications = aControl.getRawValue();
    const tempAm = aControl.getRawValue();
    const tempAmLen = tempAm.length;
    this.amplifications = [];
    if (tempAmLen > 0) {
      tempAm.forEach((item, index) => {
        item.seq = index;
        this.amplifications.push(item);
      });
    }

    const fControl = this.fusionForm.get('fusionLists') as FormArray;
    // this.fusion = fControl.getRawValue();
    const tempFu = fControl.getRawValue();
    const tempFuLen = tempFu.length;
    this.fusion = [];
    if (tempFuLen > 0) {
      tempFu.forEach((item, index) => {
        item.seq = index;
        this.fusion.push(item);
      });
    }

    const imControl = this.imutationForm.get('imutationLists') as FormArray;
    // this.imutation = imControl.getRawValue();

    const tempIMu = imControl.getRawValue();
    const tempIMuLen = tempIMu.length;
    this.imutation = [];
    if (tempIMuLen > 0) {
      tempIMu.forEach((item, index) => {
        item.seq = index;
        this.imutation.push(item);
      });
    }

    const iaControl = this.iamplificationsForm.get('iamplificationsLists') as FormArray;
    // this.iamplifications = iaControl.getRawValue();
    const tempIAm = iaControl.getRawValue();
    const tempIAmLen = tempIAm.length;
    this.iamplifications = [];
    if (tempIAmLen > 0) {
      tempIAm.forEach((item, index) => {
        item.seq = index;
        this.iamplifications.push(item);
      });
    }

    const ifControl = this.ifusionForm.get('ifusionLists') as FormArray;
    // this.ifusion = ifControl.getRawValue();
    this.ifusion = [];
    const tempIFu = ifControl.getRawValue();
    const tempIFuLen = tempIFu.length;
    if (tempIFu.length > 0) {
      tempIFu.forEach((item, index) => {
        item.seq = index;
        this.ifusion.push(item);
      });
    }

  }

  /////////////////////////////////////////////////////////////
  // tslint:disable-next-line: typedef
  sendEMR() {
    const userid = localStorage.getItem('pathuser');
    this.convertFormData();
    console.log('[1064][Burden/MSI', this.tumorMutationalBurden, this.msiScore);
    console.log('[1064][검사자/확인자]', this.examedno, this.examedname, this.checkeredno, this.checkername);
    console.log('[1065][SER]', this.basicInfo);
    console.log('[1066][SER]', this.extraction, this.mutation, this.amplifications,
      this.fusion, this.imutation, this.iamplifications, this.ifusion);

    const form = makeReport(
      this.examedno,    // 검사자 번호
      this.examedname,  // 검사자 이름
      this.checkeredno, // 확인자 번호
      this.checkername, // 확인자 이름
      this.dnanrna,
      this.organ,
      this.basicInfo,
      this.extraction,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.tumorMutationalBurden,
      this.msiScore,
      this.generalReport,
      this.specialment,
      this.notement
    );
    console.log(form);

    // this.searchService.resetscreenstatus(this.pathologyNum, '3')
    //   .subscribe(data => {
    //     this.screenstatus = '3';
    //   });

    // NU로 데이터 전송
    this.pathologyService.sendEMR(this.patientInfo, form).subscribe(data => {
      // const message = data;
      // const result1 = converter.xml2json( message, { compact: true, spaces: 2 });
      console.log('[1121][sendEMR 보낸결과]', data);
      // alert(data);
      alert('EMR로 전송했습니다.');
      this.router.navigate(['/pathology']);
    });

    this.subs.sink = this.searchService.finishPathologyEMRScreen(this.patientInfo.pathology_num, userid)
      .subscribe(data => {
        console.log('[1101][][finishPathologyEMRScreen]', data);
        if (data.message === 'SUCCESS') {
          // alert(data);
          // this.router.navigate(['/pathology']);
        }
      });

  }

  mutationTier(index: number, i: string): void {
    this.mutation[index].tier = i;
  }

  amplificationTier(index: number, i: string): void {
    this.amplifications[index].tier = i;
  }

  fusionTier(index: number, i: string): void {
    this.fusion[index].tier = i;
  }
  imutationTier(index: number, i: string): void {
    this.imutation[index].tier = i;
  }

  ifusionTier(index: number, i: string): void {
    this.ifusion[index].tier = i;
  }


  checked(rechecked: string): void {
    const reck = rechecked.split('_');
    this.checkeredno = reck[0];
    this.checkername = reck[1];

    this.searchService.updatePickselect(this.checkeredno, 'Y', 'D')
      .subscribe(data => {
        console.log('[1150][checked]', data);
      });

    this.patientInfo.recheck = rechecked;
    console.log('[1154][Rechecked][]', this.checkername, this.checkeredno);
  }

  examimed(examin: string): void {
    const exam = examin.split('_');
    this.examedno = exam[0];
    this.examedname = exam[1];

    this.searchService.updatePickselect(this.examedno, 'Y', 'T')
      .subscribe(data => {
        console.log('[1143][Examine]', data);
      });

    this.patientInfo.examin = examin;
    this.examin = examin;
    console.log('[1145][Examine][]', exam, this.examedname, this.examedno);
  }

  // tslint:disable-next-line: typedef
  savePathologyData() {
    this.convertFormData();

    console.log('[1128][1차전송][savePathologyData][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[1182][1차전송][환자정보][patientInfo]', this.patientInfo);
    console.log('[1182][1차전송][savePathologyData][검체정보][extraction]', this.extraction);
    console.log('[1182][1차전송][savePathologyData][MUTATION]', this.mutation);
    console.log('[1182][1차전송][savePathologyData][AMFLIFICATIONS]', this.amplifications);
    console.log('[1182][1차전송][savePathologyData][FUSION]', this.fusion);
    console.log('[1182][1차전송][savePathologyData][I-MUTAION]', this.imutation);
    console.log('[1182][1차전송][savePathologyData][I-AMPLIFICATIONS]', this.iamplifications);
    console.log('[1182][1차전송][savePathologyData][I-FUSION]', this.ifusion);
    console.log('[1182][1차전송][savePathologyData][멘트][ment]', this.generalReport, this.specialment, this.notement);
    console.log('[1182][1차전송][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);
    console.log('[검체번호]', this.pathologyNum);


    this.subs.sink = this.savepathologyService.savePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notement
    )
      .subscribe(data => {
        console.log('[1182][savePathologyData]', data);
        if (data.info === 'SUCCESS') {
          alert('저장 했습니다.');
          this.store.setDBSaved(true);

          // this.searchService.resetscreenstatus(this.pathologyNum, '1')
          //   .subscribe(data => {
          //     this.screenstatus = '1';
          //   });
          this.subs.sink = this.searchService.screenPathologyEmrUpdate(this.basicInfo.pathologyNum)
            .subscribe(datas => {
              console.log('[1189][savePathologyData][screenPathologyEmrUpdate]', datas);
              this.router.navigate(['/pathology']);
            });
        }
      });

  }

  updatePathologyData() {
    this.convertFormData();

    console.log('[1227][report][updatePathologyData][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[1227][updatePathologyData][환자정보][patientInfo]', this.patientInfo);
    console.log('[1227][report][updatePathologyData][검체정보][extraction]', this.extraction);
    console.log('[1227][report][updatePathologyData][mutaion]', this.mutation);
    console.log('[1227][report][updatePathologyData][amplifications]', this.amplifications);
    console.log('[1227][report][updatePathologyData][fusion]', this.fusion);
    console.log('[1227][report][updatePathologyData][imutation]', this.imutation);
    console.log('[1227][report][updatePathologyData][iamplifications]', this.iamplifications);
    console.log('[1227][report][updatePathologyData][ifusion]', this.ifusion);
    console.log('[1227][report][updatePathologyData][멘트][ment]', this.generalReport, this.specialment, this.notement);
    console.log('[1227][updatePathologyData][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);

    this.subs.sink = this.savepathologyService.updatePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notement
    ).subscribe(data => {
      console.log('[1219][savePathologyData]', data);
      if (data.info === 'SUCCESS') {
        alert('저장 했습니다.');
        this.store.setDBSaved(true);

        // this.searchService.resetscreenstatus(this.pathologyNum, '2')
        //   .subscribe(msg => {
        //     this.screenstatus = '2';
        //     console.log('[]', msg.message);
        //   });

        this.subs.sink = this.searchService.screenPathologyUpdate(this.basicInfo.pathologyNum)
          .subscribe(datas => {
            console.log('[1226][savePathologyData][screenPathologyEmrUpdate]', datas);
            this.router.navigate(['/pathology']);
          });
      }
    });

  }
  ////////////////////////////////////////////////////////////////////////////////////////////
  tempSave(): void {
    this.convertFormData();

    console.log('[1141][report][tempSave][환자정보][this.basicInfo]', this.basicInfo);
    console.log('[1141][tempSave][환자정보][patientInfo]', this.patientInfo);
    console.log('[1141][report][tempSave][검체정보][extraction]', this.extraction);
    console.log('[1141][report][tempSave][mutaion]', this.mutation);
    console.log('[1141][report][tempSave][amplifications]', this.amplifications);
    console.log('[1141][report][tempSave][fusion]', this.fusion);
    console.log('[1141][report][tempSave][imutation]', this.imutation);
    console.log('[1141][report][tempSave][iamplifications]', this.iamplifications);
    console.log('[1141][report][tempSave][ifusion]', this.ifusion);
    console.log('[1141][report][tempSave][멘트][ment]', this.generalReport, this.specialment, this.notement);
    console.log('[1141][tempSave][검수자/확인자][]', this.examedname, this.examedno, this.checkername, this.checkeredno);

    this.subs.sink = this.savepathologyService.updatePathologyData(
      this.basicInfo.pathologyNum,
      this.patientInfo,
      this.mutation,
      this.amplifications,
      this.fusion,
      this.imutation,
      this.iamplifications,
      this.ifusion,
      this.extraction,
      this.generalReport,
      this.specialment,
      this.notement
    ).subscribe(data => {
      console.log('[1267][tempSave]', data);
      if (data.info === 'SUCCESS') {
        alert('저장 했습니다.');
        this.store.setDBSaved(true);

        this.searchService.resetscreenstatus(this.pathologyNum, '2')
          .subscribe(msg => {
            this.screenstatus = '2';
            console.log('[]', msg.message);
          });
      }
    });


  }

  ////////////////////////////////////////////////////////////////////////////////////////////
  // mutationForm

  createMutaion(mutation: IMutation, index: string): FormGroup {
    // console.log('[617][][createMutaion][mutation]', mutation);
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier,
      seq: index
    });
  }

  mutationLists(): FormArray {
    return this.mutationForm.get('mutationLists') as FormArray;
  }

  newMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: '',
      seq: ''
    });
  }

  addMutation(): void {
    this.mutationLists().push(this.newMutation());
    this.mutation.push({
      gene: '', aminoAcidChange: '', nucleotideChange: '', variantAlleleFrequency: '', ID: '', seq: ''
    });
    const len = this.mutationLists().getRawValue().length;
    console.log('[1233][addMutation]', len);
    if (len > 0) {
      this.noneMu = '';
    } else {
      this.noneMu = 'None';
    }

    console.log('[1307][addMutation]', len, this.noneMu);
  }

  removeMutation(i: number): void {
    this.mutationLists().removeAt(i);
    this.mutation.splice(i, 1);
    const len = this.mutationLists().getRawValue().length;
    if (len === 0) {
      this.noneMu = 'None';
    } else {
      this.noneMu = '';
    }
    console.log('[1316][removeMutation]', len, this.noneMu);
  }
  /////////////////////////////////////////////////////////////////////
  // amplificationsForm

  createAmplifications(amplifications: IAmplification, index: string): FormGroup {
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      tier: amplifications.tier,
      seq: index
    });
  }

  amplificationsLists(): FormArray {
    return this.amplificationsForm.get('amplificationsLists') as FormArray;
  }

  newAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      tier: '',
      seq: ''
    });
  }

  addAmplifications(): void {
    this.amplificationsLists().push(this.newAmplifications());
    this.amplifications.push({
      gene: '', region: '', copynumber: '', tier: '', seq: ''
    });
    const len = this.amplificationsLists().getRawValue().length;
    if (len > 0) {
      this.noneAm = '';
    } else {
      this.noneAm = 'None';
    }
  }

  removeAmplifications(i: number): void {
    this.amplificationsLists().removeAt(i);
    this.amplifications.splice(i, 1);
    const len = this.amplificationsLists().getRawValue().length;
    if (len === 0) {
      this.noneAm = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////
  // fusionForm

  createFusion(fusion: IFusion, index: string): FormGroup {
    // console.log('[925][fusion][3][createFusion 호출]', fusion);
    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      functions: fusion.functions,
      tier: fusion.tier,
      seq: index
    });
  }

  fusionLists(): FormArray {
    // console.log('[936][fusion][2][fusionLists 호출]');
    return this.fusionForm.get('fusionLists') as FormArray;
  }

  newFusion(): FormGroup {
    // console.log('[941][fusion][newFusion]');
    return this.fb.group({
      gene: '',
      breakpoint: '',
      readcount: '',
      functions: '',
      tier: '',
      seq: ''
    });
  }

  addFusion(): void {
    this.fusionLists().push(this.newFusion());
    this.fusion.push({
      gene: '', breakpoint: '', functions: '', tier: '', seq: ''
    });
    const len = this.fusionLists().getRawValue().length;
    if (len > 0) {
      this.noneFu = '';
    } else {
      this.noneFu = 'None';
    }
  }

  removeFusion(i: number): void {
    this.fusionLists().removeAt(i);
    this.fusion.splice(i, 1);
    const len = this.fusionLists().getRawValue().length;
    if (len === 0) {
      this.noneFu = 'None';
    } else {
      this.noneFu = '';
    }
  }

  ////////////////////////////////////////////////////////////////////
  // imutationForm
  createIMutaion(mutation: IMutation, index: string): FormGroup {
    return this.fb.group({
      gene: mutation.gene,
      aminoAcidChange: mutation.aminoAcidChange,
      nucleotideChange: mutation.nucleotideChange,
      variantAlleleFrequency: mutation.variantAlleleFrequency,
      ID: mutation.ID,
      tier: mutation.tier,
      seq: index
    });
  }

  imutationLists(): FormArray {
    return this.imutationForm.get('imutationLists') as FormArray;
  }

  newIMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: '',
      seq: ''
    });
  }

  addIMutation(): void {
    this.imutationLists().push(this.newIMutation());
    this.imutation.push({
      gene: '', aminoAcidChange: '', nucleotideChange: '', variantAlleleFrequency: '', ID: '', tier: '', seq: ''
    });
    const len = this.imutationLists().getRawValue().length;
    console.log('[1436][ addIMutation]', len);
    if (len > 0) {
      this.noneIMu = '';
    } else {
      this.noneIMu = 'None';
    }
  }

  removeIMutation(i: number): void {
    this.imutationLists().removeAt(i);
    this.imutation.splice(i, 1);
    const len = this.imutationLists().getRawValue().length;
    console.log('[1447][removeIMutation]', len);
    if (len === 0) {
      this.noneIMu = 'None';
    }
  }

  /////////////////////////////////////////////////////////////////////
  // iamplificationsForm
  createIAmplifications(amplifications: IIAmplification, index: string): FormGroup {
    // console.log('[942][createIAmplifications][amplifications]', amplifications);
    return this.fb.group({
      gene: amplifications.gene,
      region: amplifications.region,
      copynumber: amplifications.copynumber,
      note: amplifications.note,
      seq: index
    });
  }

  iamplificationsLists(): FormArray {
    return this.iamplificationsForm.get('iamplificationsLists') as FormArray;
  }

  newIAmplifications(): FormGroup {
    return this.fb.group({
      gene: '',
      region: '',
      copynumber: '',
      note: '',
      seq: ''
    });
  }

  addIAmplifications(): void {
    this.iamplificationsLists().push(this.newIAmplifications());
    this.iamplifications.push({
      gene: '', region: '', copynumber: '', note: '', seq: ''
    });
    const len = this.iamplificationsLists().getRawValue().length;
    if (len > 0) {
      this.noneIAm = '';
    } else {
      this.noneIAm = 'None';
    }
  }

  removeIAmplifications(i: number): void {
    this.iamplificationsLists().removeAt(i);
    this.iamplifications.splice(i, 1);
    const len = this.iamplificationsLists().getRawValue().length;
    if (len === 0) {
      this.noneIAm = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////
  // ifusionForm
  /*

  */
  createIFusion(fusion: IFusion, index: string): FormGroup {
    // console.log('===== [1471][ createIFusion]', fusion);

    return this.fb.group({
      gene: fusion.gene,
      breakpoint: fusion.breakpoint,
      functions: fusion.functions,
      tier: fusion.tier,
      seq: index
    });
  }

  ifusionLists(): FormArray {
    return this.ifusionForm.get('ifusionLists') as FormArray;
  }

  newIFusion(): FormGroup {
    return this.fb.group({
      gene: '',
      breakpoint: '',
      functions: '',
      tier: '',
      seq: ''
    });
  }

  addIFusion(): void {
    this.ifusionLists().push(this.newIFusion());
    this.ifusion.push({
      gene: '', breakpoint: '', functions: '', tier: '', seq: ''
    });
    const len = this.ifusionLists().getRawValue().length;
    if (len > 0) {
      this.noneIFu = '';
    } else {
      this.noneIFu = 'None';
    }
  }

  removeIFusion(i: number): void {
    this.ifusionLists().removeAt(i);
    this.ifusion.splice(i, 1);
    const len = this.ifusionLists().getRawValue().length;
    if (len === 0) {
      this.noneIFu = 'None';
    }
  }
  ////////////////////////////////////////////////////////////////////

  today(): string {
    const today = new Date();

    const year = today.getFullYear(); // 년도
    const month = today.getMonth() + 1;  // 월
    const date = today.getDate();  // 날짜

    const newmon = ('0' + month).substr(-2);
    const newday = ('0' + date).substr(-2);
    const now = year + '.' + newmon + '.' + newday;

    return now;
  }

  /*
    getStatus(index): boolean {
      // console.log('[661][getStatus]', index, this.screenstatus);
      if (index === 1) {
        if (parseInt(this.screenstatus, 10) === 0) {
          return false;
        } else if (parseInt(this.screenstatus, 10) === 1) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 2) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 3) {
          return true;
        }
  
      } else if (index === 2) {
        if (parseInt(this.screenstatus, 10) === 0) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 1) {
          return false;
        } else if (parseInt(this.screenstatus, 10) === 2) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 3) {
          return true;
        }
      } else if (index === 3) {
        if (parseInt(this.screenstatus, 10) === 0) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 1) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 2) {
          return false;
        } else if (parseInt(this.screenstatus, 10) === 3) {
          return true;
        }
      } else if (index === 4) {
        if (parseInt(this.screenstatus, 10) === 0) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 1) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 2) {
          return true;
        } else if (parseInt(this.screenstatus, 10) === 3) {
          return false;
        }
      }
  
    }
   */
  reset(): void {

    this.searchService.resetscreenstatus(this.pathologyNum, '0')
      .subscribe(data => {
        if (data.message === 'SUCCESS') {
          this.mutationLists().clear();
          this.amplificationsLists().clear();
          this.fusionLists().clear();
          this.imutationLists().clear();
          this.iamplificationsLists().clear();
          this.ifusionLists().clear();
          this.loadForm();

          this.mutation = [];
          this.amplifications = [];
          this.fusion = [];
          this.imutation = [];
          this.iamplifications = [];
          this.ifusion = [];

          this.generalReport = '';
          this.specialment = '';
          this.tumorMutationalBurden = '';
          this.msiScore = '';
          this.tumorcellpercentage = '';
          this.extraction = {
            dnarna: '',
            keyblock: '',
            managementNum: '',
            tumorcellpercentage: '',
            organ: '',
            tumortype: '',
            diagnosis: ''
          };
          this.init(this.pathologyNum);
          console.log(this.screenstatus);
        }
      });

    /*
    this.patientsListService.resetscreenstatus(this.form2TestedId, '0')
      .subscribe(data => {
        console.log('reset:', data);
        this.patientsListService.getScreenStatus(this.form2TestedId)
          .subscribe(msg => {
            this.screenstatus = msg.screenstatus;
            // 초기화
            const control = this.tablerowForm.get('tableRows') as FormArray;
            control.clear();
            // 코멘트 초기화
            this.commentsRows().clear();
            // 싱글 코멘트 초기화
            this.singleCommentsRows().clear();
            this.init(this.form2TestedId);

          });
      });
      */
  }

  getStatus(index): boolean {
    // console.log('[661][getStatus]', index, this.screenstatus);
    if (index === 1) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }

    } else if (index === 2) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    } else if (index === 3) {
      if (parseInt(this.screenstatus, 10) === 0) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 1) {
        return true;
      } else if (parseInt(this.screenstatus, 10) === 2) {
        return false;
      } else if (parseInt(this.screenstatus, 10) === 3) {
        return true;
      }
    }
  }

  removeGeneCheck(gene: string, amion: string, nucleotide: string): number {
    const result = this.polymorphismList.findIndex(item =>
      item.gene === gene && item.aminoAcidChange === amion && item.necleotideChange === nucleotide
    );
    return result;
  }

  tumormutationalburdenChange(burden: string): void {
    this.extraction.tumorburden = burden;
  }

  msiScoreChange(msiscore: string): void {
    this.extraction.msiscore = msiscore;
  }
  ///////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////






}
