import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteControlCambiosComponent } from './reporte-control-cambios.component';

describe('ReporteControlCambiosComponent', () => {
  let component: ReporteControlCambiosComponent;
  let fixture: ComponentFixture<ReporteControlCambiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteControlCambiosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteControlCambiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
