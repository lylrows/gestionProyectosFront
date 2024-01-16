import { Component, EventEmitter, Input, OnInit, Output,ViewChild, ElementRef, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { ProjectInvoicing, ProjectStep2, ProjectStep2Detail } from '../../model/project/project';
import { ProjectService } from '../../services/project/project.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MasterTable } from '../../model/common/mastertable';
import { MastertableService } from '../../services/common/mastertable.service';

@Component({
  selector: 'app-registro-hitos',
  templateUrl: './registro-hitos.component.html',
  styleUrls: ['./registro-hitos.component.css']
})
export class RegistroHitosComponent implements OnInit {

  

  @Output() registroHitosClicked: EventEmitter<any> = new EventEmitter();
  
  constructor(
    private dialogRef: MatDialogRef<RegistroHitosComponent>,
    private projectService: ProjectService,
    private mastertableService:MastertableService,
    @Inject(MAT_DIALOG_DATA) private data: any
    ) { 
    dialogRef.disableClose = true;

    }
  
  scodproject = "";
  totalHito = 0;
  nid_project_step2 = 0;
  porcentajeActual = 0;
  fechaIniProj = "";
  fechaFinProj = "";

  //edit

  projectStep2Detail: ProjectStep2Detail = new ProjectStep2Detail();
  listProjectStep2 :ProjectStep2Detail[];
  projectStep2 :ProjectStep2 = new ProjectStep2();
  moneySymbolS: string='';
  projectDisable: boolean = false;
  isEdit:boolean = false;
  isEditHito:boolean=false;
  listCurrency: MasterTable[] ;
  ListInvoicing: ProjectInvoicing[];

  ngOnInit() {
    this.getCurrency();
    this.projectStep2Detail=new ProjectStep2Detail();
    this.scodproject      = this.data['scodproject'];
    this.isEdit           = this.data['isEdit'];
    if(!this.isEdit)
    {
      this.totalHito        = this.data['totalHito'];
      this.nid_project_step2= this.data['nid_project_step2'];
      this.porcentajeActual = this.data['porcentajeActual'];
      this.fechaIniProj     = this.data['fechaIniProj'];
      this.fechaFinProj     = this.data['fechaFinProj'];
    }
    else
    {
      this.getProjectdtep2(); 
      this.LoadEdit();
    }
    
  }
  getCurrency() {
    this.mastertableService.getmastertable(51).subscribe((response: any) => {
      this.listCurrency = response;
      /*if(this.scodproject!=""){
        this.getProjectdtep2();
      }*/
    }, (error) => {
      console.error(error);
    });
  }
  EditHito(item:any)
  {
    this.isEditHito = true;
    this.projectStep2Detail = item;
  }
  LoadEdit()
  {
    //if(!this.validateSaveProjectTab2()) return;
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
  }
  //creo no sirve
  validateSaveProjectTab2(): boolean{
    let _result2 = true;

    if(this.isNullorEmpty(this.projectStep2.dbegin_date) || this.isNullorEmpty(this.projectStep2.dfinish_date) ||
      this.projectStep2.nexpected_income==0 || this.projectStep2.ncurrency==0){
        Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result2 = false;
    }
    return _result2;
  }
  addHito(){    
    //this.projectStep2Detail.dplanned_date =this.turnDatepickerIntoStringDate(this.projectStep2Detail.dplanned_date);
    
    this.projectStep2Detail.scodproject=this.scodproject;
    this.isEdit?
      this.projectStep2Detail.nid_project_step2=this.projectStep2.nid_project_step2
      :this.projectStep2Detail.nid_project_step2=this.nid_project_step2;
      console.log("nid_project_step2",this.nid_project_step2)
    if(!this.validateTab2Detail()) return;
    
    if(this.porcentajeActual + this.projectStep2Detail.npercentage_invoice <= 100) {
      console.log("projectStep2Detail",this.projectStep2Detail)
      this.projectService.insupprojectstep2detail(this.projectStep2Detail).subscribe(result => {
     
        if (result == null){
          //this.spinner.hide('SpinnerProject');
          return;
        }
  
        if (result.resultado == 1){
          Swal.fire({
            icon: 'success',
            title: this.projectStep2Detail.nid_project_step2_detail>0?'Se actualizó el hito correctamente':'Se generó el hito correctamente',
            //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
          });
          if(this.isEditHito)
          this.cancelEditHito();
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar el proyecto.',
            //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
          });
        }
        //this.spinner.hide('SpinnerProject');
        // this.registroHitosClicked.emit(result.mensaje);
        if(!this.isEdit) 
          this.dialogRef.close(result.mensaje);
          this.getProjectdtep2detail();

      }, (error) => {
      console.error(error);
      //this.spinner.hide('SpinnerProject');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'El porcentaje acumulado supera el 100%',
        //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
      });
    }

  }
  closeModal(){
    this.dialogRef.close(null);
  }
  turnDatepickerIntoStringDate(date: any) {
    if (date == '' || date == null || date.day == null){
      return '';
    }

    // return  date.day.toString().padStart(2, '0')+ '/'
    // + date.month.toString().padStart(2, '0') + '/'
    // + date.year.toString().padStart(2, '0');
    return  date.year.toString().padStart(2, '0')+ '/'
    + date.month.toString().padStart(2, '0') + '/'
    +date.day.toString().padStart(2, '0');
  }
  turnStringDateIntoDatepicker(date: string) {
    if (date == '' || date == null){
      return '';
    }

    let divisor = "-";
    if(date.indexOf("/") != -1) {
      divisor = "/";
    }

    let [day, month, year] = date.split(divisor);
    if (divisor == "/") {
      [day, month, year] = date.split(divisor).reverse();
    }
    
    return {
      day: parseInt(day),
      month: parseInt(month),
      year: parseInt(year)
            
    };
  }
  calcularMonto(): void {
    this.projectStep2Detail.namount = Number((this.totalHito*this.projectStep2Detail.npercentage_invoice/100).toFixed(2))
    // this.projectStep2Detail.namount = Number((this.totalHito*this.projectStep2Detail.npercentage_invoice/100).toFixed(2));
  }
  validateTab2Detail(): boolean{
    let _result3 = true;
    if(this.isNullorEmpty(this.projectStep2Detail.sdescription) || this.isNullorEmpty(this.projectStep2Detail.dplanned_date) ||
    this.projectStep2Detail.npercentage_invoice==0.0){
      Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result3 = false;
    }

    var fechaRegistra = new Date(this.projectStep2Detail.dplanned_date);
    fechaRegistra.setDate(fechaRegistra.getDate() + 1);
    var fechaProIni = new Date(this.fechaIniProj);
    fechaProIni.setDate(fechaProIni.getDate() + 1);
    var fechaProFin = new Date(this.fechaFinProj);
    fechaProFin.setDate(fechaProFin.getDate() + 1);
    if(fechaRegistra< fechaProIni || fechaRegistra > fechaProFin) {
      Swal.fire('Error', 'Fecha hito registrada fuera de las fechas del proyecto', 'info');
      _result3 = false;
    }
    return _result3;
  }
  isNullorEmpty(s:string)
  {
    if(s=="" || s ==null)
      return true;
    else
      return false;
  }
  currencyCheck(event, valor): boolean
  {
    let pattern = /^\d+\.?\d{0,2}$/;
    let result = pattern.test(event.key);
    if (valor == null)
      return result;
    else
      return pattern.test(valor.toString() + event.key);
  }
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
        this.projectService.getprojectinvoicing(this.scodproject).subscribe((response: any) => {
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
  cancelEditHito()
  {
    this.projectStep2Detail = new ProjectStep2Detail()
    this.projectStep2Detail.scodproject = this.scodproject;
    this.isEditHito = false;
  }
  getProjectdtep2detail() {
    this.projectStep2Detail.scodproject=this.scodproject;


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
      
    }, (error) => {
      console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error al registrar hito.',
        });
    });
  }
  getProjectdtep2() {
    this.projectService.getprojectdtep2(this.scodproject).subscribe((response: any) => {
      this.projectStep2 = response;
      //this.getprojectStep2History(this.projectStep2.nid_project_step2);
      this.getProjectdtep2detail();
      

      if(this.projectStep2.ncurrency!=0){
        console.log("listCurrency",this.listCurrency)
        let varb=this.listCurrency.find(data => data.nid_mastertable_type==this.projectStep2.ncurrency);
      //console.log(varb.saux01)
        if(varb!=undefined || varb!=null) this.moneySymbolS=varb.saux01;
        else this.moneySymbolS="N";
      }
      
    }, (error) => {
      console.error(error);
    });
  }
}
