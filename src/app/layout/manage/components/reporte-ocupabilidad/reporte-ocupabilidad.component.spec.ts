import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteOcupabilidadComponent } from './reporte-ocupabilidad.component';

describe('ReporteOcupabilidadComponent', () => {
  let component: ReporteOcupabilidadComponent;
  let fixture: ComponentFixture<ReporteOcupabilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteOcupabilidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteOcupabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
