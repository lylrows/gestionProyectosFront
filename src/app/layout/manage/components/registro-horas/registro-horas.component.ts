import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProjectAssigned } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { User } from 'src/app/layout/manage/model/user/user';
import { CesePerson, FiltrosPerson, ManagementPerson, Person } from '../../model/person/person.model';
import { PermisoService } from '../../services/common/permiso.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistroHorasDetalleComponent } from '../registro-horas-detalle/registro-horas-detalle.component';
import { Client } from '../../model/client/client';

@Component({
  selector: 'app-registro-horas',
  templateUrl: './registro-horas.component.html',
  styleUrls: ['./registro-horas.component.css']
})
export class RegistroHorasComponent implements OnInit {

  filterProject: FilterProjectAssigned = new FilterProjectAssigned();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  scodprojectSeleccionado:string="";
  snameprojectSeleccionado:string=""; 
  sstatusnameSeleccionado:string="";

  nid_hour_concept=0;
  public BreadLevel01 = 'Gestión de Proyectos';
  public Title = 'Registro de Horas';
  public titleProjectModal ='Proyecto | Nuevo';
  public titleProjectModalConcept ="Registro de Horas";
  projectList:any[];
  ClientDropDownList:Client[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:DropDownList[];
  personFilter: FiltrosPerson = new FiltrosPerson;
  listConceptoHora : MasterTable[];
  listState : MasterTable[]=[];

  user: User = new User();

  nid_person_login = 0;
  nid_jefe_proyecto = 0;
  nid_manager_area = 0;
  nid_rol = 0;
  nid_father = 0;
  nid_job_managerarea = 0;

  
  permisoConsultar: boolean = false;
  permisoRegistrarHora: boolean = false;
  permisoRegistrarHorasBloqueModal: boolean = false;
  permisoAdministrador: boolean = false;

  constructor(
    private _servicePerson: PersonService,
    private mastertableService:MastertableService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private permisoService: PermisoService,
    private projectTypeService: ProjectTypeService,
    private dialog: MatDialog
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
   }

  ngOnInit() {
    this.obtenerPermisos();
    this.nid_person_login = JSON.parse(sessionStorage.getItem('User')).nid_person;

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
   }

  }
  
  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(11).subscribe((response: any) => {
      console.log("getpermissionbyuser",response);
      
      response.forEach(element => {
        if(element.sname=="Consultar"){
          this.permisoConsultar = element.permission
        }
        if(element.sname=="Registrar_Horas_Tabla"){
          this.permisoRegistrarHora = element.permission
        }
        if(element.sname=="Registrar_Horas_Bloque_Modal"){
          this.permisoRegistrarHorasBloqueModal = element.permission
        }
        if(element.sname=="Permiso_Administrador"){
          this.permisoAdministrador = element.permission
        }
      });

      this.getClientDropDown();
      this.getPersonDropDown();
      this.getProjectTypeDropDown();
      this.getConceptoHora();
      this.getState()
      // this.begin();
      this.search();

    }, (error) => {
      console.error(error);
    });
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



  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
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

  // UserType():boolean{
  //   if (this.user.nid_job == 1 || this.user.nid_job == 2) return true;
  // }
  // UserType2():boolean{
  //   if (this.user.nid_job == 1) return true;
  // }
  ChangeRecordByPage() {
    this.filterProject.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.search();
  }
  ManualLoad(content) {
    
    this.titleProjectModal = 'Registro de Horas';
    this.modalService.open(content, { size: 'lg' });
  }
  closeModal() {
    this.modalService.dismissAll();
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
        nid_rol: this.nid_rol,
        nid_jefe_proyecto: this.nid_jefe_proyecto,
        nid_job_managerarea: this.nid_job_managerarea,
        registroBloque: this.permisoRegistrarHorasBloqueModal,
        sstatusname:  this.sstatusnameSeleccionado
      },
      disableClose: false,
    });
    dialogRegistroHoras.afterClosed().subscribe(data => {
      // if(data != null) {
        this.search ();
      // }
    })
  }

  RegitrarHoras(scod, snameproject, ssname, nid_project){

    this.sstatusnameSeleccionado = ssname;
    console.log(nid_project);
    
    let esMiembroEquipo = false;
    this.nid_jefe_proyecto = 0;
    
    if(this.permisoAdministrador) {
      this.scodprojectSeleccionado=scod;
      this.snameprojectSeleccionado=snameproject;
      this.titleProjectModal = 'Registro de Horas';
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
      //console.log(this.nid_job_managerarea);
      //this.abrirModalRegistroHoras();
    } else {
      this.projectService.getproject(scod).subscribe((resp: any) => {
        console.log(resp);
        
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
            console.log(response);
            if(response != null) {
              // Entonces va devolver una lista
              response.forEach( value => {
                  // Guardo el person si es jefe de proyecto
                  if(value.nid_rol == 1 && value.nid_person == this.nid_person_login) {
                    this.nid_jefe_proyecto = value.nid_person;
                    this.nid_rol = Number(value.nid_rol);
                    console.log(this.nid_rol);
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
  RegitrarHorasConcepto(content,nid){
    this.nid_hour_concept=nid;
    this.titleProjectModal = 'Registro de Horas';
    this.modalService.open(content, { size: 'lg' });
  }

  getConceptoHora() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(19).subscribe((response: any) => {
      this.listConceptoHora = response;
      this.spinner.hide('SpinnerProject');
      
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
}
