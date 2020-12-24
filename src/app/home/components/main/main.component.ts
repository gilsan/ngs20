import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IPatient } from '../../models/patients';
import { PatientsListService } from '../../services/patientslist';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  list$: Observable<IPatient[]>;
  lists: IPatient[];
  selectedFile: File = null;
  pathologyNo: string;
  patientID: string;
  constructor(
    private patientsList: PatientsListService
  ) { }

  ngOnInit(): void {
    //  this.list$ = this.patientsList.getPatientList();
  }

  onUpload(): void { }

  onFileSelected(event): void {
    this.selectedFile = (event.target.files[0] as File);
  }

  setPatientID(id: string): void {
    this.patientID = id;
  }







}
