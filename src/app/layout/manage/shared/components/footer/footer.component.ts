import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  footerGuard: boolean;
  versionApp: string = environment.versionApp;
  constructor() {}

  ngOnInit() {
    if (sessionStorage.getItem('Guard') !== null) {
      this.footerGuard = true;
    }
  }
}
