import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProjectHoursLog } from '../../model/project/filterproject';
import { PersonalProject, Project, ProjectHoursLog } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-horas-concepto',
  templateUrl: './registro-horas-concepto.component.html',
  styleUrls: ['./registro-horas-concepto.component.css']
})
export class RegistroHorasConceptoComponent implements OnInit {

  @Output() projectClicked: EventEmitter<any> = new EventEmitter();

  filterProject: FilterProjectHoursLog = new FilterProjectHoursLog();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro
  project: Project = new Project();
  projectHoursLog: ProjectHoursLog = new ProjectHoursLog();
  listFases : MasterTable[];
  tituloBoton="Registar";
  

  public itemForm: FormGroup;
  PersonalList: PersonalProject[]=[];
  ClientDropDownList:DropDownList[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:DropDownList[];
  listProjectHoursLog:any[] = [];
  @Input() scodproject = "";
  @Input() snameproject = "";
  @Input() nid_concept_hour = 0;

  constructor(private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private mastertableService:MastertableService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private projectService: ProjectService) {
      this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
      this.filterProject.pagination.TotalItems = this.totalItems;
      this.filterProject.pagination.CurrentPage = this.currentPage;
      
     }

    nidchannel=0;
    startDateFilter:any;
    endDateFilter:any;

  ngOnInit() {
    if(this.nid_concept_hour>0){
      this.filterProject.scodproject="";
      this.filterProject.nid_hours_concept=this.nid_concept_hour;
      this.getProjectHoursLogPagination();
    }
    this.getFases();
    this.getPersonDropDown();
    
    
  }
  getProjectHoursLogPagination(){
    this.filterProject.scodproject="";
    this.projectService.getprojecthourslogpagination(this.filterProject).subscribe((response: any) => {
      this.listProjectHoursLog = response.data;
          this.totalItems = response.pagination.totalItems;
    }, (error) => {
      console.error(error);
    });
  }
  saveHoursLog(){
    /*this.listProjectHoursLog.forEach(function (item) {
      item.nid_person=Number(item.nid_person);
    });*/
    this.projectHoursLog.scodproject="";
    this.projectHoursLog.nid_hours_concept=this.filterProject.nid_hours_concept;
    this.projectHoursLog.nid_person=Number(this.projectHoursLog.nid_person);
    this.projectService.insuprojecthourslog(this.projectHoursLog).subscribe(result => {
      if (result == null){
        this.spinner.hide('SpinnerProject');
        return;
      }

      if (result.resultado == 1){
        
        this.tituloBoton="Registrar";
        this.getProjectHoursLogPagination();
        this.projectHoursLog=new ProjectHoursLog();
        Swal.fire({
          icon: 'success',
          title: 'Se registro correctamente el detalle de la hora' ,
          
        });
        
      }else{
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
  closeModal() {
    this.projectClicked.emit(null);
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
  EditHoursLog(item){
    this.projectHoursLog=item;
    this.tituloBoton="Actualizar";
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
  DelHoursLog(item){
    item.sactive='D';
    item.scodproject="";
    this.projectService.insuprojecthourslog(item).subscribe(result => {
      if (result == null){
        console.log("ocurrió un error");
        return;
      }

      if (result.resultado == 1){
        this.getProjectHoursLogPagination();
        Swal.fire({
          icon: 'success',
          title: 'Se eliminó el registro correctamente',
          
        });
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al eliminar el registro.',
          
        });
      }
    }, (error) => {
    console.error(error);
    });
  }
  
}
