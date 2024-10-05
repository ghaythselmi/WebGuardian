import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user/user-list/user-list.component';
import { TemplateComponent } from './template/template.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component'; 
import { MonitoringComponent } from './monitoring/monitoring.component';
import { FrontClientComponent } from './frontTemplate/front-client/front-client.component';
import { HomeComponent } from './frontTemplate/home/home.component';

const routes: Routes = [

  { path: 'users', component: UserListComponent },
  { path: 'home/', component: TemplateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignupComponent },
  { path: 'websites/:id', component: MonitoringComponent },
  { path: 'frontClient/:id', component: FrontClientComponent },
  { path: 'h', component: HomeComponent },

  { path: '', redirectTo: '/h', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
