import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ProvExt } from '../../../model/prov-ext/provext';
import { MastertableService } from '../../../services/common/mastertable.service';
import { MasterTable } from '../../../model/common/mastertable';
import { ProjectService } from '../../../services/project/project.service';

@Component({
  selector: 'app-registro-proveedor-externo',
  templateUrl: './registro-proveedor-externo.component.html',
  styleUrls: ['./registro-proveedor-externo.component.css']
})
export class RegistroProveedorExternoComponent implements OnInit {

  user: any;
  provext: ProvExt = new ProvExt();
  listCategoriaHora: MasterTable[];
  ListProvExt: ProvExt[];

  constructor(
    private dialogRef: MatDialogRef<RegistroProveedorExternoComponent>,
    private spinner: NgxSpinnerService,
    private mastertableService:MastertableService,
    private projectService: ProjectService
  ) {
    dialogRef.disableClose = true;
   }

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem('User'));
   this.getCategoriaHora();
   this.getProvExt();
  }

  getCategoriaHora() {
    this.spinner.show('SpinnerProject');

    let listCategorias: MasterTable = new MasterTable();

    this.mastertableService.getmastertable(-1).subscribe((res: any) => {
      listCategorias = res.find(x=>x.typeaux==4);
      console.log(listCategorias.nid_mastertable);
      this.spinner.hide('SpinnerProject');
      this.mastertableService.getmastertable(listCategorias.nid_mastertable).subscribe((response: any) => {
        this.listCategoriaHora = response;
        console.log(response);
        this.listCategoriaHora = this.listCategoriaHora.filter(x=>x.nid_mastertable_type==3 || x.nid_mastertable_type==4)
        console.log(this.listCategoriaHora);
        this.spinner.hide('SpinnerProject');
      }, (error) => {
        console.error(error);
        this.spinner.hide('SpinnerProject');
      });

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProvExt(){
    this.projectService.getpersonalexternal(0).subscribe(resp=>{
      if(resp!=null){
        this.ListProvExt=resp;
        console.log(resp);
      }
    },(error) => {
      console.log(error);
    })
  }

  validateProvExt():boolean{
    let _result=true;
    if(this.provext.costohora==0){
      let mensaje="Debe ingresar el costo por hora";
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      _result=false;
    }
    if(this.provext.nid_categoryhours==0){
      let mensaje="Debe escoger una categoría";
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      _result=false;
    }
    if(this.provext.edescription==null 
      || this.provext.edescription==undefined
      || this.provext.edescription==""){
      let mensaje="Debe ingresar una descripción o nombre";
      Swal.fire({
        icon: 'info',
        title: "<div style='text-align: left; display: contents; font-size:14px;'>"+mensaje+"</div>"
      });
      _result=false;
    }
    return _result;
  }

  save(){
    this.provext.nid_categoryhours=Number(this.provext.nid_categoryhours);
    this.provext.costohora=Number(this.provext.costohora);
    console.log(this.provext);
    if(!this.validateProvExt()) return;
    this.projectService.insupprovext(this.provext).subscribe(resp=>{
      if(resp!=null){
        console.log(resp, 'Done!');
        if(resp.resultado==1){
          Swal.fire({
            icon: 'success',
            title: resp.mensaje
          })
          this.getProvExt();
        }else if(resp.resultado==2){
          Swal.fire({
            icon: 'success',
            title: resp.mensaje
          })
          this.getProvExt();
        }else if(resp.resultado==3){
          Swal.fire({
            icon: 'success',
            title: resp.mensaje
          })
          this.getProvExt();
        }
        else{
          Swal.fire({
            icon: 'error',
            title: 'Algo salió mal...'
          })
        }
        
      }
    }, (error)=>{
      console.log(error, 'Error!');
      
    })
  }

  clean(){
    this.provext = new ProvExt();
  }

  edit(item: ProvExt){
    this.provext = new ProvExt();
    this.provext=item;
    this.provext.nid_external=Number(item.nid_external);
    this.provext.nid_categoryhours=Number(item.nid_categoryhours);
    this.provext.costohora=Number(this.provext.costohora);
  }

  delete(item: ProvExt){
    this.provext = new ProvExt();
    this.provext=item;
    this.provext.sactive="D";
    this.save();
  }

  closeModal(){
    this.dialogRef.close(null);
  }
  
}
