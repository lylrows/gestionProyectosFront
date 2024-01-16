import { environment } from 'src/environments/environment';
import { Component, OnInit, Injectable } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { CesePerson, FiltrosPerson, ManagementPerson, Person, PersonCostHist } from '../../model/person/person.model';
import { PersonService } from '../../services/person/person.service';
import { UserService } from '../../services/user/user.service';
import { UtilityService } from '../../shared/services/utility/utility.service';
import { NgbModalConfig, NgbModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import Swal from 'sweetalert2';
// import * as moment from 'moment';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { NgxSpinnerService } from 'ngx-spinner';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { User } from '../../model/user/user';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { PermisoService } from '../../services/common/permiso.service';
import { MatDialog } from '@angular/material/dialog';
import { PersonModalComponent } from './person-modal/person-modal.component';

import { Workbook } from 'exceljs'; import * as fs from 'file-saver';

defineLocale('es', esLocale);

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent implements OnInit {
  public BreadLevel01 = 'Mantenimiento';
  public Title = 'Bancos';
  person: Person[] = [];
  personFilter: FiltrosPerson = new FiltrosPerson;
  public selectedFile: File;
  currentPage = 1; //seteamos a la pagina 1
  itemsPerPage = 5; // mostramos 5 registros por pagina
  totalItems = 0; //Total de registro

  // flagSave: boolean;
  titleModal: string;
  flagEsCesado: boolean = false;
  flagEditar: boolean = false;
  confPass: string = "";
  viewHistCost: boolean = false;
  listCost: PersonCostHist[];
  Date_True: PersonCostHist;
  nameFileCargado: string = "";

  ListState: any[] = [];

  PersonManagement: ManagementPerson = new ManagementPerson();
  ListDate: PersonCostHist = new PersonCostHist();
  PersonDate: Person = new Person();

  public bsConfigStart: Partial<BsDatepickerConfig>;


  public costoAnterior: number = 0;


  // datos:FormGroup;

  isAdminOrRrhh: number;
  isNewUser: boolean;
  isConfPass: boolean;

  permisoConsultar: boolean = false;
  permisoNuevo: boolean = false;
  permisoEditarTabla: boolean = false;
  permisoDeshabilitarTabla: boolean = false;
  permisoImportarDatos: boolean = false;

  ExcelData: any;
  ExcelDatos: any;
  UserNames: any[] = [];
  cant: number = 0;


  let_mes = new Map([
    [0, "Enero"],
    [1, "Febrero"],
    [2, "Marzo"],
    [3, "Abril"],
    [4, "Mayo"],
    [5, "Junio"],
    [6, "Julio"],
    [7, "Agosto"],
    [8, "Septiembre"],
    [9, "Octubre"],
    [10, "Noviembre"],
    [11, "Diciembre"]
  ])

  constructor(
    private _servicePerson: PersonService,
    private _serviceUser: UserService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    public utilityService: UtilityService,
    private spinner: NgxSpinnerService,
    private mastertableService: MastertableService,
    private permisoService: PermisoService,
    private httpclien: HttpClient,
    private dialog: MatDialog
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.personFilter.pagination.ItemsPerPage = this.itemsPerPage;
    this.personFilter.pagination.TotalItems = this.totalItems;
    this.personFilter.pagination.CurrentPage = this.currentPage;

  }


  ngOnInit() {
    this.obtenerPermisos();
    // Lo de abajo debe cambiar segun los permisos.
    // Primero se va comprobar si es administrador o de recursos humanos
    var isAdministrador = JSON.parse(sessionStorage.getItem('User')).nid_position == '1';
    var isRRHH = JSON.parse(sessionStorage.getItem('User')).nid_category == '3';
    this.personFilter.nidperson = JSON.parse(sessionStorage.getItem('User')).nid_person;
    this.isAdminOrRrhh = (isAdministrador || isRRHH) ? 1 : 0;
    this.personFilter.isAdminOrRrhh = this.isAdminOrRrhh;

    this.getListState();
    this.list();
    this.setPersonManagementObl();
    console.log(this.PersonManagement, "PERSON");
  }

  getPersonCostList() {

    this.spinner.show('SpinnerProject');
    this._servicePerson.getPersonCostList().subscribe((response: any[]) => {

      var data = [];
      var header = ["AÑO", "MES", "DOCUMENTO", "NOMBRE Y APELLIDOS", "TIPO", "DNI/CE/RUC", "COMPROBANTE", "Modalidad", "Costo Emp", "Costo x Hora"];

      let actualYear = new Date();

      for (var i = 0; i < response.length; i++) {
        var item = {};
        item[header[0]] = actualYear.getFullYear();
        item[header[1]] = this.let_mes.get(actualYear.getMonth());
        item[header[2]] = response[i].sdocumentNumber;
        item[header[3]] = response[i].sname;
        item[header[4]] = response[i].stype;
        item[header[5]] = response[i].typeDocument;
        item[header[6]] = " ";
        item[header[7]] = "Planilla";
        item[header[8]] = (Number(response[i].ncost)* 160);
        item[header[9]] = response[i].ncost
        data.push(item);

      }

      //Create workbook and worksheet
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet("Data Entry BI Datos Personal");
      //Add Header Row
      let headerRow = worksheet.addRow(header);
      // Cell Style : Fill and Border
      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      // Add Data and Conditional Formatting
      data.forEach((element) => {
        let eachRow = [];
        header.forEach((headers) => {
          eachRow.push(element[headers])
        })
        // if (element.isDeleted === "Y") {
        //   let deletedRow = worksheet.addRow(eachRow);
        //   deletedRow.eachCell((cell, number) => {
        //     cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
        //   })
        // } else {
        worksheet.addRow(eachRow);
        // }
      })

      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 20;
      worksheet.getColumn(5).width = 10;
      worksheet.addRow([]);
      //Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: "xlsx" });
        fs.saveAs(blob, "Data Entry BI Datos Personal" + ".xlsx");
      })
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }


  obtenerPermisos() {
    this.permisoService.getpermissionbyuser(7).subscribe((response: any) => {
      //console.log("Permisos", response);
      response.forEach(element => {
        if (element.sname == "Consultar") {
          this.permisoConsultar = element.permission
        }
        if (element.sname == "Nuevo") {
          this.permisoNuevo = element.permission
        }
        if (element.sname == "Editar_Tabla") {
          this.permisoEditarTabla = element.permission
        }
        if (element.sname == "Deshabilitar_Tabla") {
          this.permisoDeshabilitarTabla = element.permission
        }
        if (element.sname == "Importar_Datos") {
          this.permisoImportarDatos = element.permission
        }

      });
    }, (error) => {
      console.error(error);
    });
  }

  setPersonManagementObl() {
    this.PersonManagement.sfirstname = "";
    this.PersonManagement.ssecondname = "";
    this.PersonManagement.slastname = "";
    this.PersonManagement.smotherlastname = "";
    this.PersonManagement.nid_typeDocument = 0;
    this.PersonManagement.sdocumentNumber = "";
    this.PersonManagement.semail = "";
    this.PersonManagement.semail2 = "";
    this.PersonManagement.sphone = "";
    this.PersonManagement.sphone2 = "";
    this.PersonManagement.suser = "";
  }

  isNullorEmpty(s: string) {
    if (s == "" || s == null)
      return true;
    else
      return false;
  }

  list() {
    this.personFilter.nidstate = +this.personFilter.nidstate;
    console.log(this.personFilter);
    this.spinner.show();
    this._servicePerson.listaPersonaPaginado(this.personFilter).subscribe(
      res => {
        this.person = res.data;
        this.totalItems = res.pagination.totalItems;
        console.log(this.person, "la lista");
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  botonBuscar() {
    this.personFilter.pagination.CurrentPage = 1;
    this.list();
  }

  pageChanged(event: any): void {
    this.personFilter.pagination.CurrentPage = event;
    this.list();
  };



  getListState(): void {
    this._servicePerson.getListState().subscribe(resp => {
      this.ListState = resp;
    })
  }

  ChangeRegistroPorPagina() {
    this.personFilter.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.list();
  }

  // Cuando cree o edite debe hacer un this.list after close
  // Swal.fire('Confirmación', 'Se guardó correctamente.', 'success');

  edit(person: Person): void {
    this.viewHistCost = false;
    this.flagEditar = true;
    this.titleModal = 'Editar Colaborador';
    this.PersonManagement = new ManagementPerson();
    this.PersonManagement.nid_person = person.nid_person;
    this.PersonManagement.sfirstname = person.sfirstname;
    this.PersonManagement.ssecondname = person.ssecondname;
    this.PersonManagement.slastname = person.slastname;
    this.PersonManagement.smotherlastname = person.smotherlastname;
    this.PersonManagement.nid_typeDocument = person.nid_typeDocument;
    this.PersonManagement.sdocumentNumber = person.sdocumentNumber;
    this.PersonManagement.sphone = person.sphone;
    this.PersonManagement.sphone2 = person.sphone2;
    this.PersonManagement.semail = person.semail;
    this.PersonManagement.semail2 = person.semail2;
    this.PersonManagement.nid_state = person.nid_state;
    this.PersonManagement.nid_position = person.nid_position;
    this.PersonManagement.ddateofadmission = new Date(person.ddateofadmission);
    if (person.dterminationdate != null) this.PersonManagement.dterminationdate = new Date(person.dterminationdate);
    this.PersonManagement.nsalary = person.nsalary;
    this.PersonManagement.isnew = 2;
    this.PersonManagement.scodperson = person.scodperson;
    this.PersonManagement.suser = person.suser;
    this.PersonManagement.spassword = "";
    this.PersonManagement.nid_category = person.nid_category;
    // TODO
    // this.getJob(this.PersonManagement.nid_category);
    this.PersonManagement.nid_job = person.nid_job;
    this.PersonManagement.costHist.ncost = person.ncost;
    this.PersonManagement.costHist.dcost_date = new Date(person.dcost_date);
    this.costoAnterior = this.PersonManagement.costHist.ncost;
    console.log(this.PersonManagement, "person")
    this.confPass = "";

    // this.modalService.open(content, { windowClass: 'my-class'});

    this.flagEsCesado = person.nid_state == environment.IdPersonalCesado ? true : false;
    if (this.isAdminOrRrhh === 1) {
      this.isNewUser = false;
    } else {
      this.isNewUser = true;
    }
    this.isConfPass = true;
    // this.isNewUser=false;

    const dialogPersonModal = this.dialog.open(PersonModalComponent, {
      width: '800px',
      height: '90%',
      autoFocus: false,
      data: {
        PersonManagement: this.PersonManagement,
        titleModal: this.titleModal,
        flagEditar: this.flagEditar,
        costoAnterior: this.costoAnterior,
        isConfPass: this.isConfPass,
        confPass: this.confPass,
        isAdminOrRrhh: this.isAdminOrRrhh,
        flagEsCesado: this.flagEsCesado,
        viewHistCost: this.viewHistCost,
        isNewUser: this.isNewUser
      },
      disableClose: false,
    });
    dialogPersonModal.afterClosed().subscribe(data => {
      if (data == 1) {
        Swal.fire('Confirmación', 'Se guardó correctamente.', 'success');
      }
      this.PersonManagement = new ManagementPerson();
      this.nameFileCargado = "";
      this.list();
    })

  }

  delete(person: Person): void {

    Swal.fire({
      title: '¿Está seguro de deshabilitar la Persona?',
      text: 'No habrá forma de revertir la acción!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, deshabilitar',
      cancelButtonText: 'No, cancelar'
    }).then(result => {
      if (result.value) {
        this._servicePerson.deleteperson(person.nid_person).subscribe(resp => {
          this.PersonManagement.nid_state = 4;

          this.list();
          Swal.fire(
            'Satisfactorio',
            'Se desactivó correctamente.',
            'success'
          );
        })

      }
    })
  }

  open(): void {
    // this.flagSave = true;
    this.flagEditar = false;
    this.flagEsCesado = false;
    this.viewHistCost = false;
    this.titleModal = 'Nuevo Colaborador';
    this.PersonManagement = null;
    this.PersonManagement = new ManagementPerson();
    this.PersonManagement.isnew = 1;
    this.PersonManagement.nid_state = 3;
    if (this.PersonManagement.ddateofadmission <= this.PersonManagement.dterminationdate) {
      this.PersonManagement.nid_state = 4;
    }
    this.PersonManagement.suser = '';
    this.PersonManagement.spassword = this.generatePassword();
    this.isConfPass = false;
    this.isNewUser = false;

    this.listCost = [];


    const dialogPersonModal = this.dialog.open(PersonModalComponent, {
      width: '800px',
      height: '90%',
      autoFocus: false,
      data: {
        PersonManagement: this.PersonManagement,
        titleModal: this.titleModal,
        flagEditar: this.flagEditar,
        costoAnterior: this.costoAnterior,
        isConfPass: this.isConfPass,
        confPass: this.confPass,
        isAdminOrRrhh: this.isAdminOrRrhh,
        flagEsCesado: this.flagEsCesado,
        viewHistCost: this.viewHistCost,
        isNewUser: this.isNewUser
      },
      disableClose: false,
    });
    dialogPersonModal.afterClosed().subscribe(data => {
      if (data == 1) {
        Swal.fire('Confirmación', 'Se guardó correctamente.', 'success');
      }
      this.PersonManagement = new ManagementPerson();
      this.nameFileCargado = "";
      this.list();
    })

  }

  openImportar(content1): void {
    this.modalService.open(content1, { size: 'lg' });
    this.ExcelData = null;
  }

  CargarData() {
    if (this.selectedFile == undefined) {
      Swal.fire({
        icon: 'info',
        title: 'Debe de cargar un archivo.',
      });
      return;
    }
    const formData = new FormData();
    formData.append('person', JSON.stringify(this.PersonManagement));
    formData.append(this.selectedFile.name, this.selectedFile);


  }



  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
  }



  cleanUnnecessaryWhiteSpaces(cadena: string) {
    return cadena.replace(/\s{2,}/g, ' ').trim();
  }


  generatePassword() {
    var length = 8;
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@";
    var retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }




  cambiarUsu() {
    var charsetU = "0123456789";
    var retVal = "";
    for (var i = 0, n = charsetU.length; i < 3; ++i) {
      retVal += charsetU.charAt(Math.floor(Math.random() * n));
    }
    if (this.PersonManagement.sfirstname != undefined && this.PersonManagement.sfirstname != '' && this.PersonManagement.slastname != undefined && this.PersonManagement.slastname != '') {
      this.PersonManagement.suser = this.PersonManagement.sfirstname.substring(0, 1) + this.PersonManagement.slastname + retVal;
    }
    console.log("Usuarioq", this.PersonManagement.suser)
  }




  //(change)="onFileChanged($event)"
  onFileChanged(event) {
    if (event.target.files.length === 0)
      return;
    this.selectedFile = event.target.files[0];
    this.nameFileCargado = this.selectedFile.name;
  }

  ReadExcel(event: any) {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = (e) => {
      var workBook = XLSX.read(fileReader.result, { type: 'binary' });
      var sheetNames = workBook.SheetNames;
      this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]])
      console.log(this.ExcelData)

      console.log("PersonManagement NumCol: ", this.ExcelData[0].NumCol)
      this.cant = +this.ExcelData[0].NumCol;

      this.ExcelDatos = this.ExcelData.slice(1, this.cant + 1);
      console.log(this.ExcelDatos)

      const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      //this.personFilter.pagination.ItemsPerPage=
      // console.log("PERSON FILTERR: ",this.person)

      // for(let y=0;y<this.cant;y++){
      //   let lastname = this.ExcelDatos[y].aPatern.toLowerCase().replace(/ /g, "");
      // this.UserNames[y] = removeAccents(this.ExcelDatos[y].pNom.substring(0,1).toLowerCase() + lastname);
      // }

      // let lastname = this.ExcelDatos.aPatern.toLowerCase().replace(/ /g, "");
      // this.UserNames = removeAccents(this.ExcelDatos.pNom.substring(0,1).toLowerCase() + lastname).slice(0,this.cant);
      //   console.log("USERNAMES: ",this.UserNames)

      //for (let i = 1; i <= this.cant; i++) {
      //this.PersonManagement = new ManagementPerson();
      //this.PersonManagement.sfirstname=this.ExcelData[i].pNom;
      //   this.PersonManagement.ssecondname=this.ExcelData[i].sNom;
      //this.PersonManagement.slastname=this.ExcelData[i].aPatern;
      //   this.PersonManagement.smotherlastname=this.ExcelData[i].aMatern;
      //   this.PersonManagement.nid_typeDocument=+this.ExcelData[i].idDoc;
      //   this.PersonManagement.sdocumentNumber=String(this.ExcelData[i].numDoc);
      //   this.PersonManagement.semail=this.ExcelData[i].emailEmp;
      //   this.PersonManagement.semail2="";
      //   this.PersonManagement.sphone2=String(this.ExcelData[i].Celular);
      //   this.PersonManagement.ddateofadmission=new Date(this.ExcelData[i].fecIni);
      //   this.PersonManagement.dterminationdate=new Date(this.ExcelData[i].fecCes);
      //   this.PersonManagement.nid_state=+this.ExcelData[i].idEstado;
      //   this.PersonManagement.nid_position=+this.ExcelData[i].idPerfil;
      //   this.PersonManagement.nid_category=+this.ExcelData[i].idCatego;
      //   this.PersonManagement.nid_job=+this.ExcelData[i].idPuesto;
      //   this.PersonManagement.costHist.ncost=+this.ExcelData[i].Costo;
      // const removeAccents = (str) => {
      //   return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      // } 

      //let lastname = this.PersonManagement.slastname.toLowerCase().replace(/ /g, "");
      //this.PersonManagement.suser = removeAccents(this.PersonManagement.sfirstname.substring(0,1).toLowerCase() + lastname);

      //console.log("USERS: ",this.PersonManagement.suser)
      //this.UserNames[i] = this.PersonManagement.suser;
      //console.log("USERSNAMES: ",this.UserNames[i])

      //   this.PersonManagement.suser=this.ExcelData[i].pNom.substring(0,1)+ this.ExcelData[i].aPatern;
      //   this.PersonManagement.spassword = this.generatePassword();
      //   this.PersonManagement.isnew = 1;



      // console.log("person log: ",this.PersonManagement)
      // this._servicePerson.managementPerson(this.PersonManagement).subscribe(resp => {
      //   console.log(resp)
      //   if (resp == null){
      //     console.log("ocurrió un error");
      //     this.spinner.hide('SpinnerProject');
      //     return;
      //   }

      //   //this.modalService.dismissAll();
      //   //console.log(this.costoAnterior,"costoanterior")


      //   if (resp.resultado == 1){
      //     this.confPass="";
      //     this.PersonManagement = new ManagementPerson();
      //     if(this.PersonManagement.costHist.ncost==-1)
      //     this.PersonManagement.costHist.ncost = this.costoAnterior;
      //     this.costoAnterior = 0;
      //     Swal.fire({
      //       type: 'success',
      //       title: 'Se cargo correctamente el archivo' ,
      //       //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
      //     });
      //   }else{
      //     Swal.fire({
      //       type: 'error',
      //       title: 'Ocurrió un error al cargar el archivo.',
      //       //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
      //     });
      //   }
      //   this.spinner.hide('SpinnerProject');
      // }, (error) => {
      // console.error(error);
      // this.spinner.hide('SpinnerProject');
      // })

      //}
    }



  }

  userNames(y) {
    for (let i = 1; i <= this.cant; i++) {
      this.PersonManagement = new ManagementPerson();
      this.PersonManagement.sfirstname = this.ExcelData[i].pNom;
      this.PersonManagement.slastname = this.ExcelData[i].aPatern;

      const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      let lastname = this.PersonManagement.slastname.toLowerCase().replace(/ /g, "");
      this.PersonManagement.suser = removeAccents(this.PersonManagement.sfirstname.substring(0, 1).toLowerCase() + lastname);

      console.log("USERS: ", this.PersonManagement.suser)
      this.UserNames[i] = this.PersonManagement.suser;



    }
    console.log("USERSNAMES: ", this.UserNames[y])
  }

  savePersons(f: NgForm): void {

    this.cant = +this.ExcelData[0].NumCol;

    for (let i = 1; i <= this.cant; i++) {
      this.PersonManagement = new ManagementPerson();
      this.PersonManagement.sfirstname = this.ExcelData[i].pNom;
      this.PersonManagement.ssecondname = this.ExcelData[i].sNom;
      this.PersonManagement.slastname = this.ExcelData[i].aPatern;
      this.PersonManagement.smotherlastname = this.ExcelData[i].aMatern;
      this.PersonManagement.nid_typeDocument = +this.ExcelData[i].idDoc;
      this.PersonManagement.sdocumentNumber = String(this.ExcelData[i].numDoc);
      this.PersonManagement.semail = this.ExcelData[i].emailEmp;
      this.PersonManagement.semail2 = "";
      this.PersonManagement.sphone2 = String(this.ExcelData[i].Celular);

      let arrayFecIni = this.ExcelData[i].fecIni.split('/');
      let tempFecIni = arrayFecIni[1] + "/" + arrayFecIni[0] + "/" + arrayFecIni[2];

      let tempFecCes = this.ExcelData[i].fecCes;
      if (this.ExcelData[i].fecCes != "" && this.ExcelData[i].fecCes != null) {
        let arrayFecCes = this.ExcelData[i].fecCes.split('/');
        tempFecCes = arrayFecCes[1] + "/" + arrayFecCes[0] + "/" + arrayFecCes[2];
      }

      this.PersonManagement.ddateofadmission = new Date(tempFecIni);
      this.PersonManagement.dterminationdate = new Date(tempFecCes);
      this.PersonManagement.nid_state = +this.ExcelData[i].idEstado;
      this.PersonManagement.nid_position = +this.ExcelData[i].idPerfil;
      this.PersonManagement.nid_category = +this.ExcelData[i].idCatego;
      this.PersonManagement.nid_job = +this.ExcelData[i].idPuesto;
      this.PersonManagement.costHist.ncost = +this.ExcelData[i].Costo;

      const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      let lastname = this.PersonManagement.slastname.toLowerCase().replace(/ /g, "");
      this.PersonManagement.suser = removeAccents(this.PersonManagement.sfirstname.substring(0, 1).toLowerCase() + lastname);

      this.PersonManagement.spassword = this.generatePassword();
      this.PersonManagement.isnew = 1;

      this.validatePersons();

      this._servicePerson.managementPerson(this.PersonManagement).subscribe(resp => {
        console.log("respuesta", resp)
        if (resp == null) {
          console.log("ocurrió un error");
          this.spinner.hide('SpinnerProject');
          return;
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Se cargo correctamente el archivo',
          });
        }

        //this.modalService.dismissAll();
        //console.log(this.costoAnterior,"costoanterior")


        // if (resp.resultado == 1){
        //   this.confPass="";
        //   this.PersonManagement = new ManagementPerson();
        //   if(this.PersonManagement.costHist.ncost==-1)
        //   this.PersonManagement.costHist.ncost = this.costoAnterior;
        //   this.costoAnterior = 0;

        // }else{
        //   Swal.fire({
        //     type: 'error',
        //     title: 'Ocurrió un error al cargar el archivo.',
        //     //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        //   });
        // }
        this.spinner.hide('SpinnerProject');
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      })

      this.modalService.dismissAll();
      this.list();
    }



  }

  validatePersons() {
    console.log("validate persons");

    if (this.isNullorEmpty(this.PersonManagement.ssecondname) ||
      this.isNullorEmpty(this.PersonManagement.semail2) ||
      this.isNullorEmpty(this.PersonManagement.sphone)) {
      this.PersonManagement.ssecondname = "";
      this.PersonManagement.semail2 = "";
      this.PersonManagement.sphone = "";
    }


  }

  saveCost(f: NgForm): void {
    const formData = new FormData();
    formData.append(this.selectedFile.name, this.selectedFile);

    this._servicePerson.uploadCostDocument(formData).subscribe(result => {
      if (result == null) {
        console.log("ocurrió un error");
        this.spinner.hide('SpinnerProject');
        return;
      }

      if (result.resultado == 1) {
        this.listCost = JSON.parse(result.data);
        this.listCost.forEach(x => {
          x.dcost_date = new Date(x.dcost_date)
        });
        Swal.fire({
          icon: 'success',
          title: 'Se cargo correctamente los costos de los colaboradores',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al cargar el archivo.',
        });
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });

  }
  DelFile() {
    this.selectedFile = undefined;
    this.nameFileCargado = "";
  }

  close(): void {
    console.log("Cerranding")
    // this.PersonManagement = new ManagementPerson();
    // this.modalService.dismissAll();
    // this.nameFileCargado="";
  }

}
