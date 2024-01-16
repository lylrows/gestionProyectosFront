import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanceProyectoModalComponent } from './avance-proyecto-modal.component';

describe('AvanceProyectoModalComponent', () => {
  let component: AvanceProyectoModalComponent;
  let fixture: ComponentFixture<AvanceProyectoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvanceProyectoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvanceProyectoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
