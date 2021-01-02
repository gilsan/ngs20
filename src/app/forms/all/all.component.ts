import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';

import { IComment, IFilteredTSV, IGeneCoding, IPatient, IProfile, IRecoverVariants } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeBForm, METHODS } from 'src/app/home/models/bTypemodel';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { StoreService } from '../store.current';
import { ExcelService } from 'src/app/home/services/excelservice';
import { makeALLForm } from 'src/app/home/models/all.model';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit, OnDestroy, AfterViewInit {


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

  resultStatus = 'detected';
  fusion = '';
  flt3itd = '';
  chronmosomal = '';
  methods = METHODS;
  general = GENERAL;
  indexNum = 0;
  selectedItem = '';
  tsvInfo: IFilteredTSV;
  profile: IProfile = { leukemia: '', flt3itd: '', chron: '' };
  variant_id: string;
  tempid: string;
  ment = 'VUS는 ExAC, KRGDB등의 Population database에서 관철되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.';

  mockData: IAFormVariant[] = [];

  tablerowForm: FormGroup;
  singleCommentForm: FormGroup;
  control: FormArray;
  listForm: FormGroup;


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

  examin: string; // 검사자
  recheck: string; // 확인자

  firstReportDay: string;
  lastReportDay: string;

  @ViewChild('commentbox') private commentbox: TemplateRef<any>;
  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder,
    private variantsService: DetectedVariantsService,
    private store: StoreService,
    private excel: ExcelService
  ) { }

  ngOnInit(): void {
    console.log('[commentbox][83]', this.commentbox);
    //  let item: IDetectedVariants;
    this.initLoad();
    if (parseInt(this.screenstatus, 10) >= 1 || parseInt(this.screenstatus, 10) === 2) {
      this.recoverDetected();
    } else {
      this.init(this.form2TestedId);
    }
    // this.init(this.form2TestedId);
    this.loadForm();
    this.checker();
  } // End of ngOninit

  ngAfterViewInit(): void {
    // this.checker();
  }

  checker(): void {
    if (this.store.getRechecker() !== 'none') {
      this.recheck = this.store.getRechecker();
    } else {
      this.recheck = this.rechecked.nativeElement.value;
      this.store.setRechecker(this.recheck); // 확인자 저장
    }

    if (this.store.getExamin() !== 'none') {
      this.examin = this.store.getExamin();
    } else {
      this.examin = this.examine.nativeElement.value;
      this.store.setExamin(this.examin); // 검사자 저장
    }

    this.patientInfo.examin = this.examin;
    this.patientInfo.recheck = this.recheck;
    console.log('[120][checker][확인/검사자]', this.examin, this.recheck);
  }


  loadForm(): void {
    // console.log('[120][loadForm] ', this.comments);
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list))),
      commentsRows: this.fb.array([])
    });

    this.singleCommentForm = this.fb.group({
      singleComments: this.fb.array([])
    });

  }

  initLoad(): void {
    this.form2TestedId = this.patientsListService.getTestedID();
    // console.log('[검진ID] ', this.form2TestedId);
    if (this.form2TestedId === null || this.form2TestedId === undefined) {
      this.router.navigate(['/diag']);
      return;
    }
    // 검사자 정보 가져오기
    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    this.requestDate = this.patientInfo.accept_date;
    this.store.setPatientInfo(this.patientInfo); // 환자정보 저장
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    }
    console.log('[86 검사자정보]', this.patientInfo);
    // 검체 감염유부 확인
    if (parseInt(this.patientInfo.detected, 10) === 0) {
      this.resultStatus = 'detected';
    } else if (parseInt(this.patientInfo.detected, 10) === 1) {
      this.resultStatus = 'notdetected';
    }
    // 검사자 확인자
    this.examin = this.patientInfo.examin; // 검사자
    this.recheck = this.patientInfo.recheck; // 확인자

    this.screenstatus = this.patientInfo.screenstatus;
    // specimen 015 인경우 Bon marrow
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
      this.store.setSpecimenMsg(this.specimenMsg);
    } else if (this.patientInfo.specimen === '004') {
      this.specimenMsg = 'EDTA blood';
      this.specimenMessage = 'Genomic DNA isolated from EDTA blood';
    }
    // 필터링된 tsv 파일 가져오기
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(this.form2TestedId)
      .pipe(
        shareReplay()
      );
    this.subs.sink = this.filteredTSV$.subscribe(data => {
      // console.log('[146][form2][fileredTSVFile]', data);
      this.tsvLists = data;
    });

  }

  recoverDetected(): void {
    // 디비에서 detected variant_id 와 comments 가져오기
    this.subs.sink = this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      this.recoverVariants = data;

      // console.log('[151][form2][detected variant_id]', this.recoverVariants);
      this.store.setDetactedVariants(data); // detected variant 저장
      this.recoverVariants.forEach(item => {
        this.recoverVariant(item);  // 354
        if (item.functional_impact === 'VUS') {
          this.vusstatus = true;
          this.store.setVUSStatus(this.vusstatus);
        } else {
          this.store.setVUSStatus(this.vusstatus);
        }
        // console.log('[183][recoverVariant][]', item);
      });
      this.putCheckboxInit(); // 체크박스 초기화
    });


    // 코멘트 가져오기
    this.subs.sink = this.variantsService.screenComment(this.form2TestedId)
      .subscribe(dbComments => {
        if (dbComments !== undefined && dbComments !== null && dbComments.length > 0) {
          // console.log('[188][COMMENT 가져오기]', dbComments);
          dbComments.forEach(comment => {
            this.comments.push(comment);
            this.commentsRows().push(this.createCommentRow(comment));
          });

          this.store.setComments(this.comments); // comments 저장
        }
      });

    // profile 가져오기
    this.subs.sink = this.variantsService.allscreenFind(this.form2TestedId)
      .subscribe(profile => {
        //  this.profile = profile;
        if (profile[0].chromosomalanalysis === null) {
          this.profile.chron = '';
        } else {
          this.profile.chron = profile[0].chromosomalanalysis;
        }

        if (profile[0].IKZK1Deletion === null) {
          this.profile.flt3itd = '';
        } else {
          this.profile.flt3itd = profile[0].IKZK1Deletion;
        }

        if (profile[0].leukemiaassociatedfusion === null) {
          this.profile.leukemia = '';
        } else {
          this.profile.leukemia = profile[0].leukemiaassociatedfusion;
        }
        console.log('[236][variantesService][profile]', this.profile, profile);
      });

    this.subs.sink = this.variantsService.getScreenTested(this.form2TestedId)
      .subscribe(data => {
        if (data !== undefined && data !== null && data.length > 0) {
          this.profile.chron = data[0].chromosomalanalysis;
          this.profile.flt3itd = data[0].IKZK1Deletion;   // FLT3ITD
          this.profile.leukemia = data[0].leukemiaassociatedfusion;
          this.store.setProfile(this.profile); // profile 저장
          // console.log('[216][profile]', this.profile);
        }
      });

  }

  init(form2TestedId: string): void {

    if (this.form2TestedId) {
      this.subs.sink = this.patientsListService.filtering(this.form2TestedId, 'ALL')
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
            }
          } else if (parseInt(data.artifacts1Count, 10) > 0 ||
            parseInt(data.artifacts2Count, 10) > 0) {
            type = 'A';
          } else if (parseInt(data.benign1Count, 10) > 0 ||
            parseInt(data.benign2Count, 10) > 0) {
            type = 'B';
          } else {
            type = 'New';
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
            // console.log('[281][코멘트]', data, data.commentList1, data.commentList2);
            if (typeof data.commentList1 !== 'undefined' && data.commentList1 !== 'none') {
              if (parseInt(data.comments1Count, 10) > 0) {
                const variant_id = data.tsv.amino_acid_change;
                const comment = { ...data.commentList1, variant_id };
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
      this.profile.flt3itd = this.patientInfo.IKZK1Deletion;
      this.profile.leukemia = this.patientInfo.leukemiaassociatedfusion;
      this.store.setProfile(this.profile); // profile 저장
      // console.log('[214][신현주]', this.patientInfo, this.profile);
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
        screenstatus: ''
      };
    }

    // this.tablerowForm = this.fb.group({
    //   tableRows: this.fb.array(this.mockData.map(list => this.createRow(list)))
    // });

  }

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
    // console.log('[332][checkbox status]', this.resultStatus);
  }

  radioStatus(type: string): boolean {
    if (type === this.resultStatus) {
      return true;
    }
    return false;
  }

  // tslint:disable-next-line: typedef
  sendEMR() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    const makeForm = makeBForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date,
      this.specimenMessage,
      this.fusion,
      this.ment,
      this.patientInfo,
      formData,
      this.comments,
      this.firstReportDay,
      this.lastReportDay
    );
    console.log('[183] ', makeForm);
    // patientInfo_diag 테이블 참조
    // submit_id: TXLII00124
    // business_id: li
    // instcd: 012
    // spcno:  병리번호(병리)/바코드번호(진검): specimenNo
    // forcd: -
    // rsltflag: O
    // pid: 등록번호 patientID
    // examcd: 검사코드 prescription_code
    // examflag: 검사구분(진검:L,병리:P)
    // infflag: I
    // userid: 사용자 name
    // rsltdesc: 검사결과 데이타셋
    /*
     *   spcno: string,
    *    pid: string,
    *    examcd: string,
    *    userid: string,
     *   rsltdesc: string
     */
    // 임시 멘트 처리함
    this.subs.sink = this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm).subscribe((data) => {
        // console.log('[응답]', data);
        this.router.navigate(['/diag']);
      });

    // this.router.navigate(['/home']);
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
    // console.log('[addVarient][310]', item, tsv);
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
        zygosity: item.zygosity,
        vafPercent: tsv.frequency,
        references: item.reference,
        cosmicID: item.cosmic_id,
      };
      // console.log('[249]', item, item.amino_acid_change, item.exon_intro, tempvalue);
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
        zygosity: '',
        vafPercent: tsv.frequency,
        references: '',
        cosmicID: ''
      };
    }

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.store.setDetactedVariants(this.detactedVariants);
    this.addNewRow(tempvalue);
  }

  recoverVariant(item: IRecoverVariants): void {
    let tempvalue;
    //  console.log('[352][addVarient][판독완료]', item);
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
    // console.log('[369][addVarient][판독완료]', item);

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.addNewRow(tempvalue);
    // console.log('[471][form2][mockData]......\n', this.mockData);
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
    // console.log('[407][addNewRow]', row);
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
      variant_id: comment.variant_id
    });
  }

  newCommentRow(): FormGroup {
    return this.fb.group({
      gene: '',
      comment: '',
      reference: '',
      variant_id: ''
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
      variant_id: ''
    });
  }

  singleCommentsRows(): FormArray {
    return this.singleCommentForm.get('singleComments') as FormArray;
  }

  addNewSingleCommentRow(): void {
    console.log('[554] addNewSingleCommentRow');
    this.singleCommentsRows().push(this.newSingleCommentRow());
  }

  removeSingleCommentRow(i: number): void {
    this.singleCommentsRows().removeAt(i);
  }
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

  // tslint:disable-next-line: typedef
  submit() {
    console.log(this.tablerowForm.value.tableRows);
  }

  // tslint:disable-next-line: typedef
  test() {
    console.log(this.ment);
  }

  // tslint:disable-next-line: typedef
  save(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    // console.log('[549] ', row, this.patientInfo);

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
        if (data.insertId) {
          alert('mutation에 추가 했습니다.');
          // const mutationControl = this.tablerowForm.get('tableRows') as FormArray;
          // mutationControl.removeAt(index);
        }
      });
    } else if (this.selectedItem === 'artifacts') {
      this.subs.sink = this.patientsListService.insertArtifacts(
        row.gene, row.item.loc2, row.item.exon, row.item.transcript, row.coding, row.item.amino_acid_change
      ).subscribe((data: any) => {
        if (data.insertId) {
          alert('mutation에 추가 했습니다.');
        }
      });

    } else if (this.selectedItem === 'benign') {
      this.subs.sink = this.patientsListService.insertBenign(
        row.gene, row.item.loc2, row.item.exon, row.item.transcript, row.coding, row.item.amino_acid_change
      ).subscribe((data: any) => {
        if (data.insertId) {
          alert('mutation에 추가 했습니다.');
        }
      });
    }

  }

  // tslint:disable-next-line: typedef
  saveInhouse(i: number, selecteditem: string) {
    this.indexNum = i;
    this.selectedItem = selecteditem;
    // console.log('[524] ', this.indexNum, this.selectedItem);
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

    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    } else {
      const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    this.store.setComments(this.comments);

    console.log('[728][스크린 판독] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('스크린 판독 전송하시겠습니까?');
    if (result) {

      this.store.setRechecker(this.patientInfo.recheck);
      this.store.setExamin(this.patientInfo.examin);
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      // tslint:disable-next-line:max-line-length
      this.subs.sink = this.variantsService.allscreenInsert(this.form2TestedId, formData, this.comments, this.profile, this.resultStatus, this.patientInfo)
        .subscribe(data => {
          alert('저장되었습니다.');
          // console.log('[screenRead] screen Insert ....[554]', data);
          this.router.navigate(['/diag']);
        });
    } else {
      this.router.navigate(['/diag']);
    }

  }

  // 판독완료
  screenReadFinish(): void {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    } else {
      const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    this.store.setComments(this.comments);
    // console.log('[460][스크린판독완료] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {

      this.store.setRechecker(this.patientInfo.recheck);
      this.store.setExamin(this.patientInfo.examin);
      this.patientsListService.updateExaminer('recheck', this.patientInfo.recheck, this.patientInfo.specimen);
      this.patientsListService.updateExaminer('exam', this.patientInfo.examin, this.patientInfo.specimen);

      this.subs.sink = this.variantsService.allscreenUpdate(this.form2TestedId, formData, this.comments, this.profile, this.patientInfo)
        .subscribe(data => {
          //  console.log('[판독완료] screen Updated ....[566]', data);
          alert('저장되었습니다.');
          this.router.navigate(['/diag']);
        });
    } else {
      this.router.navigate(['/diag']);
    }

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

  boxstatus(i, event): void {
    if (event.target.checked) {
      this.checkboxStatus.push(i);
    } else {
      const index = this.checkboxStatus.findIndex(idx => idx === i);
      this.checkboxStatus.splice(index, 1);
    }
    // console.log('[581][boxstatus]', this.checkboxStatus.sort());
  }

  goEMR(): void {

    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();
    const reformData = formData.filter((data, index) => this.checkboxStatus.includes(index));
    // 코멘트가 있는경우
    if (this.comments.length) {
      const commentControl = this.tablerowForm.get('commentsRows') as FormArray;
      this.comments = commentControl.getRawValue();
    } else {  // 코멘트가 신규인 경우
      const commentControl = this.singleCommentForm.get('singleComments') as FormArray;
      this.comments = commentControl.getRawValue();
    }
    // console.log('[616] ', reformData);
    // console.log('[617] ', formData, this.comments, this.checkboxStatus.sort());
    // comments 첵크
    // if (
    //   this.tempCommentComment.length ||
    //   this.tempCommentGene.length ||
    //   this.tempCommentVariants.length ||
    //   this.tempCommentreference.length) {
    //   this.comments.push({
    //     gene: this.tempCommentGene,
    //     variant_id: this.tempCommentVariants,
    //     comment: this.tempCommentComment,
    //     reference: this.tempCommentreference
    //   });
    // }
    console.log('[697][form2][comments] ', this.comments);
    const makeForm = makeALLForm(
      this.resultStatus,
      this.examin, // 검사자
      this.recheck, // 확인자
      this.profile,
      this.patientInfo.accept_date,
      this.specimenMessage,
      this.fusion,
      this.ment,
      this.patientInfo,
      reformData,
      this.comments
    );
    console.log('[623] ', makeForm);
    /*  시험용 */
    // this.excel.exportAsXMLFile(makeForm, 'ALL');
    // alert('전송 했습니다.');
    // this.variantsService.screenEmrUpdate(this.form2TestedId)
    //   .subscribe(message => {
    //     // console.log('[634][]', message);
    //     this.router.navigate(['/diag']);
    //   });
    // this.router.navigate(['/diag']);


    // EMR 로 데이타 전송하기
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm).subscribe((data) => {
        console.log('[응답]', data);
        alert(data);
        this.excel.exportAsXMLFile(makeForm, 'ALL');
        this.variantsService.screenEmrUpdate(this.form2TestedId)
          .subscribe(message => {
            // console.log('[634][]', message);
            this.router.navigate(['/diag']);
          });
      });
  }

  putCheckboxInit(): void {
    console.log('[715][detactedVariants.length] ', this.detactedVariants.length);
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
  getCommentVariants(variant_id): void {
    this.tempCommentVariants = variant_id;
  }

  getCommentRef(ref): void {
    this.tempCommentreference = ref;
  }

  previewToggle(): void {
    this.isVisible = !this.isVisible;
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


}
