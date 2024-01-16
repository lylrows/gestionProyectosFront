import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteProyectosComponent } from './reporte-proyectos.component';

describe('ReporteProyectosComponent', () => {
  let component: ReporteProyectosComponent;
  let fixture: ComponentFixture<ReporteProyectosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteProyectosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
