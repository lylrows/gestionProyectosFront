import { Component, OnInit, Inject } from '@angular/core';
import { ProjectService } from '../../../services/project/project.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportHoursExt } from '../../../model/project/project';

@Component({
  selector: 'app-reporte-persona',
  templateUrl: './reporte-persona.component.html',
  styleUrls: ['./reporte-persona.component.css']
})
export class ReportePersonaComponent implements OnInit {

  titleModal: string = "";
  listPersonHoursExt: any[];
  PersonHoursExt: ReportHoursExt = new ReportHoursExt();

  constructor(
    private dialogRef: MatDialogRef<ReportePersonaComponent>,
    private projectService: ProjectService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    dialogRef.disableClose = true;
   }

  ngOnInit(): void {
    this.titleModal = this.data['titleModal'];
    this.PersonHoursExt = this.data['reportHourExt'];
    this.getPersonHoursExt();
  }

  getPersonHoursExt(){
    this.PersonHoursExt.nid_person=Number(this.PersonHoursExt.nid_person)
    this.PersonHoursExt.num_mes=Number(this.PersonHoursExt.num_mes)
    console.log(this.PersonHoursExt);
    
    this.projectService.getpersonprojecthoursext(this.PersonHoursExt.nid_person,this.PersonHoursExt.num_mes).subscribe(resp=>{
      this.listPersonHoursExt=resp;
    })
  }

  closeModal(){
    this.dialogRef.close(null);
  }

}
