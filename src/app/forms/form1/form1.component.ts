/*
   1) Variants Detect   
      - Functional Impact : 사이즈 좀 크게
     - COSMIC ID         : 사이즈 좀 크게
      - VAF               : 사이즈 좀 작게   
   
   2) 미리보기
   
      - Variants Detect : 화면 좌우사이즈가 너무 커서 보기 불편

   3) Comments 관리

      - AML 뿐만 아니라, ALL, 기타 결과지 모두에서 필요하다.

      - Comments에서 입력, 수정된 내용은 화면을 다시 읽으면 변경된 내용이 표시되어야 한다.

      - Comments 자체가 화면에서 사라지는 경우가 있다.
        (미리보기에서는 보임)


*/


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';

import { IFilteredTSV, IGeneCoding, IMutation, IPatient } from 'src/app/home/models/patients';
import { PatientsListService } from 'src/app/home/services/patientslist';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { IAFormVariant } from 'src/app/home/models/patients';
import { shareReplay, switchMap, tap, concatMap, map } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { GENERAL, makeAForm, METHODS } from 'src/app/home/models/aTypemodel';

@Component({
  selector: 'app-form1',
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.scss']
})
export class Form1Component implements OnInit, OnDestroy {

  form1TestedId: string;
  filteredTSV$: Observable<IFilteredTSV[]>;
  detectedVariant$: Observable<IAFormVariant[]>;

  artifacts1$: Observable<any>;
  artifacts2$: Observable<any>;

  benign1$: Observable<any>;
  benign2$: Observable<any>;

  mutation1$: Observable<any>;
  mutation2$: Observable<any>;

  comment1$: Observable<any>;
  comment2$: Observable<any>;

  tsvLists: IFilteredTSV[] = [];
  patientInfo: IPatient;
  geneCoding: IGeneCoding[];
  detactedVariants: IAFormVariant[] = [];

  ngsData = [];
  private subs = new SubSink();

  resultStatus = 'detected';
  fusion = '';
  methods = METHODS;
  general = GENERAL;
  indexNum = 0;
  selectedItem = '';

  ment = 'VUS는 ExAC, KRGDB등의 Population database에서 관철되지 않았거나, 임상적 의의가 불분명합니다. 해당변이의 의의를 명확히 하기 위하여 환자의 buccal swab 검체로 germline variant 여부에 대한 확인이 필요 합니다.';

  commentGene = 'KRAS';
  commentVariants = 'p.Ala146Val';
  commentReference = `
  Blood 2013;122:3616-27
  Pediatr Blood Cancer.2015;62:2157-61,
  Nature 2012;481:157-63.
  J Clin OnCol.2010;28:3858-65`;
  comment = ' TP53 유전자의 돌연변이는 ALL (16%), AML (12%), CLL (7%), MDS (6%), t-MN (37%) 등에서 관찰됩니다. 항암치료에 대한 순응도가 낮으며 예후가 좋지 않은 것으로 알려져 있습니다.  complex karyotype, monosomal karyotype와 유의하게 연관되어 발생되며, missense mutation이 가장 빈번하며, frameshift, nonsense mutation 순입니다. Li–Fraumeni syndrome 환자에서도 germline 변이가 관찰 될 수 있으므로, 가족력 확인 및 buccal swab 검체로 germline 변이 여부 확인 검사가 필요합니다. ';

  mockData: IAFormVariant[] = [];

  tablerowForm: FormGroup;
  control: FormArray;
  spcno = '';
  pid = '';
  examcd = '';
  userid = '';
  rsltdesc = '';

  constructor(
    private patientsListService: PatientsListService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // 검체번호
    this.form1TestedId = this.patientsListService.getTestedID();
    if (this.form1TestedId) {
      // 필터링된 tsv 파일 가져오기
      this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(this.form1TestedId)
        .pipe(
          shareReplay()
        );
      this.filteredTSV$.subscribe(data => {
        this.tsvLists = data;
      });

      this.filteredTSV$.pipe(
        tap(data => {
          // gene 와 coding 값 분리
          this.geneCoding = data.map(item => {
            let coding: string;
            let gene1: string;
            let gene2: string;
            let tsv: IFilteredTSV;
            tsv = item;
            if (item.genes || item.coding) {
              // const genes = item.genes;  // genes: "CSDE1;NRAS"
              const genesemi = item.genes.indexOf(';');
              if (genesemi !== -1) {  // 있는경우
                gene1 = item.genes.split(';')[0];
                gene2 = item.genes.split(';')[1];
              } else {
                gene1 = item.genes;
                gene2 = 'none';
              }

              const semi = item.coding.indexOf(';');
              if (semi !== -1) {
                coding = item.coding.split(';')[0];
              } else {
                coding = item.coding;
              }
              const id = item.id;
              return { id, gene1, gene2, coding, tsv };
            }
          });
        }),
        switchMap(() => from(this.geneCoding)),
        concatMap(item => {
          if (item.gene2 === 'none') {
            return this.patientsListService.getArtifactsInfoCount(item.gene1, item.coding).pipe(
              map(gene1Count => {
                return { ...item, artifacts1Count: gene1Count[0][0], artifacts2Count: 0 };
              })
            );
          } else {
            const gene1$ = this.patientsListService.getArtifactsInfoCount(item.gene1, item.coding);
            const gene2$ = this.patientsListService.getArtifactsInfoCount(item.gene2, item.coding);
            return combineLatest([gene1$, gene2$]).pipe(
              map(data => {
                return { ...item, artifacts1Count: data[0][0][0], artifacts2Count: data[1][0][0] };
              })
            );
          }

        }),
        concatMap(item => {
          if (item.gene2 === 'none') {
            return this.patientsListService.benignInfoCount(item.gene1, item.coding).pipe(
              map(benign1Count => {
                return { ...item, benign1Count: benign1Count[0][0], benign2Count: 0 };
              })
            );
          } else {
            const gene1$ = this.patientsListService.benignInfoCount(item.gene1, item.coding);
            const gene2$ = this.patientsListService.benignInfoCount(item.gene2, item.coding);
            return combineLatest([gene1$, gene2$]).pipe(
              map(data => {
                return { ...item, benign1Count: data[0][0][0], benign2Count: data[1][0][0] };
              })
            );
          }
        }),
        concatMap(item => {
          if (item.gene2 === 'none') {
            return this.patientsListService.getMutationInfoLists(item.gene1, item.coding).pipe(
              map(lists => {
                // console.log('[157]  Mutation List :', lists);
                if (lists.length) {
                  return { ...item, mutationList1: lists[0], mutationList2: 'none' };
                } else {
                  return { ...item, mutationList1: 'none', mutationList2: 'none' };
                }
              })
            );
          } else {
            const gene1$ = this.patientsListService.getMutationInfoLists(item.gene1, item.coding);
            const gene2$ = this.patientsListService.getMutationInfoLists(item.gene2, item.coding);
            return combineLatest([gene1$, gene2$]).pipe(
              // tap((data) => console.log('[159] combineLatest: ', data)),
              map(data => {
                //   console.log('[158] ', data);
                if (data[0].length && data[1].length) {
                  return { ...item, mutationList1: data[0][0], mutationList2: data[1][0] };
                } else if (data[0].length && data[1].length === 0) {
                  return { ...item, mutationList1: data[0][0], mutationList2: 'none' };
                } else if (data[0].length === 0 && data[1].length) {
                  return { ...item, mutationList1: 'none', mutationList2: data[1][0] };
                } else if (data[0].length === 0 && data[1].length === 0) {
                  return { ...item, mutationList1: 'none', mutationList2: 'none' };
                }

              })
            );
          }
        }),
        concatMap(item => {
          if (item.gene2 === 'none') {
            return this.patientsListService.getCommentInfoCount(item.gene1, 'ALL').pipe(
              map(comments1Count => {
                // console.log('[176]Comments:  ', comments1Count);
                return { ...item, comments1Count: comments1Count[0][0], comments2Count: 0 };
              })
            );
          } else {
            const gene1$ = this.patientsListService.getCommentInfoCount(item.gene1, 'ALL');
            const gene2$ = this.patientsListService.getCommentInfoCount(item.gene2, 'ALL');
            return combineLatest([gene1$, gene2$]).pipe(
              map(data => {
                // console.log('[185]Comments:  ', data);
                return { ...item, comments1Count: data[0][0][0], comments2Count: data[1][0][0] };
              })
            );
          }
        }),
        concatMap(item => {  // Comments
          if (item.gene2 === 'none') {
            return this.patientsListService.getCommentInfoLists(item.gene1, 'ALL').pipe(
              map(comment => {
                //  console.log('[195]  Comment List :', comment);
                if (comment[0] !== undefined) {
                  return { ...item, commentList1: comment[0], commentList2: 'none' };
                } else {
                  return { ...item, commentList1: 'none', commentList2: 'none' };
                }
              })
            );
          } else {
            const gene1$ = this.patientsListService.getCommentInfoLists(item.gene1, 'ALL');
            const gene2$ = this.patientsListService.getCommentInfoLists(item.gene2, 'ALL');
            return combineLatest([gene1$, gene2$]).pipe(
              //  tap((data) => console.log('[207] combineLatest: ', data)),
              map(comment => {
                // console.log('[209] ', comment[0], comment[1]);
                if (comment[0][0] !== undefined && comment[1][0] !== undefined) {
                  return { ...item, commentList1: comment[0][0], commentList2: comment[1][0] };
                } else if (comment[0][0] !== undefined && comment[1][0] === undefined) {
                  return { ...item, commentList1: comment[0][0], commentList2: 'none' };
                } else if (comment[0][0] === undefined && comment[1][0] !== undefined) {
                  return { ...item, commentList1: 'none', commentList2: comment[1][0] };
                } else if (comment[0][0] === undefined && comment[1][0] === undefined) {
                  return { ...item, commentList1: 'none', commentList2: 'none' };
                }
              })
            );
          }
        })
      )
        // this.patientsListService.filtering(this.form1TestedId)
        .subscribe(data => {
          // gene, coding 으로 artifacts, benign, comments, mutation 을 가져온다.
          // artifacts, benign 에 있는 항목은 mutaion에서 가져오기 않는다.
          // gene 가 2개인 경우 2개중 1개가 있어면 있는것 가져온다 .
          // console.log('[242] concatMap', data);
          let type;
          let gene;
          if ((data.mutationList1 !== 'none' && data.mutationList1 === 'none') ||
            (data.mutationList1 === 'none' && data.mutationList1 !== 'none')) {
            type = 'M';
          } else if (parseInt(data.artifacts1Count, 10) > 0 ||
            parseInt(data.artifacts2Count, 10) > 0) {
            type = 'A';
          }
          /*  else if (parseInt(data.benign1Count, 10) > 0 ||
              parseInt(data.benign2Count, 10) > 0) {
              type = 'B';
            }  */
          let item;
          if (data.mutationList1 !== 'none') {
            item = data.mutationList1;
            type = 'M';
          } else if (data.mutationList2 !== 'none') {
            item = data.mutationList2;
            type = 'M';
          } else if (
            parseInt(data.artifacts1Count, 10) === 0 &&
            parseInt(data.artifacts2Count, 10) === 0 &&
            parseInt(data.benign1Count, 10) === 0 &&
            parseInt(data.benign2Count, 10) === 0 &&
            data.mutationList1 === 'none' &&
            data.mutationList2 === 'none'
          ) {
            type = 'New';

          } else {
            item = {
              igv: '',
              sanger: '',
              type: '',
              gene: '',
              functionalImpact: '',
              transcript: '',
              exonIntro: '',
              nucleotideChange: '',
              aminoAcidChange: '',
              zygosity: '',
              vafPercent: '',
              references: '',
              cosmicID: ''
            };
          }

          if (data.gene1 !== 'none' && data.gene2 !== 'none') {
            gene = data.gene1 + ',' + data.gene2;
          } else if (data.gene1 !== 'none' && data.gene2 === 'none') {
            gene = data.gene1;
          } else if (data.gene1 === 'none' && data.gene2 === 'none') {
            gene = data.gene2;
          }
          // console.log('[248]', type, item);
          this.addVarient(type, item, gene, data.coding);

        });  // End of Subscribe

      // 검사자 정보 가져오기
      this.patientInfo = this.getPatientinfo(this.form1TestedId);

    } else {
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

    this.tablerowForm = this.fb.group({
      tableRows: this.fb.array(this.mockData.map(item => this.createRow(item)))
    });
  }

  // tslint:disable-next-line: typedef
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  result(event) {
    this.resultStatus = event.srcElement.defaultValue;
  }

  // tslint:disable-next-line: typedef
  sendEMR() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const formData = control.getRawValue();

    /*
    const makeForm = makeAForm(this.resultStatus, this.fusion, this.ment, this.patientInfo, formData);
    this.patientsListService.sendEMR(
      this.patientInfo.specimenNo,
      this.patientInfo.patientID,
      this.patientInfo.test_code,
      this.patientInfo.name,
      makeForm).subscribe((data) => {
        // console.log(data);
        this.router.navigate(['/diag']);
      });
    */
  }

  // 필터링된 tsv 파일 가져오기
  getfiteredTSVlist(testedID: string) {
    this.filteredTSV$ = this.patientsListService.getFilteredTSVtList(testedID);
    this.filteredTSV$.subscribe(data => {
      this.tsvLists = data;
    });
  }

  addVarient(type: string, item: IAFormVariant, gene: string, coding: string) {
    let tempvalue;

    if (type === 'M') {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        gene,
        functionalImpact: item[0],
        transcript: item[1],
        exonIntro: item[2],
        nucleotideChange: coding,
        aminoAcidChange: item[3],
        zygosity: item[4],
        vafPercent: item[5],
        references: item[6],
        cosmicID: item[7]
      };
    } else {
      tempvalue = {
        igv: '',
        sanger: '',
        type,
        gene,
        functionalImpact: '',
        transcript: '',
        exonIntro: '',
        nucleotideChange: coding,
        aminoAcidChange: '',
        zygosity: '',
        vafPercent: '',
        references: '',
        cosmicID: ''
      };
    }

    this.detactedVariants = [...this.detactedVariants, tempvalue];
    this.mockData = this.detactedVariants;
    this.addNewRow(tempvalue);
  }

  // 검사자 정보 가져오기
  getPatientinfo(testid: string) {
    const tempInfo = this.patientsListService.patientInfo;
    if (tempInfo) {
      return tempInfo.filter(data => data.testedNum === testid)[0];
    }
    return;
  }

  createRow(item: IAFormVariant): FormGroup {
    return this.fb.group({
      igv: '',
      sanger: '',
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
      cosmicID: [item.cosmicID]
    });
  }

  addNewRow(row: IAFormVariant) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.createRow(row));
  }

  get getFormControls() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    return control;
  }

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

  addRow() {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.push(this.addTableRowGroup());
  }

  deleteRow(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    control.removeAt(index);
  }

  submit() {
    console.log(this.tablerowForm.value.tableRows);
  }

  test() {
    console.log(this.ment);
  }

  save(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    // console.log('[549] ', row, this.patientInfo);

    if (this.selectedItem === 'mutation') {
      this.subs.sink = this.patientsListService.saveMutation(
        row.igv,
        row.sanger,
        'L' + this.patientInfo.name,
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

  saveInhouse(i: number, selecteditem: string) {
    this.indexNum = i;
    this.selectedItem = selecteditem;
    // console.log('[524] ', this.indexNum, this.selectedItem);
  }

  checkType(index: number) {
    const control = this.tablerowForm.get('tableRows') as FormArray;
    const row = control.value[index];
    if (row.type === 'New') {
      return true;
    }
    return false;
  }



}

/***
 * select * from mutation where gene='SETD2' and nucleotide_change = 'c.1138delT' order by id limit 1
 *
 * Observable
  .combineLatest(this.fooService.model, this.barService.model)
  .switchMap(([foo, bar]) => {
    return bazService
      .anotherObservable(foo.someProperty)
      .map((baz) => [foo, bar, baz]);
  })
  .subscribe(([foo, bar, baz]) => console.log(foo, bar, baz));
 *
 */
