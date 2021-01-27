import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';
import { SubSink } from 'subsink';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  list$: Observable<IPatient[]>;
  lists: IPatient[];
  selectedFile: File = null;
  pathologyNo: string;
  patientID: string;

  private subs = new SubSink();

  constructor(
    private patientsList: PatientsListService
  ) { }

  ngOnInit(): void {
    this.list$ = this.patientsList.getPatientList();
    this.subs.sink = this.list$.subscribe(data => {
      console.log('[28][main.component][ngOnInit]', data);
    });
  }

  ngOnDestroy(): void {
    this.subs.sink.unsubscribe();
  }

  onUpload(): void { }

  onFileSelected(event): void {
    this.selectedFile = (event.target.files[0] as File);
  }

  setPatientID(id: string): void {
    this.patientID = id;
  }







}
