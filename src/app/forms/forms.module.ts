import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './forms.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Form1Component } from './form1/form1.component';
import { Form2Component } from './form2/form2.component';
import { Form3Component } from './form3/form3.component';
import { Form4Component } from './form4/form4.component';
import { ClarityModule } from '@clr/angular';
import { PreviewComponent } from './preview/preview.component';
import { AllComponent } from './all/all.component';
import { FilteredComponent } from './commons/filtered/filtered.component';
// import { TestformComponent } from './testform/testform.component';

@NgModule({
  declarations: [
    FormsComponent,
    Form1Component,
    Form2Component,
    Form3Component,
    Form4Component,
    PreviewComponent,
    AllComponent,
    FilteredComponent,
    //  TestformComponent
  ],
  imports: [
    CommonModule,
    FormsRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ClarityModule,
  ]
})
export class SaintFormsModule { }
