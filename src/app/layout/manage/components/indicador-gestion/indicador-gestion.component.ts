import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProject } from '../../model/project/filterproject';
import { Project } from '../../model/project/project';
import { User } from '../../model/user/user';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { PermisoService } from '../../services/common/permiso.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { ModalIndicadorProyectoComponent } from './modal-indicador-proyecto/modal-indicador-proyecto.component';
import { Client } from '../../model/client/client';

@Component({
  selector: 'app-indicador-gestion',
  templateUrl: './indicador-gestion.component.html',
  styleUrls: ['./indicador-gestion.component.css']
})
export class IndicadorGestionComponent implements OnInit {

  filterProject: FilterProject = new FilterProject();
  project: Project = new Project();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  scodprojectSeleccionado:string="";
  sstatusnameSeleccionado:string="";
  public BreadLevel01 = 'Indicadores';
  public Title = 'Indicadores de Gestión';
  public titleProjectModal ='Proyecto | Nuevo'
  projectList:any[]=[];
  UserIsNotAdmin: boolean = false;
  ClientDropDownList:Client[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:DropDownList[];
  ManagerDropDownList:DropDownList[];
  listState : MasterTable[]=[];
  user: User = new User();

  permisoConsultar: boolean = false;
  permisoNuevo: boolean = false;
  permisoEditarTabla: boolean = false;
  permisoDeshabilitarTabla: boolean = false;
  permisoAdministrador: boolean = false;
  permisoJefeDeProyecto: boolean = false;
  
  constructor(
    private _servicePerson: PersonService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService,
    private mastertableService:MastertableService,
    private dialog: MatDialog
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
   }


  ngOnInit() {
    this.filterProject.nid_status = 1;

    // Despues de obtener permiso inicia todo lo demas
    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }

    this.obtenerPermisos();
  }

  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(8).subscribe((response: any) => {
      response.forEach(element => {
        if(element.sname=="Consultar"){
          this.permisoConsultar = element.permission
        }
        if(element.sname=="Nuevo"){
          this.permisoNuevo = element.permission
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
      this.getManagerDropDown();
      this.getProjectTypeDropDown();
      this.getState();
      this.begin();
      // this.list();

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
    // this.showFormDetails = false;
 
    this.spinner.show();

    if(this.permisoAdministrador) {
      this.filterProject.nid_manager=Number(this.filterProject.nid_manager);
    } else {
      this.filterProject.nid_manager=this.user.nid_person;
    }

    this.filterProject.nid_project_type=Number(this.filterProject.nid_project_type);
    this.filterProject.nid_status=+this.filterProject.nid_status;
    
    this.filterProject.nid_client=Number(this.filterProject.nid_client);
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

          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );
    
  }
 
  getClientDropDown() {
    
    this.spinner.show('SpinnerProject');
    this.clientService.getDropdownlist(0).subscribe((response: any) => {
      if (response == null){
        this.filterProject.nid_client = 0;
        return;
      }
      this.ClientDropDownList = response;
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

  getManagerDropDown() {
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      
      if (response == null){
        this.filterProject.nid_manager = 0;
        return;
      }
      this.ManagerDropDownList = response;
      if ( this.ManagerDropDownList.length>0){
        this.filterProject.nid_manager = 0;
      }
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

  

  pageChanged(event: any): void {
    this.currentPage = event;
    this.filterProject.pagination.CurrentPage = this.currentPage;
    this.search();
  }


  thereAreProjectsLoad(): boolean {
  
    if (typeof this.projectList === 'undefined') return false;
    if (this.projectList === null) return false;
    if (this.projectList.length === 0) return false;

    return true;
  }
  ChangeRecordByPage() {
    this.filterProject.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.search();
  }
  
  EditProject(scod, ssname){
    this.scodprojectSeleccionado=scod;
    this.sstatusnameSeleccionado = ssname;
    this.titleProjectModal = 'Indicadores de Gestión';

    const dialogOpenBandeja = this.dialog.open(ModalIndicadorProyectoComponent, {
      width: '70%',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal: this.titleProjectModal,
        scodproject: scod,
        sstatusname: ssname,
        snameproject: ""
      },
      disableClose: false,
    });
    dialogOpenBandeja.afterClosed().subscribe(data => {
      this.search ();
    })

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
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );
    
  }

}
