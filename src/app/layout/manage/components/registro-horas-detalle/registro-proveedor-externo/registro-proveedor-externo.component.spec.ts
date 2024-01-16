import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroProveedorExternoComponent } from './registro-proveedor-externo.component';

describe('RegistroProveedorExternoComponent', () => {
  let component: RegistroProveedorExternoComponent;
  let fixture: ComponentFixture<RegistroProveedorExternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroProveedorExternoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroProveedorExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
