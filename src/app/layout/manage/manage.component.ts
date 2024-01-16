import { Component, OnInit, isDevMode  } from '@angular/core';


@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  MenuGuard: string;
  title = 'manage';

  ngOnInit() {
  }
}
