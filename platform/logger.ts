export class Logger {
  private readonly _prefix: string;

  constructor(prefix: string) {
    this._prefix = prefix;
  }

  log(msg: string) {
    console.log(`${this._prefix}|${msg}`);
  }

  error(msg: string, ex: any) {
    console.error(`${this._prefix}|${msg}`, ex);
  }
}
