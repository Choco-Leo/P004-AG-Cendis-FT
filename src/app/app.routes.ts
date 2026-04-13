import { Routes } from '@angular/router';
//LAYOUTS
import { PublicLayout } from './layouts/public-layout/public-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

//AUTH
import { Login } from './auth/login/login';
import { loginGuard } from './services/login-guard';
import { authGuard } from './services/auth-guard';
import { adminGuard } from './services/admin-guard';

//PAGES
import { Dashbord } from './pages/dashbord/dashbord';
import { Catalogo } from './pages/catalogo/catalogo';
    import { Cendis } from './pages/catalogo/cendis/cendis';
    import { Edades } from './pages/catalogo/edades/edades';
    import { Horarios } from './pages/catalogo/horarios/horarios';
    import { Presentaciones } from './pages/catalogo/presentaciones/presentaciones';
    import { Unidades } from './pages/catalogo/unidades/unidades'; 
import { Pedidos } from './pages/pedidos/pedidos';
    import { Solicitud } from './pages/pedidos/solicitud/solicitud';
import { Calendario } from './pages/calendario/calendario';
import { Impresiones } from './pages/impresiones/impresiones';
import { Admin } from './pages/admin/admin';
    import { Accesos } from './pages/admin/accesos/accesos';
    import { Cargo } from './pages/admin/cargo/cargo';
    import { User } from './pages/admin/user/user';
    import { Movinsumos } from './pages/admin/movinsumos/movinsumos';
import { Cocina } from './pages/cocina/cocina';
    import { Catinsumos } from './pages/cocina/catinsumos/catinsumos';
    import { Alminsumos } from './pages/cocina/alminsumos/alminsumos';
    import { Menus } from './pages/cocina/menus/menus';
    import { Recetas } from './pages/cocina/recetas/recetas';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: Login,
                canActivate: [loginGuard]
            }
        ]
    },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        children: [
            {
                path: 'Dashbord',
                component: Dashbord
            },
            {
                path: 'Admin',
                component: Admin,
                canActivate: [adminGuard],
                canActivateChild:[authGuard],
                children: [
                    {
                        path:'User',
                        component: User
                    },
                    {
                        path:'Accesos',
                        component:Accesos
                    },
                    {
                        path:'Cargos',
                        component:Cargo
                    },
                    {
                        path:'MovInsumos',
                        component:Movinsumos
                    }
                ]
            },
            {
                path: 'Catalogo',
                component: Catalogo,
                canActivate: [adminGuard],
                canActivateChild:[authGuard],
                children: [
                    {
                        path:'Cendis',
                        component: Cendis
                    },
                    {
                        path:'Edades',
                        component:Edades
                    },
                    {
                        path:'Horarios',
                        component:Horarios
                    },
                    {
                        path:'Presentaciones',
                        component:Presentaciones
                    },
                    {
                        path:'Unidades',
                        component:Unidades
                    }
                ]
            },
            {
                path: 'Cocina',
                component: Cocina,
                canActivateChild:[authGuard],
                children: [
                    {
                        path:'CatInsumos',
                        component: Catinsumos,
                        canActivate: [adminGuard]
                    },
                    {
                        path:'AlmInsumos',
                        component: Alminsumos
                    },
                    {
                        path:'Recetas',
                        component:Recetas
                    },
                    {
                        path:'Menus',
                        component:Menus
                    }
                ]
            },
            {
                path: 'Pedidos',
                component: Pedidos,
                canActivateChild:[authGuard],
                children: [
                    {
                        path:'',
                        component: Solicitud
                    }
                ]
            },
            {
                path: 'Calendario',
                component: Calendario,
                canActivate: [adminGuard],
                canActivateChild:[authGuard],
                children: [
                    
                ]
            },
            {
                path: 'Impresiones',
                component: Impresiones,
                canActivateChild:[authGuard],
                children: [
                    
                ]
            },
        ],
    }
];
