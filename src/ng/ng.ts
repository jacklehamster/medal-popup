// To recognize dom types (see https://bun.sh/docs/typescript#dom-types):
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { Newgrounds } from "../external/newgrounds/newgroundsio.min"

export interface Config {
  game: string;
  url: string;
  key: string;
  skey: string;
  debug?: boolean;
  audioIn?: string;
  audioOut?: string;
}

const testConfig = {
  "game": "Divine Techno Run",
  "url": "https://www.newgrounds.com/portal/view/628667",
  "key": "34685:cxZQ5a1E",
  "skey": "aBuRcFJLqDmPe3Gb0uultA==",
  "audio": "sounds/ng-sound.ogg",
  "audioOut": "sounds/ng-sound-out.ogg",
}

interface NGIO {
  user?: {
    name: string;
    icons: {
      small: string;
      medium: string;
      large: string;
    };
  };
  login_error?: {
    message: string;
  };
  callComponent(command: string,
    payload: {
      id?: string;
      value?: number;
    },
    callback: (result: {
      medal?: Medal;
      medals?: Medal[];
      success: boolean;
      scoreboards: Scoreboard[];
    }) => void): void;
  getValidSession(callback: () => void): void;
  requestLogin(onLoggedIn: () => void, onLoginFailed: () => void, onLoginCancelled: () => void): void;
}

interface Medal {
  name: string;
  unlocked: boolean;
  id: string;
  icon: string;
  description: string;
}

interface Scoreboard {
  name: string;
  id: string;
}

export class NewgroundsWrapper {
  #ngio: NGIO;
  #cacheUnlocked: Record<string, boolean> = {};
  #medals?: Medal[];
  #medalCallbacks?: ((medals: Medal[]) => void)[];
  #debug?: boolean;
  #scoreboards?: Scoreboard[];
  #scoreBoardsCallback?: ((scoreboards: Scoreboard[]) => void)[];
  #loginListeners = new Set<() => void>();
  #medalListeners = new Set<(medal: Medal) => void>();
  audio?: HTMLAudioElement;
  audioOut?: HTMLAudioElement;
  gameUrl: string;

  addLoginListener(listener: () => void) {
    this.#loginListeners.add(listener);
  }

  addUnlockListener(listener: (medal: Medal) => void) {
    this.#medalListeners.add(listener);
  }

  constructor(config: Config = testConfig) {
    this.#ngio = new Newgrounds.io.core(config.key, config.skey);
    this.#debug = config.debug;
    this.initSession();
    this.audio = testConfig.audio ? new Audio(testConfig.audio) : undefined;
    this.audioOut = testConfig.audioOut ? new Audio(testConfig.audioOut) : undefined;
    this.gameUrl = config.url;
  }

  get loggedIn() {
    return !!this.#ngio.user;
  }

  get icons() {
    return this.#ngio.user?.icons;
  }

  get user() {
    return this.#ngio.user?.name;
  }

  async getScoreboards(): Promise<Scoreboard[]> {
    return new Promise(resolve => {
      if (this.#scoreboards) {
        resolve?.(this.#scoreboards);
      } else if (this.#scoreBoardsCallback) {
        this.#scoreBoardsCallback.push(resolve);
      } else {
        this.#scoreBoardsCallback = [resolve];
        this.#ngio.callComponent("ScoreBoard.getBoards", {}, (result) => {
          if (result.success) {
            this.#scoreboards = result.scoreboards;
            this.#scoreboards.forEach((scoreboard) => console.log("Scoreboard:", scoreboard.name, scoreboard.id));
            this.#scoreBoardsCallback?.forEach((callback) => callback?.(this.#scoreboards ?? []));
            this.#scoreBoardsCallback = undefined;
          }
        });
      }
    });
  }

  async getMedals(): Promise<Medal[]> {
    return new Promise(resolve => {
      if (this.#medals) {
        resolve(this.#medals);
      } else if (this.#medalCallbacks) {
        this.#medalCallbacks.push(resolve);
      } else {
        this.#medalCallbacks = [resolve];
        this.#ngio.callComponent("Medal.getList", {}, (result) => {
          if (result.success) {
            this.#medals = result.medals;
            const style = "font-weight: bold;";
            console.log(
              "%c Unlocked:",
              style,
              this.#medals
                ?.filter(({ unlocked }) => unlocked)
                .map(({ name }) => name)
                .join(", "),
            );
            console.log(
              "%c Locked:",
              style,
              this.#medals
                ?.filter(({ unlocked }) => !unlocked)
                .map(({ name }) => name)
                .join(", "),
            );
            this.#medalCallbacks?.forEach((callback) => callback?.(this.#medals ?? []));
            this.#medalCallbacks = undefined;
          }
        });
      }
    });
  }

  async unlockMedal(medal_name: string): Promise<Medal | undefined> {
    /* If there is no user attached to our ngio object, it means the user isn't logged in and we can't unlock anything */
    if (!this.#ngio.user) return;
    console.log("unlocking", medal_name, "for", this.#ngio.user);
    const medals = await this.getMedals();
    const medal = medals.filter((medal) => medal.name === medal_name)[0];
    if (medal) {
      return new Promise(resolve => {
        if (!medal.unlocked && !this.#cacheUnlocked[medal.id]) {
          this.#ngio.callComponent("Medal.unlock", { id: medal.id }, (result) => {
            const medal = result.medal;
            if (medal) {
              for (let i = 0; i < medals.length; i++) {
                if (medals[i].id === medal.id) {
                  medals[i] = medal;
                }
              }
              this.#cacheUnlocked[medal.id] = true;
              this.#medalListeners.forEach(listener => listener(medal));
              this.showReceivedMedal(medal);
              resolve(result.medal);
            }
          });
        } else {
          resolve(medal);
        }
      });
    } else {
      console.warn(`Medal doesn't exist: ${medal_name}`);
    }
  }

  requestLogin() {
    this.#ngio.requestLogin(this.onLoggedIn, this.onLoginFailed, this.onLoginCancelled);
    /* you should also draw a 'cancel login' buton here */
    const button = document.getElementById("newgrounds-login");
    if (button) {
      button.style.display = "none";
    }
  }

  onLoginFailed() {
    console.log("There was a problem logging in: ", this.#ngio.login_error?.message);
    const button = document.getElementById("newgrounds-login");
    if (button) {
      button.style.display = "";
    }
  }

  onLoginCancelled() {
    console.log("The user cancelled the login.");
    const button = document.getElementById("newgrounds-login");
    if (button) {
      button.style.display = "";
    }
  }


  initSession() {
    this.#ngio.getValidSession(() => {
      const button = document.body.appendChild(document.createElement("button"));
      button.id = "newgrounds-login";
      button.style.display = this.#debug ? "" : "none";
      button.style.position = "absolute";
      button.style.top = "5px";
      button.style.right = "5px";
      button.style.height = "24px";
      button.style.fontSize = "10pt";
      button.style.zIndex = "1000";
      button.classList.add("button");
      button.innerText = "login newgrounds";
      button.addEventListener("click", (e) => {
        this.requestLogin();
        e.stopPropagation();
      });

      if (this.#ngio.user) {
        button.style.display = "none";
        this.onLoggedIn();
      } else {
        // console.log("Not logged in Newgrounds.");
      }
    });
  }

  onLoggedIn() {
    console.log(
      "Welcome ", this.#ngio.user?.name + "!",
    );
    this.#loginListeners.forEach(listener => listener());
    this.getMedals();
    this.getScoreboards();
  }

  #medalDiv?: HTMLDivElement;
  #getMedalDiv() {
    if (!this.#medalDiv) {
      const medalDiv = document.body.appendChild(document.createElement("div"));
      medalDiv.style.display = "none";
      medalDiv.style.position = "absolute";
      medalDiv.style.right = "10px";
      medalDiv.style.top = "10px";
      medalDiv.style.padding = "5px 10px";
      medalDiv.style.border = "2px solid #880";
      medalDiv.style.borderRadius = "5px";
      medalDiv.style.background = "linear-gradient(#884, #553)";
      medalDiv.style.boxShadow = "2px 2px black";
      medalDiv.style.flexDirection = "row";
      medalDiv.style.transition = "opacity .5s, margin-right .3s";
      medalDiv.style.opacity = "0";
      medalDiv.style.marginRight = "-300px";
      medalDiv.style.zIndex = "3000";
      medalDiv.style.fontFamily = "Papyrus, fantasy";


      this.#medalDiv = medalDiv;
    }
    return this.#medalDiv;
  }

  #medalTimeout?: Timer;
  showReceivedMedal(medal: Medal): void {
    clearTimeout(this.#medalTimeout);
    const medalDiv = this.#getMedalDiv();
    medalDiv.style.display = "flex";
    medalDiv.innerText = "";
    const img = medalDiv.appendChild(document.createElement("img"));
    img.addEventListener("load", () => {
      medalDiv.style.display = "flex";
      medalDiv.style.opacity = "1";
      medalDiv.style.marginRight = "0";
      if (!(window as any).mute) {
        this.audio?.play();
      }
      this.#medalTimeout = setTimeout(() => {
        if (!(window as any).mute) {
          this.audioOut?.play();
        }
        medalDiv.style.opacity = "0";
        this.#medalTimeout = setTimeout(() => {
          medalDiv.style.display = "none";
          medalDiv.style.marginRight = "-300px";
          this.#medalTimeout = undefined;
        }, 1000);
      }, 5000);
    });
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.backgroundColor = "black";
    img.src = medal.icon;

    const divDetails = medalDiv.appendChild(document.createElement("div"));
    divDetails.style.marginLeft = "10px";

    const divText = divDetails.appendChild(document.createElement("div"));
    divText.style.fontWeight = "bold";
    divText.style.fontSize = "12pt";
    divText.style.color = "gold";
    divText.style.margin = "5px";
    divText.innerText = `🏆 ${medal.name}`;

    const divDesc = divDetails.appendChild(document.createElement("div"));
    divDesc.style.fontSize = "10pt";
    divDesc.style.color = "silver";
    divDesc.innerText = medal.description;
  }

  async postScore(value: number, boardname: string): Promise<boolean | void> {
    const scoreboards: Scoreboard[] = await this.getScoreboards();
    const scoreboard = boardname ? scoreboards.find(board => board.name === boardname) : scoreboards[0];
    if (scoreboard) {
      return new Promise<boolean>(resolve => {
        this.#ngio.callComponent("ScoreBoard.postScore", { id: scoreboard.id, value }, response => {
          resolve(response.success);
        });
      });
    }
  }
}