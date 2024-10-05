import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { TemplateComponent } from './template/template.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component'; // Import FormsModule
import { ReactiveFormsModule } from '@angular/forms';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { FrontClientComponent } from './frontTemplate/front-client/front-client.component';
import { HomeComponent } from './frontTemplate/home/home.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    TemplateComponent,
    LoginComponent,
    SignupComponent,
    MonitoringComponent,
    FrontClientComponent,
    HomeComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
