import { HttpClient } from 'typed-rest-client/HttpClient';
import { parseString } from 'xml2js';
import { parse } from 'node-html-parser';
import { busesMapper, Bus } from './bus.model';

export class EMTService {

  private httpc = new HttpClient('node-api-user-agent');

  async getNextBusTime(stopBus: number, busId?: string) {
    let response = await this.httpc.get(`http://www.emtvalencia.es/EMT/mapfunctions/MapUtilsPetitions.php?sec=getSAE&idioma=es&parada=${stopBus}&linea=${busId || ''}&adaptados=false`);
    return await this.parseBusTimes(await response.readBody());
  }

  async getbalance(card_id: number) {
    let response = await this.httpc.post(`https://www.emtvalencia.es/ciudadano/modules/mod_saldo/busca_saldo.php`, `numero=${card_id}&idioma=es`, { 'Content-Type': 'application/x-www-form-urlencoded' });
    return await this.parseBalance(await response.readBody());
  }

  // ----------------------------------
  private parseBusTimes(body: any) {
    return new Promise<Bus[]>((resolve) => {
      parseString(body, { trim: true, explicitArray: false }, (err: any, result: any) => {
        resolve(busesMapper(result));
      });
    });
  }

  private parseBalance(body: any) {
    return new Promise<Number>((resolve, reject) => {
      let html = parse(body + '</span>').querySelector('strong');
      if (html) resolve(+html.text.substring(0, 2));
      else reject();
    });
  }

}