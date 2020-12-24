import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-path-report',
  templateUrl: './path-report.component.html',
  styleUrls: ['./path-report.component.scss']
})
export class PathReportComponent implements OnInit {
  today: string;
  examer: string;
  rechecker: string;

  mutationForm: FormGroup;
  amplificationForm: FormGroup;
  fusionForm: FormGroup;
  imutationForm: FormGroup;
  iamplificationForm: FormGroup;
  ifusionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.now();
    this.mutationInit();
  }

  // { gene: 'PIK3CA', aminoAcidChange: 'p.Arg93G', nucleotideChange: 'c.278G>A',
  // variantAlleleFrequency: '15.85%', ID: 'COSM86041', tier: 'II' }

  /**
   *  Mutation
   */
  mutationInit(): void {
    this.mutationForm = this.fb.group({
      mutation: this.fb.array([])
    });
  }

  get mutation(): FormArray {
    return this.mutationForm.get('mutation') as FormArray;
  }

  newMutation(): FormGroup {
    return this.fb.group({
      gene: '',
      aminoAcidChange: '',
      nucleotideChange: '',
      variantAlleleFrequency: '',
      ID: '',
      tier: ''
    });
  }

  // 항목추가
  addMutations(): void {
    this.mutation.push(this.newMutation());
  }

  // 항목삭제
  removeMutation(i: number): void {
    this.mutation.removeAt(i);
  }

  // 전체 값보기
  onSubmit(): void {
    console.log(this.mutationForm.value);
  }
  //////////////////////////////////////////////////
  now(): void {
    const year = new Date().getFullYear();
    const mon = new Date().getMonth() + 1;
    const days = new Date().getDate();

    const month = ('0' + mon).substr(-2);
    const day = ('0' + days).substr(-2);
    this.today = year + '.' + month + '.' + day;
  }

}
