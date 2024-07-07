import { NewgroundsWrapper } from "./ng/ng";
import { Config } from "./ng/ng";


export { NewgroundsWrapper as Newgrounds };
export type { Config };


export function validateSession(session: string, config: Config): Promise<string | undefined> {
  return NewgroundsWrapper.validateSession(session, config);
}

let ngWrapper: NewgroundsWrapper | undefined;

async function getNg(config: Config): Promise<NewgroundsWrapper> {
  if (!ngWrapper || ngWrapper.config.key !== config.key || ngWrapper.config.skey !== config.skey) {
    ngWrapper = new NewgroundsWrapper(config);
  }
  if (!ngWrapper.loggedIn) {
    await new Promise((resolve) => {
      ngWrapper?.addLoginListener(() => resolve(undefined));
    });
  }
  return ngWrapper;
}

export async function unlockMedal(name: string, config: Config): Promise<boolean> {
  return !!(await (await getNg(config)).unlockMedal(name));
}

export async function postScore(score: number, boardname: string, config: Config): Promise<boolean> {
  return !!(await (await getNg(config)).postScore(score, boardname));
}
