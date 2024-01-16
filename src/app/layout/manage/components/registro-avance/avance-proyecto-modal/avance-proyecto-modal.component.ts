import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { Progress, ProgressDetail, Project, ProjectStep2, ProjectStep2Detail, ProjectStep4, ProjectStep4Detail } from '../../../model/project/project';
import { ProjectService } from '../../../services/project/project.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-avance-proyecto-modal',
  templateUrl: './avance-proyecto-modal.component.html',
  styleUrls: ['./avance-proyecto-modal.component.css']
})
export class AvanceProyectoModalComponent implements OnInit {

  scodproject = "";
  snameproject = "";
  sstatusname = "";
  titleProjectModal = "";


  project: Project = new Project();
  projectStep2 :ProjectStep2 = new ProjectStep2();
  projectStep4 :ProjectStep4 = new ProjectStep4();
  listProjectStep4Detail : ProjectStep4Detail[] = [];
  progress: Progress = new Progress(); 
  listprogress: Progress[] = []; 
  actual_Date= new Date;

  int_first_date: number = 0;
  int_second_date: number = 0;
  comparation_first_date: ProgressDetail[] = []; 
  comparation_second_date: ProgressDetail[] = []; 

  filtro_registro_nuevo = 0;
  filtro_comparation_date = 0;

  projectDisable: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AvanceProyectoModalComponent>,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) private data: any
    ) {
    dialogRef.disableClose = true;

      this.actual_Date.setMilliseconds(0);
      this.actual_Date.setSeconds(0);
      this.actual_Date.setMinutes(0);
      this.actual_Date.setHours(0);
    }

  ngOnInit() {
    this.scodproject       = this.data['scodproject'];
    this.sstatusname       = this.data['sstatusname'];
    this.snameproject      = this.data['snameproject'];
    this.titleProjectModal = this.data['titleProjectModal'];

    if(this.scodproject!=""){
      this.project.scodproject=this.scodproject;
      this.getProjectdtep2();
      this.getProjectdtep4();
    }
    if(this.sstatusname=="Inactivo") {
      this.projectDisable = true;
    } else {
      this.projectDisable = false;
    }
  }

  getProjectdtep2() {
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectdtep2(this.project.scodproject).subscribe((response: any) => {
      this.spinner.hide('SpinnerProject');
      this.projectStep2 = response;
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectdtep4(){
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectdtep4(this.project.scodproject).subscribe((response: any) => {
      this.spinner.hide('SpinnerProject');
      this.projectStep4 = response;
      this.getProjectdtep4Detail();
    }, (error) => {
      console.error(error);
    });
  }

  getProjectdtep4Detail(){
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectdtep4detail(this.projectStep4.nid_project_step4)
    .subscribe((response: any) => {
      this.spinner.hide('SpinnerProject');
      if(response === null ){
        this.dialogRef.close("FC");
      }

      // La fecha llega en string no en date
      this.listProjectStep4Detail = response;
      this.listProjectStep4Detail.forEach(element => {
        element.finish = new Date(element.finish)
        element.finish.setMilliseconds(0);
        element.finish.setSeconds(0);
        element.finish.setMinutes(0);
        element.finish.setHours(0);

        element.start = new Date(element.start)
        element.start.setMilliseconds(0);
        element.start.setSeconds(0);
        element.start.setMinutes(0);
        element.start.setHours(0);
      });

      this.getProjectProgress();
    }, (error) => {
      console.error(error);
    });
  }

  cerrarModal() {
    this.dialogRef.close(null);
  }
  
  getProjectProgress(){
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectprogress(this.scodproject).subscribe((response: any) => {
      this.spinner.hide('SpinnerProject');
      if(response == null) {
          this.createProgressFromListProjectStep4Detail();
      }
      else {
        this.listprogress = response;
        if(this.listprogress.length >= 2) {
          this.int_first_date = 0;
          this.int_second_date = 1;
          this.comparation_first_date = this.listprogress[0].listProgressDetail;
          this.comparation_second_date= this.listprogress[1].listProgressDetail;
        } else {
          this.int_first_date = 0;
          this.int_second_date = 0;
          this.comparation_first_date = this.listprogress[0].listProgressDetail;
          this.comparation_second_date = this.listprogress[0].listProgressDetail;
        }
        this.createProgressFromListProjectStep4Detail();
      }
    }, (error) => {
      console.error(error);
    });
  }

  createProgressFromListProjectStep4Detail() {
    this.progress = new Progress(); 
    this.progress.scodproject = this.scodproject;
    this.progress.registration_date = this.actual_Date;


    if(this.comparation_first_date.length > 0) {
      var index = 0;
      for(let element of this.listProjectStep4Detail) {
        var newProgressDetail: ProgressDetail = new ProgressDetail();
        newProgressDetail.name = element.name;
        newProgressDetail.planificado = this.getEstimate(element);
        newProgressDetail.start = element.start;
        newProgressDetail.finish = element.finish;
        newProgressDetail.real = newProgressDetail.planificado

        // Por el nombre no va ser posible debido a que existen varios con el mismo name
        // var anteriorRegistro = this.comparation_first_date.find(cfd => cfd.name == element.name);
               
        var anteriorRegistro = this.comparation_first_date[index]
        if(anteriorRegistro != undefined) {
          newProgressDetail.last = anteriorRegistro.real;
        } else {
          newProgressDetail.last = 0;
        }

        // this.int_first_date = 0;
        // this.int_second_date = 1;
        var firstDate = new Date(this.listprogress[this.int_first_date].registration_date);
        firstDate.setMilliseconds(0);
        firstDate.setSeconds(0);
        firstDate.setMinutes(0);
        firstDate.setHours(0);
        var secondDate = new Date(this.listprogress[this.int_second_date].registration_date);
        secondDate.setMilliseconds(0);
        secondDate.setSeconds(0);
        secondDate.setMinutes(0);
        secondDate.setHours(0);

        if(firstDate < this.actual_Date) {
          var last_registrated1 =  this.comparation_first_date[index];
          if(last_registrated1 != undefined) {
            newProgressDetail.last_registrated = this.comparation_first_date[index].real;
          } else {
            newProgressDetail.last_registrated = 0;
          }

        } else {
          if(firstDate > secondDate) {
            var last_registrated2 =  this.comparation_second_date[index];
            if(last_registrated2 != undefined) {
              newProgressDetail.last_registrated = this.comparation_second_date[index].real;
            } else {
              newProgressDetail.last_registrated = 0;
            }
          } else {
            newProgressDetail.last_registrated = 0;
          }
        }

        index++;
        this.progress.listProgressDetail.push(newProgressDetail);
      };
    } else {
      this.listProjectStep4Detail.forEach(element => {
        var newProgressDetail: ProgressDetail = new ProgressDetail();
        newProgressDetail.name = element.name;
        newProgressDetail.planificado = this.getEstimate(element);
        newProgressDetail.start = element.start;
        newProgressDetail.finish = element.finish;
        newProgressDetail.real = newProgressDetail.planificado
        this.progress.listProgressDetail.push(newProgressDetail);
      });
    }
  }

  getEstimate(element: ProjectStep4Detail) {
      // IIf([Comienzo]>Date();0;
      // IIf([Fin]<Date();100;
      // ELSE((Date()-[Comienzo])/([Fin]-[Comienzo]))*100))
      return element.start.getTime() > this.actual_Date.getTime()? 0: element.finish.getTime() <= this.actual_Date.getTime()? 100: Number(((this.calculateNumberOfDays(element.start, this.actual_Date)/ this.calculateNumberOfDays(element.start, element.finish))*100).toFixed(2));
  }

  calculateNumberOfDays(startDate: Date, endDate: Date) {
    var nextDay = new Date(startDate);
    var cnt = 0;
    do {
        cnt += (nextDay.getDay() >= 1 && nextDay.getDay() <= 5) ? 1 : 0;
        nextDay.setDate(nextDay.getDate() + 1);
    } while (nextDay.getTime() <= endDate.getTime());

    if(cnt == 0) cnt+= 1;
    return cnt;
  }

  saveProgreso() {
    this.spinner.show('SpinnerProject');
    this.projectService.insupprojectprogress(this.progress).subscribe(result => {
      this.spinner.hide('SpinnerProject');
      if (result != null){
        this.getProjectProgress();
        Swal.fire({
          icon: 'success',
          title: 'Se registro correctamente la estimación' ,
        });
      } else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar avance del proyecto.',
        });
      }
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });

  }

  change_first_date() {
    if(this.listprogress.length > 0) {
      this.comparation_first_date = this.listprogress[this.int_first_date].listProgressDetail;
    }
  }
  
  change_second_date() {
    if(this.listprogress.length > 0) {
      this.comparation_second_date = this.listprogress[this.int_second_date].listProgressDetail;
    }
  }

  currencyCheck(event, item): boolean
  {
    let pattern = /^\d{1,3}\.?\d{0,2}$/;
    let result = pattern.test(event.key);
    if (item.real == null)
      return result;
    else
      return pattern.test(item.real.toString() + event.key);
  }

}
