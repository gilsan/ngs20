import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllComponent } from './all/all.component';
import { Form1Component } from './form1/form1.component';
import { Form2Component } from './form2/form2.component';
import { Form3Component } from './form3/form3.component';
import { Form4Component } from './form4/form4.component';
import { FormsComponent } from './forms.component';



const routes: Routes = [
  {
    path: '', component: FormsComponent, children: [
      { path: 'all', component: AllComponent },
      { path: 'all/:type', component: AllComponent },
      { path: 'form2', component: Form2Component },
      { path: 'form2/:type', component: Form2Component },
      { path: 'form3', component: Form3Component },
      { path: 'form3/:form3id', component: Form3Component },
      { path: 'form4', component: Form4Component },
      { path: 'form4/:form4id', component: Form4Component }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
