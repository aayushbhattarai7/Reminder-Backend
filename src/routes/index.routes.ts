import { Router } from "express";
import user from './user.routes'
export interface Route{
    path: string;
    route:Router
}
const router = Router()
const routes: Route[] = [
    {
        path: '/user',
        route: user
    }
]
routes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router