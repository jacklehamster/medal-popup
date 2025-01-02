import { NewgroundsWrapper } from "./ng/ng";
import { Config } from "./ng/ng";


export { NewgroundsWrapper as Newgrounds };
export type { Config };


export function validateSession(session: string, config: Config): Promise<string | undefined> {
  return NewgroundsWrapper.validateSession(session, config);
}

export function saveData(data: any, session: string, config: Config): Promise<any | undefined> {
  return NewgroundsWrapper.saveData(data, session, config);
}

export { TESTCONFIG } from "./ng/ng";
