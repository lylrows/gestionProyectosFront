import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { DropDownList } from '../../../../model/dropdownlist/DropDownList';
import { FilterProjectAssigned } from '../../../../model/project/filterproject';
import { RequestManagement, ManagementPermission, GetManagementPermission } from '../../../../model/request-management/request-management.model';
//import { ManagementPermission } from 'src/app/layout/manage/model/request-management/management-permission.model';
import { ClientService } from '../../../../services/client/client.service';
import { Project } from '../../../../model/project/project';
import { ProjectService } from '../../../../services/project/project.service';
import { ProjectTypeService } from '../../../../services/project/projecttype.service';
import { PersonService } from '../../../../services/person/person.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { User } from 'src/app/layout/manage/model/user/user';
import { PermisoService } from '../../../../services/common/permiso.service';
import { RequestManagementService } from '../../../../services/request-management/request-management.service'
import { DatePipe } from '@angular/common';
import { MastertableService } from '../../../../services/common/mastertable.service';
import { MasterTable } from '../../../../model/common/mastertable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Client } from 'src/app/layout/manage/model/client/client';

@Component({
  selector: 'app-registro-solicitud',
  templateUrl: './registro-solicitud.component.html',
  styleUrls: ['./registro-solicitud.component.css']
})
export class RegistroSolicitudComponent implements OnInit {

  snameprojectSeleccionado: string = "";
  ClientDropDownList: Client[];
  PersonDropDownList: DropDownList[];
  ProjectTypeDropDownList: DropDownList[];
  listFState: MasterTable[];
  listState: MasterTable[] = [];
  user: User = new User();
  requestmanagement: RequestManagement = new RequestManagement();
  managementpermission: ManagementPermission = new ManagementPermission();
  getmp: GetManagementPermission = new GetManagementPermission();

  nid_job: number = 0;

  tituloBoton = "";
  tituloProject = "";
  title = "";
  fecha_hoy = new Date();
  s_fecha_hoy = this.fecha_hoy.getFullYear() + "-" + String(this.fecha_hoy.getMonth() + 1).padStart(2, '0') + "-" + String(this.fecha_hoy.getDate()).padStart(2, '0');
  dateString: string = this.s_fecha_hoy;

  fecha_hoyp = new Date();
  s_fecha_hoyp = this.fecha_hoyp.getFullYear() + "-" + String(this.fecha_hoyp.getMonth() + 1).padStart(2, '0') + "-" + String(this.fecha_hoyp.getDate()).padStart(2, '0');
  dateStringp: string = this.s_fecha_hoyp;
  dateRangeString: string = this.s_fecha_hoyp;

  fecha_inicio_proyecto: any;
  fecha_fin_proyecto: any;
  string_fecha_inicio_proyecto: any;
  string_fecha_fin_proyecto: any;

  projectList: any[] = [];

  allProjects: any[];

  allViews: any[];

  listPersonEstimate: any[];

  namemanage: any = "";

  constructor(
    private dialogRef: MatDialogRef<RegistroSolicitudComponent>,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private requestManageService: RequestManagementService,
    private mastertableService: MastertableService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    dialogRef.disableClose = true;
    this.nid_job = JSON.parse(sessionStorage.getItem('User')).nid_job;
  }

  scodproject = '';
  snameproject = "";
  requestItem: RequestManagement = new RequestManagement();
  active: boolean;
  isAdmin: boolean = false;

  public dateRange: Date;
  public date: Date;

  ngOnInit() {

    this.scodproject = this.data['scodproject'];
    this.snameproject = this.data['snameproject'];
    this.requestItem = this.data['requestItem'];
    this.active = this.data['active'];
    this.isAdmin = this.data['isAdmin'];
    console.log(this.scodproject);

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }

    this.dateRange = new Date();
    this.tituloProject = this.scodproject + " - " + this.snameproject;
    this.date = new Date();

    if (this.active) {
      this.getRequestOne();
      this.tituloBoton = "Actualizar";
    } else {
      this.tituloBoton = "Registrar";
    }
    // if(this.requestItem?.nid_project!=0){
    //   console.log('debe pasar x aqui');
    //   this.getPersonsEstimate(this.requestItem?.nid_project);
    // }
    this.getAllProject();
    this.getAllViews();
    this.getPersonDropDown();
    this.getState();
  }

  getAllProject() {
    this.projectService.getallproject(1).subscribe(resp => {
      if (resp != null) {
        this.allProjects = resp;
        this.getPersonsEstimate(this.requestItem?.nid_project);
      }
    })
  }

  getAllViews() {
    this.requestManageService.getviewsall(1).subscribe(resp => {
      if (resp != null) {
        this.allViews = resp;
      }
    })
  }

  getPersonsEstimate(nid_project: number) {
    console.log(this.allProjects);
    let project = this.allProjects?.find(x => x.nid_project == nid_project);
    console.log(project);

    if (project != null) {
      console.log(project.scodproject);
      this.projectService.getprojectestimate(project.scodproject, 2).subscribe((response: any) => {
        console.log("Lista de miembros del equipo", response)
        this.listPersonEstimate = response;
        this.listPersonEstimate = this.listPersonEstimate?.filter(x => x.nid_project == nid_project)
        console.log(this.listPersonEstimate);
      }, (error) => {
        console.error(error);
      });
    }
  }

  getState() {
    this.spinner.show('SpinnerProject');
    //let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(2063).subscribe((response: any) => {
      this.listState = response;
      console.log(this.listState);


      // if(this.active) {
      //   this.requestmanagement.nid_state= this.listState.find(x => x.sshort_value?.toLocaleUpperCase() == this.requestItem.name_state?.toLocaleUpperCase()).nid_mastertable;
      // } else {
      //   this.requestmanagement.nid_state =  this.listState.find(x => x.sshort_value?.toLocaleUpperCase() == "PENDIENTE").nid_mastertable;
      // }

      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getRequestOne() {
    //let fecha = this.requestItem.date_register.toDateString();

    this.requestmanagement = new RequestManagement();
    console.log(this.requestItem);

    this.requestItem.date_register = new Date(this.requestItem.date_register);
    this.dateString = this.requestItem.date_register.getFullYear() + '-' + (this.requestItem.date_register.getMonth() + 1).toString().padStart(2, '0') + '-' + this.requestItem.date_register.getDate().toString().padStart(2, '0');
    this.requestmanagement.cod_request = this.requestItem.cod_request;
    this.requestmanagement.nid_request = Number(this.requestItem.nid_request);
    this.requestmanagement.scodproject = this.requestItem.scodproject;
    this.requestmanagement.nid_project = Number(this.requestItem.nid_project);
    this.requestmanagement.snameproject = this.requestItem.snameproject;
    this.requestmanagement.nidresource = Number(this.requestItem.nidresource);
    this.requestmanagement.nid_state = Number(this.requestItem.nid_state);
    this.getPersonsEstimate(this.requestmanagement.nid_project);
    if (this.requestmanagement.nidresource == 0) {
      this.requestmanagement.module = this.requestItem.module;
    }
    this.requestmanagement.obs = this.requestItem.obs;

    this.getmp.nid_request = this.requestmanagement.nid_request;
    this.getmp.option = 1;
    console.log(this.getmp);

    this.requestManageService.getmanagementpermission(this.getmp).subscribe((response: ManagementPermission) => {
      console.log(response);
      //this.getPersonsEstimate(this.requestmanagement.nid_project);
      this.managementpermission.nid_person = Number(response.nid_person);
      this.managementpermission.datepermission = new Date(response.datepermission);
      let fechapermiso = new Date(response.datepermission);
      this.dateStringp = fechapermiso.getFullYear() + '-' + (fechapermiso.getMonth() + 1).toString().padStart(2, '0') + '-' + fechapermiso.getDate().toString().padStart(2, '0');
      this.managementpermission.numhours = Number(response.numhours);
      console.log(this.managementpermission);
    })

    console.log(this.requestmanagement);
  }

  validateRequest(): boolean{
    let _result=true;
    if(this.requestmanagement.nidresource==0){
      if(this.requestmanagement.module=="" || this.requestmanagement.module==null || this.requestmanagement.module==undefined){
        let mensaje="Debe ingresar el campo >>Otro<<";
        Swal.fire({
          icon: 'info',
          title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
        });
        _result=false;
      }
    }
    if(this.requestmanagement.nid_state==0){
      let mensaje="La solicitud debe tener un estado";
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      _result=false;
    }
    if(this.requestmanagement.nid_project==0){
      let mensaje="Debe elegir un proyecto";
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      _result=false;
    }
    if(!this.validateManagementPermission()){
      _result=false;
    } 
    return _result;
  }

  validateManagementPermission():boolean{
    let _result=true;
    if(this.requestmanagement.nidresource==11){
      if(this.managementpermission.nid_person==0){
        let mensaje="Debe escoger un colaborador";
        Swal.fire({
          icon: 'info',
          title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
        });
        _result=false;
      }
      if(this.managementpermission.numhours==0){
        let mensaje="El número de horas extras debe ser mayor a 0";
        Swal.fire({
          icon: 'info',
          title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
        });
        _result=false;
      }
      if(this.dateStringp==null || this.dateStringp==undefined){
          console.log(this.managementpermission.datepermission);
          console.log(this.dateStringp);
          
        let mensaje="Debe ingresar la fecha de permiso";
        Swal.fire({
          icon: 'info',
          title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
        });
        _result=false;
      }
    }
    return _result;
  }

  saveRequest() {
    this.date = new Date(this.dateString)
    //this.date.setDate(this.date.getDate() + 1);
    this.requestmanagement.date_register = this.date;
    this.user = JSON.parse(sessionStorage.getItem('User'));
    this.requestmanagement.nuser = +this.user.niduser;
    this.requestmanagement.nid_project = Number(this.requestmanagement.nid_project);
    this.requestmanagement.nid_state = Number(this.requestmanagement.nid_state);
    this.requestmanagement.nidresource = Number(this.requestmanagement.nidresource);
    console.log("after", this.requestmanagement);
    if(!this.validateRequest()) return;
    this.requestManageService.insuprequestmanagement(this.requestmanagement).subscribe(resp => {
      this.modalService.dismissAll();
      console.log(resp);
      if (resp.resultado == 1) {
        console.log(resp.mensaje);

        if (this.requestmanagement.nidresource == 11) {
          this.managementpermission.nid_project = Number(this.requestmanagement.nid_project);
          this.managementpermission.nid_request = Number(resp.mensaje);
          this.managementpermission.nid_person = Number(this.managementpermission.nid_person);
          this.managementpermission.nidresource = this.requestmanagement.nidresource;
          let date: Date = new Date(this.dateStringp);
          //date.setDate(this.date.getDate() + 1);
          this.managementpermission.datepermission = date;
          this.managementpermission.numhours = Number(this.managementpermission.numhours);
          console.log(this.managementpermission);
          if(this.managementpermission.datepermission==null || this.managementpermission.datepermission==undefined){
            let mensaje="Debe ingresar la fecha de permiso";
            Swal.fire({
              icon: 'info',
              title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
            });
            return;
          }
          if(!this.validateManagementPermission()) return;
          this.requestManageService.insupmanagementpermission(this.managementpermission).subscribe(res => {
            if (res.resultado == 1) {
              Swal.fire({
                icon: 'success',
                title: 'Se registró correctamente la solicitud',
              });
              this.closeModal();
            }
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Se registró correctamente la solicitud',
          });
          this.closeModal();
        }
        // Swal.fire({
        //   icon: 'success',
        //   title: 'Se registró correctamente la solicitud' ,
        // });
        // this.closeModal();

      }
      if (resp.resultado == 2) {
        console.log(resp.mensaje);
        Swal.fire({
          icon: 'success',
          title: 'Se actualizó correctamente la solicitud',
        });
        this.closeModal();
      }
      if (resp == null) {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error',
        });
        this.closeModal();
      }
    })
  }

  getPersonDropDown() {
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      this.PersonDropDownList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  closeModal() {
    //this.cerrarModalRegistro.emit();
    this.dialogRef.close(null);
  }

}
