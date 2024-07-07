import { NewgroundsWrapper } from "./ng/ng";
import { Config } from "./ng/ng";


export { NewgroundsWrapper as Newgrounds };
export type { Config };


export function validateSession(session: string, config: Config): Promise<string | undefined> {
  return NewgroundsWrapper.validateSession(session, config);
}

let ngWrapper: NewgroundsWrapper | undefined;

function getNg(config: Config): NewgroundsWrapper {
  if (!ngWrapper || ngWrapper.config.key !== config.key || ngWrapper.config.skey !== config.skey) {
    ngWrapper = new NewgroundsWrapper(config);
  }
  return ngWrapper;
}

export async function unlockMedal(name: string, config: Config): Promise<boolean> {
  return !!(await getNg(config).unlockMedal(name));
}

export async function postScore(score: number, boardname: string, config: Config): Promise<boolean> {
  return !!(await getNg(config).postScore(score, boardname));
}
