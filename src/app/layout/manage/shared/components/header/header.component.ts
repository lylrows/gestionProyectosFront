    import { Component, OnInit } from '@angular/core';
    import { Router } from '@angular/router';
    import { User } from 'src/app/layout/manage/model/user/user';
    import { environment } from 'src/environments/environment';
    import { LoginService } from '../../../services/login/login.service';
     
    @Component({
      selector: 'app-header',
      templateUrl: './header.component.html',
      styleUrls: ['./header.component.css']
    })
     
    export class HeaderComponent implements OnInit {
      user: User;
      constructor(
        private router: Router,
        private login: LoginService
        ) { }
     
      ngOnInit() {
         if (sessionStorage.getItem('Guard') !== null) {
            this.user = JSON.parse(sessionStorage.getItem('User'));
         }
      }
     
      targetMenu() {
        const element = document.getElementsByTagName('body')[0];
        const validation = element.className.includes('menu-hide');
        if (validation) {
          element.classList.remove('menu-hide');
          element.classList.remove('vertical-overlay-menu');
          element.classList.add('menu-collapsed');
          element.classList.add('vertical-menu-modern');
        } else{
          element.classList.remove('menu-collapsed');
          element.classList.remove('vertical-menu-modern');
          element.classList.add('menu-hide');
          element.classList.add('vertical-overlay-menu');
        }
      }

      targetProfile(){
        const element2 = document.getElementById('navbar-mobile');
        const validation = element2.className.includes('show');
        if (validation) {
          element2.classList.remove('show');
        }
        else {
          element2.classList.add('show');
        }
      }
     
      logOutApplication() {
        if (sessionStorage.getItem('Guard') !== null) {

          const objSessionUser = JSON.parse(sessionStorage.getItem('User'));

          sessionStorage.removeItem('Guard');

          sessionStorage.removeItem('User');

          sessionStorage.removeItem('Menu');

          window.location.href = environment.localUrl;

        }

        
        // if (sessionStorage.getItem('Guard') !== null) {
        //   const objSessionUser = JSON.parse(sessionStorage.getItem('User'));
        //   console.log("nidduser",objSessionUser.niduser);
        //   this.login.logOut(objSessionUser.niduser)
        //   .subscribe(
        //     result => {
        //       console.log(result);
        //     },
        //     error => {
        //       console.log(error);
        //     },
        //     () => {
        //       sessionStorage.removeItem('Guard');
        //       sessionStorage.removeItem('User');
        //       sessionStorage.removeItem('Menu');
        //       window.location.href = environment.localUrl;
        //     }
        //   );
        // }
      }
     
    }

