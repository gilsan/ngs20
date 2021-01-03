import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';
// import { ClarityModule } from '@clr/angular';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { DiseaseformComponent } from '../forms/diseaseform/diseaseform.component';
import { ExcelDownloadComponent } from './components/excel-download/excel-download.component';
import { InhouseToDbComponent } from './components/inhouse-to-db/inhouse-to-db.component';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { DiseaseToDbComponent } from './components/disease-to-db/disease-to-db.component';

import { MainscreenComponent } from './components/mainscreen/mainscreen.component';
import { TsvuploadComponent } from './components/tsvupload/tsvupload.component';
import { ManageStatisticsComponent } from './components/manage-statistics/manage-statistics.component';
import { ManageFunctionsComponent } from './components/manage-functions/manage-functions.component';
import { DetailFunctionsComponent } from './components/detail-functions/detail-functions.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';

@NgModule({
  declarations: [
    HomeComponent, FileuploadComponent, DiseaseformComponent, ExcelDownloadComponent,
    InhouseToDbComponent, WorkflowComponent, DiseaseToDbComponent,
    MainscreenComponent,
    TsvuploadComponent,
    ManageStatisticsComponent,
    ManageFunctionsComponent,
    DetailFunctionsComponent,
    ManageUsersComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HttpClientModule,
    FormsModule,
    //  ClarityModule
  ]
})
export class HomeModule { }
