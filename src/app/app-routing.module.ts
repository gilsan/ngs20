import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/authguard.service';
import { PathAuthGuard } from './services/pathguard.service';

const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'diag', loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
    canActivate: [PathAuthGuard]
  },
  {
    path: 'pathology', loadChildren: () => import('./byengri/byengri.module').then((m) => m.ByengriModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],

  exports: [RouterModule]
})
export class AppRoutingModule { }
