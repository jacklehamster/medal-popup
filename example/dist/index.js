// /Users/vincent/medal-popup/example/node_modules/medal-popup/dist/index.js
var X = {};
X.io = { GATEWAY_URI: "//newgrounds.io/gateway_v3.php" };
X.io.events = {};
X.io.call_validators = {};
X.io.model = { checkStrictValue: function(O, K, V, Q, Z, M, Y) {
  if (Q == "mixed")
    return true;
  if (V === null || typeof V == "undefined")
    return true;
  if (Q && V.constructor === Q)
    return true;
  if (Q == Boolean && V.constructor === Number)
    return true;
  if (Z && V.constructor === X.io.model[Z])
    return true;
  if (V.constructor === Array && (M || Y)) {
    for (var W = 0;W < V.length; W++)
      this.checkStrictValue(O, K, V[W], M, Y, null, null);
    return true;
  }
  if (O)
    throw new Error("Illegal '" + K + "' value set in model " + O);
  return false;
} };
X.io.events.OutputEvent = function(O, K, V) {
  this.type = O, this.call = K, this.data = V, this.success = V && typeof (V.success != "undefined") ? V.success ? true : false : false, this.preventDefault = false;
};
X.io.events.OutputEvent.prototype.constructor = X.io.events.OutputEvent;
X.io.events.SessionEvent = function(O) {
  this.type = O, this.user = null, this.passport_url = null;
};
X.io.events.SessionEvent.USER_LOADED = "user-loaded";
X.io.events.SessionEvent.SESSION_EXPIRED = "session-expired";
X.io.events.SessionEvent.REQUEST_LOGIN = "request-login";
X.io.events.SessionEvent.prototype.constructor = X.io.events.SessionEvent;
X.io.events.EventDispatcher = function() {
};
X.io.events.EventDispatcher.prototype = { _event_listeners: {}, addEventListener: function(O, K) {
  if (O.constructor !== String)
    throw new Error("Event names must be a string format.");
  if (K.constructor !== Function)
    throw new Error("Event listeners must be functions.");
  if (typeof this._event_listeners[O] == "undefined")
    this._event_listeners[O] = [];
  this._event_listeners[O].push(K);
}, removeEventListener: function(O, K) {
  if (typeof this._event_listeners[O] == "undefined")
    return;
  var V = -1;
  for (let Q = 0;Q < this._event_listeners[O].length; Q++)
    if (this._event_listeners[O][Q] === K) {
      V = Q;
      break;
    }
  if (V >= 0)
    return this._event_listeners[O].splice(V, 1), true;
  return false;
}, removeAllEventListeners: function(O) {
  if (typeof this._event_listeners[O] == "undefined")
    return 0;
  var K = this._event_listeners[O].length;
  return this._event_listeners[O] = [], K;
}, dispatchEvent: function(O) {
  var K = false, V;
  for (var Q in X.io.events)
    if (O.constructor === X.io.events[Q]) {
      K = true;
      break;
    }
  if (!K)
    throw new Error("Unsupported event object");
  if (typeof this._event_listeners[O.type] == "undefined")
    return false;
  for (var Z = 0;Z < this._event_listeners[O.type].length; Z++)
    if (V = this._event_listeners[O.type][Z], V(O) === false || O.preventDefault)
      return true;
  return true;
} };
X.io.events.EventDispatcher.prototype.constructor = X.io.events.EventDispatcher;
X.io.core = function(O, K) {
  var V, Q, Z, M, Y = this, W, L = new X.io.urlHelper;
  if (L.getRequestQueryParam("ngio_session_id"))
    Q = L.getRequestQueryParam("ngio_session_id");
  if (Object.defineProperty(this, "app_id", { get: function() {
    return V;
  } }), Object.defineProperty(this, "user", { get: function() {
    return this.getCurrentUser();
  } }), Object.defineProperty(this, "session_id", { set: function($) {
    if ($ && typeof $ != "string")
      throw new Error("'session_id' must be a string value.");
    Q = $ ? $ : null;
  }, get: function() {
    return Q ? Q : null;
  } }), Object.defineProperty(this, "debug", { set: function($) {
    M = $ ? true : false;
  }, get: function() {
    return M;
  } }), !O)
    throw new Error("Missing required 'app_id' in Newgrounds.io.core constructor");
  if (typeof O != "string")
    throw new Error("'app_id' must be a string value in Newgrounds.io.core constructor");
  if (V = O, K)
    W = j.enc.Base64.parse(K);
  else
    console.warn("You did not set an encryption key. Some calls may not work without this.");
  var P = "Newgrounds-io-app_session-" + V.split(":").join("-");
  function J() {
    if (typeof localStorage != "undefined" && localStorage && localStorage.getItem.constructor == Function)
      return true;
    return false;
  }
  const G = {};
  function T() {
    if (J())
      return localStorage;
    return { getItem($) {
      return G[$];
    }, setItem($, R) {
      G[$] = R;
    }, removeItem($) {
      delete G[$];
    } };
  }
  function I() {
    var R = T().getItem(P);
    return R ? R : null;
  }
  function F($) {
    T().setItem(P, $);
  }
  function H() {
    T().removeItem(P);
  }
  if (!Q && I())
    Q = I();
  this.addEventListener("App.endSession", function($) {
    Y.session_id = null, H();
  }), this.addEventListener("App.startSession", function($) {
    if ($.success)
      Y.session_id = $.data.session.id;
  }), this.addEventListener("App.checkSession", ($) => {
    if ($.success) {
      if ($.data.session.expired)
        H(), this.session_id = null;
      else if ($.data.session.remember)
        F($.data.session.id);
    } else
      this.session_id = null, H();
  }), this._encryptCall = function($) {
    if (!$ || !$.constructor == X.io.model.call_model)
      throw new Error("Attempted to encrypt a non 'call' object");
    var R = j.lib.WordArray.random(16), z = j.AES.encrypt(JSON.stringify($.toObject()), W, { iv: R }), S = j.enc.Base64.stringify(R.concat(z.ciphertext));
    return $.secure = S, $.parameters = null, $;
  };
};
X.io.core.prototype = { _session_loader: null, _call_queue: [], _event_listeners: {}, addEventListener: X.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: X.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: X.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: X.io.events.EventDispatcher.prototype.dispatchEvent, getSessionLoader: function() {
  if (this._session_loader == null)
    this._session_loader = new X.io.SessionLoader(this);
  return this._session_loader;
}, getSession: function() {
  return this.getSessionLoader().session;
}, getCurrentUser: function() {
  var O = this.getSessionLoader();
  if (O.session)
    return O.session.user;
  return null;
}, getLoginError: function() {
  return this.getSessionLoader().last_error;
}, getValidSession: function(O, K) {
  this.getSessionLoader().getValidSession(O, K);
}, requestLogin: function(O, K, V, Q) {
  if (!O || O.constructor !== Function)
    throw "Missing required callback for 'on_logged_in'.";
  if (!K || K.constructor !== Function)
    throw "Missing required callback for 'on_login_failed'.";
  var Z = this, M = this.getSessionLoader(), Y;
  function W() {
    if (Y)
      clearInterval(Y);
    Z.removeEventListener("cancelLoginRequest", L), M.closePassport();
  }
  function L() {
    V && V.constructor === Function ? V.call(Q) : K.call(Q), W();
  }
  if (Z.addEventListener("cancelLoginRequest", L), Z.getCurrentUser())
    O.call(Q);
  else
    M.loadPassport(), Y = setInterval(function() {
      M.checkSession(function(P) {
        if (!P || P.expired)
          if (M.last_error.code == 111)
            L();
          else
            W(), K.call(Q);
        else if (P.user)
          W(), O.call(Q);
      });
    }, 3000);
}, cancelLoginRequest: function() {
  event = new X.io.events.OutputEvent("cancelLoginRequest", null, null), this.dispatchEvent(event);
}, logOut: function(O, K) {
  this.getSessionLoader().endSession(O, K);
}, queueComponent: function(O, K, V, Q) {
  if (K && K.constructor === Function && !V)
    V = K, K = null;
  var Z = new X.io.model.call(this);
  if (Z.component = O, typeof K != "undefined")
    Z.parameters = K;
  this._validateCall(Z), this._call_queue.push([Z, V, Q]);
}, executeQueue: function() {
  var O = [], K = [], V = [];
  for (var Q = 0;Q < this._call_queue.length; Q++)
    O.push(this._call_queue[Q][0]), K.push(this._call_queue[Q][1]), V.push(this._call_queue[Q][2]);
  this._doCall(O, K, V), this._call_queue = [];
}, callComponent: function(O, K, V, Q) {
  if (K.constructor === Function && !V)
    V = K, K = null;
  var Z = new X.io.model.call(this);
  if (Z.component = O, typeof K != "undefined")
    Z.parameters = K;
  this._validateCall(Z), this._doCall(Z, V, Q);
}, _doCallback: function(O, K, V, Q) {
  var Z, M, Y, W, L, P = { success: false, error: { code: 0, message: "Unexpected Server Response" } };
  if (typeof V == "undefined")
    V = null;
  if (O.constructor === Array && K && K.constructor === Array) {
    for (Z = 0;Z < O.length; Z++)
      M = !V || typeof V[Z] == "undefined" ? P : V[Z], Y = typeof K[Z] == "undefined" ? null : K[Z], this._doCallback(O[Z], Y, M, Q[Z]);
    return;
  }
  if (V && typeof V.data != "undefined") {
    var J;
    if (V.data.constructor === Array) {
      J = [];
      for (Z = 0;Z < V.data.length; Z++)
        J.push(this._formatResults(V.component, V.data[Z]));
    } else
      J = this._formatResults(V.component, V.data);
    V.data = J;
  }
  var G;
  if (V)
    if (typeof V.data != "undefined")
      G = V.data;
    else
      console.warn("Received empty data from '" + O.component + "'."), G = null;
  else
    G = P;
  var T;
  if (G.constructor === Array)
    for (Z = 0;Z < G.length; Z++)
      T = new X.io.events.OutputEvent(O.component, O[Z], G[Z]), this.dispatchEvent(T);
  else
    T = new X.io.events.OutputEvent(O.component, O, G), this.dispatchEvent(T);
  if (K && K.constructor === Function)
    K.call(Q, G);
}, _formatResults: function(O, K) {
  var V, Q, Z, M, Y, W = null;
  if (typeof K.success != "undefined" && K.success)
    W = X.io.call_validators.getValidator(O);
  if (!W)
    return K;
  var L = W.returns;
  for (Q in L) {
    if (typeof K[Q] == "undefined" && K.success !== false) {
      console.warn("Newgrounds.io server failed to return expected '" + Q + "' in '" + O + "' data.");
      continue;
    }
    if (typeof L[Q].array != "undefined") {
      if (typeof L[Q].array.object != "undefined")
        Y = L[Q].array.object;
      else
        Y = L[Q].array;
      if (typeof X.io.model[Y] == "undefined") {
        console.warn("Received unsupported model '" + Y + "' from '" + O + "'.");
        continue;
      }
      if (K[Q].constructor !== Array) {
        console.warn("Expected array<" + Y + "> value for '" + Q + "' in '" + O + "' data, got " + typeof K[Q]);
        continue;
      }
      M = [];
      for (Z = 0;Z < K[Q].length; Z++)
        V = new X.io.model[Y](this), V.fromObject(K[Q][Z]), M.push(V);
      K[Q] = M;
    } else if (typeof L[Q].object != "undefined" && K[Q]) {
      if (Y = L[Q].object, typeof X.io.model[Y] == "undefined") {
        console.warn("Received unsupported model '" + Y + "' from '" + O + "'.");
        continue;
      }
      V = new X.io.model[Y](this), V.fromObject(K[Q]), K[Q] = V;
    }
  }
  return K;
}, _doCall: function(O, K, V) {
  if (!this.app_id)
    throw new Error("Attempted to call Newgrounds.io server without setting an app_id in Newgrounds.io.core instance.");
  var Q, Z = false, M = this;
  function Y(G) {
    var T = X.io.call_validators.getValidator(G.component);
    if (T.hasOwnProperty("redirect") && T.redirect) {
      var I = G.parameters;
      if (!I || !I.hasOwnProperty("redirect") || I.redirect)
        return true;
    }
    return false;
  }
  if (O.constructor === Array) {
    Q = [];
    for (i = 0;i < O.length; i++) {
      if (Y(O[i]))
        throw new Error("Loader components can not be called in an array without a redirect=false parameter.");
      Q.push(O[i].toObject());
    }
  } else
    Q = O.toObject(), Z = Y(O);
  var W = { app_id: this.app_id, session_id: this.session_id, call: Q };
  if (this.debug)
    W.debug = 1;
  if (Z) {
    var L = { success: true, app_id: this.app_id, result: { component: O.component, data: { success: true } } }, P = document.createElement("form");
    P.action = X.io.GATEWAY_URI, P.target = "_blank", P.method = "POST";
    var J = document.createElement("input");
    J.type = "hidden", J.name = "input", P.appendChild(J), document.body.appendChild(P), J.value = JSON.stringify(W), P.submit(), document.body.removeChild(P);
  } else {
    const G = this, T = X.io.GATEWAY_URI.startsWith("//") ? "https:" + X.io.GATEWAY_URI : X.io.GATEWAY_URI, I = new FormData;
    I.append("input", JSON.stringify(W)), fetch(T, { method: "POST", body: I }).then((F) => F.json()).then((F) => {
      G._doCallback(O, K, F.result, V);
    });
  }
}, _doValidateCall: function(O, K) {
  var V, Q, Z, M, Y = X.io.call_validators.getValidator(O);
  if (!Y)
    throw new Error("'" + O + "' is not a valid server component.");
  if (Y.require_session && !this.session_id)
    throw new Error("'" + O + "' requires a session id");
  if (Y.import && Y.import.length > 0)
    for (V = 0;V < Y.import.length; V++)
      Q = Y.import[V].split("."), this._doValidateCall(Q[0], Q[1], K);
  var W;
  for (Z in Y.params) {
    if (M = Y.params[Z], W = K && typeof K[Z] != "undefined" ? K[Z] : null, !W && M.extract_from && M.extract_from.alias)
      W = K[M.extract_from.alias];
    if (W === null) {
      if (M.required)
        throw new Error("Missing required parameter for '" + O + "': " + Z);
      continue;
    }
    if (M.extract_from && W.constructor === X.io.model[M.extract_from.object])
      W = W[M.extract_from.property];
    if (!X.io.model.checkStrictValue(null, Z, W, M.type, null, null, null))
      throw new Error("Illegal value for '" + Z + "' parameter of '" + O + "': " + W);
  }
}, _validateCall: function(O) {
  var K;
  if (O.constructor === Array) {
    var V = [];
    for (K = 0;K < O.length; K++)
      V.push(this._validateCall(O[K]));
    return V;
  } else if (O.constructor !== X.io.model.call)
    throw new Error("Unexpected 'call_model' value. Expected Newgrounds.io.model.call instance.");
  var { component: Q, parameters: Z, echo: M } = O;
  if (Z && Z.constructor === Array)
    for (K = 0;K < Z.length; K++)
      this._doValidateCall(Q, Z[K]);
  else
    this._doValidateCall(Q, Z);
  var Y = { component: O.component }, W = X.io.call_validators.getValidator(O.component);
  if (typeof Z != "undefined")
    if (W.secure) {
      var L = this._encryptCall(O);
      Y.secure = L.secure;
    } else
      Y.parameters = Z;
  if (typeof M != "undefined")
    Y.echo = M;
  return Y;
} };
X.io.core.prototype.constructor = X.io.core;
X.io.core.instance_id = 0;
X.io.core.getNextInstanceID = function() {
  return X.io.core.instance_id++, X.io.core.instance_id;
};
X.io.urlHelper = function() {
  var O = globalThis.location?.href, K = {}, V = O?.split("?").pop();
  if (V) {
    var Q = V.split("&"), Z;
    for (var M = 0;M < Q.length; M++)
      Z = Q[M].split("="), K[Z[0]] = Z[1];
  }
  this.getRequestQueryParam = function(Y, W) {
    if (typeof W == "undefined")
      W = null;
    return typeof K[Y] == "undefined" ? W : K[Y];
  };
};
X.io.model.call = function(O, K) {
  var V, Q, Z, M;
  this.__property_names = ["component", "echo", "parameters", "secure"], this.__classname = "Newgrounds.io.model.call", this.__ngio = O;
  var V;
  Object.defineProperty(this, "component", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "component", Y, String, null, null, null), V = Y;
  } });
  var Q;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Y) {
    Q = Y;
  } });
  var Z;
  Object.defineProperty(this, "parameters", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "parameters", Y, Object, null, Object, null), Z = Y;
  } });
  var M;
  if (Object.defineProperty(this, "secure", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "secure", Y, String, null, null, null), M = Y;
  } }), K)
    this.fromObject(K);
};
X.io.model.call.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.call.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.call.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.call.prototype.constructor = X.io.model.call;
X.io.model.debug = function(O, K) {
  var V, Q;
  this.__property_names = ["exec_time", "input"], this.__classname = "Newgrounds.io.model.debug", this.__ngio = O;
  var V;
  Object.defineProperty(this, "exec_time", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "exec_time", Z, String, null, null, null), V = Z;
  } });
  var Q;
  if (Object.defineProperty(this, "input", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "input", Z, null, "input", null, null), Q = Z;
  } }), K)
    this.fromObject(K);
};
X.io.model.debug.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.debug.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.debug.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "input" && K)
      K = new X.io.model.input(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.debug.prototype.constructor = X.io.model.debug;
X.io.model.error = function(O, K) {
  var V, Q;
  this.__property_names = ["code", "message"], this.__classname = "Newgrounds.io.model.error", this.__ngio = O;
  var V;
  Object.defineProperty(this, "code", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "code", Z, Number, null, null, null), V = Z;
  } });
  var Q;
  if (Object.defineProperty(this, "message", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "message", Z, String, null, null, null), Q = Z;
  } }), K)
    this.fromObject(K);
};
X.io.model.error.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.error.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.error.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.error.get = function(O, K) {
  var V = new X.io.model.error;
  return V.message = O ? O : "Unknown Error", V.code = K ? K : 0, V;
};
X.io.model.error.MISSING_INPUT = 100;
X.io.model.error.INVALID_INPUT = 101;
X.io.model.error.MISSING_PARAMETER = 102;
X.io.model.error.INVALID_PARAMETER = 103;
X.io.model.error.EXPIRED_SESSION = 104;
X.io.model.error.DUPLICATE_SESSION = 105;
X.io.model.error.MAX_CONNECTIONS_EXCEEDED = 106;
X.io.model.error.MAX_CALLS_EXCEEDED = 107;
X.io.model.error.MEMORY_EXCEEDED = 108;
X.io.model.error.TIMED_OUT = 109;
X.io.model.error.LOGIN_REQUIRED = 110;
X.io.model.error.INVALID_APP_ID = 200;
X.io.model.error.INVALID_ENCRYPTION = 201;
X.io.model.error.INVALID_MEDAL_ID = 202;
X.io.model.error.INVALID_SCOREBOARD_ID = 203;
X.io.model.error.INVALID_SAVEGROUP_ID = 204;
X.io.model.error.SERVER_UNAVAILABLE = 504;
X.io.model.error.prototype.constructor = X.io.model.error;
X.io.model.input = function(O, K) {
  var V, Q, Z, M, Y;
  this.__property_names = ["app_id", "call", "debug", "echo", "session_id"], this.__classname = "Newgrounds.io.model.input", this.__ngio = O;
  var V;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "app_id", W, String, null, null, null), V = W;
  } });
  var Q;
  Object.defineProperty(this, "call", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "call", W, null, "call", null, "call"), Q = W;
  } });
  var Z;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "debug", W, Boolean, null, null, null), Z = W;
  } });
  var M;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(W) {
    M = W;
  } });
  var Y;
  if (Object.defineProperty(this, "session_id", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "session_id", W, String, null, null, null), Y = W;
  } }), K)
    this.fromObject(K);
};
X.io.model.input.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.input.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.input.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "call" && K)
      K = new X.io.model.call(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.input.prototype.constructor = X.io.model.input;
X.io.model.medal = function(O, K) {
  var V, Q, Z, M, Y, W, L, P;
  this.__property_names = ["description", "difficulty", "icon", "id", "name", "secret", "unlocked", "value"], this.__classname = "Newgrounds.io.model.medal", this.__ngio = O;
  var V;
  Object.defineProperty(this, "description", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "description", J, String, null, null, null), V = J;
  } });
  var Q;
  Object.defineProperty(this, "difficulty", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "difficulty", J, Number, null, null, null), Q = J;
  } });
  var Z;
  Object.defineProperty(this, "icon", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "icon", J, String, null, null, null), Z = J;
  } });
  var M;
  Object.defineProperty(this, "id", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "id", J, Number, null, null, null), M = J;
  } });
  var Y;
  Object.defineProperty(this, "name", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "name", J, String, null, null, null), Y = J;
  } });
  var W;
  Object.defineProperty(this, "secret", { get: function() {
    return typeof W == "undefined" ? null : W;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "secret", J, Boolean, null, null, null), W = J;
  } });
  var L;
  Object.defineProperty(this, "unlocked", { get: function() {
    return typeof L == "undefined" ? null : L;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "unlocked", J, Boolean, null, null, null), L = J;
  } });
  var P;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof P == "undefined" ? null : P;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "value", J, Number, null, null, null), P = J;
  } }), K)
    this.fromObject(K);
};
X.io.model.medal.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.medal.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.medal.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.medal.prototype.unlock = function(O) {
  var K = this;
  if (this._has_ngio_user())
    this.__ngio.callComponent("Medal.unlock", { id: this.id }, function(Z) {
      if (Z.success)
        this.unlocked = true;
      O(Z);
    });
  else if (typeof O == "function") {
    var V = X.io.model.error.get("This function requires a valid user session.", X.io.model.error.LOGIN_REQUIRED), Q = { success: false, error: V };
    O(Q);
  }
};
X.io.model.medal.prototype.constructor = X.io.model.medal;
X.io.model.output = function(O, K) {
  var V, Q, Z, M, Y, W, L, P;
  this.__property_names = ["api_version", "app_id", "debug", "echo", "error", "help_url", "result", "success"], this.__classname = "Newgrounds.io.model.output", this.__ngio = O;
  var V;
  Object.defineProperty(this, "api_version", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "api_version", J, String, null, null, null), V = J;
  } });
  var Q;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "app_id", J, String, null, null, null), Q = J;
  } });
  var Z;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "debug", J, null, "debug", null, null), Z = J;
  } });
  var M;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(J) {
    M = J;
  } });
  var Y;
  Object.defineProperty(this, "error", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "error", J, null, "error", null, null), Y = J;
  } });
  var W;
  Object.defineProperty(this, "help_url", { get: function() {
    return typeof W == "undefined" ? null : W;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "help_url", J, String, null, null, null), W = J;
  } });
  var L;
  Object.defineProperty(this, "result", { get: function() {
    return typeof L == "undefined" ? null : L;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "result", J, null, "result", null, "result"), L = J;
  } });
  var P;
  if (Object.defineProperty(this, "success", { get: function() {
    return typeof P == "undefined" ? null : P;
  }, set: function(J) {
    X.io.model.checkStrictValue(this.__classname, "success", J, Boolean, null, null, null), P = J;
  } }), K)
    this.fromObject(K);
};
X.io.model.output.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.output.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.output.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "debug" && K)
      K = new X.io.model.debug(this.__ngio, K);
    else if (this.__property_names[Q] == "error" && K)
      K = new X.io.model.error(this.__ngio, K);
    else if (this.__property_names[Q] == "result" && K)
      K = new X.io.model.result(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.output.prototype.constructor = X.io.model.output;
X.io.model.result = function(O, K) {
  var V, Q, Z;
  this.__property_names = ["component", "data", "echo"], this.__classname = "Newgrounds.io.model.result", this.__ngio = O;
  var V;
  Object.defineProperty(this, "component", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(M) {
    X.io.model.checkStrictValue(this.__classname, "component", M, String, null, null, null), V = M;
  } });
  var Q;
  Object.defineProperty(this, "data", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(M) {
    X.io.model.checkStrictValue(this.__classname, "data", M, Object, null, Object, null), Q = M;
  } });
  var Z;
  if (Object.defineProperty(this, "echo", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(M) {
    Z = M;
  } }), K)
    this.fromObject(K);
};
X.io.model.result.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.result.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.result.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.result.prototype.constructor = X.io.model.result;
X.io.model.score = function(O, K) {
  var V, Q, Z, M;
  this.__property_names = ["formatted_value", "tag", "user", "value"], this.__classname = "Newgrounds.io.model.score", this.__ngio = O;
  var V;
  Object.defineProperty(this, "formatted_value", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "formatted_value", Y, String, null, null, null), V = Y;
  } });
  var Q;
  Object.defineProperty(this, "tag", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "tag", Y, String, null, null, null), Q = Y;
  } });
  var Z;
  Object.defineProperty(this, "user", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "user", Y, null, "user", null, null), Z = Y;
  } });
  var M;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "value", Y, Number, null, null, null), M = Y;
  } }), K)
    this.fromObject(K);
};
X.io.model.score.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.score.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.score.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "user" && K)
      K = new X.io.model.user(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.score.prototype.constructor = X.io.model.score;
X.io.model.scoreboard = function(O, K) {
  var V, Q;
  this.__property_names = ["id", "name"], this.__classname = "Newgrounds.io.model.scoreboard", this.__ngio = O;
  var V;
  Object.defineProperty(this, "id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "id", Z, Number, null, null, null), V = Z;
  } });
  var Q;
  if (Object.defineProperty(this, "name", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Z) {
    X.io.model.checkStrictValue(this.__classname, "name", Z, String, null, null, null), Q = Z;
  } }), K)
    this.fromObject(K);
};
X.io.model.scoreboard.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.scoreboard.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.scoreboard.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.scoreboard.prototype.postScore = function(O, K, V) {
  var Q = this;
  if (typeof K == "function" && !V)
    V = K, K = null;
  if (!K)
    K = null;
  if (this._has_ngio_user())
    this.__ngio.callComponent("ScoreBoard.postScore", { id: this.id, value: O, tag: K }, function(Y) {
      V(Y);
    });
  else if (typeof V == "function") {
    var Z = X.io.model.error.get("This function requires a valid user session.", X.io.model.error.LOGIN_REQUIRED), M = { success: false, error: Z };
    V(M);
  }
};
X.io.model.scoreboard.prototype.constructor = X.io.model.scoreboard;
X.io.model.session = function(O, K) {
  var V, Q, Z, M, Y;
  this.__property_names = ["expired", "id", "passport_url", "remember", "user"], this.__classname = "Newgrounds.io.model.session", this.__ngio = O;
  var V;
  Object.defineProperty(this, "expired", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "expired", W, Boolean, null, null, null), V = W;
  } });
  var Q;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "id", W, String, null, null, null), Q = W;
  } });
  var Z;
  Object.defineProperty(this, "passport_url", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "passport_url", W, String, null, null, null), Z = W;
  } });
  var M;
  Object.defineProperty(this, "remember", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "remember", W, Boolean, null, null, null), M = W;
  } });
  var Y;
  if (Object.defineProperty(this, "user", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(W) {
    X.io.model.checkStrictValue(this.__classname, "user", W, null, "user", null, null), Y = W;
  } }), K)
    this.fromObject(K);
};
X.io.model.session.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.session.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.session.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "user" && K)
      K = new X.io.model.user(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.session.prototype.constructor = X.io.model.session;
X.io.model.user = function(O, K) {
  var V, Q, Z, M;
  this.__property_names = ["icons", "id", "name", "supporter"], this.__classname = "Newgrounds.io.model.user", this.__ngio = O;
  var V;
  Object.defineProperty(this, "icons", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "icons", Y, null, "usericons", null, null), V = Y;
  } });
  var Q;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "id", Y, Number, null, null, null), Q = Y;
  } });
  var Z;
  Object.defineProperty(this, "name", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "name", Y, String, null, null, null), Z = Y;
  } });
  var M;
  if (Object.defineProperty(this, "supporter", { get: function() {
    return typeof M == "undefined" ? null : M;
  }, set: function(Y) {
    X.io.model.checkStrictValue(this.__classname, "supporter", Y, Boolean, null, null, null), M = Y;
  } }), K)
    this.fromObject(K);
};
X.io.model.user.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.user.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.user.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++) {
    if (K = O[this.__property_names[Q]], this.__property_names[Q] == "icons" && K)
      K = new X.io.model.usericons(this.__ngio, K);
    this[this.__property_names[Q]] = K;
  }
};
X.io.model.user.prototype.constructor = X.io.model.user;
X.io.model.usericons = function(O, K) {
  var V, Q, Z;
  this.__property_names = ["large", "medium", "small"], this.__classname = "Newgrounds.io.model.usericons", this.__ngio = O;
  var V;
  Object.defineProperty(this, "large", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(M) {
    X.io.model.checkStrictValue(this.__classname, "large", M, String, null, null, null), V = M;
  } });
  var Q;
  Object.defineProperty(this, "medium", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(M) {
    X.io.model.checkStrictValue(this.__classname, "medium", M, String, null, null, null), Q = M;
  } });
  var Z;
  if (Object.defineProperty(this, "small", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(M) {
    X.io.model.checkStrictValue(this.__classname, "small", M, String, null, null, null), Z = M;
  } }), K)
    this.fromObject(K);
};
X.io.model.usericons.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
X.io.model.usericons.prototype.toObject = function() {
  var O = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      O[this.__property_names[K]] = this[this.__property_names[K]];
  return O;
};
X.io.model.usericons.prototype.fromObject = function(O) {
  var K, V;
  for (var Q = 0;Q < this.__property_names.length; Q++)
    K = O[this.__property_names[Q]], this[this.__property_names[Q]] = K;
};
X.io.model.usericons.prototype.constructor = X.io.model.usericons;
X.io.call_validators.getValidator = function(O) {
  var K = O.split("."), V = K[0], Q = K[1], Z = X.io.call_validators[V] && X.io.call_validators[V][Q] ? X.io.call_validators[V][Q] : null;
  return Z;
};
X.io.call_validators.App = { checkSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: { session: { object: "session", description: null } } }, endSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: {} }, getCurrentVersion: { require_session: false, secure: false, redirect: false, import: false, params: { version: { type: String, extract_from: null, required: null, description: 'The version number (in "X.Y.Z" format) of the client-side app. (default = "0.0.0")' } }, returns: {} }, getHostLicense: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: null, description: "The host domain to check (ei, somesite.com)." } }, returns: {} }, logView: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Examples: "www.somesite.com", "localHost"' } }, returns: {} }, startSession: { require_session: false, secure: false, redirect: false, import: false, params: { force: { type: Boolean, extract_from: null, required: null, description: "If true, will create a new session even if the user already has an existing one.\n\nNote: Any previous session ids will no longer be valid if this is used." } }, returns: { session: { object: "session", description: null } } } };
X.io.call_validators.Event = { logEvent: { require_session: false, secure: false, redirect: false, import: false, params: { event_name: { type: String, extract_from: null, required: true, description: "The name of your custom event as defined in your Referrals & Events settings." }, host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "newgrounds.com", "localHost"' } }, returns: {} } };
X.io.call_validators.Gateway = { getDatetime: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, getVersion: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, ping: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} } };
X.io.call_validators.Loader = { loadAuthorUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadMoreGames: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadNewgrounds: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadOfficialUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadReferral: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." }, referral_name: { type: String, extract_from: null, required: true, description: 'The name of the referral (as defined in your "Referrals & Events" settings).' } }, returns: {} } };
X.io.call_validators.Medal = { getList: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { medals: { array: { object: "medal" }, description: "An array of medal objects." } } }, unlock: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "medal", alias: "medal", property: "id" }, required: true, description: "The numeric ID of the medal to unlock." } }, returns: { medal: { object: "medal", description: "The #medal that was unlocked." } } } };
X.io.call_validators.ScoreBoard = { getBoards: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { scoreboards: { array: { object: "scoreboard" }, description: "An array of #scoreboard objects." } } }, getScores: { require_session: false, secure: false, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, limit: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to include in the list. Default = 10." }, period: { type: String, extract_from: null, required: null, description: "The time-frame to pull scores from (see notes for acceptable values)." }, skip: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to skip before starting the list. Default = 0." }, social: { type: Boolean, extract_from: null, required: null, description: "If set to true, only social scores will be loaded (scores by the user and their friends). This param will be ignored if there is no valid session id and the 'user' param is absent." }, tag: { type: String, extract_from: null, required: null, description: "A tag to filter results by." }, user: { type: "mixed", extract_from: null, required: null, description: "A user's ID or name.  If 'social' is true, this user and their friends will be included. Otherwise, only scores for this user will be loaded. If this param is missing and there is a valid session id, that user will be used by default." } }, returns: { scoreboard: { object: "scoreboard", description: "The #scoreboard being queried." }, scores: { array: { object: "score" }, description: "An array of #score objects." }, user: { object: "user", description: "The #user the score list is associated with (either as defined in the 'user' param, or extracted from the current session when 'social' is set to true)" } } }, postScore: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, tag: { type: String, extract_from: null, required: null, description: "An optional tag that can be used to filter scores via ScoreBoard.getScores" }, value: { type: Number, extract_from: null, required: true, description: "The int value of the score." } }, returns: { score: { object: "score", description: "The #score that was posted to the board." }, scoreboard: { object: "scoreboard", description: "The #scoreboard that was posted to." } } } };
X.io.SessionLoader = function(O) {
  if (!O || O.constructor !== X.io.core)
    throw new Error("'ngio' must be a 'Newgrounds.io.core' instance.");
  this.__ngio = O;
  var K = null;
  Object.defineProperty(this, "session", { set: function(V) {
    if (V && !V.constructor === X.io.model.session)
      throw new Error("'session' must be a 'Newgrounds.io.model.session' instance.");
    K = V;
  }, get: function() {
    return K;
  } });
};
X.io.SessionLoader.prototype = { _event_listeners: {}, last_error: null, passport_window: null, addEventListener: X.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: X.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: X.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: X.io.events.EventDispatcher.prototype.dispatchEvent, getValidSession: function(O, K) {
  var V = this;
  V.checkSession(function(Q) {
    if (!Q || Q.expired)
      V.startSession(O, K);
    else
      O.call(K, Q);
  });
}, startSession: function(O, K) {
  var V = new X.io.events.SessionEvent, Q = this;
  this.__ngio.callComponent("App.startSession", function(Z) {
    if (!Z.success || !Z.session) {
      if (Z.error)
        Q.last_error = Z.error;
      else
        Q.last_error = new X.io.model.error, Q.last_error.message = "Unexpected Error";
      V.type = X.io.events.SessionEvent.SESSION_EXPIRED, Q.session = null;
    } else
      V.type = X.io.events.SessionEvent.REQUEST_LOGIN, V.passport_url = Z.session.passport_url, Q.session = Z.session;
    if (Q.__ngio.session_id = Q.session ? Q.session.id : null, Q.dispatchEvent(V), O && O.constructor === Function)
      O.call(K, Q.session);
  });
}, checkSession: function(O, K) {
  var V = new X.io.events.SessionEvent, Q = this;
  if (Q.session && Q.session.user) {
    if (V.type = X.io.events.SessionEvent.USER_LOADED, V.user = Q.session.user, Q.dispatchEvent(V), O && O.constructor === Function)
      O.call(K, Q.session);
  } else if (!this.__ngio.session_id) {
    if (V.type = X.io.events.SessionEvent.SESSION_EXPIRED, Q.session = null, Q.dispatchEvent(V), O && O.constructor === Function)
      O.call(K, null);
  } else
    this.__ngio.callComponent("App.checkSession", function(Z) {
      if (!Z.success || !Z.session || Z.session.expired)
        if (V.type = X.io.events.SessionEvent.SESSION_EXPIRED, Q.session = null, Z.error)
          Q.last_error = Z.error;
        else if (Q.last_error = new X.io.model.error, Z.session && Z.session.expired)
          Q.last_error.message = "Session is Expired";
        else
          Q.last_error.message = "Unexpected Error";
      else if (!Z.session.user)
        V.type = X.io.events.SessionEvent.REQUEST_LOGIN, V.passport_url = Z.session.passport_url, Q.session = Z.session;
      else
        V.type = X.io.events.SessionEvent.USER_LOADED, V.user = Z.session.user, Q.session = Z.session;
      if (Q.__ngio.session_id = Q.session ? Q.session.id : null, Q.dispatchEvent(V), O && O.constructor === Function)
        O.call(K, Q.session);
    });
}, endSession: function(O, K) {
  var V = this, Q = this.__ngio;
  this.__ngio.callComponent("App.endSession", function(Z) {
    V.session = null, Q.session_id = null;
    var M = new X.io.events.SessionEvent(X.io.events.SessionEvent.SESSION_EXPIRED);
    if (V.dispatchEvent(M), O && O.constructor === Function)
      O.call(K, V.session);
  }), this.__ngio.session_id = null, this.session = null;
}, loadPassport: function(O) {
  if (typeof O != "string")
    O = "_blank";
  if (!this.session || !this.session.passport_url)
    return console.warn("Attempted to open Newgrounds Passport without a valid passport_url. Be sure you have called getValidSession() first!."), false;
  if (this.passport_window = globalThis.open(this.session.passport_url, O), !this.passport_window)
    console.warn("Unable to detect passport window. Pop-up blockers will prevent loading Newgrounds Passport if loadPassport() or requestLogin() are not called from within a mouse click handler.");
  return this.passportOpen();
}, closePassport: function() {
  if (!this.passport_window)
    return false;
  return this.passport_window.close(), this.passportOpen();
}, passportOpen: function() {
  return this.passport_window && this.passport_window.parent ? true : false;
} };
X.io.SessionLoader.prototype.constructor = X.io.SessionLoader;
var j = j || function(O, K) {
  var V = {}, Q = V.lib = {}, Z = function() {
  }, M = Q.Base = { extend: function(I) {
    Z.prototype = this;
    var F = new Z;
    return I && F.mixIn(I), F.hasOwnProperty("init") || (F.init = function() {
      F.$super.init.apply(this, arguments);
    }), F.init.prototype = F, F.$super = this, F;
  }, create: function() {
    var I = this.extend();
    return I.init.apply(I, arguments), I;
  }, init: function() {
  }, mixIn: function(I) {
    for (var F in I)
      I.hasOwnProperty(F) && (this[F] = I[F]);
    I.hasOwnProperty("toString") && (this.toString = I.toString);
  }, clone: function() {
    return this.init.prototype.extend(this);
  } }, Y = Q.WordArray = M.extend({ init: function(I, F) {
    I = this.words = I || [], this.sigBytes = F != K ? F : 4 * I.length;
  }, toString: function(I) {
    return (I || L).stringify(this);
  }, concat: function(I) {
    var F = this.words, H = I.words, $ = this.sigBytes;
    if (I = I.sigBytes, this.clamp(), $ % 4)
      for (var R = 0;R < I; R++)
        F[$ + R >>> 2] |= (H[R >>> 2] >>> 24 - 8 * (R % 4) & 255) << 24 - 8 * (($ + R) % 4);
    else if (65535 < H.length)
      for (R = 0;R < I; R += 4)
        F[$ + R >>> 2] = H[R >>> 2];
    else
      F.push.apply(F, H);
    return this.sigBytes += I, this;
  }, clamp: function() {
    var I = this.words, F = this.sigBytes;
    I[F >>> 2] &= 4294967295 << 32 - 8 * (F % 4), I.length = O.ceil(F / 4);
  }, clone: function() {
    var I = M.clone.call(this);
    return I.words = this.words.slice(0), I;
  }, random: function(I) {
    for (var F = [], H = 0;H < I; H += 4)
      F.push(4294967296 * O.random() | 0);
    return new Y.init(F, I);
  } }), W = V.enc = {}, L = W.Hex = { stringify: function(I) {
    var F = I.words;
    I = I.sigBytes;
    for (var H = [], $ = 0;$ < I; $++) {
      var R = F[$ >>> 2] >>> 24 - 8 * ($ % 4) & 255;
      H.push((R >>> 4).toString(16)), H.push((R & 15).toString(16));
    }
    return H.join("");
  }, parse: function(I) {
    for (var F = I.length, H = [], $ = 0;$ < F; $ += 2)
      H[$ >>> 3] |= parseInt(I.substr($, 2), 16) << 24 - 4 * ($ % 8);
    return new Y.init(H, F / 2);
  } }, P = W.Latin1 = { stringify: function(I) {
    var F = I.words;
    I = I.sigBytes;
    for (var H = [], $ = 0;$ < I; $++)
      H.push(String.fromCharCode(F[$ >>> 2] >>> 24 - 8 * ($ % 4) & 255));
    return H.join("");
  }, parse: function(I) {
    for (var F = I.length, H = [], $ = 0;$ < F; $++)
      H[$ >>> 2] |= (I.charCodeAt($) & 255) << 24 - 8 * ($ % 4);
    return new Y.init(H, F);
  } }, J = W.Utf8 = { stringify: function(I) {
    try {
      return decodeURIComponent(escape(P.stringify(I)));
    } catch (F) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse: function(I) {
    return P.parse(unescape(encodeURIComponent(I)));
  } }, G = Q.BufferedBlockAlgorithm = M.extend({ reset: function() {
    this._data = new Y.init, this._nDataBytes = 0;
  }, _append: function(I) {
    typeof I == "string" && (I = J.parse(I)), this._data.concat(I), this._nDataBytes += I.sigBytes;
  }, _process: function(I) {
    var F = this._data, H = F.words, $ = F.sigBytes, R = this.blockSize, z = $ / (4 * R), z = I ? O.ceil(z) : O.max((z | 0) - this._minBufferSize, 0);
    if (I = z * R, $ = O.min(4 * I, $), I) {
      for (var S = 0;S < I; S += R)
        this._doProcessBlock(H, S);
      S = H.splice(0, I), F.sigBytes -= $;
    }
    return new Y.init(S, $);
  }, clone: function() {
    var I = M.clone.call(this);
    return I._data = this._data.clone(), I;
  }, _minBufferSize: 0 });
  Q.Hasher = G.extend({ cfg: M.extend(), init: function(I) {
    this.cfg = this.cfg.extend(I), this.reset();
  }, reset: function() {
    G.reset.call(this), this._doReset();
  }, update: function(I) {
    return this._append(I), this._process(), this;
  }, finalize: function(I) {
    return I && this._append(I), this._doFinalize();
  }, blockSize: 16, _createHelper: function(I) {
    return function(F, H) {
      return new I.init(H).finalize(F);
    };
  }, _createHmacHelper: function(I) {
    return function(F, H) {
      return new T.HMAC.init(I, H).finalize(F);
    };
  } });
  var T = V.algo = {};
  return V;
}(Math);
(function() {
  var O = j, K = O.lib.WordArray;
  O.enc.Base64 = { stringify: function(V) {
    var { words: Q, sigBytes: Z } = V, M = this._map;
    V.clamp(), V = [];
    for (var Y = 0;Y < Z; Y += 3)
      for (var W = (Q[Y >>> 2] >>> 24 - 8 * (Y % 4) & 255) << 16 | (Q[Y + 1 >>> 2] >>> 24 - 8 * ((Y + 1) % 4) & 255) << 8 | Q[Y + 2 >>> 2] >>> 24 - 8 * ((Y + 2) % 4) & 255, L = 0;4 > L && Y + 0.75 * L < Z; L++)
        V.push(M.charAt(W >>> 6 * (3 - L) & 63));
    if (Q = M.charAt(64))
      for (;V.length % 4; )
        V.push(Q);
    return V.join("");
  }, parse: function(V) {
    var Q = V.length, Z = this._map, M = Z.charAt(64);
    M && (M = V.indexOf(M), M != -1 && (Q = M));
    for (var M = [], Y = 0, W = 0;W < Q; W++)
      if (W % 4) {
        var L = Z.indexOf(V.charAt(W - 1)) << 2 * (W % 4), P = Z.indexOf(V.charAt(W)) >>> 6 - 2 * (W % 4);
        M[Y >>> 2] |= (L | P) << 24 - 8 * (Y % 4), Y++;
      }
    return K.create(M, Y);
  }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
})();
(function(O) {
  function K(G, T, I, F, H, $, R) {
    return G = G + (T & I | ~T & F) + H + R, (G << $ | G >>> 32 - $) + T;
  }
  function V(G, T, I, F, H, $, R) {
    return G = G + (T & F | I & ~F) + H + R, (G << $ | G >>> 32 - $) + T;
  }
  function Q(G, T, I, F, H, $, R) {
    return G = G + (T ^ I ^ F) + H + R, (G << $ | G >>> 32 - $) + T;
  }
  function Z(G, T, I, F, H, $, R) {
    return G = G + (I ^ (T | ~F)) + H + R, (G << $ | G >>> 32 - $) + T;
  }
  for (var M = j, L = M.lib, Y = L.WordArray, W = L.Hasher, L = M.algo, P = [], J = 0;64 > J; J++)
    P[J] = 4294967296 * O.abs(O.sin(J + 1)) | 0;
  L = L.MD5 = W.extend({ _doReset: function() {
    this._hash = new Y.init([1732584193, 4023233417, 2562383102, 271733878]);
  }, _doProcessBlock: function(G, T) {
    for (var I = 0;16 > I; I++) {
      var F = T + I, H = G[F];
      G[F] = (H << 8 | H >>> 24) & 16711935 | (H << 24 | H >>> 8) & 4278255360;
    }
    var I = this._hash.words, F = G[T + 0], H = G[T + 1], $ = G[T + 2], R = G[T + 3], z = G[T + 4], S = G[T + 5], y = G[T + 6], u = G[T + 7], m = G[T + 8], x = G[T + 9], C = G[T + 10], q = G[T + 11], f = G[T + 12], h = G[T + 13], D = G[T + 14], k = G[T + 15], U = I[0], A = I[1], E = I[2], B = I[3], U = K(U, A, E, B, F, 7, P[0]), B = K(B, U, A, E, H, 12, P[1]), E = K(E, B, U, A, $, 17, P[2]), A = K(A, E, B, U, R, 22, P[3]), U = K(U, A, E, B, z, 7, P[4]), B = K(B, U, A, E, S, 12, P[5]), E = K(E, B, U, A, y, 17, P[6]), A = K(A, E, B, U, u, 22, P[7]), U = K(U, A, E, B, m, 7, P[8]), B = K(B, U, A, E, x, 12, P[9]), E = K(E, B, U, A, C, 17, P[10]), A = K(A, E, B, U, q, 22, P[11]), U = K(U, A, E, B, f, 7, P[12]), B = K(B, U, A, E, h, 12, P[13]), E = K(E, B, U, A, D, 17, P[14]), A = K(A, E, B, U, k, 22, P[15]), U = V(U, A, E, B, H, 5, P[16]), B = V(B, U, A, E, y, 9, P[17]), E = V(E, B, U, A, q, 14, P[18]), A = V(A, E, B, U, F, 20, P[19]), U = V(U, A, E, B, S, 5, P[20]), B = V(B, U, A, E, C, 9, P[21]), E = V(E, B, U, A, k, 14, P[22]), A = V(A, E, B, U, z, 20, P[23]), U = V(U, A, E, B, x, 5, P[24]), B = V(B, U, A, E, D, 9, P[25]), E = V(E, B, U, A, R, 14, P[26]), A = V(A, E, B, U, m, 20, P[27]), U = V(U, A, E, B, h, 5, P[28]), B = V(B, U, A, E, $, 9, P[29]), E = V(E, B, U, A, u, 14, P[30]), A = V(A, E, B, U, f, 20, P[31]), U = Q(U, A, E, B, S, 4, P[32]), B = Q(B, U, A, E, m, 11, P[33]), E = Q(E, B, U, A, q, 16, P[34]), A = Q(A, E, B, U, D, 23, P[35]), U = Q(U, A, E, B, H, 4, P[36]), B = Q(B, U, A, E, z, 11, P[37]), E = Q(E, B, U, A, u, 16, P[38]), A = Q(A, E, B, U, C, 23, P[39]), U = Q(U, A, E, B, h, 4, P[40]), B = Q(B, U, A, E, F, 11, P[41]), E = Q(E, B, U, A, R, 16, P[42]), A = Q(A, E, B, U, y, 23, P[43]), U = Q(U, A, E, B, x, 4, P[44]), B = Q(B, U, A, E, f, 11, P[45]), E = Q(E, B, U, A, k, 16, P[46]), A = Q(A, E, B, U, $, 23, P[47]), U = Z(U, A, E, B, F, 6, P[48]), B = Z(B, U, A, E, u, 10, P[49]), E = Z(E, B, U, A, D, 15, P[50]), A = Z(A, E, B, U, S, 21, P[51]), U = Z(U, A, E, B, f, 6, P[52]), B = Z(B, U, A, E, R, 10, P[53]), E = Z(E, B, U, A, C, 15, P[54]), A = Z(A, E, B, U, H, 21, P[55]), U = Z(U, A, E, B, m, 6, P[56]), B = Z(B, U, A, E, k, 10, P[57]), E = Z(E, B, U, A, y, 15, P[58]), A = Z(A, E, B, U, h, 21, P[59]), U = Z(U, A, E, B, z, 6, P[60]), B = Z(B, U, A, E, q, 10, P[61]), E = Z(E, B, U, A, $, 15, P[62]), A = Z(A, E, B, U, x, 21, P[63]);
    I[0] = I[0] + U | 0, I[1] = I[1] + A | 0, I[2] = I[2] + E | 0, I[3] = I[3] + B | 0;
  }, _doFinalize: function() {
    var G = this._data, T = G.words, I = 8 * this._nDataBytes, F = 8 * G.sigBytes;
    T[F >>> 5] |= 128 << 24 - F % 32;
    var H = O.floor(I / 4294967296);
    T[(F + 64 >>> 9 << 4) + 15] = (H << 8 | H >>> 24) & 16711935 | (H << 24 | H >>> 8) & 4278255360, T[(F + 64 >>> 9 << 4) + 14] = (I << 8 | I >>> 24) & 16711935 | (I << 24 | I >>> 8) & 4278255360, G.sigBytes = 4 * (T.length + 1), this._process(), G = this._hash, T = G.words;
    for (I = 0;4 > I; I++)
      F = T[I], T[I] = (F << 8 | F >>> 24) & 16711935 | (F << 24 | F >>> 8) & 4278255360;
    return G;
  }, clone: function() {
    var G = W.clone.call(this);
    return G._hash = this._hash.clone(), G;
  } }), M.MD5 = W._createHelper(L), M.HmacMD5 = W._createHmacHelper(L);
})(Math);
(function() {
  var O = j, Q = O.lib, K = Q.Base, V = Q.WordArray, Q = O.algo, Z = Q.EvpKDF = K.extend({ cfg: K.extend({ keySize: 4, hasher: Q.MD5, iterations: 1 }), init: function(M) {
    this.cfg = this.cfg.extend(M);
  }, compute: function(M, Y) {
    for (var G = this.cfg, W = G.hasher.create(), L = V.create(), P = L.words, J = G.keySize, G = G.iterations;P.length < J; ) {
      T && W.update(T);
      var T = W.update(M).finalize(Y);
      W.reset();
      for (var I = 1;I < G; I++)
        T = W.finalize(T), W.reset();
      L.concat(T);
    }
    return L.sigBytes = 4 * J, L;
  } });
  O.EvpKDF = function(M, Y, W) {
    return Z.create(W).compute(M, Y);
  };
})();
j.lib.Cipher || function(O) {
  var I = j, K = I.lib, V = K.Base, Q = K.WordArray, Z = K.BufferedBlockAlgorithm, M = I.enc.Base64, Y = I.algo.EvpKDF, W = K.Cipher = Z.extend({ cfg: V.extend(), createEncryptor: function(H, $) {
    return this.create(this._ENC_XFORM_MODE, H, $);
  }, createDecryptor: function(H, $) {
    return this.create(this._DEC_XFORM_MODE, H, $);
  }, init: function(H, $, R) {
    this.cfg = this.cfg.extend(R), this._xformMode = H, this._key = $, this.reset();
  }, reset: function() {
    Z.reset.call(this), this._doReset();
  }, process: function(H) {
    return this._append(H), this._process();
  }, finalize: function(H) {
    return H && this._append(H), this._doFinalize();
  }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function(H) {
    return { encrypt: function($, R, z) {
      return (typeof R == "string" ? F : T).encrypt(H, $, R, z);
    }, decrypt: function($, R, z) {
      return (typeof R == "string" ? F : T).decrypt(H, $, R, z);
    } };
  } });
  K.StreamCipher = W.extend({ _doFinalize: function() {
    return this._process(true);
  }, blockSize: 1 });
  var G = I.mode = {}, L = function(H, $, R) {
    var z = this._iv;
    z ? this._iv = O : z = this._prevBlock;
    for (var S = 0;S < R; S++)
      H[$ + S] ^= z[S];
  }, P = (K.BlockCipherMode = V.extend({ createEncryptor: function(H, $) {
    return this.Encryptor.create(H, $);
  }, createDecryptor: function(H, $) {
    return this.Decryptor.create(H, $);
  }, init: function(H, $) {
    this._cipher = H, this._iv = $;
  } })).extend();
  P.Encryptor = P.extend({ processBlock: function(H, $) {
    var R = this._cipher, z = R.blockSize;
    L.call(this, H, $, z), R.encryptBlock(H, $), this._prevBlock = H.slice($, $ + z);
  } }), P.Decryptor = P.extend({ processBlock: function(H, $) {
    var R = this._cipher, z = R.blockSize, S = H.slice($, $ + z);
    R.decryptBlock(H, $), L.call(this, H, $, z), this._prevBlock = S;
  } }), G = G.CBC = P, P = (I.pad = {}).Pkcs7 = { pad: function(H, $) {
    for (var R = 4 * $, R = R - H.sigBytes % R, z = R << 24 | R << 16 | R << 8 | R, S = [], y = 0;y < R; y += 4)
      S.push(z);
    R = Q.create(S, R), H.concat(R);
  }, unpad: function(H) {
    H.sigBytes -= H.words[H.sigBytes - 1 >>> 2] & 255;
  } }, K.BlockCipher = W.extend({ cfg: W.cfg.extend({ mode: G, padding: P }), reset: function() {
    W.reset.call(this);
    var $ = this.cfg, H = $.iv, $ = $.mode;
    if (this._xformMode == this._ENC_XFORM_MODE)
      var R = $.createEncryptor;
    else
      R = $.createDecryptor, this._minBufferSize = 1;
    this._mode = R.call($, this, H && H.words);
  }, _doProcessBlock: function(H, $) {
    this._mode.processBlock(H, $);
  }, _doFinalize: function() {
    var H = this.cfg.padding;
    if (this._xformMode == this._ENC_XFORM_MODE) {
      H.pad(this._data, this.blockSize);
      var $ = this._process(true);
    } else
      $ = this._process(true), H.unpad($);
    return $;
  }, blockSize: 4 });
  var J = K.CipherParams = V.extend({ init: function(H) {
    this.mixIn(H);
  }, toString: function(H) {
    return (H || this.formatter).stringify(this);
  } }), G = (I.format = {}).OpenSSL = { stringify: function(H) {
    var $ = H.ciphertext;
    return H = H.salt, (H ? Q.create([1398893684, 1701076831]).concat(H).concat($) : $).toString(M);
  }, parse: function(H) {
    H = M.parse(H);
    var $ = H.words;
    if ($[0] == 1398893684 && $[1] == 1701076831) {
      var R = Q.create($.slice(2, 4));
      $.splice(0, 4), H.sigBytes -= 16;
    }
    return J.create({ ciphertext: H, salt: R });
  } }, T = K.SerializableCipher = V.extend({ cfg: V.extend({ format: G }), encrypt: function(H, $, R, z) {
    z = this.cfg.extend(z);
    var S = H.createEncryptor(R, z);
    return $ = S.finalize($), S = S.cfg, J.create({ ciphertext: $, key: R, iv: S.iv, algorithm: H, mode: S.mode, padding: S.padding, blockSize: H.blockSize, formatter: z.format });
  }, decrypt: function(H, $, R, z) {
    return z = this.cfg.extend(z), $ = this._parse($, z.format), H.createDecryptor(R, z).finalize($.ciphertext);
  }, _parse: function(H, $) {
    return typeof H == "string" ? $.parse(H, this) : H;
  } }), I = (I.kdf = {}).OpenSSL = { execute: function(H, $, R, z) {
    return z || (z = Q.random(8)), H = Y.create({ keySize: $ + R }).compute(H, z), R = Q.create(H.words.slice($), 4 * R), H.sigBytes = 4 * $, J.create({ key: H, iv: R, salt: z });
  } }, F = K.PasswordBasedCipher = T.extend({ cfg: T.cfg.extend({ kdf: I }), encrypt: function(H, $, R, z) {
    return z = this.cfg.extend(z), R = z.kdf.execute(R, H.keySize, H.ivSize), z.iv = R.iv, H = T.encrypt.call(this, H, $, R.key, z), H.mixIn(R), H;
  }, decrypt: function(H, $, R, z) {
    return z = this.cfg.extend(z), $ = this._parse($, z.format), R = z.kdf.execute(R, H.keySize, H.ivSize, $.salt), z.iv = R.iv, T.decrypt.call(this, H, $, R.key, z);
  } });
}();
(function() {
  for (var O = j, K = O.lib.BlockCipher, m = O.algo, V = [], Q = [], Z = [], M = [], Y = [], W = [], L = [], P = [], J = [], G = [], T = [], I = 0;256 > I; I++)
    T[I] = 128 > I ? I << 1 : I << 1 ^ 283;
  for (var F = 0, H = 0, I = 0;256 > I; I++) {
    var $ = H ^ H << 1 ^ H << 2 ^ H << 3 ^ H << 4, $ = $ >>> 8 ^ $ & 255 ^ 99;
    V[F] = $, Q[$] = F;
    var R = T[F], z = T[R], S = T[z], y = 257 * T[$] ^ 16843008 * $;
    Z[F] = y << 24 | y >>> 8, M[F] = y << 16 | y >>> 16, Y[F] = y << 8 | y >>> 24, W[F] = y, y = 16843009 * S ^ 65537 * z ^ 257 * R ^ 16843008 * F, L[$] = y << 24 | y >>> 8, P[$] = y << 16 | y >>> 16, J[$] = y << 8 | y >>> 24, G[$] = y, F ? (F = R ^ T[T[T[S ^ R]]], H ^= T[T[H]]) : F = H = 1;
  }
  var u = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], m = m.AES = K.extend({ _doReset: function() {
    for (var q = this._key, x = q.words, C = q.sigBytes / 4, q = 4 * ((this._nRounds = C + 6) + 1), f = this._keySchedule = [], h = 0;h < q; h++)
      if (h < C)
        f[h] = x[h];
      else {
        var D = f[h - 1];
        h % C ? 6 < C && h % C == 4 && (D = V[D >>> 24] << 24 | V[D >>> 16 & 255] << 16 | V[D >>> 8 & 255] << 8 | V[D & 255]) : (D = D << 8 | D >>> 24, D = V[D >>> 24] << 24 | V[D >>> 16 & 255] << 16 | V[D >>> 8 & 255] << 8 | V[D & 255], D ^= u[h / C | 0] << 24), f[h] = f[h - C] ^ D;
      }
    x = this._invKeySchedule = [];
    for (C = 0;C < q; C++)
      h = q - C, D = C % 4 ? f[h] : f[h - 4], x[C] = 4 > C || 4 >= h ? D : L[V[D >>> 24]] ^ P[V[D >>> 16 & 255]] ^ J[V[D >>> 8 & 255]] ^ G[V[D & 255]];
  }, encryptBlock: function(x, C) {
    this._doCryptBlock(x, C, this._keySchedule, Z, M, Y, W, V);
  }, decryptBlock: function(x, C) {
    var q = x[C + 1];
    x[C + 1] = x[C + 3], x[C + 3] = q, this._doCryptBlock(x, C, this._invKeySchedule, L, P, J, G, Q), q = x[C + 1], x[C + 1] = x[C + 3], x[C + 3] = q;
  }, _doCryptBlock: function(x, C, q, f, h, D, k, U) {
    for (var B = this._nRounds, w = x[C] ^ q[0], p = x[C + 1] ^ q[1], g = x[C + 2] ^ q[2], N = x[C + 3] ^ q[3], E = 4, A = 1;A < B; A++)
      var v = f[w >>> 24] ^ h[p >>> 16 & 255] ^ D[g >>> 8 & 255] ^ k[N & 255] ^ q[E++], s = f[p >>> 24] ^ h[g >>> 16 & 255] ^ D[N >>> 8 & 255] ^ k[w & 255] ^ q[E++], t = f[g >>> 24] ^ h[N >>> 16 & 255] ^ D[w >>> 8 & 255] ^ k[p & 255] ^ q[E++], N = f[N >>> 24] ^ h[w >>> 16 & 255] ^ D[p >>> 8 & 255] ^ k[g & 255] ^ q[E++], w = v, p = s, g = t;
    v = (U[w >>> 24] << 24 | U[p >>> 16 & 255] << 16 | U[g >>> 8 & 255] << 8 | U[N & 255]) ^ q[E++], s = (U[p >>> 24] << 24 | U[g >>> 16 & 255] << 16 | U[N >>> 8 & 255] << 8 | U[w & 255]) ^ q[E++], t = (U[g >>> 24] << 24 | U[N >>> 16 & 255] << 16 | U[w >>> 8 & 255] << 8 | U[p & 255]) ^ q[E++], N = (U[N >>> 24] << 24 | U[w >>> 16 & 255] << 16 | U[p >>> 8 & 255] << 8 | U[g & 255]) ^ q[E++], x[C] = v, x[C + 1] = s, x[C + 2] = t, x[C + 3] = N;
  }, keySize: 8 });
  O.AES = K._createHelper(m);
})();
var c = { game: "Divine Techno Run", url: "https://www.newgrounds.com/portal/view/628667", key: "34685:cxZQ5a1E", skey: "aBuRcFJLqDmPe3Gb0uultA==" };

class b {
  #K;
  config;
  #Y = {};
  #O;
  #Q;
  #P;
  #V;
  #X;
  #$ = new Set;
  #H = new Set;
  #I = new Set;
  audio;
  audioOut;
  gameUrl;
  static async validateSession(O, K = c) {
    const V = new X.io.core(K.key, K.skey);
    return V.session_id = O, new Promise((Q) => {
      V.callComponent("App.checkSession", {}, (Z) => {
        Q(Z?.success ? Z.session?.user?.name : undefined);
      });
    });
  }
  validateSession(O) {
    return b.validateSession(O, this.config);
  }
  addLoginListener(O) {
    this.#$.add(O);
  }
  addLogoutListener(O) {
    this.#H.add(O);
  }
  addUnlockListener(O) {
    this.#I.add(O);
  }
  removeLoginListener(O) {
    this.#$.delete(O);
  }
  removeLogoutListener(O) {
    this.#H.delete(O);
  }
  removeUnlockListener(O) {
    this.#I.delete(O);
  }
  constructor(O = c) {
    this.config = O, this.#K = new X.io.core(O.key, O.skey), this.#P = O.debug, this.initSession(), this.audio = O.noAudio ? undefined : new Audio(O.audioIn ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound.ogg"), this.audioOut = O.noAudio ? undefined : new Audio(O.audioOut ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound-out.ogg"), this.gameUrl = O.url;
  }
  get key() {
    return this.config.key;
  }
  get loggedIn() {
    return !!this.#K.user;
  }
  get icons() {
    return this.#K.user?.icons;
  }
  get user() {
    return this.#K.user?.name;
  }
  get session() {
    return this.#K.session_id;
  }
  async getScoreboards() {
    return new Promise((O) => {
      if (this.#V)
        O?.(this.#V);
      else if (this.#X)
        this.#X.push(O);
      else
        this.#X = [O], this.#K.callComponent("ScoreBoard.getBoards", {}, (K) => {
          if (K.success) {
            this.#V = K.scoreboards;
            const V = {};
            this.#V.forEach((Q) => V[Q.id] = Q.name), this.#X?.forEach((Q) => Q?.(this.#V ?? [])), this.#X = undefined;
          }
        });
    });
  }
  async getMedals() {
    return new Promise((O) => {
      if (this.#O)
        O(this.#O);
      else if (this.#Q)
        this.#Q.push(O);
      else
        this.#Q = [O], this.#K.callComponent("Medal.getList", {}, (K) => {
          if (K.success) {
            this.#O = K.medals;
            const V = "font-weight: bold;";
            console.log("%c Unlocked:", V, this.#O?.filter(({ unlocked: Q }) => Q).map(({ name: Q }) => Q).join(", ")), console.log("%c Locked:", V, this.#O?.filter(({ unlocked: Q }) => !Q).map(({ name: Q }) => Q).join(", ")), this.#Q?.forEach((Q) => Q?.(this.#O ?? [])), this.#Q = undefined;
          }
        });
    });
  }
  async unlockMedal(O) {
    if (!this.#K.user)
      return;
    console.log("unlocking", O, "for", this.#K.user.name);
    const K = await this.getMedals(), V = K.filter((Q) => Q.name === O)[0];
    if (V)
      return new Promise((Q) => {
        if (!V.unlocked && !this.#Y[V.id])
          this.#K.callComponent("Medal.unlock", { id: V.id }, (Z) => {
            const M = Z.medal;
            if (M) {
              for (let Y = 0;Y < K.length; Y++)
                if (K[Y].id === M.id)
                  K[Y] = M;
              this.#Y[M.id] = true, this.#I.forEach((Y) => Y(M)), this.showReceivedMedal(M), Q(Z.medal);
            }
          });
        else
          Q(V);
      });
    else
      console.warn(`Medal doesn't exist: ${O}`);
  }
  requestLogin() {
    this.#K.requestLogin(() => this.onLoggedIn(), () => this.onLoginFailed(), () => this.onLoginCancelled());
    const O = document.getElementById("newgrounds-login");
    if (O)
      O.style.display = "none";
  }
  requestLogout() {
    console.log(`Logging out ${this.#K.user?.name}...`), this.#K.logOut(() => {
      this.#H.forEach((O) => O());
    });
  }
  onLoginFailed() {
    console.log("There was a problem logging in: ", this.#K.login_error?.message);
    const O = document.getElementById("newgrounds-login");
    if (O)
      O.style.display = "";
  }
  onLoginCancelled() {
    console.log("The user cancelled the login.");
    const O = document.getElementById("newgrounds-login");
    if (O)
      O.style.display = "";
  }
  initSession() {
    this.#K.getValidSession(() => {
      this.validateSession(this.#K.session_id);
      const O = !this.#P ? undefined : document.body.appendChild(document.createElement("button"));
      if (O)
        O.id = "newgrounds-login", O.style.position = "absolute", O.style.top = "5px", O.style.right = "5px", O.style.height = "24px", O.style.fontSize = "10pt", O.style.zIndex = "1000", O.classList.add("button"), O.innerText = "login newgrounds", O.addEventListener("click", (K) => {
          this.requestLogin(), K.stopPropagation();
        });
      if (this.#K.user)
        O?.parentElement?.removeChild(O), this.onLoggedIn();
    });
  }
  onLoggedIn() {
    console.log("Welcome ", this.#K.user?.name + "!"), this.#$.forEach((O) => O()), this.getMedals(), this.getScoreboards();
  }
  #M;
  #W() {
    if (!this.#M) {
      const O = document.body.appendChild(document.createElement("div"));
      O.style.display = "none", O.style.position = "absolute", O.style.right = "10px", O.style.top = "10px", O.style.padding = "5px 10px", O.style.border = "2px solid #880", O.style.borderRadius = "5px", O.style.background = "linear-gradient(#884, #553)", O.style.boxShadow = "2px 2px black", O.style.flexDirection = "row", O.style.transition = "opacity .5s, margin-right .3s", O.style.opacity = "0", O.style.marginRight = "-300px", O.style.zIndex = "3000", O.style.fontFamily = "Papyrus, fantasy", this.#M = O;
    }
    return this.#M;
  }
  #Z;
  showReceivedMedal(O) {
    clearTimeout(this.#Z);
    const K = this.#W();
    K.style.display = "flex", K.innerText = "";
    const V = K.appendChild(document.createElement("img"));
    V.addEventListener("load", () => {
      if (K.style.display = "flex", K.style.opacity = "1", K.style.marginRight = "0", !globalThis.mute)
        this.audio?.play();
      this.#Z = setTimeout(() => {
        if (!globalThis.mute)
          this.audioOut?.play();
        K.style.opacity = "0", this.#Z = setTimeout(() => {
          K.style.display = "none", K.style.marginRight = "-300px", this.#Z = undefined;
        }, 1000);
      }, 5000);
    }), V.style.width = "50px", V.style.height = "50px", V.style.backgroundColor = "black", V.style.borderRadius = "3px", V.src = O.icon;
    const Q = K.appendChild(document.createElement("div"));
    Q.style.marginLeft = "10px";
    const Z = Q.appendChild(document.createElement("div"));
    Z.style.fontWeight = "bold", Z.style.fontSize = "12pt", Z.style.color = "gold", Z.style.margin = "5px", Z.innerText = `\uD83C\uDFC6 ${O.name}`;
    const M = Q.appendChild(document.createElement("div"));
    M.style.fontSize = "10pt", M.style.color = "silver", M.innerText = O.description;
  }
  async postScore(O, K) {
    const V = await this.getScoreboards(), Q = K ? V.find((Z) => Z.name === K) : V[0];
    if (Q)
      return new Promise((Z) => {
        this.#K.callComponent("ScoreBoard.postScore", { id: Q.id, value: O }, (M) => {
          Z(M.success);
        });
      });
  }
  async logView() {
    this.#K.callComponent("App.logView", { host: location.host }, (O) => {
      console.log(O);
    });
  }
  async logEvent(O) {
    this.#K.callComponent("Event.logEvent", { event_name: O, host: location.host }, (K) => {
      console.log(K);
    });
  }
}
export {
  b as Newgrounds
};
