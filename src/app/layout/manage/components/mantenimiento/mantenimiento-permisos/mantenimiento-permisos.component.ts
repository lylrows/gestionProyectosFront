import { Component, OnInit } from '@angular/core';
import { MasterTable } from '../../../model/common/mastertable';
import { Permiso } from '../../../model/common/permiso';
import { Menu } from '../../../model/menu/menu';
import { MastertableService } from '../../../services/common/mastertable.service';
import { PermisoService } from '../../../services/common/permiso.service';
import { CommomService } from '../../../shared/services/commom/commom.service';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-mantenimiento-permisos',
  templateUrl: './mantenimiento-permisos.component.html',
  styleUrls: ['./mantenimiento-permisos.component.css']
})
export class MantenimientoPermisosComponent implements OnInit {

  Title = "Mantenimiento de Permisos"
  BreadLevel01 = "Mantenimiento"
  perfilSeleccionado = 0;
  perfilAcopiar = 0;
  vistaSeleccionada = 0;
  listProfileAdministrador: MasterTable[] = [];
  listProfileRrhh: MasterTable[] = [];
  listProfileOperativo: MasterTable[] = [];
  listProfileComercial: MasterTable[] = [];
  listProfileCoreSeguros: MasterTable[] = [];
  listProfileDesarrollo: MasterTable[] = [];
  listPermiso: Permiso[] = [];
  listMenu: Menu[] = [];
  listEditar: boolean[] = [];
  user: any;

  lista: MasterTable[] = [];

  constructor(
    private mastertableService: MastertableService,
    private permisoService: PermisoService,
    private commonService: CommomService
  ) { }

  ngOnInit() {
    this.getMenu();
    this.getProfiles();
    this.getjobscat();
  }

  // Se supone que a esta vista entra el admin, y el admin carga todo el menu en su session storage
  getMenu() {
    this.commonService.getMenu().subscribe((response: any) => {
      let menu = response;
      //console.log(menu);
      
      menu.forEach(element => {
       element.items.forEach(submenu => {
         this.listMenu.push(submenu);
       });
      });

      //console.log(this.listMenu);
      
    }, (error) => {
      console.error(error);
    });


  }

  getPermiso() {
    console.log('Código perfil',this.perfilSeleccionado);

    this.permisoService.getpermission(this.perfilSeleccionado, this.vistaSeleccionada).subscribe((response: any) => {
      console.log(response);
      
      this.listPermiso = response;
      this.listEditar = [];
      for (let index = 0; index < this.listPermiso?.length; index++) {
        this.listEditar.push(false);
      }
    }, (error) => {
      console.error(error);
    });
  }

  getProfiles() {

    let categojobs = [];
    let jobs = [];
    
    //obtener todas las categorias
    var listacategorias = lastValueFrom(this.mastertableService.getmastertable(-1));
    
    Promise.all([listacategorias]).then((value:any) => {

      if (value[0] === null || value[0] === undefined) {
        Swal.fire('Error', "No hay datos", 'info');
        return;
      }

      //filtrar categorias de puestos mediante el campo typeaux = 1
      var categoriaspuestos: MasterTable[] = value[0].filter(x=>x.typeaux==1);

      if (categoriaspuestos === null || categoriaspuestos === undefined) {
        Swal.fire('Error', "No hay datos en categrias puestos", 'info');
        return;
      }

      //ordenar por nid_mastertable_type (1,2,3,4,5...)
      categoriaspuestos.sort(((a, b) => a.nid_mastertable_type - b.nid_mastertable_type));
      
      this.mastertableService.getmastertable(categoriaspuestos[0].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileAdministrador.push(element);
          });
        }
      })
  
      this.mastertableService.getmastertable(categoriaspuestos[1].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileOperativo.push(element);
          });
        }
      })
  
      this.mastertableService.getmastertable(categoriaspuestos[2].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileRrhh.push(element);
          });
        }
      })

      this.mastertableService.getmastertable(categoriaspuestos[3].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileComercial.push(element);
          });
        }
      })
  
      this.mastertableService.getmastertable(categoriaspuestos[4].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileCoreSeguros.push(element);
          });
        }
      })
  
      this.mastertableService.getmastertable(categoriaspuestos[5].nid_mastertable).subscribe((response: any) => {
        if(response != null) {
          response.forEach(element => {
            this.listProfileDesarrollo.push(element);
          });
        }
      })

    })

  }

  getjobscat(){
    let categorias;
    let categojobs = [];
    let jobs = [];

    this.mastertableService.getmastertable(-1).subscribe(response=>{
      if(response!=null){
        categorias=response.filter(x=>x.typeaux==1);

        categorias.forEach(value=>{
          categojobs.push(value)
          console.log(value);
        })

        console.log(categojobs);
        

      }
      
    })
  }

  changePerfil() {
    this.getPermiso();
  }

  changeVista() {
    this.getPermiso();
  }

  changePermision(i) {
    console.log("Prueba", i, this.listPermiso[i].permission);
  }
  
  editarPermiso(i) {
    // Primero valida que solo se este editando un permiso
    let cnt = 0;
    this.listEditar.forEach(item => {
      if(item) {
        cnt ++;
      }
    })
    if(cnt > 0) {
      Swal.fire('Error', 'Actualmente se esta editando otro permiso', 'info');
    } else {
      this.listEditar[i] = true;
    }
  }
  
  guardarPermiso(i) {
    this.permisoService.editpermission(this.listPermiso[i]).subscribe(result => {
      if(result == null) {
        Swal.fire('Error', 'No se pudo actualizar el permiso', 'info');
        this.listEditar[i] = false;
        return;
      }
      if(result.resultado == 1 ) {
        Swal.fire('Confirmado', 'Permiso actualizado correctamente', 'success');
        this.listEditar[i] = false;
      }
      console.log(result);
    })
    this.listEditar[i] = false;
  }

  generarPermisos(){
    this.user = JSON.parse(sessionStorage.getItem('User'));
    //console.log(this.user,this.user.niduser);
    
    this.permisoService.inspermission(this.perfilSeleccionado,this.user.niduser,this.perfilAcopiar).subscribe(res=>{
      console.log(res);
      this.changeVista();
      
    })
  }
}
