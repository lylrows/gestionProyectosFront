import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { RequestManagement, RequestManagementFilter, RequestManagementList } from '../../model/request-management/request-management.model';
import { RequestManagementService } from '../../services/request-management/request-management.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Project,ProjectStep2,ProjectStep2Detail,ProjectStep3,ProjectStep3Investment,ProjectStep3Cost,ProjectStep4,ProjectStep5,ProjectStep4Detail } from '../../model/project/project';
import { User } from 'src/app/layout/manage/model/user/user';
import { PermisoService } from '../../services/common/permiso.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistroSolicitudComponent } from './modal-registro/registro-solicitud/registro-solicitud.component';

@Component({
  selector: 'app-bandeja-solicitud',
  templateUrl: './bandeja-solicitud.component.html',
  styleUrls: ['./bandeja-solicitud.component.css']
})
export class BandejaSolicitudComponent implements OnInit {

  filterProject: RequestManagementFilter = new RequestManagementFilter();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  public BreadLevel01 = 'Gestión de Solicitudes';
  public Title = 'Gestión de Solicitudes';
  public titleProjectModal ='Proyecto | Nuevo'
  projectList:any[]=[];
  PersonDropDownList:DropDownList[];
  projectStep3Investment :ProjectStep3Investment = new ProjectStep3Investment();
  listProjectStep3Investment :ProjectStep3Investment[];
  scodprojectSeleccionado:string="";
  snameprojectSeleccionado:string="";
  user: User = new User();

  permisoConsultar: boolean = false;
  permisoAdministrador: boolean = false;
  permisoJefeDeProyecto: boolean = false;

  permisoEditarSolicitud: boolean = false;
  titles: string;
  requestItem: RequestManagement = new RequestManagement();
  // requestList: RequestManagement[] = [];
  active:boolean=false;

  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private permisoService: PermisoService,
    private projectTypeService: ProjectTypeService,
    private requestManageService: RequestManagementService,
    private dialog: MatDialog
    ) 
    {
      this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
      this.filterProject.pagination.TotalItems = this.totalItems;
      this.filterProject.pagination.CurrentPage = this.currentPage;
      // this.titles = ['Nueva', 'Editar'];
      this.titles = 'Editar';
    }
     nidchannel=0;
     startDateFilter:any;
     endDateFilter:any;
  ngOnInit() {
    this.obtenerPermisos();
  }
  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(13).subscribe((response: any) => {
      console.log("Permisos", response);
      response.forEach(element => {
        if(element.sname=="Consultar"){
          this.permisoConsultar = element.permission
        }
        if(element.sname=="Permiso_Administrador"){
          this.permisoAdministrador = element.permission
        }
        if(element.sname=="Permiso_Jefe_Proyecto"){
          this.permisoJefeDeProyecto = element.permission
        }
        if(element.sname=="Editar_Solicitud"){
          this.permisoEditarSolicitud = element.permission
        }
      });
      // Despues de obtener permisos inicia todo lo demas
      if (sessionStorage.getItem('Guard') !== null) {
        this.user = JSON.parse(sessionStorage.getItem('User'));
     }
      this.getRequestManagement();
  
      this.getPersonDropDown();
    }, (error) => {
      console.error(error);
    });
  }

  getRequestManagement(){
    this.spinner.show();

    if(this.permisoAdministrador) {
      this.filterProject.nid_manager=Number(this.filterProject.nid_manager);
    } else {
      this.filterProject.nid_manager=this.user.nid_person;
    }

    this.requestManageService.getrequestmanagement(this.filterProject).subscribe(
      (res: any) => {
        this.spinner.hide();
        try {
          this.projectList = res.data;
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    )
  }

  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
  }
  search() {
    // this.showFormDetails = false;
 
    this.spinner.show();
    if(this.permisoAdministrador) {
      this.filterProject.nid_manager=Number(this.filterProject.nid_manager);
    } else {
      this.filterProject.nid_manager=this.user.nid_person;
    }

    this.requestManageService.getrequestmanagement(this.filterProject).subscribe(
      (res: any) => {
        this.spinner.hide();
        try {
          this.projectList = res.data;
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    )
    
  }

  getPersonDropDown() {
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      if (response == null){
        this.filterProject.nid_manager = 0;
        return;
      }
      this.PersonDropDownList = response;
      if ( this.PersonDropDownList.length>0){
        this.filterProject.nid_manager = 0;
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
  ValidarInvestment(){
    let mensaje="";
    if(this.projectStep3Investment.nid_rol==0){
      mensaje=mensaje+"<br /> Rol";
    }
    return mensaje;
  }


  closeModal() {  
    this.modalService.dismissAll();
  }

  projectClicked(project: any) {
    this.closeModal();
  }

  ManualLoad() {
    
   // this.sstatusnameSeleccionado = "";
    this.scodprojectSeleccionado="";
    this.titleProjectModal = 'Registro Proyecto';

    this.active = false;
    // this.modalService.open(content, { size: 'lg' });
    // this.project.nid_projectmethodology=1;

    const dialogOpenBandeja = this.dialog.open(RegistroSolicitudComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal: "Registro Servicio",
        scodproject: "",
        sstatusname: "",
        snameproject: "",
        active: this.active,
        isAdmin: this.permisoAdministrador
      },
      disableClose: false,
    });
    dialogOpenBandeja.afterClosed().subscribe(data => {
      // if(data != null) {
        this.search ();
      // }
    })

  } 

  Load(req) {
    this.requestItem=new RequestManagement();
    this.requestItem=req;
    console.log(req);
    
    
    this.active=true;
    // this.sstatusnameSeleccionado = "";
     this.scodprojectSeleccionado=req.scodproject;
     console.log(this.scodprojectSeleccionado);
     
     this.titleProjectModal = 'Registro Proyecto';
 
     const dialogOpenBandeja = this.dialog.open(RegistroSolicitudComponent, {
       width: '800px',
       height: '90%',
       autoFocus:false,
       data: {
         scodproject: this.scodprojectSeleccionado,
         snameproject: req.snameproject,
         titles: this.titles,
         requestItem: this.requestItem,
         active: this.active,
         titleProjectModal: "Editar Solicitud",
        isAdmin: this.permisoAdministrador
       },
       disableClose: false,
     });
     dialogOpenBandeja.afterClosed().subscribe(data => {
       // if(data != null) {
         this.search ();
       // }
     })
 
   }

}
