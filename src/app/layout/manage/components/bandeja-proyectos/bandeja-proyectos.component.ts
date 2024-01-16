import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProject } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { Project,ProjectStep2,ProjectStep2Detail,ProjectStep3,ProjectStep3Investment,ProjectStep3Cost,ProjectStep4,ProjectStep5,ProjectStep4Detail } from '../../model/project/project';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { User } from 'src/app/layout/manage/model/user/user';
import { CesePerson, FiltrosPerson, ManagementPerson, Person } from '../../model/person/person.model';
import { PermisoService } from '../../services/common/permiso.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { ProjectComponent } from '../project/project.component';
import { ReporteControlCambiosComponent } from '../reporte-control-cambios/reporte-control-cambios.component';
import { Client } from '../../model/client/client';
import { RegistroHitosComponent } from '../registro-hitos/registro-hitos.component';


@Component({
  selector: 'app-bandeja-proyectos',
  templateUrl: './bandeja-proyectos.component.html',
  styleUrls: ['./bandeja-proyectos.component.css']
})
export class BandejaProyectosComponent implements OnInit {
  person: Person[] = [];
  filterProject: FilterProject = new FilterProject();
  project: Project = new Project();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  scodprojectSeleccionado:string="";
  sstatusnameSeleccionado:string="";
  public BreadLevel01 = 'Gestión de Proyectos';
  public Title = 'Bandeja de Proyectos';
  public titleProjectModal ='Proyecto | Nuevo'
  projectList:any[]=[];
  UserIsNotAdmin: boolean = false;
  ClientDropDownList:Client[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:DropDownList[];
  ManagerDropDownList:DropDownList[];
  listState : MasterTable[]=[];
  personFilter: FiltrosPerson = new FiltrosPerson;
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
    // private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService,
    private mastertableService:MastertableService,
    private dialog: MatDialog
  ) {
    // this.personFilter.pagination.ItemsPerPage = this.itemsPerPage;
    // this.personFilter.pagination.TotalItems = this.totalItems;

    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
   }

  nidchannel=0;
  startDateFilter:any;
  endDateFilter:any;
  

  ngOnInit() {
    // Despues de obtener permiso inicia todo lo demas
    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }

    this.obtenerPermisos();
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

  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
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
    console.log(this.filterProject);
    
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

  delete(scod){
    
    //this.nidprojectSeleccionado=Number(nidproject);
    this.scodprojectSeleccionado=scod;
    console.log(this.scodprojectSeleccionado);
    // console.log("nidproject",project.nid_project);
    // this.projectList
    //console.log("nid_project",this.project.scodproject);
    /**/
    Swal.fire({
      title: '¿Está seguro de deshabilitar el proyecto?',
      text: 'No habrá forma de revertir la acción!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, deshabilitar',
      cancelButtonText: 'No, cancelar'
    }).then(result => {
      if (result.value) {
        this.projectService.updateproject(scod, 2).subscribe(resp => {
          console.log("msj resp: ", resp);
          this.search();
          // this.projectService.getprojectpagination;
          Swal.fire(
            'Satisfactorio',
            'Se desactivó correctamente.',
            'success'
          );
        })
      }
    })
    
  }
  
  cerrarProyecto(scod){
    
    this.scodprojectSeleccionado=scod;
    Swal.fire({
      title: '¿Está seguro de cerrar el proyecto?',
      text: 'No habrá forma de revertir la acción!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar proyecto',
      cancelButtonText: 'No, cancelar'
    }).then(result => {
      if (result.value) {
        this.projectService.updateproject(scod,4).subscribe(resp => {
          this.search();
          // this.projectService.getprojectpagination;
          Swal.fire(
            'Satisfactorio',
            'Se cerró el proyecto correctamente.',
            'success'
          );
        })
      }
    })
    
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

  list() {
    this.spinner.show();
    this._servicePerson.listaPersonaPaginado(this.personFilter).subscribe(
      res => {
        this.person = res.data;
        this.totalItems = res.pagination.totalItems;
      },
      err => { 
        debugger;
        console.log(err);
      },
      () => {        
        this.spinner.hide();
      }
    );
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

  ManualLoad() {
    
    this.sstatusnameSeleccionado = "";
    this.scodprojectSeleccionado="";
    this.titleProjectModal = 'Registro Proyecto';

    // this.modalService.open(content, { size: 'lg' });
    // this.project.nid_projectmethodology=1;

    const dialogOpenBandeja = this.dialog.open(ProjectComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal: "Registro Servicio",
        scodproject: "",
        sstatusname: "",
        snameproject: "",
        nidProject: 0
      },
      disableClose: false,
    });
    dialogOpenBandeja.afterClosed().subscribe(data => {
      // if(data != null) {
        this.search ();
      // }
    })

  }
  
  EditProject(scod, ssname,nidProject){
    this.scodprojectSeleccionado=scod;
    this.sstatusnameSeleccionado = ssname;
    this.titleProjectModal = 'Editar   Proyecto';

    const dialogOpenBandeja = this.dialog.open(ProjectComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal: "Editar   Proyecto",
        scodproject: scod,
        sstatusname: ssname,
        snameproject: "",
        nidProject: nidProject,
      },
      disableClose: false,
    });
    dialogOpenBandeja.afterClosed().subscribe(data => {
      this.search ();
    })

  }
  CDCReport(nidProject,snameproject){

    const dialogOpenCDC = this.dialog.open(ReporteControlCambiosComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        nidProject: nidProject,
        snameproject: snameproject
      },
      disableClose: false,
    });
    dialogOpenCDC.afterClosed().subscribe(data => {
      this.search ();
    })

  }
  LoadModalHitosEdit(item:any){
    const dialogOpenBandeja = this.dialog.open(RegistroHitosComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        scodproject: item.scodproject,
        isEdit: true
      },
      disableClose: false,
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

}
