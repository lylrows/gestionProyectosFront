import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorRentabilidadComponent } from './indicador-rentabilidad.component';

describe('IndicadorRentabilidadComponent', () => {
  let component: IndicadorRentabilidadComponent;
  let fixture: ComponentFixture<IndicadorRentabilidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorRentabilidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorRentabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
