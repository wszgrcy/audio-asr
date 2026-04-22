import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';
function getRoutePath(currentRoute: ActivatedRouteSnapshot) {
  const paths: string[] = [];
  let route: ActivatedRouteSnapshot | null = currentRoute;
  while (route) {
    const config = route.routeConfig;
    if (config?.path !== undefined) {
      paths.push(config.path);
    }
    route = route.parent;
  }
  return paths.join('|');
}

export class RouteStrategy implements RouteReuseStrategy {
  private routeTree = new Map<string, DetachedRouteHandle>();

  shouldDetach(snapshot: ActivatedRouteSnapshot): boolean {
    return true;
  }

  shouldAttach(snapshot: ActivatedRouteSnapshot): boolean {
    const url = getRoutePath(snapshot);
    return this.routeTree.has(url);
  }

  store(snapshot: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const url = getRoutePath(snapshot);
    this.routeTree.set(url, handle);
    return;
  }

  retrieve(snapshot: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const url = getRoutePath(snapshot);
    return this.routeTree.get(url) || null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
