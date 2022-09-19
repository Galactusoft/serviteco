import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'inicio' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule) }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Admin routes
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            { path: 'gestion-usuarios', loadChildren: () => import('app/modules/admin/gestion-usuarios/gestion-usuarios.module').then(m => m.GestionUsuariosModule) },
            { path: 'inicio', loadChildren: () => import('app/modules/admin/administrador/project.module').then(m => m.ProjectModule) },
            { path: 'gestion-categorias', loadChildren: () => import('app/modules/admin/gestion-tipoProductos/gestion-tipoProductos.module').then(m => m.GestionTipoProductosModule) },
            { path: 'gestion-marcas', loadChildren: () => import('app/modules/admin/gestion-marcas/gestion-marcas.module').then(m => m.GestionMarcasModule) },
            { path: 'gestion-importadores', loadChildren: () => import('app/modules/admin/gestion-importadores/gestion-importadores.module').then(m => m.GestionImportadoresModule) },
            { path: 'gestion-distribuidores', loadChildren: () => import('app/modules/admin/gestion-distribuidores/gestion-distribuidores.module').then(m => m.GestionDistribuidoresModule) },
            { path: 'gestion-repuestos', loadChildren: () => import('app/modules/admin/gestion-repuestos/gestion-repuestos.module').then(m => m.GestionRepuestosModule) },
            { path: 'gestion-mano-obra', loadChildren: () => import('app/modules/admin/gestion-mano-obra/gestion-mano-obra.module').then(m => m.GestionManoObraModule) },
            { path: 'gestion-solicitudes', loadChildren: () => import('app/modules/admin/gestion-solicitudes/gestion-solicitudes.module').then(m => m.GestionSolicitudesModule) },
            { path: 'gestion-funcionarios', loadChildren: () => import('app/modules/admin/gestion-funcionarios/gestion-funcionarios.module').then(m => m.GestionFuncionariosModule) },
            { path: 'gestion-referencias', loadChildren: () => import('app/modules/admin/gestion-referencias/gestion-referencias.module').then(m => m.GestionReferenciasModule) },
            { path: 'gestion-productos', loadChildren: () => import('app/modules/admin/gestion-productos/gestion-productos.module').then(m => m.GestionProductosModule) },
            { path: 'carga-masiva', loadChildren: () => import('app/modules/admin/gestion-carga-masiva/gestion-carga-masiva.module').then(m => m.GestionCargaMasivaModule) },
            { path: 'detalle-producto', loadChildren: () => import('app/modules/admin/gestion-detalle-producto/gestion-detalle-producto.module').then(m => m.GestionDetalleProductoModule) },
            { path: 'gestion-pqrs', loadChildren: () => import('app/modules/admin/gestion-pqrs/gestion-pqrs.module').then(m => m.GestionPqrsModule) },
            { path: 'gestion-contactenos', loadChildren: () => import('app/modules/admin/gestion-contactenos/gestion-contactenos.module').then(m => m.GestionContactenosModule) },
            { path: 'gestion-talleres', loadChildren: () => import('app/modules/admin/gestion-talleres/gestion-talleres.module').then(m => m.GestionTalleresModule) },
            { path: 'registro-productos', loadChildren: () => import('app/modules/admin/gestion-productos/gestion-registro-producto.module').then(m => m.GestionRegistroProductosModule) },
            { path: 'gestion-usuario-final', loadChildren: () => import('app/modules/admin/gestion-usuario-final/gestion-usuario-final.module').then(m => m.GestionUsuarioFinalModule) },
            { path: 'gestion-reportes', loadChildren: () => import('app/modules/admin/gestion-reportes/gestion-reportes.module').then(m => m.GestionReportesModule) },
        ]
    },

    // No Auth
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'evaluar-solicitud', loadChildren: () => import('app/modules/auth/evaluar-solicitud/evaluar-solicitud.module').then(m => m.EvaluarSolicitudModule) }
        ]
    },
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'info-producto', loadChildren: () => import('app/modules/admin/gestion-detalle-producto/gestion-detalle-producto.module').then(m => m.GestionDetalleProductoModule) }
        ]
    },
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'registro-pqrs', loadChildren: () => import('app/modules/admin/gestion-pqrs/gestion-registro-pqrs.module').then(m => m.GestionRegistroPqrsModule) }
        ]
    },
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'registro-contactenos', loadChildren: () => import('app/modules/admin/gestion-contactenos/gestion-registro-contactenos.module').then(m => m.GestionRegistroContactenosModule) }
        ]
    },
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'politica-garantia', loadChildren: () => import('app/modules/admin/gestion-politica-garantia/gestion-politica-garantia.module').then(m => m.GestionPoliticaGarantiaModule) }
        ]
    },

    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'historial-solicitud', loadChildren: () => import('app/modules/auth/evaluar-solicitud/evaluar-solicitud.module').then(m => m.EvaluarSolicitudModule) }
        ]
    },

    // Error
    {
        path: 'error', children: [
            { path: '404', loadChildren: () => import('app/modules/auth/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '500', loadChildren: () => import('app/modules/auth/error/error-500/error-500.module').then(m => m.Error500Module) }
        ]
    },

];
