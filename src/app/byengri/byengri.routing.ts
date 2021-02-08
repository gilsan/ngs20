import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ByengriComponent } from './byengri/byengri.component';
import { ManageStatisticsComponent } from './byengri/manage-statistics/manage-statistics.component';
import { ManageUsersComponent } from './byengri/manage-users/manage-users.component';
import { ReportComponent } from './byengri/report/report.componen';

import { FileuploadComponent } from './fileupload/fileupload.component';
import { MainComponent } from './main/main.component';
import { MainpaComponent } from './mainpa/mainpa.component';
import { PathReportComponent } from './path-report/path-report.component';

const routes: Routes = [
  {
    path: '', component: ByengriComponent, children: [
      { path: '', component: MainComponent },
      { path: 'fileupload', component: FileuploadComponent },
      { path: 'fileupload/:id', component: FileuploadComponent },
      { path: 'report', component: ReportComponent },
      { path: 'report/:id', component: ReportComponent },
      { path: 'managestatistics', component: ManageStatisticsComponent },
      { path: 'manageusers', component: ManageUsersComponent },
      { path: 'report/:pathologyNum', component: ReportComponent },
      { path: 'sheet', component: PathReportComponent },
      { path: 'mainpa', component: MainpaComponent }


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],


  exports: [RouterModule]
})
export class ByengriRouting {

}
