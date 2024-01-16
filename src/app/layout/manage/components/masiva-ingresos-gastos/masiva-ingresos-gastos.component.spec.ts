import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasivaIngresosGastosComponent } from './masiva-ingresos-gastos.component';

describe('MasivaIngresosGastosComponent', () => {
  let component: MasivaIngresosGastosComponent;
  let fixture: ComponentFixture<MasivaIngresosGastosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasivaIngresosGastosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasivaIngresosGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
