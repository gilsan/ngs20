import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';

import { IComment, IDetectedVariants, IFilteredTSV, IGeneCoding, IIComment, IMutation, IPatient, IProfile, IRecoverVariants } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeBForm, METHODS } from 'src/app/home/models/bTypemodel';
import { DetectedVariantsService } from 'src/app/home/services/detectedVariants';
import { StoreService } from '../store.current';

@Component({
  selector: 'app-form2',
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.scss']
})
export class Form2Component implements OnInit, OnDestroy {

  form2TestedId: string;
  filteredTSV$: Observable<IFilteredTSV[]>;
  // detectedVariant$: Observable<IAFormVariant[]>;

  // artifacts1$: Observable<any>;
  // artifacts2$: Observable<any>;

  // benign1$: Observable<any>;
  // benign2$: Observable<any>;

  // mutation1$: Observable<any>;
  // mutation2$: Observable<any>;

  // comment1$: Observable<any>;
  // comment2$: Observable<any>;

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
  variants: string;
  tempid: string;
  ment = 'VUS는 ExAC, KRGDB등의 Population database에서 관철되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.';

  mockData: IAFormVariant[] = [];

  tablerowForm: FormGroup;
  control: FormArray;

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

  @ViewChild('commentbox') private commentbox: TemplateRef<any>;
  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder,
    private variantsService: DetectedVariantsService,
    private store: StoreService,
  ) { }



  ngOnInit(): void {
    console.log('[commentbox][83]', this.commentbox);
    //  let item: IDetectedVariants;
    this.initLoad();
    if (parseInt(this.screenstatus, 10) === 1 || parseInt(this.screenstatus, 10) === 2) {
      this.recoverDetected();

    } else {
      this.init(this.form2TestedId);
    }
    // this.init(this.form2TestedId);
    this.loadForm();

  } // End of ngOninit

  loadForm(): void {
    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(list => this.createRow(list)))
    });
  }

  initLoad(): void {
    this.form2TestedId = this.patientsListService.getTestedID();
    // console.log('[검진ID] ', this.form2TestedId);
    // 검사자 정보 가져오기
    this.patientInfo = this.getPatientinfo(this.form2TestedId);
    this.store.setPatientInfo(this.patientInfo); // 환자정보 저장
    if (this.patientInfo.specimen === '015') {
      this.specimenMsg = 'Bone marrow';
      this.specimenMessage = 'Genomic DNA isolated from Bone marrow';
    }
    // console.log('[86 검사자정보]', this.patientInfo);

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
    this.filteredTSV$.subscribe(data => {
      this.tsvLists = data;
    });

  }

  recoverDetected(): void {
    // 디비에서 detected variants 와 comments 가져오기
    this.variantsService.screenSelect(this.form2TestedId).subscribe(data => {
      this.recoverVariants = data;
      // console.log('[151][form2][detected variants]', this.recoverVariants);
      this.store.setDetactedVariants(data); // detected variant 저장
      this.recoverVariants.forEach(item => {
        this.recoverVariant(item);  // 354
      });
      this.putCheckboxInit(); // 체크박스 초기화
    });
    // 코멘트 가져오기
    this.variantsService.screenComment(this.form2TestedId)
      // .pipe(
      //   switchMap(item => from(item)),
      //   // tslint:disable-next-line: variable-name
      //   concatMap(list => {
      //     console.log(list);
      //     this.variants = list.variants;
      //     this.tempid = list.id;
      //     return this.patientsListService.getCommentInfoLists(list.gene, 'AML');
      //   })
      // )
      .subscribe(comment => {
        // console.log('[134][COMMENT]', comment);
        if (comment !== undefined && comment !== null && comment.length > 0) {
          this.comments.push({
            gene: comment[0].gene,
            comment: comment[0].comment,
            reference: comment[0].reference,
            variants: comment[0].variants,
            id: comment[0].id
          });
          this.store.setComments(this.comments); // comments 저장
        }
      });

    // profile 가져오기
    this.variantsService.screenFind(this.form2TestedId)
      .subscribe(profile => {
        //  this.profile = profile;
        if (profile[0].chromosomalanalysis === null) {
          this.profile.chron = '';
        } else {
          this.profile.chron = profile[0].chromosomalanalysis;
        }

        if (profile[0].FLT3ITD === null) {
          this.profile.flt3itd = '';
        } else {
          this.profile.flt3itd = profile[0].FLT3ITD;
        }

        if (profile[0].leukemiaassociatedfusion === null) {
          this.profile.leukemia = '';
        } else {
          this.profile.leukemia = profile[0].leukemiaassociatedfusion;
        }

        // console.log('[206][variantesService][profile]', this.profile, profile);
      });

    this.variantsService.getScreenTested(this.form2TestedId)
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
      this.patientsListService.filtering(this.form2TestedId, 'AML')
        .subscribe(data => {

          let type: string;
          let gene: string;
          let dvariable: IAFormVariant;
          // console.log('[원시자료][164]', data);

          // 타입 분류
          if (data.mtype === 'M') {  // mutation
            type = 'M';
            dvariable = data.mutationList1;
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
            }
            this.store.setVUSStatus(this.vusstatus); // VUS 상태정보 저장
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
            //  console.log('[126][멘트]', data, data.commentList1, data.commentList2);
            if (typeof data.commentList1 !== 'undefined' && data.commentList1 !== 'none') {
              const variants = data.tsv.amino_acid_change;
              const comment = { ...data.commentList1, variants };
              this.comments.push(comment);
            } else if (typeof data.commentList2 !== 'undefined' && data.commentList2 !== 'none') {
              const comment = { ...data.commentList1, variants: '' };
              this.comments.push(comment);
            }
            this.store.setComments(this.comments); // 멘트 저장
            // console.log('[멘트]', this.comments);
          }

          this.addVarient(type, dvariable, gene, data.coding, data.tsv);

        }); // End of Subscribe
      // 검사자 정보 가져오기
      // this.patientInfo = this.getPatientinfo(this.form2TestedId);
      // console.log('[140 검사자정보]', this.patientInfo);
      // this.chronmosomal = this.patientInfo.chromosomalAnalysis;
      // this.chronmosomal = this.patientInfo.chromosomalanalysis;
      this.profile.chron = this.patientInfo.chromosomalanalysis;
      this.profile.flt3itd = this.patientInfo.FLT3ITD;
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
      this.profile,
      this.patientInfo.accept_date,
      this.specimenMessage,
      this.fusion,
      this.ment,
      this.patientInfo,
      formData,
      this.comments);
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
    this.patientsListService.sendEMR(
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
    this.filteredTSV$.subscribe(data => {
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
    // console.log('[460][스크린 판독] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('스크린 판독 전송하시겠습니까?');
    if (result) {
      this.variantsService.screenInsert(this.form2TestedId, formData, this.comments, this.profile)
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
    // console.log('[460][스크린판독완료] ', this.form2TestedId, formData, this.comments, this.profile);
    const result = confirm('판독완료 전송하시겠습니까?');
    if (result) {
      this.variantsService.screenUpdate(this.form2TestedId, formData, this.comments, this.profile)
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
    // console.log('[616] ', reformData);
    // console.log('[617] ', formData, this.comments, this.checkboxStatus.sort());
    // comments 첵크
    if (
      this.tempCommentComment.length ||
      this.tempCommentGene.length ||
      this.tempCommentVariants.length ||
      this.tempCommentreference.length) {
      this.comments.push({
        gene: this.tempCommentGene,
        variants: this.tempCommentVariants,
        comment: this.tempCommentComment,
        reference: this.tempCommentreference
      });
    }
    console.log('[697][form2][comments] ', this.comments);
    const makeForm = makeBForm(
      this.resultStatus,
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
    this.router.navigate(['/diag']);
    // this.patientsListService.sendEMR(
    //   this.patientInfo.specimenNo,
    //   this.patientInfo.patientID,
    //   this.patientInfo.test_code,
    //   this.patientInfo.name,
    //   makeForm).subscribe((data) => {
    //     console.log('[응답]', data);
    //     alert(data);
    //     this.variantsService.screenEmrUpdate(this.form2TestedId)
    //       .subscribe(message => {
    //         // console.log('[634][]', message);
    //         this.router.navigate(['/diag']);
    //       });
    //   });


  }

  putCheckboxInit(): void {
    console.log('[715][detactedVariants.length] ', this.detactedVariants.length);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.detactedVariants.length; i++) {
      this.checkboxStatus.push(i);
    }
    console.log('[720][]', this.checkboxStatus);
  }

  getCommentGene(gene): void {
    this.tempCommentGene = gene;
    console.log('[724][comment.gene]', this.tempCommentGene);

    // this.comments[0].gene = gene;
  }

  getCommentComment(comment): void {
    this.tempCommentComment = comment;
    // console.log('[732][comment.comment]', this.tempCommentComment);
  }
  getCommentVariants(variants): void {
    this.tempCommentVariants = variants;
    // console.log('[736][comment.variants]', this.tempCommentVariants);
  }

  getCommentRef(ref): void {
    this.tempCommentreference = ref;
    // console.log('[741][comment.ref]', this.tempCommentreference);
  }

  previewToggle(): void {
    this.isVisible = !this.isVisible;
    // console.log('[805][previewToggle]', this.isVisible);
  }



}
