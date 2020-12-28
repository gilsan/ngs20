import { Component, Input, OnInit } from '@angular/core';
import { IAFormVariant, IComment, IPatient, IProfile } from 'src/app/home/models/patients';
import { StoreService } from '../store.current';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() result: string;
  patientInfo: IPatient;
  profile: IProfile;  //  { leukemia: '', flt3itd: '', chron: '' };
  dts: IAFormVariant[];
  specimenMsg: string;
  vusstatus: boolean;
  comments: IComment[];

  constructor(
    private store: StoreService
  ) { }

  ngOnInit(): void {
    // console.log('[15][preview]...', this.patientInfo, this.result, this.profile);
    this.patientInfo = this.store.getPatientInfo();
    this.profile = this.store.getProfile();
    this.dts = this.store.getDetactedVariants();
    this.specimenMsg = this.store.getSpecimenMsg();
    this.vusstatus = this.store.getVUSstatus();
    this.comments = this.store.getComments();
    console.log('[30][프로파일]', this.profile);
    console.log('[31][preview][mockData]\n', this.dts, this.specimenMsg, this.vusstatus);
    console.log('[32][preview][comments]\n', this.comments);
  }

}
