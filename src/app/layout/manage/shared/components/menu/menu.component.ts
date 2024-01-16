import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'src/app/layout/manage/model/menu/menu';
import { MenuFiltro } from 'src/app/layout/manage/model/menu/menu-filtro';
import { environment } from 'src/environments/environment.prod';
import { UtilityService } from '../../services/utility/utility.service';
import { CommomService } from '../../services/commom/commom.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit {
  public MenuGuard: boolean;
  menu: Menu[];
  menulocal: any[];
  HoverOpen: string;
  sactive: string;

  constructor(private router: Router, private utilityService: UtilityService, private commomService: CommomService) {} 

  ngOnInit() {
    this.MenuGuard = sessionStorage.getItem('Guard') !== null ? true : false;
    if (this.MenuGuard === true) {
      this.menu = JSON.parse(sessionStorage.getItem('Menu'));
    }
    this.sactive = '';
    
    this.setImages();
  }

  inicio(){
    this.router.navigate(['/manage/inicio']);
  }

  setImages() {
    if (this.menu != null) {
      this.menu.map( function (dato) {
        // if (dato.SHTML !== null) {
        //   if (dato.SHTML.split('|').length > 1) {
        //     dato.STHML1 = 'M9.64,8.17A8.36,8.36,0,0,0,7.86,9.79a.69.69,0,0,1-.6.27H3.67a.68.68,0,0,0-.72.46.71.71,0,0,0,.17.86,1.44,1.44,0,0,0,.72.24c.84,0,1.69,0,2.53,0h.3c-.14.58-.27,1.16-.43,1.72,0,.06-.17.11-.26.11H3.69a.77.77,0,0,0-.78.64c-.05.53.14.84.64.88.67,0,1.35,0,2,0h.66a7.33,7.33,0,0,0,1,3.11l-.27,0H1.61A1.78,1.78,0,0,1,0,16.62V16.3C0,11.49,0,6.67,0,1.85A1.89,1.89,0,0,1,1.87,0H12.59a1.87,1.87,0,0,1,1.88,1.85c0,1.72,0,3.45,0,5.17,0,.25-.11.31-.32.27a6.36,6.36,0,0,0-2.42.11.22.22,0,0,1-.2-.1c-.25-.63-.35-.7-1-.7H3.86a1.44,1.44,0,0,0-.62.14.77.77,0,0,0-.32.92.83.83,0,0,0,.72.51h6Zm-2.39-5H3.76a.76.76,0,0,0-.82.7c0,.54.28.84.9.84h6.78a1.57,1.57,0,0,0,.37,0,.7.7,0,0,0,.54-.61.78.78,0,0,0-.82-.88Z';
        //     dato.STHML2 = "M17.32,10.3a34,34,0,0,0-4.57,4.81C12,14.54,11.23,14,10.48,13.4c-.17-.13-.29-.15-.45,0s-.33.32-.5.48a.25.25,0,0,0,0,.42l3.12,3.15c.25.25.28.24.45-.08a37,37,0,0,1,3-4.64c.52-.69,1.07-1.36,1.61-2a5.59,5.59,0,0,1-.33,7.69,5.56,5.56,0,0,1-8.11-.09,5.68,5.68,0,0,1,8.06-8Z";
        //     console.log(dato.STHML1);
        //     console.log(dato.STHML2);
        //   }
        // }
      });
    }
  }

  setMenuActive(nidresource: number, nidfather: number) {
    const nidprofile: number = this.utilityService.getProfileId();
    const params: MenuFiltro = new MenuFiltro(nidresource, nidfather, nidprofile);

    this.menulocal = JSON.parse(sessionStorage.getItem('Menu'));
    this.menulocal.map( function (dato) {

      if (nidresource === 0 && nidfather === 0) {
        this.sactive = 'open';
      }

      if (dato.nidresource === nidresource && nidfather === 0) {
        dato.sactive = 'open';
      } else {
        if (dato.nidresource !== nidresource && nidfather === 0) {
          dato.sactive = '';
        }
      }

      if (dato.nidresource === nidfather && nidfather !== 0) {
        dato.items.map( function (item) {
          if (item.nidresource === nidresource) {
            item.sactive = 'open';
          } else {
            if (item.nidresource !== nidresource) {
              item.sactive = '';
            }
          }
        });
      } else {
        if (dato.nidresource !== nidfather && nidfather !== 0) {
          dato.items.map( function (item) {
            item.sactive = '';
          });
        }
      }

    });
    this.menu = this.menulocal;
    sessionStorage.setItem('Menu', JSON.stringify(this.menulocal));
  }
}
