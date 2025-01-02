// ../dist/index.js
var $ = {};
$.io = { GATEWAY_URI: "//newgrounds.io/gateway_v3.php" };
$.io.events = {};
$.io.call_validators = {};
$.io.model = { checkStrictValue: function(Q, K, Z, X, H, Y, O) {
  if (X == "mixed")
    return true;
  if (Z === null || typeof Z == "undefined")
    return true;
  if (X && Z.constructor === X)
    return true;
  if (X == Boolean && Z.constructor === Number)
    return true;
  if (H && Z.constructor === $.io.model[H])
    return true;
  if (Z.constructor === Array && (Y || O)) {
    for (var I = 0;I < Z.length; I++)
      this.checkStrictValue(Q, K, Z[I], Y, O, null, null);
    return true;
  }
  if (Q)
    throw new Error("Illegal '" + K + "' value set in model " + Q);
  return false;
} };
$.io.events.OutputEvent = function(Q, K, Z) {
  this.type = Q, this.call = K, this.data = Z, this.success = Z && typeof (Z.success != "undefined") ? Z.success ? true : false : false, this.preventDefault = false;
};
$.io.events.OutputEvent.prototype.constructor = $.io.events.OutputEvent;
$.io.events.SessionEvent = function(Q) {
  this.type = Q, this.user = null, this.passport_url = null;
};
$.io.events.SessionEvent.USER_LOADED = "user-loaded";
$.io.events.SessionEvent.SESSION_EXPIRED = "session-expired";
$.io.events.SessionEvent.REQUEST_LOGIN = "request-login";
$.io.events.SessionEvent.prototype.constructor = $.io.events.SessionEvent;
$.io.events.EventDispatcher = function() {
};
$.io.events.EventDispatcher.prototype = { _event_listeners: {}, addEventListener: function(Q, K) {
  if (Q.constructor !== String)
    throw new Error("Event names must be a string format.");
  if (K.constructor !== Function)
    throw new Error("Event listeners must be functions.");
  if (typeof this._event_listeners[Q] == "undefined")
    this._event_listeners[Q] = [];
  this._event_listeners[Q].push(K);
}, removeEventListener: function(Q, K) {
  if (typeof this._event_listeners[Q] == "undefined")
    return;
  var Z = -1;
  for (let X = 0;X < this._event_listeners[Q].length; X++)
    if (this._event_listeners[Q][X] === K) {
      Z = X;
      break;
    }
  if (Z >= 0)
    return this._event_listeners[Q].splice(Z, 1), true;
  return false;
}, removeAllEventListeners: function(Q) {
  if (typeof this._event_listeners[Q] == "undefined")
    return 0;
  var K = this._event_listeners[Q].length;
  return this._event_listeners[Q] = [], K;
}, dispatchEvent: function(Q) {
  var K = false, Z;
  for (var X in $.io.events)
    if (Q.constructor === $.io.events[X]) {
      K = true;
      break;
    }
  if (!K)
    throw new Error("Unsupported event object");
  if (typeof this._event_listeners[Q.type] == "undefined")
    return false;
  for (var H = 0;H < this._event_listeners[Q.type].length; H++)
    if (Z = this._event_listeners[Q.type][H], Z(Q) === false || Q.preventDefault)
      return true;
  return true;
} };
$.io.events.EventDispatcher.prototype.constructor = $.io.events.EventDispatcher;
$.io.core = function(Q, K) {
  var Z, X, H, Y, O = this, I, T = new $.io.urlHelper;
  if (T.getRequestQueryParam("ngio_session_id"))
    X = T.getRequestQueryParam("ngio_session_id");
  if (Object.defineProperty(this, "app_id", { get: function() {
    return Z;
  } }), Object.defineProperty(this, "user", { get: function() {
    return this.getCurrentUser();
  } }), Object.defineProperty(this, "session_id", { set: function(M) {
    if (M && typeof M != "string")
      throw new Error("'session_id' must be a string value.");
    X = M ? M : null;
  }, get: function() {
    return X ? X : null;
  } }), Object.defineProperty(this, "debug", { set: function(M) {
    Y = M ? true : false;
  }, get: function() {
    return Y;
  } }), !Q)
    throw new Error("Missing required 'app_id' in Newgrounds.io.core constructor");
  if (typeof Q != "string")
    throw new Error("'app_id' must be a string value in Newgrounds.io.core constructor");
  if (Z = Q, K)
    I = j.enc.Base64.parse(K);
  else
    console.warn("You did not set an encryption key. Some calls may not work without this.");
  var W = "Newgrounds-io-app_session-" + Z.split(":").join("-");
  function z() {
    if (typeof localStorage != "undefined" && localStorage && localStorage.getItem.constructor == Function)
      return true;
    return false;
  }
  let E = {};
  function J() {
    if (z())
      return localStorage;
    return { getItem(M) {
      return E[M];
    }, setItem(M, R) {
      E[M] = R;
    }, removeItem(M) {
      delete E[M];
    } };
  }
  function V() {
    var R = J().getItem(W);
    return R ? R : null;
  }
  function A(M) {
    J().setItem(W, M);
  }
  function P() {
    J().removeItem(W);
  }
  if (!X && V())
    X = V();
  this.addEventListener("App.endSession", function(M) {
    O.session_id = null, P();
  }), this.addEventListener("App.startSession", function(M) {
    if (M.success)
      O.session_id = M.data.session.id;
  }), this.addEventListener("App.checkSession", (M) => {
    if (M.success) {
      if (M.data.session.expired)
        P(), this.session_id = null;
      else if (M.data.session.remember)
        A(M.data.session.id);
    } else
      this.session_id = null, P();
  }), this._encryptCall = function(M) {
    if (!M || !M.constructor == $.io.model.call_model)
      throw new Error("Attempted to encrypt a non 'call' object");
    var R = j.lib.WordArray.random(16), L = j.AES.encrypt(JSON.stringify(M.toObject()), I, { iv: R }), S = j.enc.Base64.stringify(R.concat(L.ciphertext));
    return M.secure = S, M.parameters = null, M;
  };
};
$.io.core.prototype = { _session_loader: null, _call_queue: [], _event_listeners: {}, addEventListener: $.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: $.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: $.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: $.io.events.EventDispatcher.prototype.dispatchEvent, getSessionLoader: function() {
  if (this._session_loader == null)
    this._session_loader = new $.io.SessionLoader(this);
  return this._session_loader;
}, getSession: function() {
  return this.getSessionLoader().session;
}, getCurrentUser: function() {
  var Q = this.getSessionLoader();
  if (Q.session)
    return Q.session.user;
  return null;
}, getLoginError: function() {
  return this.getSessionLoader().last_error;
}, getValidSession: function(Q, K) {
  this.getSessionLoader().getValidSession(Q, K);
}, requestLogin: function(Q, K, Z, X) {
  if (!Q || Q.constructor !== Function)
    throw "Missing required callback for 'on_logged_in'.";
  if (!K || K.constructor !== Function)
    throw "Missing required callback for 'on_login_failed'.";
  var H = this, Y = this.getSessionLoader(), O;
  function I() {
    if (O)
      clearInterval(O);
    H.removeEventListener("cancelLoginRequest", T), Y.closePassport();
  }
  function T() {
    Z && Z.constructor === Function ? Z.call(X) : K.call(X), I();
  }
  if (H.addEventListener("cancelLoginRequest", T), H.getCurrentUser())
    Q.call(X);
  else
    Y.loadPassport(), O = setInterval(function() {
      Y.checkSession(function(W) {
        if (!W || W.expired)
          if (Y.last_error.code == 111)
            T();
          else
            I(), K.call(X);
        else if (W.user)
          I(), Q.call(X);
      });
    }, 3000);
}, cancelLoginRequest: function() {
  event = new $.io.events.OutputEvent("cancelLoginRequest", null, null), this.dispatchEvent(event);
}, logOut: function(Q, K) {
  this.getSessionLoader().endSession(Q, K);
}, queueComponent: function(Q, K, Z, X) {
  if (K && K.constructor === Function && !Z)
    Z = K, K = null;
  var H = new $.io.model.call(this);
  if (H.component = Q, typeof K != "undefined")
    H.parameters = K;
  this._validateCall(H), this._call_queue.push([H, Z, X]);
}, executeQueue: function() {
  var Q = [], K = [], Z = [];
  for (var X = 0;X < this._call_queue.length; X++)
    Q.push(this._call_queue[X][0]), K.push(this._call_queue[X][1]), Z.push(this._call_queue[X][2]);
  this._doCall(Q, K, Z), this._call_queue = [];
}, callComponent: function(Q, K, Z, X) {
  if (K.constructor === Function && !Z)
    Z = K, K = null;
  var H = new $.io.model.call(this);
  if (H.component = Q, typeof K != "undefined")
    H.parameters = K;
  this._validateCall(H), this._doCall(H, Z, X);
}, _doCallback: function(Q, K, Z, X) {
  var H, Y, O, I, T, W = { success: false, error: { code: 0, message: "Unexpected Server Response" } };
  if (typeof Z == "undefined")
    Z = null;
  if (Q.constructor === Array && K && K.constructor === Array) {
    for (H = 0;H < Q.length; H++)
      Y = !Z || typeof Z[H] == "undefined" ? W : Z[H], O = typeof K[H] == "undefined" ? null : K[H], this._doCallback(Q[H], O, Y, X[H]);
    return;
  }
  if (Z && typeof Z.data != "undefined") {
    var z;
    if (Z.data.constructor === Array) {
      z = [];
      for (H = 0;H < Z.data.length; H++)
        z.push(this._formatResults(Z.component, Z.data[H]));
    } else
      z = this._formatResults(Z.component, Z.data);
    Z.data = z;
  }
  var E;
  if (Z)
    if (typeof Z.data != "undefined")
      E = Z.data;
    else
      console.warn("Received empty data from '" + Q.component + "'."), E = null;
  else
    E = W;
  var J;
  if (E.constructor === Array)
    for (H = 0;H < E.length; H++)
      J = new $.io.events.OutputEvent(Q.component, Q[H], E[H]), this.dispatchEvent(J);
  else
    J = new $.io.events.OutputEvent(Q.component, Q, E), this.dispatchEvent(J);
  if (K && K.constructor === Function)
    K.call(X, E);
}, _formatResults: function(Q, K) {
  var Z, X, H, Y, O, I = null;
  if (typeof K.success != "undefined" && K.success)
    I = $.io.call_validators.getValidator(Q);
  if (!I)
    return K;
  var T = I.returns;
  for (X in T) {
    if (typeof K[X] == "undefined" && K.success !== false) {
      console.warn("Newgrounds.io server failed to return expected '" + X + "' in '" + Q + "' data.");
      continue;
    }
    if (typeof T[X].array != "undefined") {
      if (typeof T[X].array.object != "undefined")
        O = T[X].array.object;
      else
        O = T[X].array;
      if (typeof $.io.model[O] == "undefined") {
        console.warn("Received unsupported model '" + O + "' from '" + Q + "'.");
        continue;
      }
      if (K[X].constructor !== Array) {
        console.warn("Expected array<" + O + "> value for '" + X + "' in '" + Q + "' data, got " + typeof K[X]);
        continue;
      }
      Y = [];
      for (H = 0;H < K[X].length; H++)
        Z = new $.io.model[O](this), Z.fromObject(K[X][H]), Y.push(Z);
      K[X] = Y;
    } else if (typeof T[X].object != "undefined" && K[X]) {
      if (O = T[X].object, typeof $.io.model[O] == "undefined") {
        console.warn("Received unsupported model '" + O + "' from '" + Q + "'.");
        continue;
      }
      Z = new $.io.model[O](this), Z.fromObject(K[X]), K[X] = Z;
    }
  }
  return K;
}, _doCall: function(Q, K, Z) {
  if (!this.app_id)
    throw new Error("Attempted to call Newgrounds.io server without setting an app_id in Newgrounds.io.core instance.");
  var X, H = false, Y = this;
  function O(E) {
    var J = $.io.call_validators.getValidator(E.component);
    if (J.hasOwnProperty("redirect") && J.redirect) {
      var V = E.parameters;
      if (!V || !V.hasOwnProperty("redirect") || V.redirect)
        return true;
    }
    return false;
  }
  if (Q.constructor === Array) {
    X = [];
    for (i = 0;i < Q.length; i++) {
      if (O(Q[i]))
        throw new Error("Loader components can not be called in an array without a redirect=false parameter.");
      X.push(Q[i].toObject());
    }
  } else
    X = Q.toObject(), H = O(Q);
  var I = { app_id: this.app_id, session_id: this.session_id, call: X };
  if (this.debug)
    I.debug = 1;
  if (H) {
    var T = { success: true, app_id: this.app_id, result: { component: Q.component, data: { success: true } } }, W = document.createElement("form");
    W.action = $.io.GATEWAY_URI, W.target = "_blank", W.method = "POST";
    var z = document.createElement("input");
    z.type = "hidden", z.name = "input", W.appendChild(z), document.body.appendChild(W), z.value = JSON.stringify(I), W.submit(), document.body.removeChild(W);
  } else {
    let E = this, J = $.io.GATEWAY_URI.startsWith("//") ? "https:" + $.io.GATEWAY_URI : $.io.GATEWAY_URI, V = new FormData;
    V.append("input", JSON.stringify(I)), fetch(J, { method: "POST", body: V }).then((A) => A.json()).then((A) => {
      E._doCallback(Q, K, A.result, Z);
    });
  }
}, _doValidateCall: function(Q, K) {
  var Z, X, H, Y, O = $.io.call_validators.getValidator(Q);
  if (!O)
    throw new Error("'" + Q + "' is not a valid server component.");
  if (O.require_session && !this.session_id)
    throw new Error("'" + Q + "' requires a session id");
  if (O.import && O.import.length > 0)
    for (Z = 0;Z < O.import.length; Z++)
      X = O.import[Z].split("."), this._doValidateCall(X[0], X[1], K);
  var I;
  for (H in O.params) {
    if (Y = O.params[H], I = K && typeof K[H] != "undefined" ? K[H] : null, !I && Y.extract_from && Y.extract_from.alias)
      I = K[Y.extract_from.alias];
    if (I === null) {
      if (Y.required)
        throw new Error("Missing required parameter for '" + Q + "': " + H);
      continue;
    }
    if (Y.extract_from && I.constructor === $.io.model[Y.extract_from.object])
      I = I[Y.extract_from.property];
    if (!$.io.model.checkStrictValue(null, H, I, Y.type, null, null, null))
      throw new Error("Illegal value for '" + H + "' parameter of '" + Q + "': " + I);
  }
}, _validateCall: function(Q) {
  var K;
  if (Q.constructor === Array) {
    var Z = [];
    for (K = 0;K < Q.length; K++)
      Z.push(this._validateCall(Q[K]));
    return Z;
  } else if (Q.constructor !== $.io.model.call)
    throw new Error("Unexpected 'call_model' value. Expected Newgrounds.io.model.call instance.");
  var { component: X, parameters: H, echo: Y } = Q;
  if (H && H.constructor === Array)
    for (K = 0;K < H.length; K++)
      this._doValidateCall(X, H[K]);
  else
    this._doValidateCall(X, H);
  var O = { component: Q.component }, I = $.io.call_validators.getValidator(Q.component);
  if (typeof H != "undefined")
    if (I.secure) {
      var T = this._encryptCall(Q);
      O.secure = T.secure;
    } else
      O.parameters = H;
  if (typeof Y != "undefined")
    O.echo = Y;
  return O;
} };
$.io.core.prototype.constructor = $.io.core;
$.io.core.instance_id = 0;
$.io.core.getNextInstanceID = function() {
  return $.io.core.instance_id++, $.io.core.instance_id;
};
$.io.urlHelper = function() {
  var Q = globalThis.location?.href, K = {}, Z = Q?.split("?").pop();
  if (Z) {
    var X = Z.split("&"), H;
    for (var Y = 0;Y < X.length; Y++)
      H = X[Y].split("="), K[H[0]] = H[1];
  }
  this.getRequestQueryParam = function(O, I) {
    if (typeof I == "undefined")
      I = null;
    return typeof K[O] == "undefined" ? I : K[O];
  };
};
$.io.model.call = function(Q, K) {
  var Z, X, H, Y;
  this.__property_names = ["component", "echo", "parameters", "secure"], this.__classname = "Newgrounds.io.model.call", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "component", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "component", O, String, null, null, null), Z = O;
  } });
  var X;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(O) {
    X = O;
  } });
  var H;
  Object.defineProperty(this, "parameters", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "parameters", O, Object, null, Object, null), H = O;
  } });
  var Y;
  if (Object.defineProperty(this, "secure", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "secure", O, String, null, null, null), Y = O;
  } }), K)
    this.fromObject(K);
};
$.io.model.call.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.call.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.call.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.call.prototype.constructor = $.io.model.call;
$.io.model.debug = function(Q, K) {
  var Z, X;
  this.__property_names = ["exec_time", "input"], this.__classname = "Newgrounds.io.model.debug", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "exec_time", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "exec_time", H, String, null, null, null), Z = H;
  } });
  var X;
  if (Object.defineProperty(this, "input", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "input", H, null, "input", null, null), X = H;
  } }), K)
    this.fromObject(K);
};
$.io.model.debug.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.debug.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.debug.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "input" && K)
      K = new $.io.model.input(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.debug.prototype.constructor = $.io.model.debug;
$.io.model.error = function(Q, K) {
  var Z, X;
  this.__property_names = ["code", "message"], this.__classname = "Newgrounds.io.model.error", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "code", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "code", H, Number, null, null, null), Z = H;
  } });
  var X;
  if (Object.defineProperty(this, "message", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "message", H, String, null, null, null), X = H;
  } }), K)
    this.fromObject(K);
};
$.io.model.error.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.error.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.error.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.error.get = function(Q, K) {
  var Z = new $.io.model.error;
  return Z.message = Q ? Q : "Unknown Error", Z.code = K ? K : 0, Z;
};
$.io.model.error.MISSING_INPUT = 100;
$.io.model.error.INVALID_INPUT = 101;
$.io.model.error.MISSING_PARAMETER = 102;
$.io.model.error.INVALID_PARAMETER = 103;
$.io.model.error.EXPIRED_SESSION = 104;
$.io.model.error.DUPLICATE_SESSION = 105;
$.io.model.error.MAX_CONNECTIONS_EXCEEDED = 106;
$.io.model.error.MAX_CALLS_EXCEEDED = 107;
$.io.model.error.MEMORY_EXCEEDED = 108;
$.io.model.error.TIMED_OUT = 109;
$.io.model.error.LOGIN_REQUIRED = 110;
$.io.model.error.INVALID_APP_ID = 200;
$.io.model.error.INVALID_ENCRYPTION = 201;
$.io.model.error.INVALID_MEDAL_ID = 202;
$.io.model.error.INVALID_SCOREBOARD_ID = 203;
$.io.model.error.INVALID_SAVEGROUP_ID = 204;
$.io.model.error.SERVER_UNAVAILABLE = 504;
$.io.model.error.prototype.constructor = $.io.model.error;
$.io.model.input = function(Q, K) {
  var Z, X, H, Y, O;
  this.__property_names = ["app_id", "call", "debug", "echo", "session_id"], this.__classname = "Newgrounds.io.model.input", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "app_id", I, String, null, null, null), Z = I;
  } });
  var X;
  Object.defineProperty(this, "call", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "call", I, null, "call", null, "call"), X = I;
  } });
  var H;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "debug", I, Boolean, null, null, null), H = I;
  } });
  var Y;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(I) {
    Y = I;
  } });
  var O;
  if (Object.defineProperty(this, "session_id", { get: function() {
    return typeof O == "undefined" ? null : O;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "session_id", I, String, null, null, null), O = I;
  } }), K)
    this.fromObject(K);
};
$.io.model.input.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.input.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.input.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "call" && K)
      K = new $.io.model.call(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.input.prototype.constructor = $.io.model.input;
$.io.model.medal = function(Q, K) {
  var Z, X, H, Y, O, I, T, W;
  this.__property_names = ["description", "difficulty", "icon", "id", "name", "secret", "unlocked", "value"], this.__classname = "Newgrounds.io.model.medal", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "description", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "description", z, String, null, null, null), Z = z;
  } });
  var X;
  Object.defineProperty(this, "difficulty", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "difficulty", z, Number, null, null, null), X = z;
  } });
  var H;
  Object.defineProperty(this, "icon", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "icon", z, String, null, null, null), H = z;
  } });
  var Y;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "id", z, Number, null, null, null), Y = z;
  } });
  var O;
  Object.defineProperty(this, "name", { get: function() {
    return typeof O == "undefined" ? null : O;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "name", z, String, null, null, null), O = z;
  } });
  var I;
  Object.defineProperty(this, "secret", { get: function() {
    return typeof I == "undefined" ? null : I;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "secret", z, Boolean, null, null, null), I = z;
  } });
  var T;
  Object.defineProperty(this, "unlocked", { get: function() {
    return typeof T == "undefined" ? null : T;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "unlocked", z, Boolean, null, null, null), T = z;
  } });
  var W;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof W == "undefined" ? null : W;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "value", z, Number, null, null, null), W = z;
  } }), K)
    this.fromObject(K);
};
$.io.model.medal.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.medal.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.medal.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.medal.prototype.unlock = function(Q) {
  var K = this;
  if (this._has_ngio_user())
    this.__ngio.callComponent("Medal.unlock", { id: this.id }, function(H) {
      if (H.success)
        this.unlocked = true;
      Q(H);
    });
  else if (typeof Q == "function") {
    var Z = $.io.model.error.get("This function requires a valid user session.", $.io.model.error.LOGIN_REQUIRED), X = { success: false, error: Z };
    Q(X);
  }
};
$.io.model.medal.prototype.constructor = $.io.model.medal;
$.io.model.output = function(Q, K) {
  var Z, X, H, Y, O, I, T, W;
  this.__property_names = ["api_version", "app_id", "debug", "echo", "error", "help_url", "result", "success"], this.__classname = "Newgrounds.io.model.output", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "api_version", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "api_version", z, String, null, null, null), Z = z;
  } });
  var X;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "app_id", z, String, null, null, null), X = z;
  } });
  var H;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "debug", z, null, "debug", null, null), H = z;
  } });
  var Y;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(z) {
    Y = z;
  } });
  var O;
  Object.defineProperty(this, "error", { get: function() {
    return typeof O == "undefined" ? null : O;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "error", z, null, "error", null, null), O = z;
  } });
  var I;
  Object.defineProperty(this, "help_url", { get: function() {
    return typeof I == "undefined" ? null : I;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "help_url", z, String, null, null, null), I = z;
  } });
  var T;
  Object.defineProperty(this, "result", { get: function() {
    return typeof T == "undefined" ? null : T;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "result", z, null, "result", null, "result"), T = z;
  } });
  var W;
  if (Object.defineProperty(this, "success", { get: function() {
    return typeof W == "undefined" ? null : W;
  }, set: function(z) {
    $.io.model.checkStrictValue(this.__classname, "success", z, Boolean, null, null, null), W = z;
  } }), K)
    this.fromObject(K);
};
$.io.model.output.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.output.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.output.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "debug" && K)
      K = new $.io.model.debug(this.__ngio, K);
    else if (this.__property_names[X] == "error" && K)
      K = new $.io.model.error(this.__ngio, K);
    else if (this.__property_names[X] == "result" && K)
      K = new $.io.model.result(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.output.prototype.constructor = $.io.model.output;
$.io.model.result = function(Q, K) {
  var Z, X, H;
  this.__property_names = ["component", "data", "echo"], this.__classname = "Newgrounds.io.model.result", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "component", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(Y) {
    $.io.model.checkStrictValue(this.__classname, "component", Y, String, null, null, null), Z = Y;
  } });
  var X;
  Object.defineProperty(this, "data", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(Y) {
    $.io.model.checkStrictValue(this.__classname, "data", Y, Object, null, Object, null), X = Y;
  } });
  var H;
  if (Object.defineProperty(this, "echo", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(Y) {
    H = Y;
  } }), K)
    this.fromObject(K);
};
$.io.model.result.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.result.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.result.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.result.prototype.constructor = $.io.model.result;
$.io.model.score = function(Q, K) {
  var Z, X, H, Y;
  this.__property_names = ["formatted_value", "tag", "user", "value"], this.__classname = "Newgrounds.io.model.score", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "formatted_value", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "formatted_value", O, String, null, null, null), Z = O;
  } });
  var X;
  Object.defineProperty(this, "tag", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "tag", O, String, null, null, null), X = O;
  } });
  var H;
  Object.defineProperty(this, "user", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "user", O, null, "user", null, null), H = O;
  } });
  var Y;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "value", O, Number, null, null, null), Y = O;
  } }), K)
    this.fromObject(K);
};
$.io.model.score.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.score.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.score.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "user" && K)
      K = new $.io.model.user(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.score.prototype.constructor = $.io.model.score;
$.io.model.scoreboard = function(Q, K) {
  var Z, X;
  this.__property_names = ["id", "name"], this.__classname = "Newgrounds.io.model.scoreboard", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "id", H, Number, null, null, null), Z = H;
  } });
  var X;
  if (Object.defineProperty(this, "name", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(H) {
    $.io.model.checkStrictValue(this.__classname, "name", H, String, null, null, null), X = H;
  } }), K)
    this.fromObject(K);
};
$.io.model.scoreboard.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.scoreboard.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.scoreboard.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.scoreboard.prototype.postScore = function(Q, K, Z) {
  var X = this;
  if (typeof K == "function" && !Z)
    Z = K, K = null;
  if (!K)
    K = null;
  if (this._has_ngio_user())
    this.__ngio.callComponent("ScoreBoard.postScore", { id: this.id, value: Q, tag: K }, function(O) {
      Z(O);
    });
  else if (typeof Z == "function") {
    var H = $.io.model.error.get("This function requires a valid user session.", $.io.model.error.LOGIN_REQUIRED), Y = { success: false, error: H };
    Z(Y);
  }
};
$.io.model.scoreboard.prototype.constructor = $.io.model.scoreboard;
$.io.model.session = function(Q, K) {
  var Z, X, H, Y, O;
  this.__property_names = ["expired", "id", "passport_url", "remember", "user"], this.__classname = "Newgrounds.io.model.session", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "expired", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "expired", I, Boolean, null, null, null), Z = I;
  } });
  var X;
  Object.defineProperty(this, "id", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "id", I, String, null, null, null), X = I;
  } });
  var H;
  Object.defineProperty(this, "passport_url", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "passport_url", I, String, null, null, null), H = I;
  } });
  var Y;
  Object.defineProperty(this, "remember", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "remember", I, Boolean, null, null, null), Y = I;
  } });
  var O;
  if (Object.defineProperty(this, "user", { get: function() {
    return typeof O == "undefined" ? null : O;
  }, set: function(I) {
    $.io.model.checkStrictValue(this.__classname, "user", I, null, "user", null, null), O = I;
  } }), K)
    this.fromObject(K);
};
$.io.model.session.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.session.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.session.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "user" && K)
      K = new $.io.model.user(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.session.prototype.constructor = $.io.model.session;
$.io.model.user = function(Q, K) {
  var Z, X, H, Y;
  this.__property_names = ["icons", "id", "name", "supporter"], this.__classname = "Newgrounds.io.model.user", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "icons", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "icons", O, null, "usericons", null, null), Z = O;
  } });
  var X;
  Object.defineProperty(this, "id", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "id", O, Number, null, null, null), X = O;
  } });
  var H;
  Object.defineProperty(this, "name", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "name", O, String, null, null, null), H = O;
  } });
  var Y;
  if (Object.defineProperty(this, "supporter", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(O) {
    $.io.model.checkStrictValue(this.__classname, "supporter", O, Boolean, null, null, null), Y = O;
  } }), K)
    this.fromObject(K);
};
$.io.model.user.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.user.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.user.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++) {
    if (K = Q[this.__property_names[X]], this.__property_names[X] == "icons" && K)
      K = new $.io.model.usericons(this.__ngio, K);
    this[this.__property_names[X]] = K;
  }
};
$.io.model.user.prototype.constructor = $.io.model.user;
$.io.model.usericons = function(Q, K) {
  var Z, X, H;
  this.__property_names = ["large", "medium", "small"], this.__classname = "Newgrounds.io.model.usericons", this.__ngio = Q;
  var Z;
  Object.defineProperty(this, "large", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(Y) {
    $.io.model.checkStrictValue(this.__classname, "large", Y, String, null, null, null), Z = Y;
  } });
  var X;
  Object.defineProperty(this, "medium", { get: function() {
    return typeof X == "undefined" ? null : X;
  }, set: function(Y) {
    $.io.model.checkStrictValue(this.__classname, "medium", Y, String, null, null, null), X = Y;
  } });
  var H;
  if (Object.defineProperty(this, "small", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(Y) {
    $.io.model.checkStrictValue(this.__classname, "small", Y, String, null, null, null), H = Y;
  } }), K)
    this.fromObject(K);
};
$.io.model.usericons.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
$.io.model.usericons.prototype.toObject = function() {
  var Q = {};
  for (var K = 0;K < this.__property_names.length; K++)
    if (typeof this[this.__property_names[K]] != "undefined")
      Q[this.__property_names[K]] = this[this.__property_names[K]];
  return Q;
};
$.io.model.usericons.prototype.fromObject = function(Q) {
  var K, Z;
  for (var X = 0;X < this.__property_names.length; X++)
    K = Q[this.__property_names[X]], this[this.__property_names[X]] = K;
};
$.io.model.usericons.prototype.constructor = $.io.model.usericons;
$.io.call_validators.getValidator = function(Q) {
  var K = Q.split("."), Z = K[0], X = K[1], H = $.io.call_validators[Z] && $.io.call_validators[Z][X] ? $.io.call_validators[Z][X] : null;
  return H;
};
$.io.call_validators.App = { checkSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: { session: { object: "session", description: null } } }, endSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: {} }, getCurrentVersion: { require_session: false, secure: false, redirect: false, import: false, params: { version: { type: String, extract_from: null, required: null, description: 'The version number (in "X.Y.Z" format) of the client-side app. (default = "0.0.0")' } }, returns: {} }, getHostLicense: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: null, description: "The host domain to check (ei, somesite.com)." } }, returns: {} }, logView: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Examples: "www.somesite.com", "localHost"' } }, returns: {} }, startSession: { require_session: false, secure: false, redirect: false, import: false, params: { force: { type: Boolean, extract_from: null, required: null, description: `If true, will create a new session even if the user already has an existing one.

Note: Any previous session ids will no longer be valid if this is used.` } }, returns: { session: { object: "session", description: null } } } };
$.io.call_validators.CloudSave = { loadSlots: { require_session: true, secure: true, redirect: false, import: false, params: {}, returns: {} }, loadSlot: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: null, required: true, description: "The slot number to load." } }, returns: {} }, setData: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: null, required: true, description: "The slot number to save." }, data: { type: String, extract_from: null, required: true, description: "The data to save." } }, returns: {} } };
$.io.call_validators.Event = { logEvent: { require_session: false, secure: false, redirect: false, import: false, params: { event_name: { type: String, extract_from: null, required: true, description: "The name of your custom event as defined in your Referrals & Events settings." }, host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "newgrounds.com", "localHost"' } }, returns: {} } };
$.io.call_validators.Gateway = { getDatetime: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, getVersion: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, ping: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} } };
$.io.call_validators.Loader = { loadAuthorUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadMoreGames: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadNewgrounds: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadOfficialUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadReferral: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." }, referral_name: { type: String, extract_from: null, required: true, description: 'The name of the referral (as defined in your "Referrals & Events" settings).' } }, returns: {} } };
$.io.call_validators.Medal = { getList: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { medals: { array: { object: "medal" }, description: "An array of medal objects." } } }, unlock: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "medal", alias: "medal", property: "id" }, required: true, description: "The numeric ID of the medal to unlock." } }, returns: { medal: { object: "medal", description: "The #medal that was unlocked." } } } };
$.io.call_validators.ScoreBoard = { getBoards: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { scoreboards: { array: { object: "scoreboard" }, description: "An array of #scoreboard objects." } } }, getScores: { require_session: false, secure: false, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, limit: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to include in the list. Default = 10." }, period: { type: String, extract_from: null, required: null, description: "The time-frame to pull scores from (see notes for acceptable values)." }, skip: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to skip before starting the list. Default = 0." }, social: { type: Boolean, extract_from: null, required: null, description: "If set to true, only social scores will be loaded (scores by the user and their friends). This param will be ignored if there is no valid session id and the 'user' param is absent." }, tag: { type: String, extract_from: null, required: null, description: "A tag to filter results by." }, user: { type: "mixed", extract_from: null, required: null, description: "A user's ID or name.  If 'social' is true, this user and their friends will be included. Otherwise, only scores for this user will be loaded. If this param is missing and there is a valid session id, that user will be used by default." } }, returns: { scoreboard: { object: "scoreboard", description: "The #scoreboard being queried." }, scores: { array: { object: "score" }, description: "An array of #score objects." }, user: { object: "user", description: "The #user the score list is associated with (either as defined in the 'user' param, or extracted from the current session when 'social' is set to true)" } } }, postScore: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, tag: { type: String, extract_from: null, required: null, description: "An optional tag that can be used to filter scores via ScoreBoard.getScores" }, value: { type: Number, extract_from: null, required: true, description: "The int value of the score." } }, returns: { score: { object: "score", description: "The #score that was posted to the board." }, scoreboard: { object: "scoreboard", description: "The #scoreboard that was posted to." } } } };
$.io.SessionLoader = function(Q) {
  if (!Q || Q.constructor !== $.io.core)
    throw new Error("'ngio' must be a 'Newgrounds.io.core' instance.");
  this.__ngio = Q;
  var K = null;
  Object.defineProperty(this, "session", { set: function(Z) {
    if (Z && !Z.constructor === $.io.model.session)
      throw new Error("'session' must be a 'Newgrounds.io.model.session' instance.");
    K = Z;
  }, get: function() {
    return K;
  } });
};
$.io.SessionLoader.prototype = { _event_listeners: {}, last_error: null, passport_window: null, addEventListener: $.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: $.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: $.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: $.io.events.EventDispatcher.prototype.dispatchEvent, getValidSession: function(Q, K) {
  var Z = this;
  Z.checkSession(function(X) {
    if (!X || X.expired)
      Z.startSession(Q, K);
    else
      Q.call(K, X);
  });
}, startSession: function(Q, K) {
  var Z = new $.io.events.SessionEvent, X = this;
  this.__ngio.callComponent("App.startSession", function(H) {
    if (!H.success || !H.session) {
      if (H.error)
        X.last_error = H.error;
      else
        X.last_error = new $.io.model.error, X.last_error.message = "Unexpected Error";
      Z.type = $.io.events.SessionEvent.SESSION_EXPIRED, X.session = null;
    } else
      Z.type = $.io.events.SessionEvent.REQUEST_LOGIN, Z.passport_url = H.session.passport_url, X.session = H.session;
    if (X.__ngio.session_id = X.session ? X.session.id : null, X.dispatchEvent(Z), Q && Q.constructor === Function)
      Q.call(K, X.session);
  });
}, checkSession: function(Q, K) {
  var Z = new $.io.events.SessionEvent, X = this;
  if (X.session && X.session.user) {
    if (Z.type = $.io.events.SessionEvent.USER_LOADED, Z.user = X.session.user, X.dispatchEvent(Z), Q && Q.constructor === Function)
      Q.call(K, X.session);
  } else if (!this.__ngio.session_id) {
    if (Z.type = $.io.events.SessionEvent.SESSION_EXPIRED, X.session = null, X.dispatchEvent(Z), Q && Q.constructor === Function)
      Q.call(K, null);
  } else
    this.__ngio.callComponent("App.checkSession", function(H) {
      if (!H.success || !H.session || H.session.expired)
        if (Z.type = $.io.events.SessionEvent.SESSION_EXPIRED, X.session = null, H.error)
          X.last_error = H.error;
        else if (X.last_error = new $.io.model.error, H.session && H.session.expired)
          X.last_error.message = "Session is Expired";
        else
          X.last_error.message = "Unexpected Error";
      else if (!H.session.user)
        Z.type = $.io.events.SessionEvent.REQUEST_LOGIN, Z.passport_url = H.session.passport_url, X.session = H.session;
      else
        Z.type = $.io.events.SessionEvent.USER_LOADED, Z.user = H.session.user, X.session = H.session;
      if (X.__ngio.session_id = X.session ? X.session.id : null, X.dispatchEvent(Z), Q && Q.constructor === Function)
        Q.call(K, X.session);
    });
}, endSession: function(Q, K) {
  var Z = this, X = this.__ngio;
  this.__ngio.callComponent("App.endSession", function(H) {
    Z.session = null, X.session_id = null;
    var Y = new $.io.events.SessionEvent($.io.events.SessionEvent.SESSION_EXPIRED);
    if (Z.dispatchEvent(Y), Q && Q.constructor === Function)
      Q.call(K, Z.session);
  }), this.__ngio.session_id = null, this.session = null;
}, loadPassport: function(Q) {
  if (typeof Q != "string")
    Q = "_blank";
  if (!this.session || !this.session.passport_url)
    return console.warn("Attempted to open Newgrounds Passport without a valid passport_url. Be sure you have called getValidSession() first!."), false;
  if (this.passport_window = globalThis.open(this.session.passport_url, Q, "popup=yes,width=600,height=600"), !this.passport_window)
    console.warn("Unable to detect passport window. Pop-up blockers will prevent loading Newgrounds Passport if loadPassport() or requestLogin() are not called from within a mouse click handler.");
  return this.passportOpen();
}, closePassport: function() {
  if (!this.passport_window)
    return false;
  return this.passport_window.close(), this.passportOpen();
}, passportOpen: function() {
  return this.passport_window && this.passport_window.parent ? true : false;
} };
$.io.SessionLoader.prototype.constructor = $.io.SessionLoader;
var j = j || function(Q, K) {
  var Z = {}, X = Z.lib = {}, H = function() {
  }, Y = X.Base = { extend: function(V) {
    H.prototype = this;
    var A = new H;
    return V && A.mixIn(V), A.hasOwnProperty("init") || (A.init = function() {
      A.$super.init.apply(this, arguments);
    }), A.init.prototype = A, A.$super = this, A;
  }, create: function() {
    var V = this.extend();
    return V.init.apply(V, arguments), V;
  }, init: function() {
  }, mixIn: function(V) {
    for (var A in V)
      V.hasOwnProperty(A) && (this[A] = V[A]);
    V.hasOwnProperty("toString") && (this.toString = V.toString);
  }, clone: function() {
    return this.init.prototype.extend(this);
  } }, O = X.WordArray = Y.extend({ init: function(V, A) {
    V = this.words = V || [], this.sigBytes = A != K ? A : 4 * V.length;
  }, toString: function(V) {
    return (V || T).stringify(this);
  }, concat: function(V) {
    var A = this.words, P = V.words, M = this.sigBytes;
    if (V = V.sigBytes, this.clamp(), M % 4)
      for (var R = 0;R < V; R++)
        A[M + R >>> 2] |= (P[R >>> 2] >>> 24 - 8 * (R % 4) & 255) << 24 - 8 * ((M + R) % 4);
    else if (65535 < P.length)
      for (R = 0;R < V; R += 4)
        A[M + R >>> 2] = P[R >>> 2];
    else
      A.push.apply(A, P);
    return this.sigBytes += V, this;
  }, clamp: function() {
    var V = this.words, A = this.sigBytes;
    V[A >>> 2] &= 4294967295 << 32 - 8 * (A % 4), V.length = Q.ceil(A / 4);
  }, clone: function() {
    var V = Y.clone.call(this);
    return V.words = this.words.slice(0), V;
  }, random: function(V) {
    for (var A = [], P = 0;P < V; P += 4)
      A.push(4294967296 * Q.random() | 0);
    return new O.init(A, V);
  } }), I = Z.enc = {}, T = I.Hex = { stringify: function(V) {
    var A = V.words;
    V = V.sigBytes;
    for (var P = [], M = 0;M < V; M++) {
      var R = A[M >>> 2] >>> 24 - 8 * (M % 4) & 255;
      P.push((R >>> 4).toString(16)), P.push((R & 15).toString(16));
    }
    return P.join("");
  }, parse: function(V) {
    for (var A = V.length, P = [], M = 0;M < A; M += 2)
      P[M >>> 3] |= parseInt(V.substr(M, 2), 16) << 24 - 4 * (M % 8);
    return new O.init(P, A / 2);
  } }, W = I.Latin1 = { stringify: function(V) {
    var A = V.words;
    V = V.sigBytes;
    for (var P = [], M = 0;M < V; M++)
      P.push(String.fromCharCode(A[M >>> 2] >>> 24 - 8 * (M % 4) & 255));
    return P.join("");
  }, parse: function(V) {
    for (var A = V.length, P = [], M = 0;M < A; M++)
      P[M >>> 2] |= (V.charCodeAt(M) & 255) << 24 - 8 * (M % 4);
    return new O.init(P, A);
  } }, z = I.Utf8 = { stringify: function(V) {
    try {
      return decodeURIComponent(escape(W.stringify(V)));
    } catch (A) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse: function(V) {
    return W.parse(unescape(encodeURIComponent(V)));
  } }, E = X.BufferedBlockAlgorithm = Y.extend({ reset: function() {
    this._data = new O.init, this._nDataBytes = 0;
  }, _append: function(V) {
    typeof V == "string" && (V = z.parse(V)), this._data.concat(V), this._nDataBytes += V.sigBytes;
  }, _process: function(V) {
    var A = this._data, P = A.words, M = A.sigBytes, R = this.blockSize, L = M / (4 * R), L = V ? Q.ceil(L) : Q.max((L | 0) - this._minBufferSize, 0);
    if (V = L * R, M = Q.min(4 * V, M), V) {
      for (var S = 0;S < V; S += R)
        this._doProcessBlock(P, S);
      S = P.splice(0, V), A.sigBytes -= M;
    }
    return new O.init(S, M);
  }, clone: function() {
    var V = Y.clone.call(this);
    return V._data = this._data.clone(), V;
  }, _minBufferSize: 0 });
  X.Hasher = E.extend({ cfg: Y.extend(), init: function(V) {
    this.cfg = this.cfg.extend(V), this.reset();
  }, reset: function() {
    E.reset.call(this), this._doReset();
  }, update: function(V) {
    return this._append(V), this._process(), this;
  }, finalize: function(V) {
    return V && this._append(V), this._doFinalize();
  }, blockSize: 16, _createHelper: function(V) {
    return function(A, P) {
      return new V.init(P).finalize(A);
    };
  }, _createHmacHelper: function(V) {
    return function(A, P) {
      return new J.HMAC.init(V, P).finalize(A);
    };
  } });
  var J = Z.algo = {};
  return Z;
}(Math);
(function() {
  var Q = j, K = Q.lib.WordArray;
  Q.enc.Base64 = { stringify: function(Z) {
    var { words: X, sigBytes: H } = Z, Y = this._map;
    Z.clamp(), Z = [];
    for (var O = 0;O < H; O += 3)
      for (var I = (X[O >>> 2] >>> 24 - 8 * (O % 4) & 255) << 16 | (X[O + 1 >>> 2] >>> 24 - 8 * ((O + 1) % 4) & 255) << 8 | X[O + 2 >>> 2] >>> 24 - 8 * ((O + 2) % 4) & 255, T = 0;4 > T && O + 0.75 * T < H; T++)
        Z.push(Y.charAt(I >>> 6 * (3 - T) & 63));
    if (X = Y.charAt(64))
      for (;Z.length % 4; )
        Z.push(X);
    return Z.join("");
  }, parse: function(Z) {
    var X = Z.length, H = this._map, Y = H.charAt(64);
    Y && (Y = Z.indexOf(Y), Y != -1 && (X = Y));
    for (var Y = [], O = 0, I = 0;I < X; I++)
      if (I % 4) {
        var T = H.indexOf(Z.charAt(I - 1)) << 2 * (I % 4), W = H.indexOf(Z.charAt(I)) >>> 6 - 2 * (I % 4);
        Y[O >>> 2] |= (T | W) << 24 - 8 * (O % 4), O++;
      }
    return K.create(Y, O);
  }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
})();
(function(Q) {
  function K(E, J, V, A, P, M, R) {
    return E = E + (J & V | ~J & A) + P + R, (E << M | E >>> 32 - M) + J;
  }
  function Z(E, J, V, A, P, M, R) {
    return E = E + (J & A | V & ~A) + P + R, (E << M | E >>> 32 - M) + J;
  }
  function X(E, J, V, A, P, M, R) {
    return E = E + (J ^ V ^ A) + P + R, (E << M | E >>> 32 - M) + J;
  }
  function H(E, J, V, A, P, M, R) {
    return E = E + (V ^ (J | ~A)) + P + R, (E << M | E >>> 32 - M) + J;
  }
  for (var Y = j, T = Y.lib, O = T.WordArray, I = T.Hasher, T = Y.algo, W = [], z = 0;64 > z; z++)
    W[z] = 4294967296 * Q.abs(Q.sin(z + 1)) | 0;
  T = T.MD5 = I.extend({ _doReset: function() {
    this._hash = new O.init([1732584193, 4023233417, 2562383102, 271733878]);
  }, _doProcessBlock: function(E, J) {
    for (var V = 0;16 > V; V++) {
      var A = J + V, P = E[A];
      E[A] = (P << 8 | P >>> 24) & 16711935 | (P << 24 | P >>> 8) & 4278255360;
    }
    var V = this._hash.words, A = E[J + 0], P = E[J + 1], M = E[J + 2], R = E[J + 3], L = E[J + 4], S = E[J + 5], y = E[J + 6], u = E[J + 7], g = E[J + 8], x = E[J + 9], C = E[J + 10], q = E[J + 11], f = E[J + 12], h = E[J + 13], D = E[J + 14], k = E[J + 15], U = V[0], G = V[1], F = V[2], B = V[3], U = K(U, G, F, B, A, 7, W[0]), B = K(B, U, G, F, P, 12, W[1]), F = K(F, B, U, G, M, 17, W[2]), G = K(G, F, B, U, R, 22, W[3]), U = K(U, G, F, B, L, 7, W[4]), B = K(B, U, G, F, S, 12, W[5]), F = K(F, B, U, G, y, 17, W[6]), G = K(G, F, B, U, u, 22, W[7]), U = K(U, G, F, B, g, 7, W[8]), B = K(B, U, G, F, x, 12, W[9]), F = K(F, B, U, G, C, 17, W[10]), G = K(G, F, B, U, q, 22, W[11]), U = K(U, G, F, B, f, 7, W[12]), B = K(B, U, G, F, h, 12, W[13]), F = K(F, B, U, G, D, 17, W[14]), G = K(G, F, B, U, k, 22, W[15]), U = Z(U, G, F, B, P, 5, W[16]), B = Z(B, U, G, F, y, 9, W[17]), F = Z(F, B, U, G, q, 14, W[18]), G = Z(G, F, B, U, A, 20, W[19]), U = Z(U, G, F, B, S, 5, W[20]), B = Z(B, U, G, F, C, 9, W[21]), F = Z(F, B, U, G, k, 14, W[22]), G = Z(G, F, B, U, L, 20, W[23]), U = Z(U, G, F, B, x, 5, W[24]), B = Z(B, U, G, F, D, 9, W[25]), F = Z(F, B, U, G, R, 14, W[26]), G = Z(G, F, B, U, g, 20, W[27]), U = Z(U, G, F, B, h, 5, W[28]), B = Z(B, U, G, F, M, 9, W[29]), F = Z(F, B, U, G, u, 14, W[30]), G = Z(G, F, B, U, f, 20, W[31]), U = X(U, G, F, B, S, 4, W[32]), B = X(B, U, G, F, g, 11, W[33]), F = X(F, B, U, G, q, 16, W[34]), G = X(G, F, B, U, D, 23, W[35]), U = X(U, G, F, B, P, 4, W[36]), B = X(B, U, G, F, L, 11, W[37]), F = X(F, B, U, G, u, 16, W[38]), G = X(G, F, B, U, C, 23, W[39]), U = X(U, G, F, B, h, 4, W[40]), B = X(B, U, G, F, A, 11, W[41]), F = X(F, B, U, G, R, 16, W[42]), G = X(G, F, B, U, y, 23, W[43]), U = X(U, G, F, B, x, 4, W[44]), B = X(B, U, G, F, f, 11, W[45]), F = X(F, B, U, G, k, 16, W[46]), G = X(G, F, B, U, M, 23, W[47]), U = H(U, G, F, B, A, 6, W[48]), B = H(B, U, G, F, u, 10, W[49]), F = H(F, B, U, G, D, 15, W[50]), G = H(G, F, B, U, S, 21, W[51]), U = H(U, G, F, B, f, 6, W[52]), B = H(B, U, G, F, R, 10, W[53]), F = H(F, B, U, G, C, 15, W[54]), G = H(G, F, B, U, P, 21, W[55]), U = H(U, G, F, B, g, 6, W[56]), B = H(B, U, G, F, k, 10, W[57]), F = H(F, B, U, G, y, 15, W[58]), G = H(G, F, B, U, h, 21, W[59]), U = H(U, G, F, B, L, 6, W[60]), B = H(B, U, G, F, q, 10, W[61]), F = H(F, B, U, G, M, 15, W[62]), G = H(G, F, B, U, x, 21, W[63]);
    V[0] = V[0] + U | 0, V[1] = V[1] + G | 0, V[2] = V[2] + F | 0, V[3] = V[3] + B | 0;
  }, _doFinalize: function() {
    var E = this._data, J = E.words, V = 8 * this._nDataBytes, A = 8 * E.sigBytes;
    J[A >>> 5] |= 128 << 24 - A % 32;
    var P = Q.floor(V / 4294967296);
    J[(A + 64 >>> 9 << 4) + 15] = (P << 8 | P >>> 24) & 16711935 | (P << 24 | P >>> 8) & 4278255360, J[(A + 64 >>> 9 << 4) + 14] = (V << 8 | V >>> 24) & 16711935 | (V << 24 | V >>> 8) & 4278255360, E.sigBytes = 4 * (J.length + 1), this._process(), E = this._hash, J = E.words;
    for (V = 0;4 > V; V++)
      A = J[V], J[V] = (A << 8 | A >>> 24) & 16711935 | (A << 24 | A >>> 8) & 4278255360;
    return E;
  }, clone: function() {
    var E = I.clone.call(this);
    return E._hash = this._hash.clone(), E;
  } }), Y.MD5 = I._createHelper(T), Y.HmacMD5 = I._createHmacHelper(T);
})(Math);
(function() {
  var Q = j, X = Q.lib, K = X.Base, Z = X.WordArray, X = Q.algo, H = X.EvpKDF = K.extend({ cfg: K.extend({ keySize: 4, hasher: X.MD5, iterations: 1 }), init: function(Y) {
    this.cfg = this.cfg.extend(Y);
  }, compute: function(Y, O) {
    for (var E = this.cfg, I = E.hasher.create(), T = Z.create(), W = T.words, z = E.keySize, E = E.iterations;W.length < z; ) {
      J && I.update(J);
      var J = I.update(Y).finalize(O);
      I.reset();
      for (var V = 1;V < E; V++)
        J = I.finalize(J), I.reset();
      T.concat(J);
    }
    return T.sigBytes = 4 * z, T;
  } });
  Q.EvpKDF = function(Y, O, I) {
    return H.create(I).compute(Y, O);
  };
})();
j.lib.Cipher || function(Q) {
  var V = j, K = V.lib, Z = K.Base, X = K.WordArray, H = K.BufferedBlockAlgorithm, Y = V.enc.Base64, O = V.algo.EvpKDF, I = K.Cipher = H.extend({ cfg: Z.extend(), createEncryptor: function(P, M) {
    return this.create(this._ENC_XFORM_MODE, P, M);
  }, createDecryptor: function(P, M) {
    return this.create(this._DEC_XFORM_MODE, P, M);
  }, init: function(P, M, R) {
    this.cfg = this.cfg.extend(R), this._xformMode = P, this._key = M, this.reset();
  }, reset: function() {
    H.reset.call(this), this._doReset();
  }, process: function(P) {
    return this._append(P), this._process();
  }, finalize: function(P) {
    return P && this._append(P), this._doFinalize();
  }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function(P) {
    return { encrypt: function(M, R, L) {
      return (typeof R == "string" ? A : J).encrypt(P, M, R, L);
    }, decrypt: function(M, R, L) {
      return (typeof R == "string" ? A : J).decrypt(P, M, R, L);
    } };
  } });
  K.StreamCipher = I.extend({ _doFinalize: function() {
    return this._process(true);
  }, blockSize: 1 });
  var E = V.mode = {}, T = function(P, M, R) {
    var L = this._iv;
    L ? this._iv = Q : L = this._prevBlock;
    for (var S = 0;S < R; S++)
      P[M + S] ^= L[S];
  }, W = (K.BlockCipherMode = Z.extend({ createEncryptor: function(P, M) {
    return this.Encryptor.create(P, M);
  }, createDecryptor: function(P, M) {
    return this.Decryptor.create(P, M);
  }, init: function(P, M) {
    this._cipher = P, this._iv = M;
  } })).extend();
  W.Encryptor = W.extend({ processBlock: function(P, M) {
    var R = this._cipher, L = R.blockSize;
    T.call(this, P, M, L), R.encryptBlock(P, M), this._prevBlock = P.slice(M, M + L);
  } }), W.Decryptor = W.extend({ processBlock: function(P, M) {
    var R = this._cipher, L = R.blockSize, S = P.slice(M, M + L);
    R.decryptBlock(P, M), T.call(this, P, M, L), this._prevBlock = S;
  } }), E = E.CBC = W, W = (V.pad = {}).Pkcs7 = { pad: function(P, M) {
    for (var R = 4 * M, R = R - P.sigBytes % R, L = R << 24 | R << 16 | R << 8 | R, S = [], y = 0;y < R; y += 4)
      S.push(L);
    R = X.create(S, R), P.concat(R);
  }, unpad: function(P) {
    P.sigBytes -= P.words[P.sigBytes - 1 >>> 2] & 255;
  } }, K.BlockCipher = I.extend({ cfg: I.cfg.extend({ mode: E, padding: W }), reset: function() {
    I.reset.call(this);
    var M = this.cfg, P = M.iv, M = M.mode;
    if (this._xformMode == this._ENC_XFORM_MODE)
      var R = M.createEncryptor;
    else
      R = M.createDecryptor, this._minBufferSize = 1;
    this._mode = R.call(M, this, P && P.words);
  }, _doProcessBlock: function(P, M) {
    this._mode.processBlock(P, M);
  }, _doFinalize: function() {
    var P = this.cfg.padding;
    if (this._xformMode == this._ENC_XFORM_MODE) {
      P.pad(this._data, this.blockSize);
      var M = this._process(true);
    } else
      M = this._process(true), P.unpad(M);
    return M;
  }, blockSize: 4 });
  var z = K.CipherParams = Z.extend({ init: function(P) {
    this.mixIn(P);
  }, toString: function(P) {
    return (P || this.formatter).stringify(this);
  } }), E = (V.format = {}).OpenSSL = { stringify: function(P) {
    var M = P.ciphertext;
    return P = P.salt, (P ? X.create([1398893684, 1701076831]).concat(P).concat(M) : M).toString(Y);
  }, parse: function(P) {
    P = Y.parse(P);
    var M = P.words;
    if (M[0] == 1398893684 && M[1] == 1701076831) {
      var R = X.create(M.slice(2, 4));
      M.splice(0, 4), P.sigBytes -= 16;
    }
    return z.create({ ciphertext: P, salt: R });
  } }, J = K.SerializableCipher = Z.extend({ cfg: Z.extend({ format: E }), encrypt: function(P, M, R, L) {
    L = this.cfg.extend(L);
    var S = P.createEncryptor(R, L);
    return M = S.finalize(M), S = S.cfg, z.create({ ciphertext: M, key: R, iv: S.iv, algorithm: P, mode: S.mode, padding: S.padding, blockSize: P.blockSize, formatter: L.format });
  }, decrypt: function(P, M, R, L) {
    return L = this.cfg.extend(L), M = this._parse(M, L.format), P.createDecryptor(R, L).finalize(M.ciphertext);
  }, _parse: function(P, M) {
    return typeof P == "string" ? M.parse(P, this) : P;
  } }), V = (V.kdf = {}).OpenSSL = { execute: function(P, M, R, L) {
    return L || (L = X.random(8)), P = O.create({ keySize: M + R }).compute(P, L), R = X.create(P.words.slice(M), 4 * R), P.sigBytes = 4 * M, z.create({ key: P, iv: R, salt: L });
  } }, A = K.PasswordBasedCipher = J.extend({ cfg: J.cfg.extend({ kdf: V }), encrypt: function(P, M, R, L) {
    return L = this.cfg.extend(L), R = L.kdf.execute(R, P.keySize, P.ivSize), L.iv = R.iv, P = J.encrypt.call(this, P, M, R.key, L), P.mixIn(R), P;
  }, decrypt: function(P, M, R, L) {
    return L = this.cfg.extend(L), M = this._parse(M, L.format), R = L.kdf.execute(R, P.keySize, P.ivSize, M.salt), L.iv = R.iv, J.decrypt.call(this, P, M, R.key, L);
  } });
}();
(function() {
  for (var Q = j, K = Q.lib.BlockCipher, g = Q.algo, Z = [], X = [], H = [], Y = [], O = [], I = [], T = [], W = [], z = [], E = [], J = [], V = 0;256 > V; V++)
    J[V] = 128 > V ? V << 1 : V << 1 ^ 283;
  for (var A = 0, P = 0, V = 0;256 > V; V++) {
    var M = P ^ P << 1 ^ P << 2 ^ P << 3 ^ P << 4, M = M >>> 8 ^ M & 255 ^ 99;
    Z[A] = M, X[M] = A;
    var R = J[A], L = J[R], S = J[L], y = 257 * J[M] ^ 16843008 * M;
    H[A] = y << 24 | y >>> 8, Y[A] = y << 16 | y >>> 16, O[A] = y << 8 | y >>> 24, I[A] = y, y = 16843009 * S ^ 65537 * L ^ 257 * R ^ 16843008 * A, T[M] = y << 24 | y >>> 8, W[M] = y << 16 | y >>> 16, z[M] = y << 8 | y >>> 24, E[M] = y, A ? (A = R ^ J[J[J[S ^ R]]], P ^= J[J[P]]) : A = P = 1;
  }
  var u = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], g = g.AES = K.extend({ _doReset: function() {
    for (var q = this._key, x = q.words, C = q.sigBytes / 4, q = 4 * ((this._nRounds = C + 6) + 1), f = this._keySchedule = [], h = 0;h < q; h++)
      if (h < C)
        f[h] = x[h];
      else {
        var D = f[h - 1];
        h % C ? 6 < C && h % C == 4 && (D = Z[D >>> 24] << 24 | Z[D >>> 16 & 255] << 16 | Z[D >>> 8 & 255] << 8 | Z[D & 255]) : (D = D << 8 | D >>> 24, D = Z[D >>> 24] << 24 | Z[D >>> 16 & 255] << 16 | Z[D >>> 8 & 255] << 8 | Z[D & 255], D ^= u[h / C | 0] << 24), f[h] = f[h - C] ^ D;
      }
    x = this._invKeySchedule = [];
    for (C = 0;C < q; C++)
      h = q - C, D = C % 4 ? f[h] : f[h - 4], x[C] = 4 > C || 4 >= h ? D : T[Z[D >>> 24]] ^ W[Z[D >>> 16 & 255]] ^ z[Z[D >>> 8 & 255]] ^ E[Z[D & 255]];
  }, encryptBlock: function(x, C) {
    this._doCryptBlock(x, C, this._keySchedule, H, Y, O, I, Z);
  }, decryptBlock: function(x, C) {
    var q = x[C + 1];
    x[C + 1] = x[C + 3], x[C + 3] = q, this._doCryptBlock(x, C, this._invKeySchedule, T, W, z, E, X), q = x[C + 1], x[C + 1] = x[C + 3], x[C + 3] = q;
  }, _doCryptBlock: function(x, C, q, f, h, D, k, U) {
    for (var B = this._nRounds, w = x[C] ^ q[0], p = x[C + 1] ^ q[1], m = x[C + 2] ^ q[2], N = x[C + 3] ^ q[3], F = 4, G = 1;G < B; G++)
      var t = f[w >>> 24] ^ h[p >>> 16 & 255] ^ D[m >>> 8 & 255] ^ k[N & 255] ^ q[F++], c = f[p >>> 24] ^ h[m >>> 16 & 255] ^ D[N >>> 8 & 255] ^ k[w & 255] ^ q[F++], s = f[m >>> 24] ^ h[N >>> 16 & 255] ^ D[w >>> 8 & 255] ^ k[p & 255] ^ q[F++], N = f[N >>> 24] ^ h[w >>> 16 & 255] ^ D[p >>> 8 & 255] ^ k[m & 255] ^ q[F++], w = t, p = c, m = s;
    t = (U[w >>> 24] << 24 | U[p >>> 16 & 255] << 16 | U[m >>> 8 & 255] << 8 | U[N & 255]) ^ q[F++], c = (U[p >>> 24] << 24 | U[m >>> 16 & 255] << 16 | U[N >>> 8 & 255] << 8 | U[w & 255]) ^ q[F++], s = (U[m >>> 24] << 24 | U[N >>> 16 & 255] << 16 | U[w >>> 8 & 255] << 8 | U[p & 255]) ^ q[F++], N = (U[N >>> 24] << 24 | U[w >>> 16 & 255] << 16 | U[p >>> 8 & 255] << 8 | U[m & 255]) ^ q[F++], x[C] = t, x[C + 1] = c, x[C + 2] = s, x[C + 3] = N;
  }, keySize: 8 });
  Q.AES = K._createHelper(g);
})();
var v = { game: "Divine Techno Run", url: "https://www.newgrounds.com/portal/view/628667", key: "34685:cxZQ5a1E", skey: "aBuRcFJLqDmPe3Gb0uultA==" };

class b {
  #K;
  config;
  #O = {};
  #Q;
  #X;
  #W;
  #Z;
  #$;
  #M = new Set;
  #P = new Set;
  #V = new Set;
  audio;
  audioOut;
  gameUrl;
  static async validateSession(Q, K = v) {
    let Z = new $.io.core(K.key, K.skey);
    return Z.session_id = Q, new Promise((X) => {
      Z.callComponent("App.checkSession", {}, (H) => {
        X(H?.success ? H.session?.user?.name : undefined);
      });
    });
  }
  static async saveData(Q, K, Z = v) {
    let X = new $.io.core(Z.key, Z.skey);
    return X.session_id = K, new Promise((H) => {
      X.callComponent("CloudSave.setData", { id: 1, data: JSON.stringify(Q) }, (Y) => {
        H(Y);
      });
    });
  }
  validateSession(Q) {
    return b.validateSession(Q, this.config);
  }
  addLoginListener(Q) {
    this.#M.add(Q);
  }
  addLogoutListener(Q) {
    this.#P.add(Q);
  }
  addUnlockListener(Q) {
    this.#V.add(Q);
  }
  removeLoginListener(Q) {
    this.#M.delete(Q);
  }
  removeLogoutListener(Q) {
    this.#P.delete(Q);
  }
  removeUnlockListener(Q) {
    this.#V.delete(Q);
  }
  get ngio() {
    return this.#K;
  }
  constructor(Q = v) {
    this.config = Q, this.#K = new $.io.core(Q.key, Q.skey), this.#W = Q.debug, this.initSession(), this.audio = Q.noAudio ? undefined : new Audio(Q.audioIn ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound.ogg"), this.audioOut = Q.noAudio ? undefined : new Audio(Q.audioOut ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound-out.ogg"), this.gameUrl = Q.url;
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
  get supporter() {
    return this.#K.user?.supporter;
  }
  get session() {
    return this.#K.session_id;
  }
  async getScoreboards() {
    return new Promise((Q) => {
      if (this.#Z)
        Q?.(this.#Z);
      else if (this.#$)
        this.#$.push(Q);
      else
        this.#$ = [Q], this.#K.callComponent("ScoreBoard.getBoards", {}, (K) => {
          if (K.success) {
            this.#Z = K.scoreboards;
            let Z = {};
            this.#Z.forEach((X) => Z[X.id] = X.name), this.#$?.forEach((X) => X?.(this.#Z ?? [])), this.#$ = undefined;
          }
        });
    });
  }
  async getMedals() {
    return new Promise((Q) => {
      if (this.#Q)
        Q(this.#Q);
      else if (this.#X)
        this.#X.push(Q);
      else
        this.#X = [Q], this.#K.callComponent("Medal.getList", {}, (K) => {
          if (K.success) {
            this.#Q = K.medals;
            let Z = "font-weight: bold;";
            console.log("%c Unlocked:", Z, this.#Q?.filter(({ unlocked: X }) => X).map(({ name: X }) => X).join(", ")), console.log("%c Locked:", Z, this.#Q?.filter(({ unlocked: X }) => !X).map(({ name: X }) => X).join(", ")), this.#X?.forEach((X) => X?.(this.#Q ?? [])), this.#X = undefined;
          }
        });
    });
  }
  async unlockMedal(Q) {
    if (!this.#K.user)
      return;
    console.log("unlocking", Q, "for", this.#K.user.name);
    let K = await this.getMedals(), Z = K.filter((X) => X.name === Q)[0];
    if (Z)
      return new Promise((X) => {
        if (!Z.unlocked && !this.#O[Z.id])
          this.#K.callComponent("Medal.unlock", { id: Z.id }, (H) => {
            let Y = H.medal;
            if (Y) {
              for (let O = 0;O < K.length; O++)
                if (K[O].id === Y.id)
                  K[O] = Y;
              this.#O[Y.id] = true, this.#V.forEach((O) => O(Y)), this.showReceivedMedal(Y), X(H.medal);
            }
          });
        else
          X(Z);
      });
    else
      console.warn(`Medal doesn't exist: ${Q}`);
  }
  requestLogin() {
    this.#K.requestLogin(() => this.onLoggedIn(), () => this.onLoginFailed(), () => this.onLoginCancelled());
    let Q = document.getElementById("newgrounds-login");
    if (Q)
      Q.style.display = "none";
  }
  requestLogout() {
    return new Promise((Q) => {
      console.log(`Logging out ${this.#K.user?.name}...`), this.#K.logOut(() => {
        this.#P.forEach((K) => K()), Q();
      });
    });
  }
  onLoginFailed() {
    console.log("There was a problem logging in: ", this.#K.login_error?.message);
    let Q = document.getElementById("newgrounds-login");
    if (Q)
      Q.style.display = "";
  }
  onLoginCancelled() {
    console.log("The user cancelled the login.");
    let Q = document.getElementById("newgrounds-login");
    if (Q)
      Q.style.display = "";
  }
  initSession() {
    this.#K.getValidSession(() => {
      this.validateSession(this.#K.session_id);
      let Q = !this.#W ? undefined : document.body.appendChild(document.createElement("button"));
      if (Q)
        Q.id = "newgrounds-login", Q.style.position = "absolute", Q.style.top = "5px", Q.style.right = "5px", Q.style.height = "24px", Q.style.fontSize = "10pt", Q.style.zIndex = "1000", Q.classList.add("button"), Q.innerText = "login newgrounds", Q.addEventListener("click", (K) => {
          this.requestLogin(), K.stopPropagation();
        });
      if (this.#K.user)
        Q?.parentElement?.removeChild(Q), this.onLoggedIn();
    });
  }
  onLoggedIn() {
    console.log("Welcome ", this.#K.user?.name + "!"), this.#M.forEach((Q) => Q()), this.getMedals(), this.getScoreboards(), this.#R();
  }
  #Y;
  #I() {
    if (!this.#Y) {
      let Q = document.body.appendChild(document.createElement("div"));
      Q.style.display = "none", Q.style.position = "absolute", Q.style.right = "10px", Q.style.top = "10px", Q.style.padding = "5px 10px", Q.style.border = "2px solid #880", Q.style.borderRadius = "5px", Q.style.background = "linear-gradient(#884, #553)", Q.style.boxShadow = "2px 2px black", Q.style.flexDirection = "row", Q.style.transition = "opacity .5s, margin-right .3s", Q.style.opacity = "0", Q.style.marginRight = "-300px", Q.style.zIndex = "3000", Q.style.fontFamily = "Papyrus, fantasy", this.#Y = Q;
    }
    return this.#Y;
  }
  #H;
  showReceivedMedal(Q) {
    clearTimeout(this.#H);
    let K = this.#I();
    K.style.display = "flex", K.innerText = "";
    let Z = K.appendChild(document.createElement("img"));
    Z.addEventListener("load", () => {
      if (K.style.display = "flex", K.style.opacity = "1", K.style.marginRight = "0", !globalThis.mute)
        this.audio?.play();
      this.#H = setTimeout(() => {
        if (!globalThis.mute)
          this.audioOut?.play();
        K.style.opacity = "0", this.#H = setTimeout(() => {
          K.style.display = "none", K.style.marginRight = "-300px", this.#H = undefined;
        }, 1000);
      }, 5000);
    }), Z.style.width = "50px", Z.style.height = "50px", Z.style.backgroundColor = "black", Z.style.borderRadius = "3px", Z.src = Q.icon;
    let X = K.appendChild(document.createElement("div"));
    X.style.marginLeft = "10px";
    let H = X.appendChild(document.createElement("div"));
    H.style.fontWeight = "bold", H.style.fontSize = "12pt", H.style.color = "gold", H.style.margin = "5px", H.innerText = `\uD83C\uDFC6 ${Q.name}`;
    let Y = X.appendChild(document.createElement("div"));
    Y.style.fontSize = "10pt", Y.style.color = "silver", Y.innerText = Q.description;
  }
  async postScore(Q, K) {
    let Z = await this.getScoreboards(), X = K ? Z.find((H) => H.name === K) : Z[0];
    if (X)
      return new Promise((H) => {
        this.#K.callComponent("ScoreBoard.postScore", { id: X.id, value: Q }, (Y) => {
          H(Y.success);
        });
      });
  }
  async#R() {
    return new Promise((Q) => {
      this.#K.callComponent("App.logView", { host: location.host }, (K) => {
        Q(K);
      });
    });
  }
  async logEvent(Q) {
    return new Promise((K) => {
      this.#K.callComponent("Event.logEvent", { event_name: Q, host: location.host }, (Z) => {
        K(Z);
      });
    });
  }
  async loadSlots() {
    let Q = await new Promise((K) => {
      this.#K.callComponent("CloudSave.loadSlots", {}, (Z) => {
        K(Z);
      });
    });
    if (!Q.success || !Q.slots)
      return [];
    return await Promise.all(Q.slots.map(async (K) => {
      let { url: Z } = K, X = Z ? await fetch(Z).then((H) => H.json()) : undefined;
      return { ...K, data: X };
    }));
  }
  async loadSlot(Q) {
    let K = await new Promise((H) => {
      this.#K.callComponent("CloudSave.loadSlot", { id: Q }, (Y) => {
        H(Y);
      });
    });
    if (!K.success || !K.slot)
      return;
    let { url: Z } = K.slot, X = Z ? await fetch(Z).then((H) => H.json()) : undefined;
    return { ...K.slot, data: X };
  }
  async saveData(Q, K) {
    let Z = await new Promise((X) => {
      this.#K.callComponent("CloudSave.setData", { id: Q, data: JSON.stringify(K) }, (H) => {
        X(H);
      });
    });
    if (!Z.success || !Z.slot)
      return;
    return Z.slot;
  }
}
export {
  b as Newgrounds
};
