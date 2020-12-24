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

@NgModule({
  declarations: [
    HomeComponent, FileuploadComponent, DiseaseformComponent, ExcelDownloadComponent,
    InhouseToDbComponent, WorkflowComponent, DiseaseToDbComponent,
    MainscreenComponent,
    TsvuploadComponent
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
