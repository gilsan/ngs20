import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAFormVariant, IComment, IPatient, IProfile } from 'src/app/home/models/patients';
import { StoreService } from '../store.current';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  @Input() vusmsg: string;
  @Input() result: string;
  @Input() type: string;
  @Output() closemodal = new EventEmitter<void>();
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
    this.dts = this.store.getDetactedVariants(); // 스토어에 detected variants 저장
    this.specimenMsg = this.store.getSpecimenMsg();
    this.vusstatus = this.store.getVUSstatus();
    this.comments = this.store.getComments();

    console.log('[30][preview]', this.dts);
    console.log('[30][preview][프로파일]', this.profile);
    console.log('[31][preview][mockData]\n', this.specimenMsg, this.vusstatus);
    console.log('[32][preview][comments]\n', this.comments);
    console.log('[32][preview][vusmsg]\n', this.vusmsg);
  }

  closeModal(): void {
    this.closemodal.emit(null);
  }

}
