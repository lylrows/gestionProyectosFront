import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { MasterTable } from '../../../model/common/mastertable';
import { CesePerson, ManagementPerson, PersonCostHist } from '../../../model/person/person.model';
import { MastertableService } from '../../../services/common/mastertable.service';
import { PersonService } from '../../../services/person/person.service';
import { UserService } from '../../../services/user/user.service';
import { UtilityService } from '../../../shared/services/utility/utility.service';

@Component({
  selector: 'app-person-modal',
  templateUrl: './person-modal.component.html',
  styleUrls: ['./person-modal.component.css']
})
export class PersonModalComponent implements OnInit {

  DocumentType: any[] = [];
  
  fechahoys:string;
  fechahoy: Date;
  fecha_hoy = new Date();
  s_fecha_hoy = this.fecha_hoy.getFullYear() + "-" + String(this.fecha_hoy.getMonth()+1).padStart(2, '0') + "-" + String(this.fecha_hoy.getDate()+1).padStart(2, '0');
  dateString: string = this.s_fecha_hoy;
  fechacese: string;


  usuarioRepetido = false;
  docRepetido = false;
  maxLength: number;
  isValidEmail:boolean = true;
  isValidEmail2:boolean = true;

  auxX: number;

  listHistCost:PersonCostHist[];

  fieldTextType = false;

  verifiquePass: boolean = false;

  listaCese: CesePerson[] = [];
  ListState: any[] = [];
  profile: MasterTable[]=[];
  listCategory : MasterTable[];
  listJob : MasterTable[]=[];

  // Lo que deberia venir en la data
  PersonManagement: ManagementPerson = new ManagementPerson();
  titleModal: string = "";
  flagEditar: boolean = false;
  costoAnterior:number = 0;
  isConfPass: boolean;
  confPass : string = "";
  isAdminOrRrhh: boolean = false;
  flagEsCesado: boolean = false;
  viewHistCost: boolean =false;
  isNewUser: boolean = false;

  public bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private dialogRef: MatDialogRef<PersonModalComponent>,
    private _servicePerson: PersonService,
    private _userService: UserService,
    public utilityService: UtilityService,
    private mastertableService:MastertableService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { 
    dialogRef.disableClose = true;
    
    this.bsConfig = Object.assign({},
      {
        dateInputFormat: 'DD/MM/YYYY' ,
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: false,
        isAnimated: true
      });
  }

  ngOnInit(): void {
    this.PersonManagement =this.data['PersonManagement'];
    this.titleModal       =this.data['titleModal']; 
    this.flagEditar       =this.data['flagEditar'];
    this.costoAnterior    =this.data['costoAnterior'];
    this.isConfPass       =this.data['isConfPass'];
    this.confPass         =this.data['confPass'];
    this.isAdminOrRrhh    =this.data['isAdminOrRrhh'];
    this.flagEsCesado     =this.data['flagEsCesado'];
    this.viewHistCost     =this.data['viewHistCost'];
    this.isNewUser        =this.data['isNewUser'];

    this.getListProfile();
    this.getDocumentType();
    this.getListState();
    this.getCategory();
  }

  getCategory() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(32).subscribe((response: any) => {
      this.listCategory = response;
      if(this.PersonManagement.isnew == 2) {
        this.getJob(this.PersonManagement.nid_category)
      }
      
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getListProfile(): void {
    this.mastertableService.getmastertable(65).subscribe((response: any) => {
      this.profile = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  
  getListState(): void {
    this._servicePerson.getListState().subscribe(resp => {
      this.ListState = resp;
    })
  }

  ViewHistCost(id_person) {
    this.viewHistCost=!this.viewHistCost;
    this.PersonManagement.saveCost = false;
    if(this.viewHistCost)
    {
      this.spinner.show('SpinnerProject');
      this._servicePerson.getPersonCostHist(id_person).subscribe((response: any) => {
        this.listHistCost = response;
        this.listHistCost.forEach(x => {x.dcost_date=new Date(x.dcost_date)});
        this.spinner.hide('SpinnerProject');
        
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });
    }    
  }

  getDocumentType(): void {
    this.mastertableService.getmastertable(2055).subscribe((response: any) => {
      this.DocumentType = response;
      if(this.PersonManagement != null) {
        this.numTypeDocu(this.PersonManagement.nid_typeDocument);
      }
    }, (error) => {
      console.error(error);
    });

    // this._servicePerson.getDocumentType().subscribe(resp => {
    //   this.DocumentType = resp;
    //   console.log("Lista de documentos", this.DocumentType);
    // })
  }

  save(f: NgForm): void {
    const removeAccents = (str) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      } 
    this.fechahoy=new Date(this.s_fecha_hoy)

    this.fechahoys=this.fechahoy.toDateString();
    if(this.PersonManagement.dterminationdate != undefined && this.PersonManagement.dterminationdate != undefined) {
      this.fechacese=this.PersonManagement.dterminationdate.toDateString();
      if(this.fechacese==this.fechahoys){
        this.PersonManagement.nid_state=4;
      }
    }

    this.PersonManagement.sfirstname=this.PersonManagement.sfirstname.toLocaleUpperCase();
    if(this.PersonManagement.ssecondname!=null){
      this.PersonManagement.ssecondname=this.PersonManagement.ssecondname.toLocaleUpperCase();
    }
    this.PersonManagement.slastname=this.PersonManagement.slastname.toLocaleUpperCase();
    this.PersonManagement.smotherlastname=this.PersonManagement.smotherlastname.toLocaleUpperCase();
    this.PersonManagement.suser=removeAccents(this.PersonManagement.suser);

    //console.log("fecha here:",this.PersonManagement.ddateofadmission);
    this.PersonManagement.nid_state = Number(this.PersonManagement.nid_state);
	  this.PersonManagement.nid_position = Number(this.PersonManagement.nid_position);
    this.PersonManagement.nid_typeDocument = Number(this.PersonManagement.nid_typeDocument);
    //this.PersonManagement.sphone2 = Number(this.PersonManagement.sphone2);
    this.PersonManagement.nid_category = Number(this.PersonManagement.nid_category);
    this.PersonManagement.nid_job = Number(this.PersonManagement.nid_job);
    if(!this.validateSavePerson()) return;
    
    //console.log("Debug cool", this.PersonManagement.slastname);
    //console.log(this.PersonManagement, "lo que se va guardar")
    if(this.flagEditar)
    {
      if(this.PersonManagement.costHist.ncost==this.costoAnterior)
      {
        this.PersonManagement.costHist.ncost =-1;
      }
    }

    
    this.spinner.show('SpinnerProject');

    this._servicePerson.managementPerson(this.PersonManagement).subscribe(resp => {
      this.spinner.hide('SpinnerProject');
      this.confPass="";
      this.dialogRef.close(1);
      // this.PersonManagement = new ManagementPerson();
      // if(this.PersonManagement.costHist.ncost==-1)
      //   this.PersonManagement.costHist.ncost = this.costoAnterior;
      // this.costoAnterior = 0;
    })

    
  }

  validateSavePerson(): boolean {
    let _result = true;
    'use strict';
    var EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
    if(this.PersonManagement.spassword.length>0 && this.isConfPass===true){
      if(this.confPass!=this.PersonManagement.spassword){
        Swal.fire('Error', 'Las contraseñas deben ser iguales', 'info');
        _result = false;
      }
    }

    if(this.PersonManagement.dterminationdate != null) {
      if(this.PersonManagement.ddateofadmission >= this.PersonManagement.dterminationdate){
        Swal.fire('Error', 'Debe seleccionar el estado Cesado', 'info');
        _result = false;
      }
    }

    if(this.PersonManagement.nid_state == environment.IdPersonalCesado) {
      if(this.PersonManagement.dterminationdate == null){
        Swal.fire('Error', 'Debe ingresar una fecha de Cese', 'info');
        _result = false;
      }
    }

    if(!this.flagEditar) {
      
      if(this.usuarioRepetido) {
        Swal.fire('Error', 'Usuario Repetido', 'info');
        _result = false;
      }
      if(this.docRepetido) {
        console.log("doc REPETIDO",this.docRepetido);
        Swal.fire('Error', 'N° Documento Repetido', 'info');
        _result = false;
      }
    } 

    if(this.PersonManagement.sdocumentNumber.length<this.maxLength || this.PersonManagement.sdocumentNumber.length>this.maxLength){
      Swal.fire('Error', 'Cantidad de dígitos inválidos en el N° de Documento', 'info');
        _result = false;
    }

    if(!this.PersonManagement.semail.match(EMAIL_REGEX)){
      Swal.fire('Error', 'Debe ingresar un correo corporativo válido', 'info');
      this.isValidEmail = false;
      _result=false;
    }

    if(this.PersonManagement.semail2==null || this.PersonManagement.semail2=="" || this.PersonManagement.semail2==undefined){
      //console.log("aqui sin:",this.PersonManagement.semail2);
      
    }else{
      if(!this.PersonManagement.semail2.match(EMAIL_REGEX)){
        Swal.fire('Error', 'Debe ingresar un correo personal válido', 'info');
        this.isValidEmail2 = false;
        _result=false;
      }
    }

    if(this.PersonManagement.ddateofadmission==null){
      Swal.fire('Error', 'Debe indicar la fecha de inicio', 'info');
        _result = false;
    }

    if(this.isNullorEmpty(this.PersonManagement.sfirstname)||
    //this.isNullorEmpty(this.PersonManagement.ssecondname) ||
    this.isNullorEmpty(this.PersonManagement.slastname) || 
    this.isNullorEmpty(this.PersonManagement.smotherlastname) || 
    this.PersonManagement.nid_typeDocument == 0 ||
    this.isNullorEmpty(this.PersonManagement.sdocumentNumber) || 
    this.isNullorEmpty(this.PersonManagement.semail)||
    //this.PersonManagement.ddateofadmission==null||
    //this.isNullorEmpty(this.PersonManagement.semail2) || 
    //this.isNullorEmpty(this.PersonManagement.sphone) ||
    this.isNullorEmpty(this.PersonManagement.sphone2) || 
    this.isNullorEmpty(this.PersonManagement.suser) ||
    this.isNullorEmpty(String(this.PersonManagement.ddateofadmission)) ||
    this.PersonManagement.nid_state == 0 ||
    this.PersonManagement.nid_category == 0 || this.PersonManagement.nid_position == 0 || this.PersonManagement.nid_job == 0)
    {
      Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result = false;
    }

    // this.isValidEmail = true;
    // this.isValidEmail2 = true;
    return _result;
    
  }

  blurGetUser() {

    const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } 
    
    if(this.PersonManagement.sfirstname != undefined && this.PersonManagement.sfirstname != '' && this.PersonManagement.slastname != undefined && this.PersonManagement.slastname != '') {
      let lastname = this.PersonManagement.slastname.toLowerCase().replace(/ /g, "");
      this.PersonManagement.suser = removeAccents(this.PersonManagement.sfirstname.substring(0,1).toLowerCase() + lastname);
      
      this.validateUser();
    }
  }

  validateUser() {
    const jsonUsuario = {
      "mensaje": this.PersonManagement.suser
    };

    this.usuarioRepetido = false;

    this._userService.existsuserbysUser(jsonUsuario).subscribe(data => {
      console.log("Respuesta",data.mensaje);
      if(data.mensaje == 'El usuario ya esta registrado en el sistema'){
        this.usuarioRepetido = true;
      }
    })
    
  }

  validateDoc() {
    const jsonDocUser = {
      "mensaje": this.PersonManagement.sdocumentNumber
    };

    this.docRepetido = false;

    this._userService.existsuserbyDoc(jsonDocUser).subscribe(data => {
      console.log("RespuestaA",data.mensaje);
      if(data.mensaje == 'El documento se encuentra en uso'){
        
        this.docRepetido = true;
      }
    })
  }

  numTypeDocu(aux1:any){
    //console.log(aux1)
    //console.log(this.DocumentType)
    let varb=this.DocumentType.find(data => data.nid_mastertable_type==aux1);

    //console.log("varb",varb)
    if(varb!=null) this.auxX=varb.saux01;
    else this.auxX=11;
    //console.log("aux",typeof this.auxX)
    this.maxLength = this.auxX;
  }

  isNullorEmpty(s:string)
  {
    if(s=="" || s ==null)
      return true;
    else
      return false;
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  blurPass(){
    if(this.PersonManagement.spassword==this.confPass){
      this.verifiquePass=true;
    }
    else{
      this.verifiquePass=false;
    }
    
  }

  addNewInitialDate(): void {
    if(this.listaCese == null || typeof this.listaCese == 'undefined') this.listaCese = [];
    //validar si en la lista estan todas las fechas de cese llenas
    if(this.listaCese.length > 0) {
      let _validation = true;
      this.listaCese.forEach(x => {
        if(x.ddateofadmission == null || typeof x.ddateofadmission == 'undefined') _validation = false;
        if(x.dterminationdate == null || typeof x.dterminationdate == 'undefined') _validation = false;
      });
      if(!_validation) {
        Swal.fire('Error', 'Debe llenar la fecha de Ingreso/Cese anterior', 'info');
        return;
      }
    }


    let _objCese = new CesePerson();
    _objCese.nid_person = this.PersonManagement.nid_person;
    this.listaCese.push(_objCese);
  }

  getJob(id) {
    this.spinner.show('SpinnerProject');
    let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(idFather).subscribe((response: any) => {
      this.listJob = response;
      this.spinner.hide('SpinnerProject');
      
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  EditCost(){
    this.PersonManagement.saveCost=!this.PersonManagement.saveCost;
    this.viewHistCost=false;
  }
  
  close(): void {
    this.dialogRef.close(null);
  }
}
