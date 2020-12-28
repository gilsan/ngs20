import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  type: string;

  loginGroup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.init();
    //  this.register();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  init() {
    this.loginGroup = this.fb.group({
      user: ['', [Validators.required]],
      passwd: ['', [Validators.required]]
    });
  }

  login(): void {

    if (this.type === undefined) {
      alert('진검, 병리 선택이 안되었습니다.');
      return;
    }

    if (this.type === 'diag') {
      this.subs.sink = this.authService.loginDiag(this.loginGroup.value.user, this.loginGroup.value.passwd)
        .subscribe((data) => {
          //  console.log('[46][diag]', data);
          if (data.message === 'WRONGID') {
            alert('아이디가 맞지 않습니다..');
          } else if (data.message === 'WRONGPW') {
            alert('암호가 맞지 않습니다.');
          } else {
            localStorage.setItem('userpart', 'diag');
            this.router.navigateByUrl('/diag');
          }
        });
    } else if (this.type === 'path') {
      this.subs.sink = this.authService.loginPath(this.loginGroup.value.user, this.loginGroup.value.passwd)
        .subscribe((data) => {
          // console.log('[56][path]', data);
          if (data.message === 'WRONGID') {
            alert('아이디가 맞지 않습니다.');
          } else if (data.message === 'WRONGPW') {
            alert('암호가 맞지 않습니다.');
          } else {
            localStorage.setItem('userpart', 'pathology');
            this.router.navigateByUrl('/pathology');
          }
        });
    }



  }

  register(): void {
    console.log('등록');
    this.router.navigateByUrl('/register');
    // this.subs.sink = this.authService.register(this.loginGroup.value.user, this.loginGroup.value.passwd)
    //   .subscribe((data) => {
    //     this.router.navigateByUrl('./register');
    //   });
  }


  route(type): void {
    if (this.type === '진검') {
      console.log('진검', this.loginGroup.value, this.type);
      this.ngZone.run(() => {
        this.router.navigateByUrl('/diag');
      });
    } else {
      console.log('병리', this.loginGroup.value, this.type);
      this.ngZone.run(() => {
        this.router.navigateByUrl('/pathology');
      });
    }
  }

  // 진검, 병리 구분
  result(type: string): void {
    this.type = type;
    console.log('[checkbox status]', this.type);
  }



}
