import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorProyectosComponent } from './indicador-proyectos.component';

describe('IndicadorProyectosComponent', () => {
  let component: IndicadorProyectosComponent;
  let fixture: ComponentFixture<IndicadorProyectosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorProyectosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
