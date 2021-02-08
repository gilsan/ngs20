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
import { ManageUsersComponent } from './byengri/manage-users/manage-users.component';
import { ManageStatisticsComponent } from './byengri/manage-statistics/manage-statistics.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ScrollMonitorDirective } from './directives/scroll-monitor.directive';
import { MainpaComponent } from './mainpa/mainpa.component';


@NgModule({
  declarations: [
    ByengriComponent,

    FileuploadComponent,
    ReportComponent,
    MainComponent,
    UploadComponent,
    PathReportComponent,
    ManageUsersComponent,
    ManageStatisticsComponent,
    ScrollMonitorDirective,
    MainpaComponent,


  ],
  imports: [

    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ByengriRouting,
    ClarityModule,
    MaterialModule,
    NgxBarcodeModule
  ]
})
export class ByengriModule { }
