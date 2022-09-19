import { Route } from '@angular/router';
import { GestionDetalleProductoComponent } from './gestion-detalle-producto.component';
import { GestionDetalleproductosProductoResolver } from './gestion-detalle-producto.resolvers';

export const gestionDetalleProductoRoutes: Route[] = [
    {
        path     : '',
        component: GestionDetalleProductoComponent
    },
    {
        path     : ':id',
        component: GestionDetalleProductoComponent,
        resolve: {
            productos: GestionDetalleproductosProductoResolver,
        }
    }
];
