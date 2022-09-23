import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi {
    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService, private _aut: AuthService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {

                // Fill compact navigation children using the default navigation
                this._compactNavigation.forEach((compactNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === compactNavItem.id) {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === futuristicNavItem.id) {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if (defaultNavItem.id === horizontalNavItem.id) {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                let menuPrincipal: FuseNavigationItem[] = [];

                let inicio: FuseNavigationItem = {
                    id: 'inicio',
                    title: 'Inicio',
                    type: 'basic',
                    icon: 'heroicons_outline:home',
                    link: '/inicio'
                };

                let usuarios: FuseNavigationItem = {
                    id: 'usuarios',
                    title: 'Usuarios',
                    type: 'basic',
                    icon: 'heroicons_outline:users',
                    link: '/gestion-usuarios'
                };

                let usuarioFinal: FuseNavigationItem = {
                    id: 'usuariosFinales',
                    title: 'Usuarios finales',
                    type: 'basic',
                    icon: 'heroicons_outline:user-group',
                    link: '/gestion-usuario-final'
                };

                let importadores: FuseNavigationItem = {
                    id: 'importadores',
                    title: 'Importadores',
                    type: 'basic',
                    icon: 'heroicons_outline:globe',
                    link: '/gestion-importadores'
                };

                let distribuidores: FuseNavigationItem = {
                    id: 'distribuidores',
                    title: 'Distribuidores',
                    type: 'basic',
                    icon: 'heroicons_outline:home',
                    link: '/gestion-distribuidores'
                };

                let talleres: FuseNavigationItem = {
                    id: 'talleres',
                    title: 'Talleres Autorizados',
                    type: 'basic',
                    icon: 'feather:tool',
                    link: '/gestion-talleres'
                };

                let referencias: FuseNavigationItem = {
                    id: 'referencias',
                    title: 'Referencias',
                    type: 'basic',
                    icon: 'heroicons_outline:cube-transparent',
                    link: '/gestion-referencias'
                };

                let productos: FuseNavigationItem = {
                    id: 'productos',
                    title: 'Productos',
                    type: 'basic',
                    icon: 'heroicons_outline:cube',
                    link: '/gestion-productos'
                };

                let marcas: FuseNavigationItem = {
                    id: 'marcas',
                    title: 'Marcas',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-list',
                    link: '/gestion-marcas'
                };

                let repuestos: FuseNavigationItem = {
                    id: 'repuestos',
                    title: 'Repuestos',
                    type: 'basic',
                    icon: 'heroicons_outline:archive',
                    link: '/gestion-repuestos'
                };

                let mano_obra: FuseNavigationItem = {
                    id: 'mano_obra',
                    title: 'Mano de obra',
                    type: 'basic',
                    icon: 'heroicons_outline:hand',
                    link: '/gestion-mano-obra'
                };

                let tipo_producto: FuseNavigationItem = {
                    id: 'tipo_producto',
                    title: 'Categorías',
                    type: 'basic',
                    icon: 'heroicons_outline:cog',
                    link: '/gestion-categorias'
                };

                let pqrs: FuseNavigationItem = {
                    id: 'pqrs',
                    title: 'Pqrs',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-pqrs'
                };

                let contactenos: FuseNavigationItem = {
                    id: 'contactenos',
                    title: 'Contáctenos',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-contactenos'
                };

                let reporte_cuentas_cobrar_importador: FuseNavigationItem = {
                    id: 'reporte_cuentas_cobrar_importador',
                    title: 'Cuentas por cobrar por importador',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/cuentas-cobrar-importador'
                };

                let reporte_productos: FuseNavigationItem = {
                    id: 'reporte_productos',
                    title: 'Productos creados',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/productos-creados'
                };

                let reporte_distribuidores_talleres: FuseNavigationItem = {
                    id: 'reporte_distribuidores_talleres',
                    title: 'Distribuidores y talleres activos',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/distribuidores-talleres-activos'
                };

                let reporte_referencias_activas: FuseNavigationItem = {
                    id: 'reporte_referencias_activas',
                    title: 'Referencias Activas',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/referencias-activas'
                };

                let reporte_usuarios_activos: FuseNavigationItem = {
                    id: 'reporte_referencias_activas',
                    title: 'Usuarios Activas',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/usuarios-activos'
                };

                let reporte_productos_activos: FuseNavigationItem = {
                    id: 'reporte_productos_activos',
                    title: 'Productos Activos',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/gestion-reportes/importadores/productos-activos'
                };

                let ayuda_serviteco: FuseNavigationItem = {
                    id: 'ayuda-serviteco',
                    title: 'Ayuda SERVITECO',
                    type: 'basic',
                    icon: 'heroicons_outline:collection',
                    link: '/ayuda-serviteco'
                };

                let childrenGestion: FuseNavigationItem[] = [];

                childrenGestion.push(usuarios);
                childrenGestion.push(usuarioFinal);
                childrenGestion.push(importadores);
                childrenGestion.push(distribuidores);
                childrenGestion.push(talleres);
                childrenGestion.push(marcas);
                childrenGestion.push(tipo_producto);
                childrenGestion.push(referencias);
                childrenGestion.push(repuestos);
                childrenGestion.push(mano_obra);

                let gestion: FuseNavigationItem = {
                    id: 'gestion',
                    title: 'Administración',
                    subtitle: 'Gestión general SERVITECO',
                    type: 'group',
                    icon: 'heroicons_outline:home',
                    children: childrenGestion
                };

                let childrenProductos: FuseNavigationItem[] = [];

                childrenProductos.push(productos);

                let admin_productos: FuseNavigationItem = {
                    id: 'admin_productos',
                    title: 'Gestión de productos',
                    subtitle: 'Gestión de los seriales',
                    type: 'group',
                    icon: 'heroicons_outline:home',
                    children: childrenProductos
                };

                let childrenPqrs: FuseNavigationItem[] = [];

                childrenPqrs.push(pqrs);

                let admin_pqrs: FuseNavigationItem = {
                    id: 'admin_ppqrs',
                    title: 'Gestión de PQRS',
                    subtitle: 'Gestión de los PQRS',
                    type: 'group',
                    icon: 'heroicons_outline:collection',
                    children: childrenPqrs
                };

                let childrenContactenos: FuseNavigationItem[] = [];

                childrenContactenos.push(contactenos);

                let admin_contactenos: FuseNavigationItem = {
                    id: 'admin_contactenos',
                    title: 'Gestión de Contáctenos',
                    subtitle: 'Gestión de los mensajes registrados',
                    type: 'group',
                    icon: 'heroicons_outline:collection',
                    children: childrenContactenos
                };

                let childrenReportes: FuseNavigationItem[] = [];

                childrenReportes.push(reporte_cuentas_cobrar_importador);
                childrenReportes.push(reporte_productos);
                childrenReportes.push(reporte_distribuidores_talleres);
                childrenReportes.push(reporte_referencias_activas);
                childrenReportes.push(reporte_productos_activos);
                childrenReportes.push(reporte_usuarios_activos);

                let admin_reportes: FuseNavigationItem = {
                    id: 'admin_reportes',
                    title: 'Gestión de Reportes',
                    subtitle: 'Gestión de los reportes generados',
                    type: 'group',
                    icon: 'heroicons_outline:collection',
                    children: childrenReportes
                };

                let childrenMesaAyuda: FuseNavigationItem[] = [];

                childrenMesaAyuda.push(ayuda_serviteco);

                let admin_ayuda_serviteco: FuseNavigationItem = {
                    id: 'admin_ayuda_serviteco',
                    title: 'Mesa de Ayuda',
                    subtitle: 'Gestión mesa de ayuda SERVITECO',
                    type: 'group',
                    icon: 'heroicons_outline:collection',
                    children: childrenMesaAyuda
                };

                let bandeja_solicitudes: FuseNavigationItem = {
                    id: 'bandeja_solicitudes',
                    title: 'Bandeja de solicitudes',
                    type: 'basic',
                    icon: 'feather:tool',
                    link: '/gestion-solicitudes'
                };

                let childrenSolicitudes: FuseNavigationItem[] = [];

                childrenSolicitudes.push(bandeja_solicitudes);

                let solicitudes: FuseNavigationItem = {
                    id: 'solicitudes',
                    title: 'Recepción de solicitudes',
                    subtitle: 'Gestión de las solicitudes',
                    type: 'group',
                    icon: 'heroicons_outline:home',
                    children: childrenSolicitudes
                };

                menuPrincipal.push(inicio);

                if (this._aut.accessAdmin == 'administrador') {
                    menuPrincipal.push(gestion);
                    menuPrincipal.push(admin_productos);
                    menuPrincipal.push(solicitudes);
                    menuPrincipal.push(admin_pqrs);
                    menuPrincipal.push(admin_contactenos);
                    menuPrincipal.push(admin_reportes);
                    menuPrincipal.push(admin_ayuda_serviteco);
                } else {
                    if (this._aut.accessAdmin == 'funcionario' || this._aut.accessAdmin == 'taller autorizado') {
                        menuPrincipal.push(solicitudes);
                    } else if (this._aut.accessAdmin == 'distribuidor') {
                        menuPrincipal.push(solicitudes);
                        menuPrincipal.push(admin_reportes);
                    } else {
                        menuPrincipal.push(admin_productos);
                        menuPrincipal.push(solicitudes);
                    }
                }

                // Return the response
                return [
                    200,
                    {
                        compact: cloneDeep(menuPrincipal),
                        default: cloneDeep(menuPrincipal),
                        futuristic: cloneDeep(menuPrincipal),
                        horizontal: cloneDeep(menuPrincipal)
                    }
                ];
            });
    }
}
