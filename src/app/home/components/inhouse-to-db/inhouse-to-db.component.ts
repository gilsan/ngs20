import { Component, OnInit } from '@angular/core';
import { UploadResponse } from '../../models/uploadfile';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-inhouse-to-db',
  templateUrl: './inhouse-to-db.component.html',
  styleUrls: ['./inhouse-to-db.component.scss']
})
export class InhouseToDbComponent implements OnInit {

  upload: UploadResponse = new UploadResponse();
  isActive: boolean;
  constructor(
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = true;
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isActive = false;
    // console.log('Drag leave');
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      this.onDroppedFile(droppedFiles);
    }
    this.isActive = false;
  }

  onDroppedFile(droppedFiles: any) {
    const formData = new FormData();
    for (const item of droppedFiles) {
      formData.append('userfiles', item);
    }

    this.fileUploadService.inhouseDataUpload(formData)
      .subscribe(result => {
        this.upload = result;
      });
  }

  onSelectedFile(event: any) {
    if (event.target.files.length > 0) {
      this.onDroppedFile(event.target.files);
    }
  }

}
