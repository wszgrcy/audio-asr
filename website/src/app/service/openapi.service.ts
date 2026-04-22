import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { paths } from '../openapi/type.d.ts';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenApiService {
  #http = inject(HttpClient);

  ping() {
    return this.#http.get<
      paths['/open/ping']['get']['responses']['200']['content']
    >(`${environment.prefix}/open/ping`);
  }

  testDemo() {
    return this.#http.get<
      paths['/open/test/demo']['get']['responses']['200']['content']
    >(`${environment.prefix}/open/test/demo`);
  }

  convertUrlDoc(
    body: paths['/open/docVector/convertUrlDoc']['post']['requestBody']['content']['application/json'],
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
    },
  ) {
    return this.#http.post<
      paths['/open/docVector/convertUrlDoc']['post']['responses']['200']['content']
    >(`${environment.prefix}/open/docVector/convertUrlDoc`, body, options);
  }
}
