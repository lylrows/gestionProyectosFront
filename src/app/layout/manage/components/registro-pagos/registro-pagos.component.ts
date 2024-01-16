import { Component, OnInit, EventEmitter, Input, Output,ViewChild, ElementRef, Inject } from '@angular/core';
import { ProjectInvoicing, ProjectStep2, ProjectStep2Detail } from '../../model/project/project';
import { ProjectService } from '../../services/project/project.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { exit } from 'process';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-registro-pagos',
  templateUrl: './registro-pagos.component.html',
  styleUrls: ['./registro-pagos.component.css']
})
export class RegistroPagosComponent implements OnInit {

  scodproject = "";
  snameproject = "";
  sstatusname = "";
  titleProjectModal = "";

  listProjectInvoicing :ProjectInvoicing[];
  ListProject: ProjectInvoicing=new ProjectInvoicing();
  listProjectInvoicing1: ProjectInvoicing = new ProjectInvoicing();
  tituloProject="";
  public codProject :string ="";
  projectDisable: boolean = false;
  projectStep2 :ProjectStep2 = new ProjectStep2();
 //projectStep2detail: ProjectStep2Detail = new ProjectStep2Detail();

  constructor(
    private dialogRef: MatDialogRef<RegistroPagosComponent>,
    private projectService: ProjectService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    dialogRef.disableClose = true;
     }

  ngOnInit() {
    this.scodproject       = this.data['scodproject'];
    this.sstatusname       = this.data['sstatusname'];
    this.snameproject      = this.data['snameproject'];
    this.titleProjectModal = this.data['titleProjectModal'];

    this.codProject=this.scodproject;
    if(this.sstatusname=="Inactivo") {
      this.projectDisable = true;
    } else {
      this.projectDisable = false;
    }

    this.projectService.getprojectdtep2(this.codProject).subscribe(response => {
      
      if(response != null) {
        this.projectStep2 = response
      }
    })

    this.getProjectInvoicing();//Esto trae la lista
    this.tituloProject=this.codProject + " - " + this.snameproject;
    
  }
  // for (let i = 1; i <= this.listProjectStep2.length; i++){
  //   this.listProjectStep2[i-1].nmilestone= i;
  
  //  }
  getProjectInvoicing(){  
    
    this.projectService.getprojectinvoicing(this.codProject).subscribe((response: any) => {
      this.listProjectInvoicing = response;
   
       if(this.listProjectInvoicing === null ){
         Swal.fire('Error', 'Debe programar Hitos', 'info');
       }
      
    }, (error) => {
      console.error(error);
     });
  }

  MontoFacturado(i){
    if(this.listProjectInvoicing[i].binvoiced!=true){
      this.listProjectInvoicing[i].nbilled_amount=0;
      Swal.fire('Confirmación', 'Monto No Facturado', 'success');
    }else{
      this.listProjectInvoicing[i].nbilled_amount=(this.projectStep2.nexpected_income *this.listProjectInvoicing[i].npercentage_invoice)/100;
      Swal.fire('Confirmación', 'Monto Facturado', 'success');
    }
    // this.listProjectInvoicing.forEach(function (item) {
    //   if(item.binvoiced==true){
    //     item.nbilled_amount=(this.projectStep2.nexpected_income *item.npercentage_invoice)/100;
    //     console.log("item.nbilled_amount",item.nbilled_amount);
    //   }else{
    //     item.nbilled_amount=0;
    //   }
      
    // });
  }
  
  SaveInvoicing(){
    console.log(this.listProjectInvoicing);
    this.projectService.insupprojectinvoicing(this.listProjectInvoicing).subscribe(result => {
      if (result == null){
        console.log("ocurrió un error");
        this.spinner.hide('SpinnerProject');
        return;
      }

      if (result.resultado == 1){
        
        
        this.getProjectInvoicing();
        Swal.fire({
          icon: 'success',
          title: 'Se registro correctamente la facturación' ,
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
        
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrar la facturación del proyecto.',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
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

  Validate2(i){
      if(this.listProjectInvoicing[i].binvoiced!=true){
       this.listProjectInvoicing[i].bpaid=false;
        //   Swal.fire({
        //   type: 'error',
        //   title: 'Tiene que facturar',
        //   //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
          
        // });
        
        
      }
      
      //this.MontoFacturado(i);
    
   
  }
   Validate(i){
       if(this.listProjectInvoicing[i].binvoiced!=true){
        this.listProjectInvoicing[i].bpaid=false;
           Swal.fire({
            icon: 'error',
           title: 'Tiene que facturar',
           //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
           
         });
         
         
       }
       
     
    
   }

}
