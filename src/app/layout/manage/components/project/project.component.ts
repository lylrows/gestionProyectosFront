import { Component, EventEmitter, Input, OnInit, Output,ViewChild, ElementRef, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { ProjectInvoicing, Project,ProjectStep2,ProjectStep2History,ProjectStep2Detail,ProjectStep3,ProjectStep3Investment,ProjectStep3Cost,ProjectStep4,ProjectStep5,ProjectStep4Detail, ProjectStep3Investment_area } from '../../model/project/project';
import { MasterTable } from '../../model/common/mastertable';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { NgbModal,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/layout/manage/model/user/user';
import { interval } from 'rxjs';
import { RegistroHitosComponent } from '../registro-hitos/registro-hitos.component';
import { PermisoService } from '../../services/common/permiso.service';
import { ClienteComponent } from '../cliente/cliente.component';
import { Client } from '../../model/client/client';
import { FilterProject } from '../../model/project/filterproject';



@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  //@Output() registroHitosClicked: EventEmitter<any> = new EventEmitter();
  @ViewChild('tabset') tabSet: any;
  //private tabset: NgbTabset;
  // private modalReference: NgbModalRef;
  // @Output() projectClicked: EventEmitter<any> = new EventEmitter();
  
  
  scodproject = "";
  sstatusname = "";
  snameproject = "";
  titleProjectModal = "";
  nid_project = 0;

  selectedIndex: number = 0;

  public codProject :string ="";
  public item2 :boolean =true;
  tituloProject="";
  listProjectInvoicing: ProjectInvoicing = new ProjectInvoicing();
  ListInvoicing: ProjectInvoicing[];
  public titleHitosModal ='Hito'
  project: Project = new Project();
  listRoles : MasterTable[];
  listCategory : MasterTable [];
  listCurrency: MasterTable[];
  projectStep2 :ProjectStep2 = new ProjectStep2();
  projectStep2Detail :ProjectStep2Detail=new ProjectStep2Detail();
  projectStep3 :ProjectStep3 = new ProjectStep3();
  projectStep4 :ProjectStep4 = new ProjectStep4();
  listProjectStep4Detail : ProjectStep4Detail[];
  projectStep5 :ProjectStep5 = new ProjectStep5();
  projectStep3Investment :ProjectStep3Investment = new ProjectStep3Investment();
  projectStep3Investment_area :ProjectStep3Investment_area = new ProjectStep3Investment_area();
  projectStep3Cost :ProjectStep3Cost = new ProjectStep3Cost();
  listProjectStep2 :ProjectStep2Detail[];
  listprojectStep2History : ProjectStep2History[];
  listProjectStep3Investment :ProjectStep3Investment[];
  listProjectStep3Investment_area :ProjectStep3Investment_area[];
  listProjectStep3Cost :ProjectStep3Cost[];
  public itemForm: FormGroup;
  ManagerDisabled: boolean = true;
  step01Disabled: boolean = true;
  step02Disabled: boolean = true;
  step03Disabled: boolean = true;
  step04Disabled: boolean = true;
  step05Disabled: boolean = true;
  nameBtnAddInvestment :string = "Agregar";
  nameBtnAddInvestment_area :string = "Agregar";
  isEditInvestment:boolean=false;
  isEditInvestmentArea:boolean=false;
  nameFileCargado="";
  public selectedFile: File;
  user: User = new User();
  numMonths:number = 0;
  porcentajeActual: number = 0;
  fechaIniProj: string;
  fechaFinProj: string;
  estimacionRegistrada: boolean = false;
  moneySymbol: string [] = [];
  moneySymbolS: string='';
  isNidRolNull: boolean=false;
  isNidAreaNull: boolean=false;
  isNhoursAssginedNull: boolean=false;
  isInvestmentPercentageNull:boolean=false;
  isNpeopleQuantityNull: boolean=false;
  isNcostPerHourNull:boolean=false;

  projectDisable: boolean = false;

  disableEditarStep1: boolean = true;

  step4Flag:boolean = true;

  //agregarDisabled: boolean = true;

  projectList:any[]=[];
  ismanager_area: boolean=false;

  constructor(
    private dialogRef: MatDialogRef<ProjectComponent>,
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private personService: PersonService,
    private mastertableService:MastertableService,
    private projectTypeService: ProjectTypeService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private permisoService: PermisoService,
    // private modalService: NgbModal,  
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    dialogRef.disableClose = true;
    this.step01Disabled = false;
    this.moneySymbol=["S/.","$"];
  }

  
  ClientDropDownList:Client[];
  PersonDropDownList:DropDownList[];
  ProjectTypeDropDownList:any[];

  

  ngOnInit() {
    this.obtenerPermisos();
    this.scodproject       = this.data['scodproject'];
    this.sstatusname       = this.data['sstatusname'];
    this.snameproject      = this.data['snameproject'];
    this.titleProjectModal = this.data['titleProjectModal'];
    this.nid_project       = this.data['nidProject'];
    this.codProject=this.scodproject;
    this.projectService.getprojectinvoicing(this.codProject).subscribe(response => {
      if(response != null) {
        this.listProjectInvoicing = response
      }
    })

    this.getProjectInvoicing();//Esto trae la lista
    this.tituloProject=this.codProject + " - " + this.snameproject;
    this.getClientDropDown();
    this.getPersonDropDown();
    this.getProjectTypeDropDown();
    this.getRoles();
    this.getCategory();
    this.getCurrency();
    this.getProjectDropDown();
    if(this.scodproject!=""){
      this.project.scodproject=this.scodproject;
      this.getProject();
      this.getProjectdtep3();
      this.getProjectdtep4();
      this.getProjectdtep5();
      this.ChangeUtilidadBruta();
      this.getProjectEstimate();
    }
    if(this.sstatusname=="Inactivo" || this.sstatusname=="Cerrado")  {
      this.projectDisable = true;
    } else {
      this.projectDisable = false;
    }
    
    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
   }
   if(this.user.nid_job==1){
     this.ManagerDisabled = false;
   }
   this.project.nid_manager = Number(this.user.nid_person);
  }

  
  getProjectEstimate() {
    this.projectService.getprojectestimate(this.scodproject, 2).subscribe((response: any) => {
      this.estimacionRegistrada = response != null;
      // [disabled]="estimacionRegistrada"
    }, (error) => {
      console.error(error);
    });
  }

  getProjectInvoicing(){  
    this.projectService.getprojectinvoicing(this.codProject).subscribe((response: any) => {
      this.listProjectInvoicing = response;
    }, (error) => {
      console.error(error);
     });
  }



  submit() {
      this.project.nid_projectmethodology =+this.project.nid_projectmethodology;
      this.project.nid_project_type = Number(this.project.nid_project_type);
      this.project.nid_client = Number(this.project.nid_client);
      this.project.nid_manager =Number(this.project.nid_manager);
      this.project.nid_project = this.nid_project;
      if(this.project.nid_project_type==5)
        this.project.nid_projectFather = Number(this.project.nid_projectFather)
      if(!this.validateSaveProjectTab1()) return;
      this.spinner.show('SpinnerProject');
      console.log("PROJECTPRE",this.project)
      this.projectService.insert(this.project).subscribe(result => {
                if (result == null){
                  Swal.fire('Error', 'Debe elegir roles', 'info');
                this.spinner.hide('SpinnerProject');
                  return ;
                }
                if (result.resultado == 1){
                  //this.project.scodproject=result.mensaje;
                  //console.log("result.data",result)
                  this.scodproject = result.data;
                  this.nid_project = result.nidprocess
                  this.project.scodproject = this.scodproject;
                  this.getProject();
                  this.step02Disabled=false;
                  this.ManagerDisabled=false;
                  this.selectedIndex = 1;
                  // this.tabSet.activeId = "tab-2"     
                  //this.campo=false;
                  Swal.fire({
                    icon: 'success',
                    title: 'Se generó el proyecto con código:' +  result.mensaje ,
                    //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
                  });
                }
                else if(result.resultado == 2){
                  Swal.fire({
                    icon: 'error',
                    title: 'El código insertado ya existe.',
                    //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
                  });
                }
                else{
                  Swal.fire({
                    icon: 'error',
                    title: 'Ocurrió un error al registrar el proyecto.',
                    //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
                  });
                }
                this.spinner.hide('SpinnerProject');
              //  this.projectClicked.emit(result.mensaje);
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });    
  }
  

  validateSaveProjectTab1(): boolean{
    let _result = true;

    // if(this.project.nid_project_type==2){
    //   if(this.isNullorEmpty(this.project.scodproject)){
    //     Swal.fire('Error', 'Debe completar el campo código de proyecto', 'info');
    //     _result = false;
    //   }
    // }

    // if(this.project.nid_project_type==3){
      
    // }

    if(this.project.nid_project_type==0  ||
      this.isNullorEmpty(this.project.snameproject) ||
      this.project.nid_client==0 || 
      this.isNullorEmpty(this.project.scodproject))
    {
      Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
      _result = false;
    }
    else if(this.project.nid_project_type==5 && this.project.nid_projectFather == 0)
    {
      Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
      _result = false;
    }

    return _result;
  }

  validateSaveProjectTab2(): boolean{
    let _result2 = true;
    if(this.projectStep2.nexpected_income==0 && this.project.nid_project_type == 8)
    {
      Swal.fire('Error', 'No se puede agregar hito si no hay ingreso esperado', 'info');
        _result2 = false;
    }
    else if(this.isNullorEmpty(this.projectStep2.dbegin_date) || this.isNullorEmpty(this.projectStep2.dfinish_date) ||
      this.projectStep2.nexpected_income==0 || this.projectStep2.ncurrency==0){
        Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result2 = false;
    }
    return _result2;
  }
  validateSaveProjectTab2simple(): boolean{
    let _result2 = true;
    if(this.isNullorEmpty(this.projectStep2.dbegin_date) || this.isNullorEmpty(this.projectStep2.dfinish_date)){
        Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result2 = false;
    }
    return _result2;
  }

  isNullorEmpty(s:string)
  {
    if(s=="" || s ==null)
      return true;
    else
      return false;
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

  getClientDropDown() {
    this.spinner.show('SpinnerProject');
    this.clientService.getDropdownlist(0).subscribe((response: any) => {
      this.ClientDropDownList = response;
      console.log(response);
      
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectTypeDropDown() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(9052).subscribe((response: any) => {
      this.ProjectTypeDropDownList = response;
      this.spinner.hide('SpinnerProject');      
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProject(){
    this.projectService.getproject(this.project.scodproject).subscribe((response: any) => {
      console.log("RESPONSE",response)
      this.project = response;
      console.log("PROJECT",this.project)
      if (this.project.nid_project_type!=3) {
        if(this.project.nid_projectmethodology==2){
          let content2:HTMLElement= document.getElementById('radioMethodology2') as HTMLElement;
          // content2.click();
        }
        else{
          let content2:HTMLElement= document.getElementById('radioMethodology1') as HTMLElement;
          // content2.click();
        }
      }
      this.changeTipoServicio();
      this.step02Disabled=false;
    }, (error) => {
      console.error(error);
    });
  }
  getProjectDropDown()
  {
    var filterProject: FilterProject = new FilterProject();
    filterProject.pagination.CurrentPage = 1;
    filterProject.pagination.ItemsPerPage = 9999;
    filterProject.pagination.TotalItems = 0;
    filterProject.nid_status = 1;
    filterProject.nid_project_type = 1;
    this.projectService.getprojectpagination(filterProject).subscribe(
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
          console.log("project dropdown",this.projectList)
        } catch (e) {
          this.spinner.hide();
        }
      }
    );
  }


  closeModal() {
    this.dialogRef.close(null);
  }

  AddClient(){
    const dialogOpenClient = this.dialog.open(ClienteComponent, {
      width: '600px',
      height: '70%',
      autoFocus:false,
      disableClose: false,
    });
    dialogOpenClient.afterClosed().subscribe(data => {
      this.getClientDropDown();
    })
    
  }
  
  LoadModalHitos(){
    if(!this.validateSaveProjectTab2()) return;
    // Va a calcular el porcentaje actual de la lista registrada
    let temp = 0;
    if(this.listProjectStep2 != undefined && this.listProjectStep2 != null) {
      if(this.listProjectStep2.length > 0) {
        for (let i = 0; i < this.listProjectStep2.length; i++){
          temp += Number(this.listProjectStep2[i].npercentage_invoice)
        }
      }
    }

    this.porcentajeActual = temp;
    this.fechaIniProj = this.projectStep2.dbegin_date;
    this.fechaFinProj = this.projectStep2.dfinish_date;
    this.projectStep2Detail= new ProjectStep2Detail();
    
    // this.modalReference=this.modalService.open(content, { size: 'lg' });

    const dialogOpenBandeja = this.dialog.open(RegistroHitosComponent, {
      width: '800px',
      height: '90%',
      autoFocus:false,
      data: {
        totalHito: this.projectStep2.nexpected_income,
        scodproject: this.project.scodproject,
        isEdit: false,
        nid_project_step2: this.projectStep2.nid_project_step2,
        porcentajeActual: this.porcentajeActual,
        fechaIniProj: this.fechaIniProj,
        fechaFinProj: this.fechaFinProj
      },
      disableClose: false,
    });
    dialogOpenBandeja.afterClosed().subscribe(data => {
      if (data!= null){
        this.projectStep2.nid_project_step2=Number(data);
        this.getProjectdtep2detail();
      }
    })
  }


  saveTab2(){
    this.projectStep2.scodproject=this.project.scodproject;
    this.projectStep2.ncurrency=Number(this.projectStep2.ncurrency);

    this.projectStep2.nexpected_income = Number(this.projectStep2.nexpected_income);
    //probar si no hay problema al comentar este fragmento de codigo
    this.projectStep2.ntotal_amount=Number(this.projectStep2.ntotal_amount);
    /*if (this.project.nid_project_type != 3) {
      this.projectStep2.ntotal_amount=Number(this.projectStep2.ntotal_amount);
    } else {
      this.projectStep2.ntotal_amount= this.projectStep2.nexpected_income;
    }*/
    //
    if(this.project.nid_project_type != 8)
    {
      if(!this.validateSaveProjectTab2()) return;
    }
    else 
    {
      if(!this.validateSaveProjectTab2simple()) return;
    }
    this.projectStep2.nfrequency = 1;
    
    this.projectService.insupprojectstep2(this.projectStep2).subscribe(result => {
      if (result == null){
        this.spinner.hide('SpinnerProject');
        return;
      }

      if (result.resultado == 1){
        this.projectStep2.nid_project_step2=Number(result.mensaje);
        
        //this.addHito();
        this.getProjectdtep2detail();
        this.getprojectStep2History(this.projectStep2.nid_project_step2);
        Swal.fire({
          icon: 'success',
          title: 'Se registro la información financiera',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
        this.step03Disabled=false;
        this.selectedIndex = 2;
        // this.tabSet.activeId = "tab-3"  
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar la información financiera.',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
    console.error(error);
    this.spinner.hide('SpinnerProject');
    });
  

  }

  getMonthsBtwnDates(startDate,endDate){
  // El setDate es porque lo crea con un dia menos
  startDate = new Date(startDate);
  startDate.setDate(startDate.getDate() + 1);
  endDate = new Date(endDate);
  endDate.setDate(endDate.getDate() + 1);
    return Math.max(
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        endDate.getMonth() -
        startDate.getMonth(),
      0   
    )
  }

  roundNumberToTwoDecimals(number: number) {
    return Number(parseFloat(number.toString()).toFixed(2));
  }
  //Descontinuado, ya no se autogeneran los hitos 18/05
  /*generateHitos(){
    console.log("generate hitos")
    if (this.project.nid_project_type==3){
      // Cuando se crea la fecha se crea con un día menos
      const gh_dbegin_date = new Date(this.projectStep2.dbegin_date);
      gh_dbegin_date.setDate(gh_dbegin_date.getDate() + 1);

      const gh_dfinish_date = new Date(this.projectStep2.dfinish_date);
      gh_dfinish_date.setDate(gh_dfinish_date.getDate() + 1);

      this.listProjectStep2 = [];

      let nMonths = this.getMonthsBtwnDates(this.projectStep2.dbegin_date, this.projectStep2.dfinish_date)

      if (this.projectStep2.nfrequency == 1){   
      }else if(this.projectStep2.nfrequency == 2){
        const primer_paso_diferencia_dias = gh_dfinish_date.getTime() - gh_dbegin_date.getTime();
        const Days = Math.trunc(((primer_paso_diferencia_dias / (1000*3600*24)) + 1) / 15);

        let monthlyFee = this.projectStep2.nexpected_income / (Days);

          for(let i=1; i <= Days; i++){
            let hito = new ProjectStep2Detail();
            hito.namount = this.roundNumberToTwoDecimals(monthlyFee);

            if(i == 1) {
              gh_dbegin_date.setDate(gh_dbegin_date.getDate() + 14);
            } else {
              gh_dbegin_date.setDate(gh_dbegin_date.getDate() + 15);
            }

            hito.dplanned_date = this.turnDatepickerIntoStringDate(gh_dbegin_date);
            

            hito.npercentage_invoice= this.roundNumberToTwoDecimals((monthlyFee/this.projectStep2.nexpected_income)*100);
            hito.nmilestone = i;
            hito.sdescription = "Hito " + String(i);
            this.listProjectStep2.push(hito);
          }
      
      }else if(this.projectStep2.nfrequency == 3){
      
        let monthlyFee =this.projectStep2.nexpected_income / (nMonths);
          for(let i=1; i <= nMonths; i++){
            let hito = new ProjectStep2Detail();
            
            hito.namount = this.roundNumberToTwoDecimals(monthlyFee);

            gh_dbegin_date.setMonth(gh_dbegin_date.getMonth() + 1);
            hito.dplanned_date = this.turnDatepickerIntoStringDate(gh_dbegin_date);
          
          
            hito.npercentage_invoice= this.roundNumberToTwoDecimals((monthlyFee/this.projectStep2.nexpected_income)*100);
            hito.nmilestone = i;
            hito.sdescription = "Hito " + String(i);
            this.projectStep2Detail = hito;
            this.listProjectStep2.push(hito);
            // this.addHito();  
          }
      }
      }else {
        
        let new_sum = 0;
        if(this.listProjectStep2==undefined){
          console.log("this.listProjectStep2 is undefined")
        }else{
          this.listProjectStep2.forEach( value => {
            value.namount = this.projectStep2.nexpected_income*(value.npercentage_invoice/100)
            new_sum += value.namount
        });
        this.projectStep2.ntotal_amount= new_sum;
        }
        
      }
  }*/
 //Descontinuado, no se usa en el front 18/05/23
 /*addHito(){
  //this.projectStep2Detail.dplanned_date =this.turnDatepickerIntoStringDate(this.projectStep2Detail.dplanned_date);
  if (this.project.nid_project_type==3){
    this.listProjectStep2.forEach(prj => {
      // Esto lo deberia hacer cuando se crea cada prj
      prj.scodproject = this.projectStep2.scodproject;
      prj.nid_project_step2 = this.projectStep2.nid_project_step2
      console.log("prj",prj)
      this.projectService.insupprojectstep2detail(prj).subscribe(result => {

        if (result == null){
          console.log("ocurrió un error");
          return;
        }
        
        if (result.resultado == 1){
          Swal.fire({
            icon: 'success',
            title: this.projectStep2Detail.nid_project_step2_detail>0?'Se actualizó el hito correctamente':'Se generó el hito correctamente',
          });
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar el proyecto.',
          });
        }

      }, (error) => {
      console.error(error);
      });
    });
  }
  }*/

  //  camposLlenos():boolean{
  //  let _lleno=true;

  //    if(this.validateSaveProjectTab2()===true){
  //     let contentL= <HTMLInputElement>document.getElementById('ButtonDis');
  //     contentL.disabled=false;
  //    }
  //    return _lleno;
  // }

  getProjectdtep2detail() {
    this.spinner.show('SpinnerProject');

    this.projectStep2Detail.scodproject=this.projectStep2.scodproject;

    //if(!this.validateTab2Detail()){ return} else {};

    //this.projectStep2Detail.scodproject=this.projectStep2.scodproject;

    this.projectService.getprojectdtep2detail(this.projectStep2.nid_project_step2).subscribe((response: any) => {
      if(response != null) {
        this.listProjectStep2 = response;

        this.projectStep2.ntotal_amount=this.listProjectStep2.reduce((sum, current) => sum + current.namount, 0);
        // this.projectStep2.nexpected_income=this.listProjectStep2.reduce((sum, current) => sum + current.namount, 0);
        for (let i = 1; i <= this.listProjectStep2.length; i++){
          this.listProjectStep2[i-1].nmilestone= i;
        
         } 
      }
      this.spinner.hide('SpinnerProject');
      
    }, (error) => {
      console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar hito.',
        });
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectdtep2() {
    this.spinner.show('SpinnerProject');
    this.projectService.getprojectdtep2(this.project.scodproject).subscribe((response: any) => {
      console.log("step2",response)
      this.projectStep2 = response;
      //console.log("step2 id",this.projectStep2.nid_project_step2)
      this.getprojectStep2History(this.projectStep2.nid_project_step2);
      this.spinner.hide('SpinnerProject');
      this.getProjectdtep2detail();
      this.step03Disabled=false;
      
      this.ChangeUtilidadBruta()

      if(this.projectStep2.ncurrency!=0){
        let varb=this.listCurrency.find(data => data.nid_mastertable_type==this.projectStep2.ncurrency);
      //console.log(varb.saux01)
        if(varb!=undefined || varb!=null) this.moneySymbolS=varb.saux01;
        else this.moneySymbolS="N";
      }
      
      
      // if(this.projectStep2.ncurrency==2){
      //   this.moneySymbolS=this.moneySymbol[1]
      // }else if(this.projectStep2.ncurrency==1){
      //   this.moneySymbolS=this.moneySymbol[0]
      // }
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getprojectStep2History(id:number){
    this.projectService.getprojectstep2history(id).subscribe((response: any) => {
      //console.log("step2history",response);
      this.listprojectStep2History = response;
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  // EditHito(content,hito){
  //   this.projectStep2Detail=hito;
  //   this.modalReference=this.modalService.open(content, { size: 'lg' });
  // }

  //gil2
  delete(item): void {
    Swal.fire({
      title: '¿Está seguro de eliminar el Hito?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then(result => {
      
      if (result.value) {
        //gil
        this.projectService.getprojectinvoicing(this.codProject).subscribe((response: any) => {
          this.ListInvoicing = response;
          for (let i = 1; i <= this.ListInvoicing.length; i++){
            this.ListInvoicing[i-1].nmilestone= i;
          
           } 
          for(let i=0;i<this.ListInvoicing.length;i++){
           if(!this.ListInvoicing[i].binvoiced  && this.ListInvoicing[i].nmilestone == item.nmilestone ){
            
             //Swal.fire('Error', 'No puede eliminar un Hito ya facturado', 'info');
    
             this.EliminarHito(item);
           }if(this.ListInvoicing[i].binvoiced  && this.ListInvoicing[i].nmilestone == item.nmilestone ){
            Swal.fire('Error', 'No puede eliminar un Hito ya facturado', 'info');
           }
          }
          
        }, (error) => {
          console.error(error);
         });   
                      
      }
    })
  }


  //GIL
  EliminarHito(hito){
    hito.sactive='D';
    hito.scodproject="";
    let nuevo_total_delete= 0;
    this.projectService.insupprojectstep2detail(hito).subscribe(result => {
      if (result == null){
        console.log("ocurrió un error");
        return;  
      }

      if (result.resultado == 1){
        const index = this.listProjectStep2.indexOf(hito, 0);
        if (index > -1) {
          this.listProjectStep2.splice(index, 1);
         
        }
        for (let i = 1; i <= this.listProjectStep2.length; i++){
         this.listProjectStep2[i-1].nmilestone= i;
         nuevo_total_delete += (Number(this.listProjectStep2[i-1].npercentage_invoice) * Number(this.projectStep2.nexpected_income) / 100)
         //this.UpdateHitosEliminacion(this.listProjectStep2[i-1]);
        } 
        this.projectStep2.ntotal_amount = nuevo_total_delete;
         
        Swal.fire({
          icon: 'success',
          title: 'Se eliminó el hito correctamente',
          
        });
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al eliminar el hito.',
          
        });
      }
    }, (error) => {
    console.error(error);
    });

  }
  
  UpdateHitosEliminacion(hito){
    hito.sactive="U"
    this.projectService.insupprojectstep2detail(hito).subscribe(result => {
  

    }, (error) => {
    console.error(error);
    });
    
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
  getCategory() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(32).subscribe((response: any) => {
      this.listCategory = response;      
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  getCurrency() {
    this.spinner.show('SpinnerProject');
    this.mastertableService.getmastertable(51).subscribe((response: any) => {
      this.listCurrency = response;
      this.spinner.hide('SpinnerProject');
      if(this.scodproject!=""){
        this.getProjectdtep2();
      }
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }
  ChangeCostoxHora(){
    
    let rol=this.listRoles.filter(r => r.nid_mastertable_type==this.projectStep3Investment.nid_rol)[0];
    this.projectStep3Investment.ncost_per_hour=Number(rol.saux01);
    this.projectStep3Investment.snamerol=rol.sshort_value;
  }
  ChangeInvestmentArea(){
    
    let area=this.listCategory.filter(r => r.nid_mastertable_type==this.projectStep3Investment_area.nid_area)[0];
    
    this.projectStep3Investment_area.snamearea=area.sshort_value;
  }
  ChangeTotalxResource(){
    this.projectStep3Investment.ntotal_per_resource=this.projectStep3Investment.ncost_per_hour * this.projectStep3Investment.nhours_assgined 
    }

  AddInvestment(){
    let mensaje=this.ValidarInvestment();
    
    if (mensaje!=""){
      Swal.fire({
        icon: 'info',
        title: 'Falta ingresar los siguientes campos: <br/>'+"<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      return;
    }
    this.projectStep3Investment.nid_rol=Number(this.projectStep3Investment.nid_rol);
    if(!this.isEditInvestment && this.projectStep3.listInvestment.filter(x=>x.sactive!="D" && x.nid_rol==this.projectStep3Investment.nid_rol).length>0){
      Swal.fire({
        icon: 'info',
        title: 'El rol seleccionado ya fue ingresado.'
      });
      return;
    }
    this.projectStep3Investment.npeople_quantity=Number(this.projectStep3Investment.npeople_quantity);
    let investment=this.projectStep3Investment;
    this.projectStep3Investment=new ProjectStep3Investment();
    if(this.isEditInvestment){
      this.projectStep3.listInvestment.filter(x=>x.nid_rol==investment.nid_rol)[0]=investment;
    }
    else{
      this.projectStep3.listInvestment.push(investment);
    }
    
    this.projectStep3.ntotal_hours = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.nhours_assgined, 0);
    this.projectStep3.ntotal_investment = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.ntotal_per_resource, 0);
    this.nameBtnAddInvestment="Agregar";
    this.isEditInvestment=false;
    this.isNidRolNull=false;
    this.isNhoursAssginedNull=false;
    this.isNpeopleQuantityNull=false;
    this.isNcostPerHourNull=false;
  }
  AddInvestment_area(){
    let mensaje=this.ValidarInvestment_area();
    
    if (mensaje!=""){
      Swal.fire({
        icon: 'info',
        title: 'Falta ingresar los siguientes campos: <br/>'+"<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      return;
    }
    console.log("project step 3",this.projectStep3)
    this.projectStep3Investment_area.nid_area=Number(this.projectStep3Investment_area.nid_area);
    if(!this.isEditInvestmentArea && this.projectStep3.listInvestment_area.filter(x=>x.sactive!="D" && x.nid_area==this.projectStep3Investment_area.nid_area).length>0){
      Swal.fire({
        icon: 'info',
        title: 'El área seleccionada ya fue ingresada.'
      });
      return;
    }
    this.projectStep3Investment_area.investment_percentage=Number(this.projectStep3Investment_area.investment_percentage);
    let investment=this.projectStep3Investment_area;
    this.projectStep3Investment_area=new ProjectStep3Investment_area();
    if(this.isEditInvestmentArea){
      this.projectStep3.listInvestment_area.filter(x=>x.nid_area==investment.nid_area)[0]=investment;
    }
    else{
      this.projectStep3.listInvestment_area.push(investment);
    }
    this.nameBtnAddInvestment_area="Agregar";
    this.isEditInvestmentArea=false;
    this.isNidAreaNull=false;
  }
  EditInvestment(investment:any){
    this.nameBtnAddInvestment="Actualizar";
    const itemInvestment=investment;
    this.projectStep3Investment=itemInvestment;
    let mensaje=this.ValidarInvestment();
    
    if (mensaje!=""){
      Swal.fire({
        icon: 'info',
        title: 'Falta ingresar los siguientes campos: <br/>'+"<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      return;
    }
    this.isEditInvestment=true;
    this.isNidRolNull=false;
    this.isNhoursAssginedNull=false;
    this.isNpeopleQuantityNull=false
    this.isNcostPerHourNull=false;
  }
  EditInvestment_area(investment:any){
    this.nameBtnAddInvestment_area="Actualizar";
    const itemInvestment=investment;
    this.projectStep3Investment_area=itemInvestment;
    let mensaje=this.ValidarInvestment_area();
    
    if (mensaje!=""){
      Swal.fire({
        icon: 'info',
        title: 'Falta ingresar los siguientes campos: <br/>'+"<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      return;
    }
    this.isEditInvestmentArea=true;
    this.isNidRolNull=false;
    this.isNhoursAssginedNull=false;
    this.isNpeopleQuantityNull=false
    this.isNcostPerHourNull=false;
  }
  DelInvestment(investment:any){
    if(investment.nid_project_step3_investment==0){
        this.projectStep3.listInvestment.forEach((value,index)=>{
          if(value.nid_rol==investment.nid_rol) this.projectStep3.listInvestment.splice(index,1);
        });
    }
    else{
      investment.sactive="D";
    }
    this.projectStep3.ntotal_hours = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.nhours_assgined, 0);
    this.projectStep3.ntotal_investment = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.ntotal_per_resource, 0);
  }
  DelInvestment_area(investment:any){
    if(investment.nid_project_step3_investment_area==0){
        this.projectStep3.listInvestment_area.forEach((value,index)=>{
          if(value.nid_area==investment.nid_area) 
            this.projectStep3.listInvestment_area.splice(index,1);
        });
    }
    else{
      investment.sactive="D";
    }
    this.projectStep3.ntotal_hours = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.nhours_assgined, 0);
    this.projectStep3.ntotal_investment = this.projectStep3.listInvestment.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.ntotal_per_resource, 0);
  }
  AddCost(){
    let nuevoCosto = new ProjectStep3Cost();
    nuevoCosto.sexternal_cost = "";
    nuevoCosto.namount = 0;
    nuevoCosto.sactive= 'A';
    this.projectStep3.listCost.push(nuevoCosto);
  }
  DelCost(index:any){
    let cost =this.projectStep3.listCost[index];
    if(cost.nid_project_step3_cost==0){
      this.projectStep3.listCost.splice(index,1);
    }
    else{
      cost.sactive="D";
    }
    this.ChangeTotalCostExt();
  }
  ChangeTotalCostExt(){
    this.projectStep3.ntotal_external_cost = this.projectStep3.listCost.filter(x=>x.sactive!="D").reduce((sum, current) => sum + current.namount, 0);
  }
  ValidarInvestment(){
    let mensaje="";
    if(this.projectStep3Investment.nid_rol==0){
      this.isNidRolNull=true;
      mensaje=mensaje+"<br /> Rol";
    }
    if(this.projectStep3Investment.nhours_assgined==0 && 
      this.project.nid_project_type != 7 &&
      this.project.nid_project_type != 3 &&
      this.project.nid_project_type != 6
      ){
      this.isNhoursAssginedNull=true;
      mensaje=mensaje+"<br /> Horas asignación";
    }
    if(this.projectStep3Investment.npeople_quantity==0){
      this.isNpeopleQuantityNull=true;
      mensaje=mensaje+"<br /> Cantidad de personas";
    }
    if(this.projectStep3Investment.ncost_per_hour==0){
      this.isNcostPerHourNull=true;
      mensaje=mensaje+"<br /> Costo por Hora";
    }
    return mensaje;
  }
  ValidarInvestment_area(){
    let mensaje="";
    if(this.projectStep3Investment_area.nid_area==0){
      this.isNidRolNull=true;
      mensaje=mensaje+"<br /> Área";
    }
    if(this.projectStep3Investment_area.investment_percentage==0 ||  this.projectStep3Investment_area.investment_percentage == null){
      this.isNhoursAssginedNull=true;
      mensaje=mensaje+"<br /> Porcentaje";
    }
    return mensaje;
  }
  ValidarPorcentajeInvestment_area(): string {
    let total_percentage = 0;
    for (let investment_area of this.projectStep3.listInvestment_area) {
      total_percentage += investment_area.investment_percentage;
      if(investment_area.manager_area){
        this.ismanager_area = true;
      }
    }

    if (total_percentage > 100) {
      return "El porcentaje total de las areas es mayor que 100";
    } else if (total_percentage < 100) {
      return "El porcentaje total de las areas es menor que 100";
    }

    if(!this.ismanager_area){
      return "Debe elegir el área encargada";
    }
    
    return "";
  }
  onChange(i,manager_area){
    console.log(i,manager_area);
    this.projectStep3.listInvestment_area[i].manager_area=manager_area;
    this.projectStep3.listInvestment_area.forEach((value,index) =>{
      if(index!=i){
        value.manager_area=false;
      }
    })
  }
  saveTab3(){
    this.projectStep3.scodproject=this.project.scodproject;
    // for (let investment_area of this.projectStep3.listInvestment_area) {
    //   if(investment_area.manager_area){
    //     this.ismanager_area = true;
    //   }
    // }
    // if(!this.ismanager_area){
    //   Swal.fire({
    //     icon: 'info',
    //     title: "<div style='text-align: left; display: contents; font-size:14px;'>"+"Debe elegir el área encargada"+"</div>"
    //   });
    //   return;
    // }
    console.log(this.projectStep3.listInvestment_area);
    let mensaje = this.ValidarPorcentajeInvestment_area();
    if(mensaje != "")
    {
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      return;
    }
  
    this.spinner.show('SpinnerProject');
    //console.log(this.projectStep3);
    this.ismanager_area = false;
    this.projectService.insupprojectstep3(this.projectStep3).subscribe(result => {
      this.spinner.hide('SpinnerProject');
      if (result == null){
        return;
      }

      if (result.resultado == 1){
        this.projectStep3.nid_project_step3=Number(result.mensaje);
        this.getProjectdtep3();
    
        Swal.fire({
          icon: 'success',
          title: 'Se registro correctamente la inversión del proyecto' ,
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
          if (this.project.nid_project_type != 3) {
              this.step04Disabled = false;
              this.selectedIndex = 3;
              // this.tabSet.activeId = "tab-4" 
          } else {
              this.step05Disabled = false;
              this.selectedIndex = 4;
              // this.tabSet.activeId = "tab-5" 
          }

      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar la inversión del proyecto.',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
      }
    }, (error) => {
    console.error(error);
    this.spinner.hide('SpinnerProject');
    });
  }
  getProjectdtep3(){
    this.projectService.getprojectdtep3(this.project.scodproject).subscribe((response: any) => {
      this.projectStep3 = response;
      this.ChangeUtilidadBruta();
      this.spinner.hide('SpinnerProject');
      this.step04Disabled=false;
      
    }, (error) => {
      console.error(error);
    });
  }
  saveTab4(){
    if(this.selectedFile ==undefined){
      Swal.fire({
        icon: 'info',
        title: 'Debe de cargar un archivo.',
      });
      return;
    }
    this.projectStep4.scodproject=this.project.scodproject;
    const formData = new FormData();
    formData.append('projectStep4', JSON.stringify(this.projectStep4));
    formData.append(this.selectedFile.name, this.selectedFile);

    this.spinner.show('SpinnerProject');
    this.projectService.insupprojectstep4(formData).subscribe(result => {
      this.spinner.hide('SpinnerProject');
      if (result == null){
        return;
      }
      if (result.resultado == 1){
        this.listProjectStep4Detail=JSON.parse(result.data);
        this.projectStep4.nid_project_step4=Number(result.mensaje);
        //this.getProjectdtep3();
        Swal.fire({
          icon: 'success',
          title: 'Se cargo correctamente el archivo' ,
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
        this.step05Disabled=false;
        this.selectedIndex = 4;
        // this.tabSet.activeId = "tab-5" 

      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al cargar el archivo.',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
    console.error(error);
    this.spinner.hide('SpinnerProject');
    });

  }
  onFileChanged(event){
    if (event.target.files.length === 0)
      return;
    this.selectedFile = event.target.files[0];
    this.nameFileCargado=this.selectedFile.name;
  }
  getProjectdtep4(){
    this.projectService.getprojectdtep4(this.project.scodproject).subscribe((response: any) => {
      this.projectStep4 = response;
      this.ChangeUtilidadBruta();
      this.spinner.hide('SpinnerProject');
      this.step05Disabled=false;
      this.nameFileCargado=this.projectStep4.sfilename;
      this.getProjectdtep4Detail();
      
    }, (error) => {
      console.error(error);
    });
  }
  getProjectdtep4Detail(){
    this.projectService.getprojectdtep4detail(this.projectStep4.nid_project_step4).subscribe((response: any) => {
      this.listProjectStep4Detail = response;
      this.ChangeUtilidadBruta();
      this.spinner.hide('SpinnerProject');
      this.step05Disabled=false;
      this.nameFileCargado=this.projectStep4.sfilename;
      
    }, (error) => {
      console.error(error);
    });
  }
  ChangeUtilidadBruta(){
    this.projectStep5.nexpected_utility=this.projectStep2.nexpected_income-this.projectStep3.ntotal_investment-this.projectStep3.ntotal_external_cost;
    if(this.projectStep2.nexpected_income <= 0)
      this.projectStep5.nmargin = 0;
    else
      this.projectStep5.nmargin=Number(((this.projectStep5.nexpected_utility/this.projectStep2.nexpected_income)*100).toFixed(2));
  }
  saveTab5(){
    this.projectStep5.scodproject= this.project.scodproject;
    this.projectStep5.nexpected_income=this.projectStep2.nexpected_income;
    this.projectStep5.ntotal_investment=this.projectStep3.ntotal_investment;
    this.projectStep5.ntotal_external_cost=this.projectStep3.ntotal_external_cost;
    this.projectStep5.sactive= "A";
    this.projectService.insupprojectstep5(this.projectStep5).subscribe(result => {
      if (result == null){
        console.log("ocurrió un error");
        this.spinner.hide('SpinnerProject');
        return;
      }

      if (result.resultado == 1){
        this.projectStep5.nid_project_step5=Number(result.mensaje);
        //this.getProjectdtep3();
        Swal.fire({
          icon: 'success',
          title: 'Se creo correctamente el proyecto' ,
         });
        this.closeModal();
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al crear el proyecto.',
           });
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
    console.error(error);
    this.spinner.hide('SpinnerProject');
    });

  }
  ConfirmSaveTab5(){
    Swal.fire({
      icon: 'info', 
      title: 'Confirmación',
      text: '¿Desea crear el proyecto?',  
      showCancelButton: true,  
      confirmButtonText: 'Si, crear proyecto',  
      cancelButtonText: 'No, cancelar'  
    }).then((result) => {  
      if (result.value) {  
        this.saveTab5(); 
      } else if (result.dismiss === Swal.DismissReason.cancel) {  
        Swal.fire(  
          'Cancelado',  
          'Continue editando el proyecto',  
          'error'  
        )  
      }  
    });
  }
  getProjectdtep5(){
    this.projectService.getprojectdtep5(this.project.scodproject).subscribe((response: any) => {
      this.projectStep5 = response;
    }, (error) => {
      console.error(error);
    });
  }
  DelFile(){
    this.selectedFile= undefined;
    this.nameFileCargado="";
  }
  turnDatepickerIntoStringDate(date: any) 
  {
    if (date == '' || date == null || date.getDate() == null)
    {
      return '';
    }
    
      return  date.getFullYear().toString().padStart(4, '0') + '-'
      + (date.getMonth() + 1).toString().padStart(2, '0') + '-'
      + date.getDate().toString().padStart(2, '0')
      
  }

  currencyCheck(event, valor): boolean
  {
    let pattern = /^\d{0,9}\.?\d{0,2}$/;
    let result = pattern.test(event.key);
    if (valor == null)
      return result;
    else
      return pattern.test(valor.toString() + event.key);
  }

  maxLength(event, valor): boolean
  {
    let pattern = /^[0-9]{1,3}$/;
    let result = pattern.test(event.key);
    if (valor == null)
      return result;
    else
      return pattern.test(valor.toString() + event.key);
  }

  cambioMoneda() {
    let varb=this.listCurrency.find(data => data.nid_mastertable_type==this.projectStep2.ncurrency);
    //console.log(varb.saux01)
    if(varb!=undefined || varb!=null) this.moneySymbolS=varb.saux01;
    else this.moneySymbolS="N";    
  }
  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(8).subscribe((response: any) => {
      console.log("permisos",response)
      response.forEach(element => {
        if(element.sname=="Editar_Step1"){
          this.disableEditarStep1 = !element.permission;
          this.ManagerDisabled = !element.permission;
        }        
      });

    }, (error) => {
      console.error(error);
    });
  }
  
  changeTipoServicio()
  {
    if(this.project.nid_project_type == 3 ||
      this.project.nid_project_type == 4 ||
      this.project.nid_project_type == 6 ||
      this.project.nid_project_type == 7 
      //||this.project.nid_project_type == 8
      )
      this.step4Flag = false
    else
      this.step4Flag = true;
  }
}


