import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIndicadorProyectoComponent } from './modal-indicador-proyecto.component';

describe('ModalIndicadorProyectoComponent', () => {
  let component: ModalIndicadorProyectoComponent;
  let fixture: ComponentFixture<ModalIndicadorProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalIndicadorProyectoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalIndicadorProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
