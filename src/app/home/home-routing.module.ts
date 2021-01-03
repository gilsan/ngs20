import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiseaseformComponent } from '../forms/diseaseform/diseaseform.component';
import { DiseaseToDbComponent } from './components/disease-to-db/disease-to-db.component';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { InhouseToDbComponent } from './components/inhouse-to-db/inhouse-to-db.component';
import { MainComponent } from './components/main/main.component';
import { MainscreenComponent } from './components/mainscreen/mainscreen.component';
import { ManageFunctionsComponent } from './components/manage-functions/manage-functions.component';
import { DetailFunctionsComponent } from './components/detail-functions/detail-functions.component';
import { ManageStatisticsComponent } from './components/manage-statistics/manage-statistics.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: MainscreenComponent },
      { path: 'fileupload', component: FileuploadComponent },
      { path: 'fileupload/:id', component: FileuploadComponent },
      { path: 'inhouse_to_db', component: InhouseToDbComponent },
      // { path: 'disease_to_db', component: DiseaseToDbComponent },
      { path: 'main', component: MainscreenComponent },
      {
        path: 'jingum', loadChildren: () => import('../forms/forms.module').then((m) => m.SaintFormsModule)
      },
      { path: 'jingum/:testcode', loadChildren: () => import('../forms/forms.module').then((m) => m.SaintFormsModule) },
      { path: 'inhouse', loadChildren: () => import('../inhouse/inhouse.module').then((m) => m.InhouseModule) },
      { path: 'managestatistics', component: ManageStatisticsComponent },
      { path: 'managefunctions', component: ManageFunctionsComponent },
      { path: 'detailfunctions', component: DetailFunctionsComponent },
      { path: 'manageusers', component: ManageUsersComponent },
      { path: 'disease_test', component: DiseaseformComponent },
      { path: '**', component: MainscreenComponent },

    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class HomeRoutingModule { }
