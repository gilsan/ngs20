import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';

import {
  IComment, IDList, IFilteredTSV, IGeneCoding,
  IGeneList,
  IPatient, IProfile, IRecoverVariants
} from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map, filter, last } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeBForm, METHODS } from 'src/app/home/models/bTypemodel';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { StoreService } from '../store.current';
import { ExcelService } from 'src/app/home/services/excelservice';

import { MatDialog } from '@angular/material/dialog';
import { DialogOverviewExampleDialogComponent } from '../dialog-overview-example-dialog/dialog-overview-example-dialog.component';
import { makeAForm } from 'src/app/home/models/aTypemodel';
import { UtilsService } from '../commons/utils.service';
import { CommentsService } from 'src/app/services/comments.service';

@Component({
  selector: 'app-form2',
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.scss']
})
export class Form2Component implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('examine', { static: true }) examine: ElementRef;
  @ViewChild('rechecked', { static: true }) rechecked: ElementRef;

  requestDate: string; // 검사의뢰일
  form2TestedId: string;
  filteredTSV$: Observable<IFilteredTSV[]>;

  tsvLists: IFilteredTSV[] = [];
  patientInfo: IPatient;
  geneCoding: IGeneCoding[];
  detactedVariants: IAFormVariant[] = [];
  recoverVariants: IRecoverVariants[] = [];
  checkboxStatus = []; // 체크박스 on 인것
  ngsData = [];
  private subs = new SubSink();

  resultStatus = 'Not Detected';
  fusion = '';
  flt3itd = '';
  chronmosomal = '';
  methods = METHODS;
  general = GENERAL;
  indexNum = 0;
  selectedItem = 'mutation';
  tsvInfo: IFilteredTSV;
  profile: IProfile = { leukemia: '', flt3itd: '', chron: '' };
  // tslint:disable-next-line:variable-name
  variant_id: string;
  tempid: string;
  ment = '';

  mockData: IAFormVariant[] = [];

  tablerowForm: FormGroup;
  // singleCommentForm: FormGroup;
  control: FormArray;
  listForm: FormGroup;

  lists: IDList[];

  spcno = '';
  pid = '';
  examcd = '';
  userid = '';
  rsltdesc = '';
  screenstatus: string;
  specimenMsg: string;
  specimenMessage: string;

  comments: IComment[] = [];
  tempCommentGene = '';
  tempCommentVariants = '';
  tempCommentreference = '';
  tempCommentComment = '';
  vusstatus = false;
  preview = true;
  isVisible = false;

  examin = ''; // 검사자
  recheck = ''; // 확인자

  animal: string;
  name: string;
  sendEMR = 0; // EMR 보낸 수
  firstReportDay = ''; // 검사보고일
  lastReportDay = '';  // 수정보고일
  reportType: string; // AML ALL

  genelists: IGeneList[] = [];

  // tslint:disable-next-line:max-line-length
  vusmsg = `VUS는 ExAC, KRGDB등의 Population database에서 관철되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.`;

  @ViewChild('commentbox') private commentbox: TemplateRef<any>;
  @ViewChild('box100', { static: true }) box100: ElementRef;
  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder,
    private variantsService: DetectedVariantsService,
    private store: StoreService,
    private excel: ExcelService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private commentsService: CommentsService
  ) { }

  ngOnInit(): void {
    this.findType();
    this.box100.nativeElement.scrollLeft += 250;


    this.initLoad();
    if (parseInt(this.screenstatus, 10) >= 1 || parseInt(this.screenstatus, 10) === 2) {
      this.recoverDetected();
    } else {
      this.init(this.form2TestedId);
    }

    this.loadForm();

  } // End of ngOninit

  ngAfterViewInit(): void {
    // this.checker();
  }

  findType(): void {
    this.route.paramMap.pipe(
      filter(data => data !== null || data !== undefined),
      map(route => route.get('type'))
    ).subscribe(data => {
      console.log('[138][findType]', data);
      this.reportType = data;
      this.getGeneList(this.reportType); // 진검 유전자 목록 가져옴.
    });
  }

  loadForm(): void {
    // console.log('[120][loadForm] ', this.comments);
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
      commentsRows: this.fb.array([])
    });
  }

  initLoad(): void {
    // 검진부서원 리스트 스토어에서 가져옴.
    // this.lists = this.store.getDiagList();

    const lists$ = this.utilsService.getDiagList()
      .pipe(shareReplay());

    lists$.pipe(
      map(lists => lists.filter(list => list.part === 'D'))
    ).subscribe(data => {
      const len = data.length - 1;
      data.forEach((list, index) => {
        if (index === len) {
          this.recheck = this.recheck + list.user_nm + ' M.D.';
        } else {
          this.recheck = this.recheck + list.user_nm + ' M.D./';
        }
      });
    });

    lists$.pipe(
      map(lists => lists.filter(list => list.part === 'T'))
    ).subscribe(data => {
      const len = data.length - 1;
      data.forEach((list, index) => {
        if (index === len) {
          this.examin = this.examin + list.user_nm + ' M.T.';
        } else {
          this.examin = this.examin + list.user_nm + ' M.T./';
        }
      });
    });

    /*
    .subscribe(data => {
  const len = data.length - 1;
  data.forEach((list, index) => {
    if (index === len) {
      if (list.part === 'D') {
        this.recheck = this.recheck + list.user_nm + ' M.D';
      } else if (list.part === 'T') {
        this.examin = this.examin + list.user_nm + ' M.T';
      }
    } else {
      if (list.part === 'D') {
        this.recheck = this.recheck + list.user_nm + ' M.D./';
      } else if (list.part === 'T') {
        this.examin = this.examin + list.user_nm + ' M.T./';
      }
    }

  });
});
*/
    this.form2TestedId = this.patientsListService.getTestedID();

    // 검사자 정보 가져오기
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }

    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    console.log('[162][환자정보]', this.patientInfo);
    this.store.setPatientInfo(this.patientInfo); // 환자정보 저장
    this.requestDate = this.patientInfo.accept_date;
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    } else if (this.patientInfo.specimen === '004') {
      this.specimenMsg = 'EDTA blood';
      this.specimenMessage = 'Genomic DNA isolated from EDTA blood';
    }

    // 전송횟수, 검사보고일, 수정보고일  저장
    this.setReportdaymgn(this.patientInfo);

    this.screenstatus = this.patientInfo.screenstatus;
    // specimen 015 인경우 Bon marrow
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
      this.store.setSpecimenMsg(this.specimenMsg);
    }
    // 필터링된 tsv 파일 가져오기
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(this.form2TestedId)
      .pipe(
        shareReplay()
      );
    this.subs.sink = this.filteredTSV$.subscribe(data => {
      // console.log('[168][form2][fileredTSVFile]', data);
      this.tsvLists = data;
    });

  }

  // ALL/AML 유전자 목록 가져오기
  getGeneList(type: string): any {
    this.utilsService.getGeneList(type).subscribe(data => {
      this.genelists = data;
    });
  }
  ////////////////////////////////////////
  recoverDetected(): void {
    // 디비에서 detected variant_id 와 comments 가져오기
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      this.recoverVariants = data;
      console.log('[204][form2][detected variant_id]', this.recoverVariants);
      this.store.setDetactedVariants(data); // detected variant 저장
      this.recoverVariants.forEach(item => {
        this.recoverVariant(item);  // 354
        if (item.functional_impact === 'VUS') {
          this.vusstatus = true;
          this.store.setVUSStatus(this.vusstatus);
        } else {
          this.store.setVUSStatus(this.vusstatus);
          this.vusstatus = false;
        }
      });
      this.putCheckboxInit(); // 체크박스 초기화
    });


    // 코멘트 가져오기
    this.subs.sink = this.variantsService.screenComment(this.form2TestedId)
      .subscribe(dbComments => {
        if (dbComments !== undefined && dbComments !== null && dbComments.length > 0) {
          console.log('[247][COMMENT 가져오기]', dbComments);
          dbComments.forEach(comment => {

            this.comments.push(
              {
                gene: comment.gene, comment: comment.comment, reference: comment.reference,
                variant_id: comment.variants
              }
            );
            this.commentsRows().push(this.createCommentRow(
              {
                gene: comment.gene, comment: comment.comment, reference: comment.reference,
                variant_id: comment.variants
              }
            ));
          });
          this.store.setComments(this.comments); // comments 저장
        }
      });

    // profile 가져오기
    this.subs.sink = this.variantsService.screenFind(this.form2TestedId)
      .subscribe(profile => {
        if (profile[0].chromosomalanalysis === null) {
          this.profile.chron = '';
        } else {
          this.profile.chron = profile[0].chromosomalanalysis;
        }
        if (this.reportType === 'AML') {
          if (profile[0].FLT3ITD === null) {
            this.profile.flt3itd = '';
          } else {
            this.profile.flt3itd = profile[0].FLT3ITD;
          }
        } else if (this.reportType === 'ALL') {
          if (profile[0].FLT3ITD === null) {
            this.profile.flt3itd = '';
          } else {
            this.profile.flt3itd = profile[0].IKZK1Deletion;
          }
        }


        if (profile[0].leukemiaassociatedfusion === null) {
          this.profile.leukemia = '';
        } else {
          this.profile.leukemia = profile[0].leukemiaassociatedfusion;
        }
        // console.log('[257][variantesService][profile]', this.profile, profile);
      });

    this.subs.sink = this.variantsService.getScreenTested(this.form2TestedId)
      .subscribe(data => {
        if (data !== undefined && data !== null && data.length > 0) {
          this.profile.chron = data[0].chromosomalanalysis;
          this.profile.flt3itd = data[0].FLT3ITD;
          this.profile.leukemia = data[0].leukemiaassociatedfusion;
          this.store.setProfile(this.profile); // profile 저장
          // console.log('[216][profile]', this.profile);
        }
      });

  }

  init(form2TestedId: string): void {

    if (this.form2TestedId) {
      this.subs.sink = this.patientsListService.filtering(this.form2TestedId, this.reportType)
        .subscribe(data => {

          let type: string;
          let gene: string;
          let dvariable: IAFormVariant;
          // console.log('[원시자료][247]', data);

          // 타입 분류
          if (data.mtype === 'M') {  // mutation
            type = 'M';
            if (data.mutationList1.exonIntro !== 'none') {
              dvariable = data.mutationList1;
              // mutaion에 있으면 detected로 표시
              this.resultStatus = 'Detected';
            }
            // dvariable = data.mutationList1;
          } else if (parseInt(data.artifacts1Count, 10) > 0 ||
            parseInt(data.artifacts2Count, 10) > 0) {
            type = 'A';
            // this.resultStatus = 'Not Detected';
          } else if (parseInt(data.benign1Count, 10) > 0 ||
            parseInt(data.benign2Count, 10) > 0) {
            type = 'B';
            // this.resultStatus = 'Not Detected';
          } else {
            type = 'New';
            // this.resultStatus = 'Not Detected';
          }
          if (dvariable) {
            // console.log('[247][form2][dvariable]', dvariable.functional_impact);
            if (dvariable.functional_impact === 'VUS') {
              this.vusstatus = true;
              this.store.setVUSStatus(this.vusstatus); // VUS 상태정보 저장
            } else {
              this.store.setVUSStatus(this.vusstatus);
            }

          }

          // 유전자명
          if (data.gene1 !== 'none' && data.gene2 !== 'none') {
            gene = data.gene1 + ',' + data.gene2;
          } else if (data.gene1 !== 'none' && data.gene2 === 'none') {
            gene = data.gene1;
          } else if (data.gene1 === 'none' && data.gene2 === 'none') {
            gene = data.gene2;
          }

          // comments 분류
          if (data.mtype === 'M') {
            console.log('[327][코멘트]', data, data.commentList1, data.commentList2);
            if (typeof data.commentList1 !== 'undefined' && data.commentList1 !== 'none') {
              if (parseInt(data.comments1Count, 10) > 0) {
                const variant_id = data.tsv.amino_acid_change;
                const comment = { ...data.commentList1, variant_id, type: this.reportType };
                // console.log('[286][코멘트]', comment);
                this.comments.push(comment);
                this.store.setComments(this.comments); // 멘트 저장
                let tempArray = new Array();
                tempArray.push(comment);
                tempArray.forEach(ment => {
                  this.commentsRows().push(this.createCommentRow(ment));
                });
                tempArray = [];
              }
            } else if (typeof data.commentList2 !== 'undefined' && data.commentList2 !== 'none') {
              if (data.comments2Count > 0) {
                const comment = { ...data.commentList2 as any, variant_id: '' };
                this.comments.push(comment);
                this.store.setComments(this.comments); // 멘트 저장
                let tempArray = new Array();
                tempArray.push(comment);
                tempArray.forEach(ment => {
                  this.commentsRows().push(this.createCommentRow(ment));
                });
                tempArray = [];
              }
            }

          }

          this.addVarient(type, dvariable, gene, data.coding, data.tsv);

        }); // End of Subscribe

      // 검사자 정보 가져오기
      this.profile.chron = this.patientInfo.chromosomalanalysis;
      if (this.reportType === 'AML') {
        this.profile.flt3itd = this.patientInfo.FLT3ITD;
      } else if (this.reportType === 'ALL') {
        this.profile.flt3itd = this.patientInfo.IKZK1Deletion;
      }

      this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
      this.store.setProfile(this.profile); // profile 저장

    } else {   // End of form2TestedId loop
      this.patientInfo = {
        id: 0,
        name: '',
        patientID: '',
        age: '',
        gender: '',
        testedNum: '',
        leukemiaAssociatedFusion: '',
        IKZK1Deletion: '',
        chromosomalAnalysis: '',
        targetDisease: '',
        method: '',
        accept_date: '',
        specimen: '',
        request: '',
        tsvFilteredFilename: '',
        FLT3ITD: '',
        specimenNo: '',
        screenstatus: '',
        examin: '',
        recheck: ''
      };
    }
  }

  // 검사일/검사보고일/수정보고일 관리
  setReportdaymgn(patientInfo: IPatient): void {
    // 전송횟수, 검사보고일, 수정보고일  저장
    if (parseInt(patientInfo.sendEMR, 10) > 0) {
      this.sendEMR = Number(this.patientInfo.sendEMR);
      this.firstReportDay = this.patientInfo.sendEMRDate.slice(0, 10);
      this.lastReportDay = this.patientInfo.report_date.slice(0, 10);
    } else {
      this.firstReportDay = this.today();
      this.lastReportDay = '-';
    }
  }

  // AML 유전체 목록 가져오기



  // ALL 유전체 목록 가져오기

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // VUS 검사
  checkVue(): boolean {

    const idx = this.tsvLists.findIndex(item => item.loc1 === 'VUS');
    // console.log('[306][checkVue]', this.tsvLists, idx);
    if (idx === -1) {
      this.ment = '';
      return false;
    }
    return true;
  }

  // tslint:disable-next-line:typedef
  result(event) {
    this.resultStatus = event.srcElement.defaultValue;

  }

  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }


  // 필터링된 tsv 파일 가져오기
  // tslint:disable-next-line: typedef
  getfiteredTSVlist(testedID: string) {
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(testedID);
    this.subs.sink = this.filteredTSV$.subscribe(data => {
      this.tsvLists = data;
    });
  }

  // tslint:disable-next-line: typedef
  addVarient(type: string, item: IAFormVariant, gene: string, coding: string, tsv: IFilteredTSV) {
    let tempvalue;

    if (type === 'M') {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        gene,
        functionalImpact: item.functional_impact,
        transcript: tsv.transcript,
        exonIntro: 'E' + tsv.exon,
        nucleotideChange: coding,
        aminoAcidChange: tsv.amino_acid_change,
        // zygosity: item.zygosity,
        zygosity: 'heterozygous',
        vafPercent: tsv.frequency,
        references: item.reference,
        cosmicID: item.cosmic_id,
      };

    } else {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        gene,
        functionalImpact: '',
        transcript: tsv.transcript,
        exonIntro: 'E' + tsv.exon,
        nucleotideChange: coding,
        aminoAcidChange: tsv.amino_acid_change,
        zygosity: 'heterozygous',
        vafPercent: tsv.frequency,
        references: '',
        cosmicID: ''
      };
    }
    //
    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.store.setDetactedVariants(this.detactedVariants);
    this.addNewRow(tempvalue);

    this.checkboxStatus = [];
    for (let i = 0; i < this.detactedVariants.length; i++) {
      this.checkboxStatus.push(i);
    }
    // this.putCheckboxInit(); // 체크박스 초기화
  }

  recoverVariant(item: IRecoverVariants): void {
    let tempvalue;

    tempvalue = {
      igv: item.igv,
      sanger: item.sanger,
      type: item.type,
      gene: item.gene,
      functionalImpact: item.functional_impact,
      transcript: item.transcript,
      exonIntro: item.exon,
      nucleotideChange: item.nucleotide_change,
      aminoAcidChange: item.amino_acid_change,
      zygosity: item.zygosity,
      vafPercent: item.vaf,
      references: item.reference,
      cosmicID: item.cosmic_id,
      id: item.id
    };

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.addNewRow(tempvalue);

  }

  // 검사자 정보 가져오기
  // tslint:disable-next-line: typedef
  getPatientinfo(testid: string) {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.specimenNo === testid)[0];
    }
    return;
  }

  createRow(item: IAFormVariant): FormGroup {
    return this.fb.group({
      igv: [item.igv],
      sanger: [item.sanger],
      type: [item.type],
      gene: [item.gene],
      functionalImpact: [item.functionalImpact],
      transcript: [item.transcript],
      exonIntro: [item.exonIntro],
      nucleotideChange: [item.nucleotideChange],
      aminoAcidChange: [item.aminoAcidChange],
      zygosity: [item.zygosity],
      vafPercent: [item.vafPercent],
      references: [item.references],
      cosmicID: [item.cosmicID],
      id: [item.id]
    });
  }

  addNewRow(row: IAFormVariant): void {
    // console.log('[544][addNewRow]', row);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }
  //////////////////////////////////////////
  // commentsForm
  ////////////////////////////////////////////
  createCommentRow(comment: IComment): FormGroup {
    return this.fb.group({
      gene: comment.gene,
      comment: comment.comment,
      reference: comment.reference,
      variant_id: comment.variant_id,
      type: this.reportType
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      gene: '',
      comment: '',
      reference: '',
      variant_id: '',
      type: this.reportType
    });
  }

  commentsRows(): FormArray {
    return this.tablerowForm.get('commentsRows') as FormArray;
  }

  addNewCommentRow(): void {
    this.commentsRows().push(this.newCommentRow());
  }

  removeCommentRow(i: number): void {
    this.commentsRows().removeAt(i);
  }
  //////////////////////////////////////////////////////////////
  // singleCommentForm
  /////////////////////////////////////////////////////////////
  /*
  createSingleCommentRow(comment: IComment): FormGroup {
    return this.fb.group({
      gene: comment.gene,
      comment: comment.comment,
      reference: comment.reference,
      variant_id: comment.variant_id
    });
  }

  newSingleCommentRow(): FormGroup {
    return this.fb.group({
      gene: '',
      comment: '',
      reference: '',
      variant_id: '',
      type: 'AML'
    });
  }

  singleCommentsRows(): FormArray {
    return this.singleCommentForm.get('singleComments') as FormArray;
  }

  addNewSingleCommentRow(): void {
    console.log('[608] addNewSingleCommentRow');
    this.singleCommentsRows().push(this.newSingleCommentRow());
  }

  removeSingleCommentRow(i: number): void {

    this.singleCommentsRows().removeAt(i);
  }
  */
  /////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////
  get getFormControls(): any {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }

  // tslint:disable-next-line: typedef
  putTableRowGroup() {
    return this.fb.group({
      id: [],
      igv: [],
      sanger: [],
      type: [],
      gene: [],
      functionalImpact: [],
      transcript: [],
      exonIntro: [],
      nucleotideChange: [],
      aminoAcidChange: [],
      zygosity: [],
      vafPercent: [],
      references: [],
      cosmicID: []
    });
  }

  // tslint:disable-next-line: typedef
  addTableRowGroup() {
    return this.fb.group({
      id: [],
      igv: [],
      sanger: [],
      type: [],
      gene: [],
      functionalImpact: [],
      transcript: [],
      exonIntro: [],
      nucleotideChange: [],
      aminoAcidChange: [],
      zygosity: [],
      vafPercent: [],
      references: [],
      cosmicID: []
    });
  }

  // tslint:disable-next-line: typedef
  addRow() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
  }

  // tslint:disable-next-line: typedef
  deleteRow(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.removeAt(index);
  }
  /////////////////////////////////////////////////////////////////////////////////
  // tslint:disable-next-line: typedef
  submit() {
    console.log(this.tablerowForm.value.tableRows);
  }

  // tslint:disable-next-line: typedef
  test() {
    console.log(this.ment);
  }

  addComments(type: string): void {
    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    from(this.comments)
      .pipe(
        concatMap(ment => this.commentsService.insertCommentsList(
          '', ment.type, ment.gene, ment.variant_id, ment.comment, ment.reference
        )),
        last()
      ).subscribe(data => {
        if (data) {
          alert('등록 되었습니다.');
        }
      });
  }

  // tslint:disable-next-line: typedef
  save(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];

    console.log('[691][mutation/artifacts] ', row, this.patientInfo);

    if (this.selectedItem === 'mutation') {
      this.subs.sink = this.patientsListService.saveMutation(
        row.igv,
        row.sanger,
        'M' + this.patientInfo.name,
        this.patientInfo.patientID,
        row.gene,
        row.functionalImpact,
        row.transcript,
        row.exonIntro,
        row.nucleotideChange,
        row.aminoAcidChange,
        row.zygosity,
        row.vafPercent,
        row.references,
        row.cosmicID
      ).subscribe((data: any) => {

        alert('mutation에 추가 했습니다.');

      });
    } else if (this.selectedItem === 'artifacts') {
      console.log('[715][save][artifacts] ', row);
      this.subs.sink = this.patientsListService.insertArtifacts(
        row.gene, '', '', row.transcript, row.nucleotideChange, row.aminoAcidChange
      ).subscribe((data: any) => {
        console.log('[719][result][artifacts] ', data);
        alert('artifacts에 추가 했습니다.');

      });
    } else if (this.selectedItem === 'benign') {
      console.log('[724][save][benign] ', row);
      this.subs.sink = this.patientsListService.insertBenign(
        row.gene, '', '', row.transcript, row.nucleotideChange, row.aminoAcidChange
      ).subscribe((data: any) => {
        console.log('[728][save][benign] ', data);
        alert('benign에 추가 했습니다.');

      });

    }

  }

  // tslint:disable-next-line: typedef
  saveInhouse(i: number, selecteditem: string) {
    this.indexNum = i;
    this.selectedItem = selecteditem;
    console.log('[741][saveInhouse][selectedItem] ', this.indexNum, this.selectedItem);
  }

  // tslint:disable-next-line: typedef
  checkType(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    if (row.type === 'New') {
      return true;
    }
    return false;
  }

  // 스크린 판독
  screenRead(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    // } else {
    //   const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
    //   this.comments = commentControl.getRawValue();
    // }
    this.store.setComments(this.comments);

    // console.log('[771][스크린 판독] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('스크린 판독 전송하시겠습니까?');
    if (result) {
      this.store.setRechecker(this.patientInfo.recheck);
      this.store.setExamin(this.patientInfo.examin);
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      //  this.patientInfo.recheck = this.
      // tslint:disable-next-line:max-line-length
      console.log('[840][screenRead][profile] ', this.profile);
      // tslint:disable-next-line:max-line-length
      this.subs.sink = this.variantsService.screenInsert(this.form2TestedId, reformData, this.comments, this.profile, this.resultStatus, this.patientInfo)
        .pipe(
          tap(data => {
            console.log('[843][screenRead] ', data);
            alert('저장되었습니다.');
          }),
          concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
        ).subscribe(msg => {
          console.log('[845][sendscreen]', msg[0].screenstatus);
          this.screenstatus = msg[0].screenstatus;
        });
    }

  }

  // 판독완료
  screenReadFinish(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    // } else {
    //   const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
    //   this.comments = commentControl.getRawValue();
    // }
    this.store.setComments(this.comments);

    this.store.setComments(this.comments);
    // console.log('[809][screenReadFinish][검사/확인자]', this.examin, this.recheck);


    // console.log('[812][스크린판독완료] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      this.store.setRechecker(this.patientInfo.recheck);
      // this.store.setExamin(this.patientInfo.examin);
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      this.subs.sink = this.variantsService.screenUpdate(this.form2TestedId, reformData, this.comments, this.profile, this.patientInfo)
        .subscribe(data => {
          console.log('[판독완료] screen Updated ....[566]', data);
          alert('저장되었습니다.');
          this.patientsListService.getScreenStatus(this.form2TestedId)
            .subscribe(msg => {
              this.screenstatus = msg[0].screenstatus;
            });
        });
    }

  }

  getStatus(index): boolean {
    // console.log('[834][getStatus]', index, this.screenstatus);
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

  boxstatus(i, event): void {
    if (event.target.checked) {
      this.checkboxStatus.push(i);
    } else {
      const index = this.checkboxStatus.findIndex(idx => idx === i);
      this.checkboxStatus.splice(index, 1);
    }
    console.log('[887][boxstatus]', this.checkboxStatus.sort());
  }

  goEMR(): void {
    const userid = localStorage.getItem('diaguser');
    if (this.sendEMR > 1) {
      this.lastReportDay = this.today();
    }
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    // 코멘트가 있는경우
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    } else {  // 코멘트가 신규인 경우
      // const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
      // this.comments = commentControl.getRawValue();
      this.comments = [];
    }

    console.log('[904][form2][comments] ', this.comments);
    const makeForm = makeBForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date, // 검사의뢰일
      this.specimenMessage,
      this.fusion,
      this.ment,
      this.patientInfo,
      reformData,
      this.comments,
      this.firstReportDay,
      this.lastReportDay,
      this.genelists
    );
    console.log('[918] ', makeForm);

    // alert('전송 했습니다.');
    // this.excel.exportAsXMLFile(makeForm, 'AML');
    // this.router.navigate(['/diag']); // 시험때만 사용
    // this.patientsListService.resetscreenstatus(this.form2TestedId, '3')
    //   .pipe(
    //     concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
    //   )
    //   .subscribe(msg => {
    //     console.log('msg:', msg);
    //     this.screenstatus = msg.screenstatus;

    //   });


    //  실전사용시 사용

    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid)),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, this.sendEMR++)), // EMR 발송횟수 전송
        concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
      ).subscribe((msg: { screenstatus: string }) => {
        // this.screenstatus = msg[0].screenstatus;
        this.screenstatus = '3';
        alert('EMR로 전송했습니다.');
      });

  }
  // ALL 인 경우
  gotoEMR(): void {
    const userid = localStorage.getItem('pathuser');
    if (this.sendEMR > 1) {
      this.lastReportDay = this.today();
    }
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));

    console.log('[904][form2][comments] ', this.comments);
    const makeForm = makeAForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date, // 검사의뢰일
      this.specimenMessage,
      this.fusion,
      this.ment,
      this.patientInfo,
      reformData,
      this.firstReportDay,
      this.lastReportDay,
      this.genelists
    );
    console.log('[918] ', makeForm);

    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm)
      .pipe(
        concatMap(() => this.patientsListService.resetscreenstatus(this.form2TestedId, '3', userid)),
        concatMap(() => this.patientsListService.setEMRSendCount(this.form2TestedId, this.sendEMR++)), // EMR 발송횟수 전송
        concatMap(() => this.patientsListService.getScreenStatus(this.form2TestedId))
      ).subscribe((msg: { screenstatus: string }) => {
        this.screenstatus = '3';
        //  this.screenstatus = msg[0].screenstatus;
        alert('EMR로 전송했습니다.');
      });

  }

  putCheckboxInit(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.detactedVariants.length; i++) {
      this.checkboxStatus.push(i);
    }
  }

  getCommentGene(gene): void {
    this.tempCommentGene = gene;
  }

  getCommentComment(comment): void {
    this.tempCommentComment = comment;
  }
  // tslint:disable-next-line:variable-name
  getCommentVariants(variant_id: string): void {
    this.tempCommentVariants = variant_id;
  }

  getCommentRef(ref): void {
    this.tempCommentreference = ref;
  }

  previewToggle(): void {
    this.isVisible = !this.isVisible;
    // detected variants 값을 store에 저장
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue() as IAFormVariant[];
    console.log('[1129][form2][previewToggle][] ', formData);
    this.store.setDetactedVariants(formData);

    const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
    this.comments = commentControl.getRawValue();
    if (this.comments.length > 0) {
      this.store.setComments(this.comments);
    }

  }

  excelDownload(): void {
    console.log('excel', this.tsvLists);
    this.excel.exportAsExcelFile(this.tsvLists, 'sample');
  }
  ////////////////////////////////////////////////////////////
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
  //////////////////////////////////////////////////////////

  exammatch(type: string, value: string): boolean {
    if (type === 'exam') {
      if (this.examin === value) {
        return true;
      }
      return false;
    } else if (type === 'recheck') {
      if (this.recheck === value) {
        return true;
      }
      return false;
    }
  }


  checked(rechecked: string): void {
    this.patientInfo.recheck = rechecked; // 확인자
  }

  examimed(examin: string): void {
    this.patientInfo.examin = examin; // 검사자
  }

  examselected(value: string, type: number): boolean {
    if (type === 1) {
      return this.exammatch('exam', value);
    } else if (type === 2) {
      return this.exammatch('exam', value);
    }
  }

  recheckselected(value: string, type: number): boolean {
    if (type === 1) {
      return this.exammatch('recheck', value);
    } else if (type === 2) {
      return this.exammatch('recheck', value);
    } else if (type === 3) {
      return this.exammatch('recheck', value);
    } else if (type === 4) {
      return this.exammatch('recheck', value);
    } else if (type === 5) {
      return this.exammatch('recheck', value);
    }

  }


  tempSave(): void {
    console.log('[1037][tempSave]');
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    console.log('[1040][tableerowForm]', formData);
    console.log('[1041][checkbox]', this.checkboxStatus);
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    console.log('[1043][detected variants]', reformData);
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    // } else {
    //   const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
    //   this.comments = commentControl.getRawValue();
    // }
    this.store.setComments(this.comments);
    this.patientInfo.recheck = this.recheck;
    this.patientInfo.examin = this.examin;
    console.log('[1054][tempSave]patient,reform,comment]', this.patientInfo, reformData, this.comments);

    this.store.setRechecker(this.patientInfo.recheck);
    this.store.setExamin(this.patientInfo.examin);
    this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
    this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);


    // tslint:disable-next-line:max-line-length
    this.subs.sink = this.variantsService.screenInsert(this.form2TestedId, reformData, this.comments, this.profile, this.resultStatus, this.patientInfo)
      .subscribe(data => {
        console.log('[1065]', data);
        alert('저장되었습니다.');
      });
  }

  reset(): void {
    const userid = localStorage.getItem('pathuser');
    this.patientsListService.resetscreenstatus(this.form2TestedId, '0', userid)
      .subscribe(data => {
        this.patientsListService.getScreenStatus(this.form2TestedId)
          .subscribe(msg => {
            this.screenstatus = msg[0].screenstatus;
            this.patientsListService.getPatientInfo(this.form2TestedId)
              .subscribe(patientInfo => {
                // 초기화
                // const control = this.tablerowForm.get('tableRows') as FormArray;
                // control.clear();
                this.mockData = [];
                // 코멘트 초기화
                this.comments = [];
                // this.init(this.form2TestedId);
                this.ngOnInit();
                this.setReportdaymgn(patientInfo);
              });


          });
      });
  }



  ///////////////////////////////////////////////////////////////////////
  // commentsRows()
  saveComments(): any {
    console.log('saveComments');
    // const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
    // this.comments = commentControl.getRawValue();

    this.comments.forEach(item => {
      this.commentsRows().push(this.createCommentRow(item));
    });

    // this.createCommentRow(this.comments[0]);
    this.patientsListService.insertComments(this.comments)
      .subscribe(data => {
        console.log('[1110][saveComments]', this.comments);
        console.log(data);
      });
  }


  //////////////////////////////////////////////////////////////////////
  //
  findMutationBygene(gene: string): void {
    console.log('[1146][findMutationBygene]', this.resultStatus);
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    console.log('[1150][tableerowForm]', formData);
    this.patientsListService.findMutationBygene(gene)
      .subscribe(data => {
        console.log('[1148][findMutationBygene]', data);
        if (data === 0) {
          this.resultStatus = 'Not Detected';
        } else {
          this.resultStatus = 'Detected';
        }
      });
  }
  /////////////////////////////////////////////////////////////////////
}
