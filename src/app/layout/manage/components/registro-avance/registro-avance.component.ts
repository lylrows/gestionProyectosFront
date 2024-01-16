import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProject } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { User } from 'src/app/layout/manage/model/user/user';
import { PermisoService } from '../../services/common/permiso.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { MatDialog } from '@angular/material/dialog';
import { AvanceProyectoModalComponent } from './avance-proyecto-modal/avance-proyecto-modal.component';
import { Client } from '../../model/client/client';

@Component({
  selector: 'app-registro-avance',
  templateUrl: './registro-avance.component.html',
  styleUrls: ['./registro-avance.component.css']
})
export class RegistroAvanceComponent implements OnInit {
  filterProject: FilterProject = new FilterProject();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  public BreadLevel01 = 'Gestión de Proyectos';
  public Title = 'Registro Avance de Proyectos';
  public titleProjectModal ='Proyecto | Nuevo'
  projectList:any[] = [];
  ClientDropDownList:Client[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:DropDownList[];
  listState : MasterTable[]=[];
  scodprojectSeleccionado:string="";
  sstatusnameSeleccionado:string="";
  snameprojectSeleccionado:string="";
  user: User = new User();
  
  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService,
    private mastertableService:MastertableService,
    private dialog: MatDialog
    ) 
    { 
      this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
      this.filterProject.pagination.TotalItems = this.totalItems;
      this.filterProject.pagination.CurrentPage = this.currentPage;
    }
    nidchannel=0;
    startDateFilter:any;
    endDateFilter:any;

    permisoConsultar: boolean = false;
    permisoAdministrador: boolean = false;
    permisoJefeDeProyecto: boolean = false;

  ngOnInit() {
    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
   }
    this.obtenerPermisos();
  }

  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(12).subscribe((response: any) => {
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
      });

      this.getClientDropDown();
      this.getPersonDropDown();
      this.getProjectTypeDropDown();
      this.getState();
      this.begin();

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
      console.log("EstAdos:",this.listState);
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
    this.filterProject.nid_client=Number(this.filterProject.nid_client);
    this.filterProject.nid_status=+this.filterProject.nid_status;
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
//Modificación de ingreso
  UserType():boolean{
    //if (this.user.nid_job == 1 || this.user.nid_job == 2) return true;
    return true
  }

  UserType2():boolean{
    //if (this.user.nid_job == 1) return true;
    return true
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
  ManualLoad(scod,snameproject, ssname) {
    this.sstatusnameSeleccionado = ssname;
    this.scodprojectSeleccionado=scod;
    this.snameprojectSeleccionado=snameproject;
    this.titleProjectModal = `Registrar Avance: ${this.snameprojectSeleccionado}`;

    const dialogRegistroAvance = this.dialog.open(AvanceProyectoModalComponent, {
      width: '900px',
      height: '90%',
      autoFocus:false,
      data: {
        titleProjectModal:  this.titleProjectModal,
        scodproject: this.scodprojectSeleccionado,
        snameproject: this.snameprojectSeleccionado,
        sstatusname: this.sstatusnameSeleccionado
      },
      disableClose: false,
    });
    dialogRegistroAvance.afterClosed().subscribe(data => {
      // if(data != null) {
        if(data == 'FC') {
          Swal.fire('Error', 'Debe ingresar cronograma', 'info');
        }
        this.search ();
      // }
    });
  }

  begin() {
    // this.showFormDetails = false;
 
    this.spinner.show();
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

