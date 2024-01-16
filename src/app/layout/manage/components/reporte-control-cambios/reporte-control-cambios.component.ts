import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService } from '../../services/project/project.service';

@Component({
  selector: 'app-reporte-control-cambios',
  templateUrl: './reporte-control-cambios.component.html',
  styleUrls: ['./reporte-control-cambios.component.css']
})
export class ReporteControlCambiosComponent implements OnInit {
  nid_project = 0;
  cdcArray:Array<any> = []
  titleProjectModal:string = "";
  tituloProject:string = "";
  constructor(@Inject(MAT_DIALOG_DATA) private data: any
  ,private projectService:ProjectService
  ,private dialogRef: MatDialogRef<ReporteControlCambiosComponent>,) { }

  ngOnInit(): void {
    this.nid_project = this.data['nidProject'];
    this.tituloProject = this.data['snameproject'];
    this.titleProjectModal = "Reporte de control de cambios"
    console.log("NIDPROJECT",this.nid_project)
    this.getcdcproject();
  }
  getcdcproject() {
    this.projectService.getcdcbyproject(this.nid_project).subscribe((response: any) => {
      console.log(response)
      this.cdcArray = response;
      
      // [disabled]="estimacionRegistrada"
    }, (error) => {
      console.error(error);
    });
  }
  closeModal() {
    this.dialogRef.close(null);
  }


}
