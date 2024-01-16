import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimacionProyectosComponent } from './estimacion-proyectos.component';

describe('EstimacionProyectosComponent', () => {
  let component: EstimacionProyectosComponent;
  let fixture: ComponentFixture<EstimacionProyectosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimacionProyectosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimacionProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
