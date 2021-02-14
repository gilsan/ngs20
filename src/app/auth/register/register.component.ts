import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { emrUrl } from 'src/app/config';
import { IRegister } from 'src/app/home/models/register';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  dept = 'D';
  part: string;


  constructor(
    private registerService: RegisterService
  ) { }

  ngOnInit(): void {
  }

  register(): void {

    // debugger;
    const user_id: HTMLInputElement = document.getElementById('user_id') as HTMLInputElement;
    const password: HTMLInputElement = document.getElementById('password') as HTMLInputElement;
    const user_nm: HTMLInputElement = document.getElementById('user_nm') as HTMLInputElement;
    const confirmPassword: HTMLInputElement = document.getElementById('confirmPassword') as HTMLInputElement;
    // this.dept: HTMLInputElement = document.getElementById('dept') as HTMLInputElement;
    const part: HTMLInputElement = document.getElementById('part') as HTMLInputElement;
    if (user_id.value === '') {
      alert('아이디를 입력하세요!');
      return;
    }
    if (password.value === '') {
      alert('암호를 입력하세요!');
      return;
    }
    if (confirmPassword.value === '') {
      alert('확인암호를 입력하세요!');
      return;
    }
    if (password.value !== confirmPassword.value) {
      alert('암호와 확인암호가 일치하지 않습니다.!');
      return;
    }
    if (user_nm.value === '') {
      alert('이름을 입력하세요!');
      return;
    }

    // this.registerService.registerUser(user_id.value, password.value, user_nm.value, dept.value, part.value)
    this.registerService.registerUser(user_id.value, password.value, user_nm.value, this.dept, part.value)
      .subscribe((data) => {
        console.log('[170][benign 수정]', data);
        if (data.message === 'DUPID') {
          alert('아이디가 이미 사용중입니다. 다른 아이디를 사용하십시요.');
        } else if (data.message === 'success') {
          alert('등록 되었습니다. 관리자가 승인후 사용이 가능합니다.');
          window.close();
        } else {
          alert(' 등록중 알수 없는 오류가 발생하였습니다.');
        }

      });
  }

  changeDepart(depart: string): void {
    this.dept = depart;
    console.log(this.dept);
  }

  deptStatus(dept: string): boolean {
    if (this.dept === dept) {
      return true;
    }
    return false;
  }



}
