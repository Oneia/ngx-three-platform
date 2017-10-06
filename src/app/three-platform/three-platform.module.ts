import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThreeMainComponent } from './three-main/three-main.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ThreeMainComponent,
  ],
  exports: [
    ThreeMainComponent,
  ]
})
export class ThreePlatformModule { }
