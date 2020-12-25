import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ByengriComponent } from './byengri/byengri.component';
import { ByengriRouting } from './byengri.routing';
import { FileuploadComponent } from './fileupload/fileupload.component';
import { MainComponent } from './main/main.component';
import { ReportComponent } from './byengri/report/report.componen';
import { ClarityModule } from '@clr/angular';
import { UploadComponent } from './upload/upload.component';
import { PathReportComponent } from './path-report/path-report.component';
import { MaterialModule } from '../material.module';



@NgModule({
  declarations: [
    ByengriComponent,

    FileuploadComponent,
    ReportComponent,
    MainComponent,
    UploadComponent,
    PathReportComponent,


  ],
  imports: [

    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ByengriRouting,
    ClarityModule,
    MaterialModule
  ]
})
export class ByengriModule { }
