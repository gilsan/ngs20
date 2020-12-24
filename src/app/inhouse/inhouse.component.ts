import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inhouse',
  templateUrl: './inhouse.component.html',
  styleUrls: ['./inhouse.component.scss']
})
export class InhouseComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    console.log('로그아웃');
    this.router.navigateByUrl('/login');
  }

  goHome(): void {
    this.router.navigate(['/inhouse']);
  }

}
