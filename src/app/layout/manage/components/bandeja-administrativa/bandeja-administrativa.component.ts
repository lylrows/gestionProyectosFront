import { Component, OnInit } from '@angular/core';
import { PermisoService } from '../../services/common/permiso.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterProject, FilterProjectAssigned } from '../../model/project/filterproject';
import { User } from '../../model/user/user';
import { ProjectService } from '../../services/project/project.service';
import Swal from 'sweetalert2';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { PersonService } from '../../services/person/person.service';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { Client } from '../../model/client/client';
import { MasterTable } from '../../model/common/mastertable';
import { RegistroHorasDetalleComponent } from '../registro-horas-detalle/registro-horas-detalle.component';

@Component({
  selector: 'app-bandeja-administrativa',
  templateUrl: './bandeja-administrativa.component.html',
  styleUrls: ['./bandeja-administrativa.component.css']
})
export class BandejaAdministrativaComponent implements OnInit {
  projectList:any[]=[];
  public Title = 'Bandeja Administrativa';
  public BreadLevel01 = 'Gestión de Proyectos';
  user: User = new User();
  filterProject: FilterProjectAssigned = new FilterProjectAssigned();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  PersonDropDownList:DropDownList[];
  ClientDropDownList:Client[];
  ProjectTypeDropDownList:DropDownList[];
  listState : MasterTable[]=[];
  scodprojectSeleccionado:string="";
  snameprojectSeleccionado:string=""; 
  sstatusnameSeleccionado:string="";
  nid_jefe_proyecto = 0;
  nid_person_login = 0;
  public titleProjectModal ='Registro de Horas';
  permisoRegistrarHorasBloqueModal: boolean = false;
  nid_rol:number = 0;
  nid_father = 0;
  nid_job_managerarea = 0;
  
  //PERMISOS
  permisoConsultar: boolean = false;
  permisoNuevo: boolean = false;
  permisoEditarTabla: boolean = false;
  permisoDeshabilitarTabla: boolean = false;
  permisoAdministrador: boolean = false;
  permisoJefeDeProyecto: boolean = false;
  permisoRegistrarHora: boolean = false;

  constructor(private permisoService: PermisoService,
    private _servicePerson: PersonService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    // private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService:ProjectTypeService,
    private mastertableService:MastertableService,
    private dialog: MatDialog) { 
      this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
      this.filterProject.pagination.TotalItems = this.totalItems;
      this.filterProject.pagination.CurrentPage = this.currentPage;
    }

  ngOnInit(): void {
    this.nid_person_login = JSON.parse(sessionStorage.getItem('User')).nid_person;

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }

    this.obtenerPermisos();
  }
  thereAreProjectsLoad(): boolean {
  
    if (typeof this.projectList === 'undefined') return false;
    if (this.projectList === null) return false;
    if (this.projectList.length === 0) return false;

    return true;
  }
  pageChanged(event: any): void {
    this.currentPage = event;
    this.filterProject.pagination.CurrentPage = this.currentPage;
    this.search();
  }
  ChangeRecordByPage() {
    this.filterProject.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.search();
  }
  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(8).subscribe((response: any) => {
      console.log("permisos",response)
      response.forEach(element => {
        if(element.sname=="Consultar"){
          this.permisoConsultar = element.permission
        }
        if(element.sname=="Nuevo"){
          this.permisoNuevo = element.permission
        }
        if(element.sname=="Registrar_Horas_Tabla"){
          this.permisoRegistrarHora = element.permission
        }
        if(element.sname=="Registrar_Horas_Bloque_Modal"){
          this.permisoRegistrarHorasBloqueModal = element.permission
        }
        if(element.sname=="Editar_Tabla"){
          this.permisoEditarTabla = element.permission
        }
        if(element.sname=="Deshabilitar_Tabla"){
          this.permisoDeshabilitarTabla = element.permission
        }
        if(element.sname=="Permiso_Administrador"){
          this.permisoAdministrador = element.permission
        }
        if(element.sname=="Permiso_Jefe_Proyecto"){
          this.permisoJefeDeProyecto = element.permission
        }
        
      });
      this.getClientDropDown();
      this.getPersonDropDown();
      this.getProjectTypeDropDown();
      this.getState();
      //this.begin();
      this.search();

    }, (error) => {
      console.error(error);
    });
  }
  search() {
    // this.showFormDetails = false;
    this.user = JSON.parse(sessionStorage.getItem('User'));

    if(this.permisoAdministrador) {
      this.filterProject.nid_manager=Number(this.filterProject.nid_manager);
      this.filterProject.nid_person = 0;
    } else {
      this.filterProject.nid_manager=0;
      this.filterProject.nid_person = this.user.nid_person;
    }
    
    this.filterProject.nid_project_type=Number(this.filterProject.nid_project_type);
    this.filterProject.nid_client=Number(this.filterProject.nid_client);
    this.filterProject.nid_status = Number(this.filterProject.nid_status);
    this.filterProject.facturable = 2;
    this.spinner.show();
    this.projectService.getassignedprojectpagination(this.filterProject).subscribe(
      (res: any) => {
        try {

          if (res == null){
            
            Swal.fire({
              icon: 'error',
              title: 'Ocurrió un error al obtener los registros.',
              //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
            });
          }
          this.spinner.hide();

          this.projectList = res.data;
          console.log(res.data);
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );
    
  }
  getState() {
    this.spinner.show('SpinnerProject');
    //let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(50).subscribe((response: any) => {
      this.listState = response;
      this.spinner.hide('SpinnerProject');
      
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  getClientDropDown() {
    
    this.spinner.show('SpinnerProject');
    this.clientService.getDropdownlist(0).subscribe((response: any) => {
      if (response == null){
        this.filterProject.nid_client = 0;
        return;
      }
      this.ClientDropDownList = response;
      console.log(response);
      console.log(this.ClientDropDownList);
      
      if (this.ClientDropDownList.length>0){
        this.filterProject.nid_client = 0;
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  getPersonDropDown() {
    
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      
      if (response == null){
        return;
      }
      this.PersonDropDownList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  getProjectTypeDropDown() {
    
    this.spinner.show('SpinnerProject');
    this.projectTypeService.getDropdownlist().subscribe((response: any) => {
      
      if (response == null){
        this.filterProject.nid_project_type = 0;
        return;
      }
      this.ProjectTypeDropDownList = response;
      if ( this.ProjectTypeDropDownList.length>0){
        this.filterProject.nid_project_type = 0;
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  begin() {

    this.spinner.show();
    // Se filtra los proyectos en los que eres encargado
    this.filterProject.nid_manager=this.user.nid_person;
    // Se filtra todos los proyectos si tienes permiso
    if (this.permisoAdministrador){
      this.filterProject.nid_manager=0;
    } 
    this.filterProject.nid_status=1;
    this.filterProject.facturable = 2;
    this.projectService.getprojectpagination(this.filterProject).subscribe(
      (res: any) => {
        try {

          if (res == null){
            
            Swal.fire({
              icon: 'error',
              title: 'Ocurrió un error al obtener los registros.',
              //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
            });
          }
          this.spinner.hide();

          this.projectList = res.data;
          console.log("projectList",this.projectList)
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );
    
  }
  abrirModalRegistroHoras() {
    const dialogRegistroHoras = this.dialog.open(RegistroHorasDetalleComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal: "Registro Servicio",
        scodproject: this.scodprojectSeleccionado,
        snameproject: this.snameprojectSeleccionado,
        nid_jefe_proyecto: this.nid_jefe_proyecto,
        registroBloque: this.permisoRegistrarHorasBloqueModal,
        sstatusname:  this.sstatusnameSeleccionado,
        nid_rol: this.nid_rol,
        nid_job_managerarea: this.nid_job_managerarea
      },

      disableClose: false,
    });
    dialogRegistroHoras.afterClosed().subscribe(data => {
      // if(data != null) {
        this.search ();
      // }
    })
  }
  RegitrarHoras(scod, snameproject, ssname){
    console.log(scod,snameproject,ssname)
    this.sstatusnameSeleccionado = ssname;
    let esMiembroEquipo = false;
    this.nid_jefe_proyecto = 0;
    
    if(this.permisoAdministrador) {
      this.scodprojectSeleccionado=scod;
      this.snameprojectSeleccionado=snameproject;
      this.nid_jefe_proyecto = this.nid_person_login;
      this.projectService.getmanagerarea(scod).subscribe(resp=>{
        console.log(resp);
        if(resp!=null){
          this.nid_father = Number(resp.nid_mastertable);
          this.mastertableService.getmastertable(this.nid_father).subscribe((response: any) => {
            response?.forEach(value=>{
              if(value.saux01=="G"){
                this.nid_job_managerarea = value.nid_mastertable;
                console.log(value);
                console.log(this.nid_job_managerarea);
              }
            })
            this.abrirModalRegistroHoras();
            this.spinner.hide('SpinnerProject');
          }, (error) => {
            console.error(error);
            this.spinner.hide('SpinnerProject');
          });
        }else{
          this.abrirModalRegistroHoras();
        }
      })
    } else {
      this.projectService.getproject(scod).subscribe((resp: any) => {
        if (resp != null) {
          // Valida que sea encargado
          if(resp.nid_manager == this.nid_person_login) {
            this.scodprojectSeleccionado=scod;
            this.snameprojectSeleccionado=snameproject;
            this.titleProjectModal = 'Registro de Horas';
            this.nid_jefe_proyecto = this.nid_person_login;
            this.abrirModalRegistroHoras();
          } else {
          // Si no es encargado, va validar si es miembro
          this.projectService.getprojectestimate(scod, 2).subscribe(response => {
            if(response != null) {
              // Entonces va devolver una lista
              response.forEach( value => {
                // Guardo el person del jefe de proyecto
                if(value.nid_rol == 1 && value.nid_person == this.nid_person_login) {
                  this.nid_jefe_proyecto = value.nid_person;
                  this.nid_rol = Number(value.nid_rol);
                }
                // Valido si el usuario es miembro del equipo
                if(value.nid_person == this.nid_person_login) {
                  esMiembroEquipo = true;
                }
              }
              )
              
              // Si es miembro de equipo o jefe va permitir ingresa, tambien seria la opcion de admi
              if(esMiembroEquipo || resp.nid_manager == this.nid_person_login) {
                this.scodprojectSeleccionado=scod;
                this.snameprojectSeleccionado=snameproject;
                this.titleProjectModal = 'Registro de Horas';
                this.abrirModalRegistroHoras();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Usted no es miembro del proyecto',
                  //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
                });
              }
            }
          })
          }
  
        }
      });
    }

  }
}
