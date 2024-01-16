import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProjectHoursLog } from '../../model/project/filterproject';
import { PersonalProject, Project, ProjectHoursLog, ProjectEstimate, ProjectStep2, WeeksProjectPerson, PersonalExternal } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { User } from 'src/app/layout/manage/model/user/user';
import { DatePipe } from '@angular/common'
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RegistroProveedorExternoComponent } from './registro-proveedor-externo/registro-proveedor-externo.component';

defineLocale('es', esLocale);


@Component({
  selector: 'app-registro-horas-detalle',
  templateUrl: './registro-horas-detalle.component.html',
  styleUrls: ['./registro-horas-detalle.component.css']
})
export class RegistroHorasDetalleComponent implements OnInit {

  titleProjectModal = "";
  scodproject = "";
  snameproject = "";
  nid_jefe_proyecto = 0;
  nid_rol = 0;
  nid_job_managerarea = 0;
  registroBloque = false;
  sstatusname = "";


  filterProject: FilterProjectHoursLog = new FilterProjectHoursLog();
  currentPage: number = 1; // seteamos a la pagina 1
  itemsPerPage: number = 10; // mostramos 5 registros por pagina
  totalItems: number = 0; // Total de registro
  project: Project = new Project();
  projectHoursLog: ProjectHoursLog = new ProjectHoursLog();
  projectApprovHours: ProjectHoursLog = new ProjectHoursLog();
  listFases: MasterTable[];
  tituloBoton = "Registrar";
  fecha_hoy = new Date();
  s_fecha_hoy = this.fecha_hoy.getFullYear() + "-" + String(this.fecha_hoy.getMonth() + 1).padStart(2, '0') + "-" + String(this.fecha_hoy.getDate()).padStart(2, '0');
  dateString: string = this.s_fecha_hoy;
  dateRangeString: string = this.s_fecha_hoy;
  user: User = new User();
  public itemForm: FormGroup;
  listProjectEstimate: ProjectEstimate[];
  listCategoriaHora: MasterTable[];
  listPersonalExt: PersonalExternal[];
  typeHour: number = 1;
  typePerExt: number = 0;
  descripProveedor: string = "";

  viewWeek: boolean = false;
  ManagerDisabled: boolean = true;
  ManagerAreaDisabled: boolean = true;
  projectManagerDisabled: boolean = true;
  PersonalList: PersonalProject[] = [];
  ClientDropDownList: DropDownList[];
  PersonDropDownList: DropDownList[];
  ProjectTypeDropDownList: DropDownList[];
  listProjectHoursLog: any[];
  listprojHour: [];

  projectStep2: ProjectStep2 = new ProjectStep2();
  fecha_inicio_proyecto: any;
  fecha_fin_proyecto: any;
  string_fecha_inicio_proyecto: any;
  string_fecha_fin_proyecto: any;
  permisoAdministrativo:boolean = false;


  tituloProject = "";

  public dateRange: Date;
  public date: Date;

  projectDisable: boolean = false;
  isTypeExtra: boolean;
  enabledHourExtra: boolean = true;
  IsManager: boolean = true;
  isApprov: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<RegistroHorasDetalleComponent>,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private mastertableService: MastertableService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private projectService: ProjectService,
    public datepipe: DatePipe,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    dialogRef.disableClose = true;
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
    this.project.nid_manager = JSON.parse(sessionStorage.getItem('User')).nid_person;
  }

  nidchannel = 0;
  startDateFilter: any;
  endDateFilter: any;

  ngOnInit() {
    this.titleProjectModal = this.data['titleProjectModal'];
    this.scodproject = this.data['scodproject'];
    this.snameproject = this.data['snameproject'];
    this.nid_jefe_proyecto = this.data['nid_jefe_proyecto'];
    this.nid_rol = this.data['nid_rol'];
    this.nid_job_managerarea = this.data['nid_job_managerarea'];
    this.registroBloque = this.data['registroBloque'];
    this.sstatusname = this.data['sstatusname'];

    if (this.sstatusname == "Inactivo" || this.sstatusname == "Cerrado") {
      this.projectDisable = true;
    } else {
      this.projectDisable = false;
    }
    
    if(this.scodproject.startsWith("ADM"))
    {
      this.permisoAdministrativo = true;
    }

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }
    // Aca la verdad ya entra jefe de proyecto o encargado o permisos de administradores.
    // El nid_jefe de proyecto solo va llegar a esta vista si el que se logea es un jefe de proyecto, en caso contrario llega 0
    if (this.nid_jefe_proyecto == this.user.nid_person) {
      this.ManagerDisabled = false;
      this.enabledHourExtra = false;
    }
    if (this.nid_job_managerarea == this.user.nid_job){
      this.ManagerAreaDisabled = false;
      this.enabledHourExtra = false;
    }

    this.dateRange = new Date();
    this.date = new Date();
    this.tituloProject = this.scodproject + " - " + this.snameproject;

    if (this.scodproject != "") {
      this.filterProject.scodproject = this.scodproject;
      this.getProjectdtep2();
      this.getProjectHoursLogPagination();
    }
    this.getFases();
    this.getPersonDropDown();
    this.getProjectEstimate();
    this.getCategoriaHora();
    //this.getPersonalExt();
  }

  getPersonalExt(typeHour: number) {
    console.log(typeHour);
    this.typeHour = Number(this.typeHour)
    if (typeHour == 2) {
      this.enabledHourExtra = false;
    }
    if (typeHour == 3 || typeHour == 4) {
      this.projectService.getpersonalexternal(typeHour).subscribe((response: any) => {
        console.log("externo:", response)
        this.listPersonalExt = response;
      }, (error) => {
        console.error(error);
      });
    }
    else {
      console.log('No es 3 ni 4');
      this.listPersonalExt = [];
      this.getProjectHoursLogPagination();
    }
  }

  getProjectdtep2() {
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectdtep2(this.scodproject).subscribe((response: any) => {
      this.projectStep2 = response;

      this.string_fecha_inicio_proyecto = response.dbegin_date;
      this.fecha_inicio_proyecto = new Date(response.dbegin_date);
      this.fecha_inicio_proyecto.setDate(this.fecha_inicio_proyecto.getDate() + 1);

      this.string_fecha_fin_proyecto = response.dfinish_date;
      this.fecha_fin_proyecto = new Date(response.dfinish_date);
      this.fecha_fin_proyecto.setDate(this.fecha_fin_proyecto.getDate() + 1);

      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectHoursLogPagination() {
    this.listProjectHoursLog = [];
    this.filterProject.nid_person = Number(this.project.nid_manager);
    if (this.typeHour != 2) {
      this.typeHour = 1;
    }
    this.typePerExt = 0;
    this.listPersonalExt = [];
    this.projectService.getprojecthourslogpagination(this.filterProject).subscribe((response: any) => {
      //console.log("LOG lo que retorna", response)
      this.listProjectHoursLog = response.data;
      //console.log(this.listProjectHoursLog);
      this.totalItems = response.pagination.totalItems;
    }, (error) => {
      console.error(error);
    });
  }

  getProjectHoursExtPagination() {
    console.log('Debe entrar');
    this.listProjectHoursLog = [];
    this.filterProject.nid_person = Number(this.project.nid_manager);
    this.filterProject.nid_external = Number(this.typePerExt);
    this.projectService.getprojecthoursextpagination(this.filterProject).subscribe((response: any) => {
      console.log("EXT lo que retorna", response)
      this.listProjectHoursLog = response.data;
      this.totalItems = response.pagination.totalItems;
    }, (error) => {
      console.error(error);
    });
  }

  getProjectHoursExtra() {
    console.log(this.isTypeExtra);
    if (this.isTypeExtra) {
      this.listProjectHoursLog = [];
      this.filterProject.nid_person = Number(this.project.nid_manager);
      this.typeHour = 2;
      this.typePerExt = 0;
      this.listPersonalExt = [];
      this.projectService.getprojecthourslogpagination(this.filterProject).subscribe((response: any) => {
        this.listProjectHoursLog = response.data;
        this.listProjectHoursLog = this.listProjectHoursLog.filter(x => x.stype == 2)
        console.log("extra lo que retorna", this.listProjectHoursLog)
        console.log(this.listProjectHoursLog);
        this.totalItems = response.pagination.totalItems;
      }, (error) => {
        console.error(error);
      });
    } else {
      this.getProjectHoursLogPagination();
    }
  }

  addDaysToDate(date, days) {
    var res = new Date(date);
    res.setDate(res.getDate() + days);
    //console.log(res)
    return res;

  }
  getPersonDropDown() {

    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {

      if (response == null) {
        return;
      }
      this.PersonDropDownList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  validateHoursLog() {
    let isvalidhourslog = true;

    if (this.dateString == undefined || this.dateString == '') {
      Swal.fire({
        icon: 'error',
        title: 'Fecha de Inicio es Requerida',
      });
      isvalidhourslog = false;
      return isvalidhourslog;
    }
    let fecha_dateString = new Date(this.dateString);
    fecha_dateString.setDate(fecha_dateString.getDate() + 1);

    // Si existe la fecha de fin
    if (this.dateRangeString != undefined && this.dateRangeString != '') {
      let fecha_dateRangeString = new Date(this.dateRangeString);
      fecha_dateRangeString.setDate(fecha_dateRangeString.getDate() + 1);

      if (fecha_dateString > fecha_dateRangeString) {
        Swal.fire({
          icon: 'error',
          title: 'La Fecha Inicio no puede ser mayor a Fecha Fin',
        });
        isvalidhourslog = false;
        return isvalidhourslog;
      }

      // Si existe la fecha de inicio
      if (this.dateString != undefined && this.dateString != '') {
        if (fecha_dateRangeString < fecha_dateString) {
          Swal.fire({
            icon: 'error',
            title: 'La Fecha Fin no puede ser menor a Fecha Inicio',
          });
          isvalidhourslog = false;
          return isvalidhourslog;
        }

      }

    }

    if (this.projectHoursLog.nnumber_hours <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'El número de horas debe ser mayor a 0',
      });
      isvalidhourslog = false;
      return isvalidhourslog;
    }
    if (this.projectHoursLog.nid_phase == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Seleccion fase del proyecto',
      });
      isvalidhourslog = false;
      return isvalidhourslog;
    }

    if (this.projectHoursLog.sdescription == '') {
      Swal.fire({
        icon: 'error',
        title: 'Descripción es requerida',
      });
      isvalidhourslog = false;
      return isvalidhourslog;
    }

    return isvalidhourslog;
  }

  saveHoursLog() {
    /*this.listProjectHoursLog.forEach(function (item) {
      item.nid_person=Number(item.nid_person);
    });*/

    this.date = new Date(this.dateString);
    if (!this.registroBloque) {
      this.dateRange = new Date(this.dateString);
    } else {
      if (this.tituloBoton != "Actualizar") {
        if (this.dateRangeString != '') {
          this.dateRange = new Date(this.dateRangeString);
        } else {
          this.dateRange = new Date(this.dateString);
        }
      }
    }
    if (!this.validateHoursLog()) {
      console.log("No es valido");
      return
    }
    else {
      this.projectHoursLog.scodproject = this.filterProject.scodproject;
      this.projectHoursLog.nid_phase = Number(this.projectHoursLog.nid_phase);
      this.projectHoursLog.nid_person = Number(this.project.nid_manager);
      this.projectHoursLog.nid_external = Number(this.typePerExt);
      this.projectHoursLog.dregistration_date = this.date;
      this.projectHoursLog.dregistration_dateFin = this.dateRange;
      if(!this.isApprov){
        this.projectHoursLog.stype= Number(this.typeHour);
      }

      //si es JP o stype != 1(Hora Laboral) se crea como pendiente
      if (this.nid_rol === 1 || this.projectHoursLog.stype !== 1) {
        this.projectHoursLog.approv = 1;
        this.projectHoursLog.sstate = "P";
      }
      //si es (JP o manager del proyecto) y el stype es 1(Hora Laboral), entonces ingresarlo como aprobado
      //o
      //si es gerente de area, entonces ingresarlo como aprobado
      if ((!this.ManagerDisabled && this.projectHoursLog.stype === 1) || !this.ManagerAreaDisabled) {
        this.projectHoursLog.sstate = "A";
      }

      this.spinner.show('SpinnerProject');
      console.log(this.projectHoursLog);

      this.projectService.insuprojecthourslog(this.projectHoursLog).subscribe(result => {
        this.spinner.hide('SpinnerProject');
        console.log(result);


        if (result == null) {
          return;
        }

        if (result.resultado == 1) {
          this.tituloBoton = "Registrar";
          if (this.typeHour == 3 || this.typeHour == 4) {
            this.getProjectHoursExtPagination();
          }
          if (this.typeHour == 1 || this.typeHour == 2) {
            this.getProjectHoursLogPagination();
          }
          Swal.fire({
            icon: 'success',
            title: 'Se registro correctamente el detalle de la hora',
          });

          console.log(result.mensaje);//Horas extras, RESULT= "1 8500" 1: rol de jefe de proyecto , 8500: nuevo id de project hour log

          this.dateString = this.s_fecha_hoy;
          if (this.registroBloque) {
            this.dateRangeString = this.s_fecha_hoy;
          }
          this.projectHoursLog = new ProjectHoursLog();
          this.typeHour = 1;
          this.descripProveedor = "";
          this.listPersonalExt = [];
          this.projectHoursLog.approv = 0;

        } else if (result.resultado == 2) {
          this.getProjectHoursLogPagination();
          Swal.fire({
            icon: 'error',
            title: result.mensaje,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar el detalle de la hora.',

          });
        }
        this.spinner.hide('SpinnerProject');
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });

    }

    // this.projectHoursLog = new ProjectHoursLog();

  }
  closeModal() {
    this.dialogRef.close(null);
  }
  thereAreProjectsLoad(): boolean {

    if (typeof this.listProjectHoursLog === 'undefined') return false;
    if (this.listProjectHoursLog === null) return false;
    if (this.listProjectHoursLog.length === 0) return false;

    return true;
  }
  pageChanged(event: any): void {
    this.currentPage = event;
    this.filterProject.pagination.CurrentPage = this.currentPage;
    this.getProjectHoursLogPagination();
  }
  ChangeRecordByPage() {
    this.filterProject.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.getProjectHoursLogPagination();
  }
  EditHoursLog(item) {
    this.projectHoursLog = new ProjectHoursLog();
    this.projectHoursLog = item;
    console.log(item);
    console.log(this.projectHoursLog);
    this.typeHour = item.stype;
    this.descripProveedor = item.snameprovider;
    this.typePerExt = item.nid_external;
    this.dateString = this.datepipe.transform(item.dregistration_date, 'yyyy-MM-dd');
    this.dateRangeString = this.datepipe.transform(item.dregistration_dateFin, 'yyyy-MM-dd');

    // let year =item.dregistration_date.getFullYear();
    // let month =item.dregistration_date.getMonth();
    // let date = item.dregistration_date.getDate();
    // date1.setFullYear(year,month,date);
    // this.projectHoursLog.dregistration_date=date1;
    // console.log(year);
    // console.log(month);
    // console.log(date);
    // console.log(date1);
    this.date = this.projectHoursLog.dregistration_date;
    this.dateRange = this.projectHoursLog.dregistration_dateFin;
    this.tituloBoton = "Actualizar";

    if(!this.ManagerDisabled && this.projectHoursLog.stype!=1){
      this.projectHoursLog.approv=1;
    }
  }

  ApproveHoursLog(item,type){
    this.projectHoursLog=item;
    if (this.permisoAdministrativo) {
      if (type === 0) {
        this.projectHoursLog.sstate = "A1";
      } else if (type === 1) {
        this.projectHoursLog.sstate = "A2";
      }
    } else {
      this.projectHoursLog.sstate = "A";
    }
    this.projectHoursLog.stype=Number(item.stype);
    this.dateString =this.datepipe.transform(item.dregistration_date, 'yyyy-MM-dd');
    this.dateRangeString =this.datepipe.transform(item.dregistration_date, 'yyyy-MM-dd');
    this.date = this.projectHoursLog.dregistration_date;
    this.dateRange = this.projectHoursLog.dregistration_date;
    console.log(this.projectHoursLog);
    this.isApprov=true;
    this.projectHoursLog.approv=1;
    this.saveHoursLog();
    this.isApprov=false;
    this.projectHoursLog.approv=0;
  }

  DelHoursLog(item) {
    item.sactive = "D";
    //item.scodproject="";
    console.log(item);
    item.approv=1;
    console.log(item);
    this.projectService.insuprojecthourslog(item).subscribe(result => {
      if (result == null) {
        console.log("ocurrió un error");
        return;
      }

      if (result.resultado == 1) {
        this.getProjectHoursLogPagination();
        Swal.fire({
          icon: 'success',
          title: 'Se eliminó el registro correctamente',

        });
      } else if (result.resultado == 2) {
        this.getProjectHoursLogPagination();
        Swal.fire({
          icon: 'error',
          title: result.mensaje,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al eliminar el registro.',

        });
      }
    }, (error) => {
      console.error(error);
    });
  }
  getFases() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(18).subscribe((response: any) => {
      this.listFases = response;
      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getCategoriaHora() {
    this.spinner.show('SpinnerProject');

    let listCategorias: MasterTable = new MasterTable();

    this.mastertableService.getmastertable(-1).subscribe((res: any) => {
      listCategorias = res.find(x=>x.typeaux==4);
      console.log(listCategorias.nid_mastertable);
      this.spinner.hide('SpinnerProject');
      this.mastertableService.getmastertable(listCategorias.nid_mastertable).subscribe((response: any) => {
        this.listCategoriaHora = response;
        this.spinner.hide('SpinnerProject');

      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });

    
  }

  getProjectEstimate() {
    this.projectService.getprojectestimate(this.scodproject, 2).subscribe((response: any) => {
      console.log("Lista de miembros del equipo", response)
      this.listProjectEstimate = response;
      if (this.listProjectEstimate[0].nid_project_estimate > 0) {
        this.viewWeek = true;
      }
    }, (error) => {
      console.error(error);
    });
  }

  convertToDateWithFormat(dateInFormat) {
    let array = dateInFormat.split("-");
    let new_date = array[2] + "/" + array[1] + "/" + array[0]
    return new_date
  }

  cambioFechaInicio() {
    // Por si el usuario le quita el disabled en el html
    if (!this.registroBloque) {
      this.dateString = this.s_fecha_hoy;
    }
    if (this.dateString != undefined && this.dateString != '') {
      // La fecha me la crea con un dia menos
      let fecha_dateString = new Date(this.dateString);
      fecha_dateString.setDate(fecha_dateString.getDate() + 1);

      if (fecha_dateString < this.fecha_inicio_proyecto) {
        // Si se puede registar fuera del rango de fechas del proyecto
        // this.dateString = this.string_fecha_inicio_proyecto;
        Swal.fire({
          icon: 'error',
          title: 'Se esta registrando una fecha antes de la Fecha  Inicio del Proyecto',
          text: `Fecha Inicio del Proyecto: ${this.convertToDateWithFormat(this.string_fecha_inicio_proyecto)}`
        });
      }
      if (fecha_dateString > this.fecha_fin_proyecto) {
        // this.dateString = this.string_fecha_fin_proyecto;
        Swal.fire({
          icon: 'error',
          title: 'Se esta registrando una fecha despues de la Fecha Fin del Proyecto',
          text: `Fecha Fin del Proyecto: ${this.convertToDateWithFormat(this.string_fecha_fin_proyecto)}`
        });
      }
    }

  }

  cambioFechaFin() {

    if (this.dateRangeString != undefined && this.dateRangeString != '') {
      let fecha_dateRangeString = new Date(this.dateRangeString);
      fecha_dateRangeString.setDate(fecha_dateRangeString.getDate() + 1);

      this.convertToDateWithFormat(this.string_fecha_inicio_proyecto);

      // Validaciones con respecto a las fechas del proyecto
      if (fecha_dateRangeString < this.fecha_inicio_proyecto) {
        // this.dateRangeString = this.string_fecha_inicio_proyecto;
        Swal.fire({
          icon: 'error',
          title: 'Se esta registrando una fecha antes a la Fecha Inicio del Proyecto',
          text: `Fecha Inicio del Proyecto: ${this.convertToDateWithFormat(this.string_fecha_inicio_proyecto)}`
        });
      }
      if (fecha_dateRangeString > this.fecha_fin_proyecto) {
        // this.dateRangeString = this.string_fecha_fin_proyecto;
        Swal.fire({
          icon: 'error',
          title: 'Se esta registrando una fecha despues a la Fecha Fin del Proyecto',
          text: `Fecha Fin del Proyecto: ${this.convertToDateWithFormat(this.string_fecha_fin_proyecto)}`
        });
      }
    }

  }

  AddProvExt() {
    const dialogOpenClient = this.dialog.open(RegistroProveedorExternoComponent, {
      width: '600px',
      height: '70%',
      autoFocus: false,
      disableClose: false,
    });
    dialogOpenClient.afterClosed().subscribe(data => {
      this.spinner.show('SpinnerProject');
      this.getPersonalExt(this.typeHour);
      setTimeout(() => {
        /** spinner ends after 1 seconds */
        this.spinner.hide('SpinnerProject');
      }, 1000);
    })
  }

}
