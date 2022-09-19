import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { ProjectComponent } from 'app/modules/admin/administrador/project.component';
import { ProjectResolver } from 'app/modules/admin/administrador/project.resolvers';

export const projectRoutes: Route[] = [
    {
        path     : '',
        component: ProjectComponent,
        canActivate: [AuthGuard],
        resolve  : {
            data: ProjectResolver
        }
    }
];
