import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-maintance',
  templateUrl: './maintance.component.html',
  styleUrls: ['./maintance.component.css']
})
export class MaintanceComponent implements OnInit {

  constructor(
    private router: Router
  ) {
   }

  ngOnInit() {
  }

  goHome() {
    this.router.navigate(['/client']);
  }
}
