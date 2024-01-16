import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { PersonalProject, Project, ProjectEstimate, ProjectStep2, WeeksProjectPerson, ProjectStep3, ProjectStep3Investment } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { MastertableService } from '../../services/common/mastertable.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Client } from '../../model/client/client';


@Component({
  selector: 'app-registro-estimacion',
  templateUrl: './registro-estimacion.component.html',
  styleUrls: ['./registro-estimacion.component.css']
})
export class RegistroEstimacionComponent implements OnInit {


  scodproject = "";
  snameproject = "";
  sstatusname = "";
  titleProjectModal = "";

  PersonDropDownList: DropDownList[];

  projectStep2: ProjectStep2 = new ProjectStep2();
  projectStep3: ProjectStep3 = new ProjectStep3();
  listProjectEstimate: ProjectEstimate[];
  listProjectEstimateAuxiliary: ProjectEstimate[];
  projectEstimate: ProjectEstimate = new ProjectEstimate();
  ListWeekPerson: WeeksProjectPerson[] = [];


  start_date: string = "";
  end_date: string = "";
  ncantidadsemanas: number = 0;
  n_totalhours: number = 0;
  semanas: number[] = [];
  total: number = 0;

  viewWeek: boolean = false;
  listRoles: MasterTable[];

  projectDisable: boolean = false;
  //Autocompletado de horas
  totalHours:number = 0;
  startIndex:number = 0;
  endIndex:number = 0;
  selectedPersonId:number = 0;
  autocompletadoFlag:boolean = false;
  //
  

  constructor(
    private dialogRef: MatDialogRef<RegistroEstimacionComponent>,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private mastertableService: MastertableService,
    private personService: PersonService,
    private projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
      dialogRef.disableClose = true;

  }

  ngOnInit() {
    this.scodproject       = this.data['scodproject'];
    this.snameproject      = this.data['snameproject'];
    this.sstatusname       = this.data['sstatusname'];
    this.titleProjectModal = this.data['titleProjectModal'];

    if(this.sstatusname=="Inactivo") {
      this.projectDisable = true;
    } else {
      this.projectDisable = false;
    }
    
    this.getRoles();
    this.getPersonDropDown();
    this.getProjectStep2();
    this.getProjectStep3();
  }
  getRoles() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(14).subscribe((response: any) => {
      this.listRoles = response;
      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getPersonDropDown() {

    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      this.PersonDropDownList = response;
      console.log("Lo que retorna", this.PersonDropDownList);
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectStep2() {
    this.projectService.getprojectdtep2(this.scodproject).subscribe((response: any) => {
      this.projectStep2 = response;
      this.start_date = this.projectStep2.dbegin_date;
      this.end_date = this.projectStep2.dfinish_date;
      this.ncantidadsemanas = this.projectStep2.nweeks;
      this.getProjectEstimate();
    }, (error) => {
      console.error(error);
    });
  }

  getProjectEstimate() {
    this.projectService.getprojectestimate(this.scodproject, 2).subscribe((response: any) => {
      this.listProjectEstimate = response.filter(ls => ls.isAuxiliary == false);
      this.listProjectEstimateAuxiliary = response.filter(ls => ls.isAuxiliary == true);

      if (this.listProjectEstimate[0] === undefined) {
        Swal.fire('Error', 'Debe elegir roles', 'info');
        this.closeModal();
      } else {
        this.viewWeek = true;
      }

      for (var i = 0; i < this.listProjectEstimate.length; i++) {
        if (this.listProjectEstimate[i].dstart_date == undefined || this.listProjectEstimate[i].dstart_date == null || this.listProjectEstimate[i].dstart_date == "") {
          this.listProjectEstimate[i].dstart_date = this.start_date;
          this.listProjectEstimate[i].dend_date = this.end_date;
        }
      }
      this.getProjectWeekPerson();
    }, (error) => {
      console.error(error);
    });
  }

  getProjectWeekPerson() {
    this.projectService.getprojectweekperson(this.scodproject).subscribe((response: any) => {
      if (response == null) {
        this.LoadCantidadSemanas();
      } else {
        this.ListWeekPerson = response;
        this.listProjectEstimate.forEach(pe => {
          let lista = this.ListWeekPerson.filter(x => x.nid_person == pe.nid_person);
          // Va crear la semana en 0 la nueva persona agregada
          if (lista.length < 1) {
            let objWeekPerson = new WeeksProjectPerson();
            for (let i = 0; i < this.ncantidadsemanas; i++) {
              objWeekPerson = new WeeksProjectPerson();
              objWeekPerson.scodproject = pe.scodproject;
              objWeekPerson.nid_person = pe.nid_person;
              objWeekPerson.nhours_asigned = 0;
              objWeekPerson.nweeknumber = i + 1;
              this.ListWeekPerson.push(objWeekPerson);
            }
            
          }
        })
      }
      if(this.listProjectEstimate[0].nid_person !=0)
        this.autocompletadoFlag = true;
    }, (error) => {
      console.error(error);
    });
  }

  LoadCantidadSemanas() {
    try {
      this.ListWeekPerson = [];
      let objWeekPerson = new WeeksProjectPerson();
      this.listProjectEstimate.forEach(res => {
        for (let i = 0; i < this.ncantidadsemanas; i++) {
          objWeekPerson = new WeeksProjectPerson();
          objWeekPerson.scodproject = res.scodproject;
          objWeekPerson.nid_person = res.nid_person;
          objWeekPerson.nhours_asigned = 0;
          objWeekPerson.nweeknumber = i + 1;
          this.ListWeekPerson.push(objWeekPerson);
        }
      });
      // var x = 0;
    } catch (error) {
      console.log(error, 'error');
    }
  }

  getProjectStep3() {
    this.projectService.getprojectdtep3(this.scodproject).subscribe((response: any) => {
      this.projectStep3 = response;
      this.n_totalhours = this.projectStep3.ntotal_hours;
    });
  }

  ReturnArrayWeeks() {
    return new Array(this.ncantidadsemanas);
  }

  FilterPersonWeek(nidperson: number) {
    let lista = this.ListWeekPerson.filter(x => x.nid_person == nidperson);
    return lista.slice(0, this.ncantidadsemanas);
  }

  totalxPerson(idperson) {
    let numero = this.ListWeekPerson.filter(x => x.nid_person == idperson).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
    return numero
  }

  totalxweek(nweeknumber) {
    let numero = this.ListWeekPerson.filter(x => x.nweeknumber == nweeknumber).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
    return numero;
  }

  ChangeTotal(item) {
    item.nhours_asigned < 0? item.nhours_asigned = 0 : item.nhours_asigned > 40? item.nhours_asigned = 40 : item.nhours_asigned = Number(item.nhours_asigned);
    this.total = 0;
    for (var i = 0; i <= this.ncantidadsemanas - 1; i++) {
      this.total = this.total + this.semanas[i];
    }
  }

  validatelim_nhours(): boolean {
    let _result = true;
    for (let i = 0; i < this.ListWeekPerson.length; i++) {
      if (this.ListWeekPerson[i].nhours_asigned > 40) {
        Swal.fire({
          icon: 'error',
          title: 'Ha excedido las horas por semana',
        });
        _result = false;
        return false;

      }
    }
    return _result;
  }

  validate_nhoursxrol(): boolean {
    let _result = true;
    //this.listProjectEstimate.
    let sum = 0;
    for (let m = 0; m < this.projectStep3.listInvestment.length; m++) {
      for (let n = 0; n < this.listProjectEstimate.length; n++) {
        if (this.projectStep3.listInvestment[m].nid_rol == this.listProjectEstimate[n].nid_rol) {
          let totalH = this.totalxPerson(this.listProjectEstimate[n].nid_person);
          sum = sum + totalH;
        }
      }
      let namerol = this.projectStep3.listInvestment[m].snamerol;
      let totalH = this.projectStep3.listInvestment[m].nhours_assgined;
      if (this.projectStep3.listInvestment[m].nhours_assgined != sum) {
        Swal.fire('Error', 'Total de horas registradas para ' + namerol + ' incorrecto. Se ingresó: ' + sum + '<br> Total Horas: ' + totalH, 'info');
        _result = false;
        return false;
      }
      sum = 0;
    }
    return _result;
  }

  saveWeekPerson() {
    if (!this.validatelim_nhours()) return;

    if (!this.validate_nhoursxrol()) return;

    for (let i = 0; i < this.ListWeekPerson.length; i++) {
      this.ListWeekPerson[i].nhours_asigned = Number(this.ListWeekPerson[i].nhours_asigned)
    }

    this.spinner.show('SpinnerProject');

    this.projectService.insupprojectweeksperson(this.ListWeekPerson).subscribe(result => {
      this.spinner.hide('SpinnerProject');

      if (result.resultado > 0) {
        this.getProjectWeekPerson();
        // this.getProjectEstimate();
        Swal.fire({
          icon: 'success',
          title: 'Se registro correctamente la estimación',
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar la estimación del proyecto.',

        });
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  closeModal() {
    this.dialogRef.close(null);
  }

  saveEstimate() {
    var isvalid = true;
    // Aca estoy creando los oficiales en la estimacion
    for(let item of this.listProjectEstimate) {
      item.nid_person = Number(item.nid_person);

      if(item.nid_person == 0) {
        isvalid = false
        Swal.fire('Error', `Ingresar Personal para el rol ${item.srol}`, 'info');
        return;
      }
      
      var cnt1 = (this.listProjectEstimate.filter(ls => ls.nid_person == item.nid_person)).length;
      var cnt2 = (this.listProjectEstimateAuxiliary.filter(ls => ls.nid_person == item.nid_person)).length;
      if(cnt1 + cnt2 > 1) {
        Swal.fire('Error', 'Una persona no puede estar asignada en dos cargos', 'info');
        return;
      } 

      item.isAuxiliary = false;
    }

    if(isvalid) {
      this.spinner.show('SpinnerProject');
      this.projectService.insupprojectestimate(this.listProjectEstimate).subscribe(result => {
        this.spinner.hide('SpinnerProject');
        if (result == null) {
          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar la estimación del proyecto.',
          });
          return;
        }
  
        if (result.resultado == 1) {
          this.getProjectEstimate();
          Swal.fire({
            icon: 'success',
            title: 'Se registro correctamente la estimación',
          });
          this.selectedPersonId = Number(this.listProjectEstimate[0].nid_person);
  
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar la estimación del proyecto.',
          });
        }
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });
    }
  }

  saveAuxiliar(type: number) {
    this.listProjectEstimateAuxiliary = this.listProjectEstimateAuxiliary.filter(ls => (ls.nid_person != 0 || ls.nid_project_estimate != 0));

    for(let item of this.listProjectEstimateAuxiliary) {
      item.nid_person = Number(item.nid_person);
      item.isAuxiliary = true;
      item.nid_rol = Number(item.nid_rol);

      var cnt1 = (this.listProjectEstimate.filter(ls => ls.nid_person == item.nid_person)).length;
      var cnt2 = (this.listProjectEstimateAuxiliary.filter(ls => ls.nid_person == item.nid_person)).length;
      if(cnt1 + cnt2 > 1) {
        Swal.fire('Error', 'Una persona no puede estar asignada en dos cargoss', 'info');
        return;
      } 
    };

    console.log("Lo que va enviar", this.listProjectEstimateAuxiliary);
    
    this.spinner.show('SpinnerProject');
    this.projectService.insupprojectestimate(this.listProjectEstimateAuxiliary).subscribe(result => {
      this.spinner.hide('SpinnerProject');  
      if (result == null) {
        return;
      }

      if (result.resultado == 1) {
        this.getProjectEstimate();
        if (type == 1) {
          Swal.fire({
            icon: 'success',
            title: 'Se registro correctamente la estimación',

          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Se elimino correctamente el registro',
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar la estimación del proyecto.',
        });
      }
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  agregarAuxiliar() {
    // Lo haré para que solo se pueda agregar uno a la vez
    var newAuxliar: ProjectEstimate = new ProjectEstimate();
    newAuxliar.dstart_date = this.start_date;
    newAuxliar.dend_date = this.end_date;
    newAuxliar.isAuxiliary = true;
    newAuxliar.nid_person = 0;
    newAuxliar.nid_project_estimate = 0;
    // Esto generaria un error en el caso que no exista roles asignados 
    newAuxliar.nid_project = this.listProjectEstimate[0].nid_project;
    newAuxliar.nid_rol = 0;
    newAuxliar.scodproject = this.scodproject

    this.listProjectEstimateAuxiliary.push(newAuxliar);
  }

  eliminarAuxiliar(item: ProjectEstimate, index: number) {
    // Si no esta creado en la base de datos simplemente lo elimino del arreglo
    console.log("QUEV ALOR TIENE", item.nid_project_estimate,item.nid_project_estimate == 0)
    if (item.nid_project_estimate == 0) {
      this.listProjectEstimateAuxiliary.splice(index, 1);
    } else {
      // Si ya esta creado en la base de datos entonces lo inactivo
      item.sactive = "D";
      this.saveAuxiliar(2);
    }
  }

  changePerson(item: ProjectEstimate) {
    console.log("item",item)
    item.nid_person = Number(item.nid_person);
    var cnt1 = (this.listProjectEstimate.filter(ls => ls.nid_person == item.nid_person)).length;
    var cnt2 = (this.listProjectEstimateAuxiliary.filter(ls => ls.nid_person == item.nid_person)).length;
    console.log("asd", this.listProjectEstimate);
    if(cnt1 + cnt2 > 1) {
      // item.nid_person = 0;
      Swal.fire('Error', 'Una persona no puede estar asignada en dos cargoss', 'info');
    } 
  }
  autocompleteHours() {
    let personEntries = this.ListWeekPerson.filter(x => x.nid_person == this.selectedPersonId);
    console.log("listProjectEstimate",this.listProjectEstimate)
    console.log("ListWeekPerson",this.ListWeekPerson)
    console.log("selectedPersonId",this.selectedPersonId)
    console.log("personEntries",personEntries)
    if (this.startIndex >= 0 && this.endIndex < personEntries.length && this.startIndex <= this.endIndex) {      
      for (let i = this.startIndex; i <= this.endIndex; i++) {
        personEntries[i].nhours_asigned = this.totalHours;
      }
    }
  }
}
 