import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMargenContribucionPersonalComponent } from './reporte-margen-contribucion-personal.component';

describe('ReporteMargenContribucionPersonalComponent', () => {
  let component: ReporteMargenContribucionPersonalComponent;
  let fixture: ComponentFixture<ReporteMargenContribucionPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteMargenContribucionPersonalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteMargenContribucionPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
