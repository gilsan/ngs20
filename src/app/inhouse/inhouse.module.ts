import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InhouseRoutingModule } from './inhouse-routing.module';
import { InhouseComponent } from './inhouse.component';
import { MutationComponent } from './mutation/mutation.component';

import { ArtifactsComponent } from './artifacts/artifacts.component';
import { CommentsComponent } from './comments/comments.component';
import { BenignComponent } from './benign/benign.component';



@NgModule({
  declarations: [
    InhouseComponent,
    MutationComponent,
    ArtifactsComponent,
    CommentsComponent,
    BenignComponent,
  ],
  imports: [

    CommonModule,
    InhouseRoutingModule
  ]
})
export class InhouseModule { }
