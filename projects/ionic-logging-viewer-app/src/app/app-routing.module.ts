import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
	{ path: "", redirectTo: "home", pathMatch: "full" },
	{ path: "home", loadChildren: () => import("./home/home.module").then(m => m.HomePageModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	declarations: [],
	exports: [RouterModule]
})
export class AppRoutingModule { }
