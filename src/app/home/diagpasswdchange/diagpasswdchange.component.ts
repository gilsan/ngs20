import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  userid: string;
  username: string;
  dept: string;
  work: string;
  newpassword?: string;
  repassword?: string;
}

@Component({
  selector: 'app-diagpasswdchange',
  templateUrl: './diagpasswdchange.component.html',
  styleUrls: ['./diagpasswdchange.component.scss']
})
export class DiagpasswdchangeComponent implements OnInit {

  userid: string;
  username: string;
  newpassword = '';
  repassword = '';
  dept: string;
  work: string;

  formGroup: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<DiagpasswdchangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log('[diag]', this.data);
    this.userid = this.data.userid;
    this.username = this.data.username;
    this.dept = this.data.dept;
    this.work = this.data.work;
    this.init();
  }

  init(): void {
    this.formGroup = this.fb.group({
      userid: [this.userid],
      username: [this.username],
      newpassword: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      repassword: ['', Validators.required],
      dept: [this.dept],
      work: [this.work],
    });
  }

  save(): void {
    if (this.formGroup.value.newpassword !== this.formGroup.value.repassword) {
      alert('암호가 일치 하지 않습니다.');
    } else {
      this.dialogRef.close(this.formGroup.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }



}
