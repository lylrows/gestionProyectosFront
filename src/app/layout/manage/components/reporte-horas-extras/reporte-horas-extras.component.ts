import { Component, OnInit } from '@angular/core';
import { FilterProject, FilterProjectAssigned } from '../../model/project/filterproject';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectService } from '../../services/project/project.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { PermisoService } from '../../services/common/permiso.service';
import { MasterTable } from '../../model/common/mastertable';
import { Client } from '../../model/client/client';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import Swal from 'sweetalert2';
import { User } from '../../model/user/user';
import { MatDialog } from '@angular/material/dialog';
import { GetReportHoursExt, ReportHoursExt } from '../../model/project/project';
import { ReportePersonaComponent } from './reporte-persona/reporte-persona.component';

@Component({
  selector: 'app-reporte-horas-extras',
  templateUrl: './reporte-horas-extras.component.html',
  styleUrls: ['./reporte-horas-extras.component.css']
})
export class ReporteHorasExtrasComponent implements OnInit {

  public BreadLevel01 = 'Reportes';
  public Title = 'Reportes de Horas Extras';

  filterProject: FilterProjectAssigned = new FilterProjectAssigned();
  projectList: any[] = [];
  currentPage: number = 1; // seteamos a la pagina 1
  itemsPerPage: number = 10; // mostramos 5 registros por pagina
  totalItems: number = 0; // Total de registro
  scodprojectSeleccionado:string="";
  snameprojectSeleccionado:string=""; 
  sstatusnameSeleccionado:string="";

  listState: MasterTable[] = [];
  ClientDropDownList: Client[];
  ProjectTypeDropDownList: DropDownList[];
  PersonDropDownList: DropDownList[];
  listReporteHorasExtras: any[];

  ObjReportHoursExt: GetReportHoursExt=new GetReportHoursExt();
  listReportHoursExt: any[];
  
  reportHourExt: ReportHoursExt=new ReportHoursExt();

  listAreas: any[];

  user: User = new User();

  nid_person_login = 0;

  permisoConsultar: boolean = false;
  permisoRegistrarHora: boolean = false;
  permisoRegistrarHorasBloqueModal: boolean = false;
  permisoAdministrador: boolean = false;

  date1String: string = "";
  nid_area: number = 0;

  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private mastertableService: MastertableService,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService,
    private dialog: MatDialog
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
   }

   ngOnInit() {
    this.ObjReportHoursExt.option=0;
    this.ObjReportHoursExt.mes=0;
    this.ObjReportHoursExt.anio=0;
    this.ObjReportHoursExt.nid_area=0;
    this.obtenerPermisos();
    this.nid_person_login = JSON.parse(sessionStorage.getItem('User')).nid_person;

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
   }

   this.getReportHoursExt();
   this.getPersonReportHoursExt();
   this.getareas();
  }

  fecha(){
    // console.log(this.date1String);
    // let fec=this.date1String?.split('-');
    // console.log(fec);
    // this.ObjReportHoursExt.mes=Number(fec[1]);
    // this.ObjReportHoursExt.anio=Number(fec[0]);
    // console.log(this.ObjReportHoursExt);
  }

  getReportHoursExt(){
    this.projectService.getreporthoursext(this.ObjReportHoursExt).subscribe((response: any)=>{
      console.log(response);
      this.listReportHoursExt=response;
    })
  }

  getPersonReportHoursExt(){ //reporte por person y mes
    this.projectService.getpersonprojecthoursext(6179, 10638).subscribe((response: any)=>{
      console.log(response);
    })
  }

  getareas(){
    this.mastertableService.getmastertable(32).subscribe(response=>{
      this.listAreas=response;
    })
  }
  
  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(31).subscribe((response: any) => {
      response.forEach(element => {
        if(element.sname=="Consultar"){
          this.permisoConsultar = element.permission
        }
      });

      // this.begin();

    }, (error) => {
      console.error(error);
    });
  }

  getState() {
    this.spinner.show('SpinnerProject');
    //let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(50).subscribe((response: any) => {
      this.listState = response;
      this.listState = this.listState.filter(x => x.sshort_value == "ACTIVO" ||  x.sshort_value == "CERRADO")

      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  
  search() {
    console.log(this.date1String);
    let fec=this.date1String?.split('-');
    //console.log(fec);
    this.ObjReportHoursExt.mes=Number(fec[1]);
    this.ObjReportHoursExt.anio=Number(fec[0]);
    this.ObjReportHoursExt.option=1;
    this.ObjReportHoursExt.nid_area=Number(this.nid_area);
    console.log(this.ObjReportHoursExt);
    this.getReportHoursExt();
    
  }

  thereAreProjectsLoad():boolean{
    if (typeof this.listReportHoursExt === 'undefined') return false;
    if (this.listReportHoursExt === null) return false;
    if (this.listReportHoursExt.length === 0) return false;

    return true;
  }


  abrirReporteHorasExtras(item){
    this.reportHourExt=item;
    const dialogReporteHorasExtras = this.dialog.open(ReportePersonaComponent, {
      width: '600px',
      height: '70%',
      autoFocus:false,
      data: {
        titleModal: "Horas Extra: " + item.sname,
        reportHourExt: this.reportHourExt
      },
      disableClose: false,
    });
    dialogReporteHorasExtras.afterClosed().subscribe(data => {
      // if(data != null) {
        //this.search ();
      // }
    })
  }

}
