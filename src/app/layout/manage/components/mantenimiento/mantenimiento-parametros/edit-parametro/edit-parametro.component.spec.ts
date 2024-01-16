import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditParametroComponent } from './edit-parametro.component';

describe('EditParametroComponent', () => {
  let component: EditParametroComponent;
  let fixture: ComponentFixture<EditParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
