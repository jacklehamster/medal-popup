// /Users/vincent/medal-popup/example/node_modules/medal-popup/dist/index.js
var P = {};
P.io = { GATEWAY_URI: "//newgrounds.io/gateway_v3.php" };
P.io.events = {};
P.io.call_validators = {};
P.io.model = { checkStrictValue: function(I, O, Y, V, E, Q, R) {
  if (V == "mixed")
    return true;
  if (Y === null || typeof Y == "undefined")
    return true;
  if (V && Y.constructor === V)
    return true;
  if (V == Boolean && Y.constructor === Number)
    return true;
  if (E && Y.constructor === P.io.model[E])
    return true;
  if (Y.constructor === Array && (Q || R)) {
    for (var H = 0;H < Y.length; H++)
      this.checkStrictValue(I, O, Y[H], Q, R, null, null);
    return true;
  }
  if (I)
    throw new Error("Illegal \'" + O + "\' value set in model " + I);
  return false;
} };
P.io.events.OutputEvent = function(I, O, Y) {
  this.type = I, this.call = O, this.data = Y, this.success = Y && typeof (Y.success != "undefined") ? Y.success ? true : false : false, this.preventDefault = false;
};
P.io.events.OutputEvent.prototype.constructor = P.io.events.OutputEvent;
P.io.events.SessionEvent = function(I) {
  this.type = I, this.user = null, this.passport_url = null;
};
P.io.events.SessionEvent.USER_LOADED = "user-loaded";
P.io.events.SessionEvent.SESSION_EXPIRED = "session-expired";
P.io.events.SessionEvent.REQUEST_LOGIN = "request-login";
P.io.events.SessionEvent.prototype.constructor = P.io.events.SessionEvent;
P.io.events.EventDispatcher = function() {
};
P.io.events.EventDispatcher.prototype = { _event_listeners: {}, addEventListener: function(I, O) {
  if (I.constructor !== String)
    throw new Error("Event names must be a string format.");
  if (O.constructor !== Function)
    throw new Error("Event listeners must be functions.");
  if (typeof this._event_listeners[I] == "undefined")
    this._event_listeners[I] = [];
  this._event_listeners[I].push(O);
}, removeEventListener: function(I, O) {
  if (typeof this._event_listeners[I] == "undefined")
    return;
  var Y = -1;
  for (i = 0;i < this._event_listeners[I].length; i++)
    if (this._event_listeners[I][i] === O) {
      Y = i;
      break;
    }
  if (Y >= 0)
    return this._event_listeners[I].splice(Y, 1), true;
  return false;
}, removeAllEventListeners: function(I) {
  if (typeof this._event_listeners[I] == "undefined")
    return 0;
  var O = this._event_listeners[I].length;
  return this._event_listeners[I] = [], O;
}, dispatchEvent: function(I) {
  var O = false, Y;
  for (var V in P.io.events)
    if (I.constructor === P.io.events[V]) {
      O = true;
      break;
    }
  if (!O)
    throw new Error("Unsupported event object");
  if (typeof this._event_listeners[I.type] == "undefined")
    return false;
  for (var E = 0;E < this._event_listeners[I.type].length; E++)
    if (Y = this._event_listeners[I.type][E], Y(I) === false || I.preventDefault)
      return true;
  return true;
} };
P.io.events.EventDispatcher.prototype.constructor = P.io.events.EventDispatcher;
P.io.core = function(I, O) {
  var Y, V, E, Q, R = this, H, z = new P.io.urlHelper;
  if (z.getRequestQueryParam("ngio_session_id"))
    V = z.getRequestQueryParam("ngio_session_id");
  if (Object.defineProperty(this, "app_id", { get: function() {
    return Y;
  } }), Object.defineProperty(this, "user", { get: function() {
    return this.getCurrentUser();
  } }), Object.defineProperty(this, "session_id", { set: function(Z) {
    if (Z && typeof Z != "string")
      throw new Error("\'session_id\' must be a string value.");
    V = Z ? Z : null;
  }, get: function() {
    return V ? V : null;
  } }), Object.defineProperty(this, "debug", { set: function(Z) {
    Q = Z ? true : false;
  }, get: function() {
    return Q;
  } }), !I)
    throw new Error("Missing required \'app_id\' in Newgrounds.io.core constructor");
  if (typeof I != "string")
    throw new Error("\'app_id\' must be a string value in Newgrounds.io.core constructor");
  if (Y = I, O)
    H = k.enc.Base64.parse(O);
  else
    console.warn("You did not set an encryption key. Some calls may not work without this.");
  var $ = "Newgrounds-io-app_session-" + Y.split(":").join("-");
  function B() {
    if (typeof localStorage != "undefined" && localStorage && localStorage.getItem.constructor == Function)
      return true;
    return console.warn("localStorage unavailable. Are you running from a web server?"), false;
  }
  function A() {
    if (!B())
      return null;
    var Z = localStorage.getItem($);
    return Z ? Z : null;
  }
  function T(Z) {
    if (!B())
      return null;
    localStorage.setItem($, Z);
  }
  function M() {
    if (!B())
      return null;
    localStorage.removeItem($);
  }
  if (!V && A())
    V = A();
  this.addEventListener("App.endSession", function(Z) {
    R.session_id = null, M();
  }), this.addEventListener("App.startSession", function(Z) {
    if (Z.success)
      R.session_id = Z.data.session.id;
  }), this.addEventListener("App.checkSession", function(Z) {
    if (Z.success) {
      if (Z.data.session.expired)
        M(), this.session_id = null;
      else if (Z.data.session.remember)
        T(Z.data.session.id);
    } else
      this.session_id = null, M();
  }), this._encryptCall = function(Z) {
    if (!Z || !Z.constructor == P.io.model.call_model)
      throw new Error("Attempted to encrypt a non \'call\' object");
    var K = k.lib.WordArray.random(16), X = k.AES.encrypt(JSON.stringify(Z.toObject()), H, { iv: K }), U = k.enc.Base64.stringify(K.concat(X.ciphertext));
    return Z.secure = U, Z.parameters = null, Z;
  };
};
P.io.core.prototype = { _session_loader: null, _call_queue: [], _event_listeners: {}, addEventListener: P.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: P.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: P.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: P.io.events.EventDispatcher.prototype.dispatchEvent, getSessionLoader: function() {
  if (this._session_loader == null)
    this._session_loader = new P.io.SessionLoader(this);
  return this._session_loader;
}, getSession: function() {
  return this.getSessionLoader().session;
}, getCurrentUser: function() {
  var I = this.getSessionLoader();
  if (I.session)
    return I.session.user;
  return null;
}, getLoginError: function() {
  return this.getSessionLoader().last_error;
}, getValidSession: function(I, O) {
  this.getSessionLoader().getValidSession(I, O);
}, requestLogin: function(I, O, Y, V) {
  if (!I || I.constructor !== Function)
    throw "Missing required callback for \'on_logged_in\'.";
  if (!O || O.constructor !== Function)
    throw "Missing required callback for \'on_login_failed\'.";
  var E = this, Q = this.getSessionLoader(), R;
  function H() {
    if (R)
      clearInterval(R);
    E.removeEventListener("cancelLoginRequest", z), Q.closePassport();
  }
  function z() {
    Y && Y.constructor === Function ? Y.call(V) : O.call(V), H();
  }
  if (E.addEventListener("cancelLoginRequest", z), E.getCurrentUser())
    I.call(V);
  else
    Q.loadPassport(), R = setInterval(function() {
      Q.checkSession(function($) {
        if (!$ || $.expired)
          if (Q.last_error.code == 111)
            z();
          else
            H(), O.call(V);
        else if ($.user)
          H(), I.call(V);
      });
    }, 3000);
}, cancelLoginRequest: function() {
  event = new P.io.events.OutputEvent("cancelLoginRequest", null, null), this.dispatchEvent(event);
}, logOut: function(I, O) {
  this.getSessionLoader().endSession(I, O);
}, queueComponent: function(I, O, Y, V) {
  if (O && O.constructor === Function && !Y)
    Y = O, O = null;
  var E = new P.io.model.call(this);
  if (E.component = I, typeof O != "undefined")
    E.parameters = O;
  this._validateCall(E), this._call_queue.push([E, Y, V]);
}, executeQueue: function() {
  var I = [], O = [], Y = [];
  for (var V = 0;V < this._call_queue.length; V++)
    I.push(this._call_queue[V][0]), O.push(this._call_queue[V][1]), Y.push(this._call_queue[V][2]);
  this._doCall(I, O, Y), this._call_queue = [];
}, callComponent: function(I, O, Y, V) {
  if (O.constructor === Function && !Y)
    Y = O, O = null;
  var E = new P.io.model.call(this);
  if (E.component = I, typeof O != "undefined")
    E.parameters = O;
  this._validateCall(E), this._doCall(E, Y, V);
}, _doCallback: function(I, O, Y, V) {
  var E, Q, R, H, z, $ = { success: false, error: { code: 0, message: "Unexpected Server Response" } };
  if (typeof Y == "undefined")
    Y = null;
  if (I.constructor === Array && O && O.constructor === Array) {
    for (E = 0;E < I.length; E++)
      Q = !Y || typeof Y[E] == "undefined" ? $ : Y[E], R = typeof O[E] == "undefined" ? null : O[E], this._doCallback(I[E], R, Q, V[E]);
    return;
  }
  if (Y && typeof Y.data != "undefined") {
    var B;
    if (Y.data.constructor === Array) {
      B = [];
      for (E = 0;E < Y.data.length; E++)
        B.push(this._formatResults(Y.component, Y.data[E]));
    } else
      B = this._formatResults(Y.component, Y.data);
    Y.data = B;
  }
  var A;
  if (Y)
    if (typeof Y.data != "undefined")
      A = Y.data;
    else
      console.warn("Received empty data from \'" + I.component + "\'."), A = null;
  else
    A = $;
  var T;
  if (A.constructor === Array)
    for (E = 0;E < A.length; E++)
      T = new P.io.events.OutputEvent(I.component, I[E], A[E]), this.dispatchEvent(T);
  else
    T = new P.io.events.OutputEvent(I.component, I, A), this.dispatchEvent(T);
  if (O && O.constructor === Function)
    O.call(V, A);
}, _formatResults: function(I, O) {
  var Y, V, E, Q, R, H = null;
  if (typeof O.success != "undefined" && O.success)
    H = P.io.call_validators.getValidator(I);
  if (!H)
    return O;
  var z = H.returns;
  for (V in z) {
    if (typeof O[V] == "undefined" && O.success !== false) {
      console.warn("Newgrounds.io server failed to return expected \'" + V + "\' in \'" + I + "\' data.");
      continue;
    }
    if (typeof z[V].array != "undefined") {
      if (typeof z[V].array.object != "undefined")
        R = z[V].array.object;
      else
        R = z[V].array;
      if (typeof P.io.model[R] == "undefined") {
        console.warn("Received unsupported model \'" + R + "\' from \'" + I + "\'.");
        continue;
      }
      if (O[V].constructor !== Array) {
        console.warn("Expected array<" + R + "> value for \'" + V + "\' in \'" + I + "\' data, got " + typeof O[V]);
        continue;
      }
      Q = [];
      for (E = 0;E < O[V].length; E++)
        Y = new P.io.model[R](this), Y.fromObject(O[V][E]), Q.push(Y);
      O[V] = Q;
    } else if (typeof z[V].object != "undefined" && O[V]) {
      if (R = z[V].object, typeof P.io.model[R] == "undefined") {
        console.warn("Received unsupported model \'" + R + "\' from \'" + I + "\'.");
        continue;
      }
      Y = new P.io.model[R](this), Y.fromObject(O[V]), O[V] = Y;
    }
  }
  return O;
}, _doCall: function(I, O, Y) {
  if (!this.app_id)
    throw new Error("Attempted to call Newgrounds.io server without setting an app_id in Newgrounds.io.core instance.");
  var V, E = false, Q = this;
  function R(U) {
    var J = P.io.call_validators.getValidator(U.component);
    if (J.hasOwnProperty("redirect") && J.redirect) {
      var C = U.parameters;
      if (!C || !C.hasOwnProperty("redirect") || C.redirect)
        return true;
    }
    return false;
  }
  if (I.constructor === Array) {
    V = [];
    for (i = 0;i < I.length; i++) {
      if (R(I[i]))
        throw new Error("Loader components can not be called in an array without a redirect=false parameter.");
      V.push(I[i].toObject());
    }
  } else
    V = I.toObject(), E = R(I);
  var H = { app_id: this.app_id, session_id: this.session_id, call: V };
  if (this.debug)
    H.debug = 1;
  if (E) {
    var z = { success: true, app_id: this.app_id, result: { component: I.component, data: { success: true } } }, $ = document.createElement("form");
    $.action = P.io.GATEWAY_URI, $.target = "_blank", $.method = "POST";
    var B = document.createElement("input");
    B.type = "hidden", B.name = "input", $.appendChild(B), document.body.appendChild($), B.value = JSON.stringify(H), $.submit(), document.body.removeChild($);
  } else {
    var A = new XMLHttpRequest, T, M = null, Z = this;
    A.onreadystatechange = function() {
      if (A.readyState == 4) {
        var U;
        try {
          U = JSON.parse(A.responseText).result;
        } catch (J) {
        }
        Z._doCallback(I, O, U, Y);
      }
    };
    var K = new FormData, X = typeof Array.prototype.toJSON != "undefined" ? Array.prototype.toJSON : null;
    if (X)
      delete Array.prototype.toJSON;
    if (K.append("input", JSON.stringify(H)), X)
      Array.prototype.toJSON = X;
    A.open("POST", P.io.GATEWAY_URI, true), A.send(K);
  }
}, _doValidateCall: function(I, O) {
  var Y, V, E, Q, R = P.io.call_validators.getValidator(I);
  if (!R)
    throw new Error("\'" + I + "\' is not a valid server component.");
  if (R.require_session && !this.session_id)
    throw new Error("\'" + I + "\' requires a session id");
  if (R.import && R.import.length > 0)
    for (Y = 0;Y < R.import.length; Y++)
      V = R.import[Y].split("."), this._doValidateCall(V[0], V[1], O);
  var H;
  for (E in R.params) {
    if (Q = R.params[E], H = O && typeof O[E] != "undefined" ? O[E] : null, !H && Q.extract_from && Q.extract_from.alias)
      H = O[Q.extract_from.alias];
    if (H === null) {
      if (Q.required)
        throw new Error("Missing required parameter for \'" + I + "\': " + E);
      continue;
    }
    if (Q.extract_from && H.constructor === P.io.model[Q.extract_from.object])
      H = H[Q.extract_from.property];
    if (!P.io.model.checkStrictValue(null, E, H, Q.type, null, null, null))
      throw new Error("Illegal value for \'" + E + "\' parameter of \'" + I + "\': " + H);
  }
}, _validateCall: function(I) {
  var O;
  if (I.constructor === Array) {
    var Y = [];
    for (O = 0;O < I.length; O++)
      Y.push(this._validateCall(I[O]));
    return Y;
  } else if (I.constructor !== P.io.model.call)
    throw new Error("Unexpected \'call_model\' value. Expected Newgrounds.io.model.call instance.");
  var { component: V, parameters: E, echo: Q } = I;
  if (E && E.constructor === Array)
    for (O = 0;O < E.length; O++)
      this._doValidateCall(V, E[O]);
  else
    this._doValidateCall(V, E);
  var R = { component: I.component }, H = P.io.call_validators.getValidator(I.component);
  if (typeof E != "undefined")
    if (H.secure) {
      var z = this._encryptCall(I);
      R.secure = z.secure;
    } else
      R.parameters = E;
  if (typeof Q != "undefined")
    R.echo = Q;
  return R;
} };
P.io.core.prototype.constructor = P.io.core;
P.io.core.instance_id = 0;
P.io.core.getNextInstanceID = function() {
  return P.io.core.instance_id++, P.io.core.instance_id;
};
P.io.urlHelper = function() {
  var I = window.location.href, O = {}, Y = I.split("?").pop();
  if (Y) {
    var V = Y.split("&"), E;
    for (var Q = 0;Q < V.length; Q++)
      E = V[Q].split("="), O[E[0]] = E[1];
  }
  this.getRequestQueryParam = function(R, H) {
    if (typeof H == "undefined")
      H = null;
    return typeof O[R] == "undefined" ? H : O[R];
  };
};
P.io.model.call = function(I, O) {
  var Y, V, E, Q;
  this.__property_names = ["component", "echo", "parameters", "secure"], this.__classname = "Newgrounds.io.model.call", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "component", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "component", R, String, null, null, null), Y = R;
  } });
  var V;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(R) {
    V = R;
  } });
  var E;
  Object.defineProperty(this, "parameters", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "parameters", R, Object, null, Object, null), E = R;
  } });
  var Q;
  if (Object.defineProperty(this, "secure", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "secure", R, String, null, null, null), Q = R;
  } }), O)
    this.fromObject(O);
};
P.io.model.call.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.call.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.call.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.call.prototype.constructor = P.io.model.call;
P.io.model.debug = function(I, O) {
  var Y, V;
  this.__property_names = ["exec_time", "input"], this.__classname = "Newgrounds.io.model.debug", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "exec_time", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "exec_time", E, String, null, null, null), Y = E;
  } });
  var V;
  if (Object.defineProperty(this, "input", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "input", E, null, "input", null, null), V = E;
  } }), O)
    this.fromObject(O);
};
P.io.model.debug.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.debug.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.debug.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "input" && O)
      O = new P.io.model.input(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.debug.prototype.constructor = P.io.model.debug;
P.io.model.error = function(I, O) {
  var Y, V;
  this.__property_names = ["code", "message"], this.__classname = "Newgrounds.io.model.error", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "code", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "code", E, Number, null, null, null), Y = E;
  } });
  var V;
  if (Object.defineProperty(this, "message", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "message", E, String, null, null, null), V = E;
  } }), O)
    this.fromObject(O);
};
P.io.model.error.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.error.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.error.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.error.get = function(I, O) {
  var Y = new P.io.model.error;
  return Y.message = I ? I : "Unknown Error", Y.code = O ? O : 0, Y;
};
P.io.model.error.MISSING_INPUT = 100;
P.io.model.error.INVALID_INPUT = 101;
P.io.model.error.MISSING_PARAMETER = 102;
P.io.model.error.INVALID_PARAMETER = 103;
P.io.model.error.EXPIRED_SESSION = 104;
P.io.model.error.DUPLICATE_SESSION = 105;
P.io.model.error.MAX_CONNECTIONS_EXCEEDED = 106;
P.io.model.error.MAX_CALLS_EXCEEDED = 107;
P.io.model.error.MEMORY_EXCEEDED = 108;
P.io.model.error.TIMED_OUT = 109;
P.io.model.error.LOGIN_REQUIRED = 110;
P.io.model.error.INVALID_APP_ID = 200;
P.io.model.error.INVALID_ENCRYPTION = 201;
P.io.model.error.INVALID_MEDAL_ID = 202;
P.io.model.error.INVALID_SCOREBOARD_ID = 203;
P.io.model.error.INVALID_SAVEGROUP_ID = 204;
P.io.model.error.SERVER_UNAVAILABLE = 504;
P.io.model.error.prototype.constructor = P.io.model.error;
P.io.model.input = function(I, O) {
  var Y, V, E, Q, R;
  this.__property_names = ["app_id", "call", "debug", "echo", "session_id"], this.__classname = "Newgrounds.io.model.input", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "app_id", H, String, null, null, null), Y = H;
  } });
  var V;
  Object.defineProperty(this, "call", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "call", H, null, "call", null, "call"), V = H;
  } });
  var E;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "debug", H, Boolean, null, null, null), E = H;
  } });
  var Q;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(H) {
    Q = H;
  } });
  var R;
  if (Object.defineProperty(this, "session_id", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "session_id", H, String, null, null, null), R = H;
  } }), O)
    this.fromObject(O);
};
P.io.model.input.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.input.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.input.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "call" && O)
      O = new P.io.model.call(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.input.prototype.constructor = P.io.model.input;
P.io.model.medal = function(I, O) {
  var Y, V, E, Q, R, H, z, $;
  this.__property_names = ["description", "difficulty", "icon", "id", "name", "secret", "unlocked", "value"], this.__classname = "Newgrounds.io.model.medal", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "description", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "description", B, String, null, null, null), Y = B;
  } });
  var V;
  Object.defineProperty(this, "difficulty", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "difficulty", B, Number, null, null, null), V = B;
  } });
  var E;
  Object.defineProperty(this, "icon", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "icon", B, String, null, null, null), E = B;
  } });
  var Q;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "id", B, Number, null, null, null), Q = B;
  } });
  var R;
  Object.defineProperty(this, "name", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "name", B, String, null, null, null), R = B;
  } });
  var H;
  Object.defineProperty(this, "secret", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "secret", B, Boolean, null, null, null), H = B;
  } });
  var z;
  Object.defineProperty(this, "unlocked", { get: function() {
    return typeof z == "undefined" ? null : z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "unlocked", B, Boolean, null, null, null), z = B;
  } });
  var $;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof $ == "undefined" ? null : $;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "value", B, Number, null, null, null), $ = B;
  } }), O)
    this.fromObject(O);
};
P.io.model.medal.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.medal.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.medal.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.medal.prototype.unlock = function(I) {
  var O = this;
  if (this._has_ngio_user())
    this.__ngio.callComponent("Medal.unlock", { id: this.id }, function(E) {
      if (E.success)
        this.unlocked = true;
      I(E);
    });
  else if (typeof I == "function") {
    var Y = P.io.model.error.get("This function requires a valid user session.", P.io.model.error.LOGIN_REQUIRED), V = { success: false, error: Y };
    I(V);
  }
};
P.io.model.medal.prototype.constructor = P.io.model.medal;
P.io.model.output = function(I, O) {
  var Y, V, E, Q, R, H, z, $;
  this.__property_names = ["api_version", "app_id", "debug", "echo", "error", "help_url", "result", "success"], this.__classname = "Newgrounds.io.model.output", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "api_version", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "api_version", B, String, null, null, null), Y = B;
  } });
  var V;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "app_id", B, String, null, null, null), V = B;
  } });
  var E;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "debug", B, null, "debug", null, null), E = B;
  } });
  var Q;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(B) {
    Q = B;
  } });
  var R;
  Object.defineProperty(this, "error", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "error", B, null, "error", null, null), R = B;
  } });
  var H;
  Object.defineProperty(this, "help_url", { get: function() {
    return typeof H == "undefined" ? null : H;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "help_url", B, String, null, null, null), H = B;
  } });
  var z;
  Object.defineProperty(this, "result", { get: function() {
    return typeof z == "undefined" ? null : z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "result", B, null, "result", null, "result"), z = B;
  } });
  var $;
  if (Object.defineProperty(this, "success", { get: function() {
    return typeof $ == "undefined" ? null : $;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "success", B, Boolean, null, null, null), $ = B;
  } }), O)
    this.fromObject(O);
};
P.io.model.output.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.output.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.output.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "debug" && O)
      O = new P.io.model.debug(this.__ngio, O);
    else if (this.__property_names[V] == "error" && O)
      O = new P.io.model.error(this.__ngio, O);
    else if (this.__property_names[V] == "result" && O)
      O = new P.io.model.result(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.output.prototype.constructor = P.io.model.output;
P.io.model.result = function(I, O) {
  var Y, V, E;
  this.__property_names = ["component", "data", "echo"], this.__classname = "Newgrounds.io.model.result", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "component", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(Q) {
    P.io.model.checkStrictValue(this.__classname, "component", Q, String, null, null, null), Y = Q;
  } });
  var V;
  Object.defineProperty(this, "data", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Q) {
    P.io.model.checkStrictValue(this.__classname, "data", Q, Object, null, Object, null), V = Q;
  } });
  var E;
  if (Object.defineProperty(this, "echo", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(Q) {
    E = Q;
  } }), O)
    this.fromObject(O);
};
P.io.model.result.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.result.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.result.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.result.prototype.constructor = P.io.model.result;
P.io.model.score = function(I, O) {
  var Y, V, E, Q;
  this.__property_names = ["formatted_value", "tag", "user", "value"], this.__classname = "Newgrounds.io.model.score", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "formatted_value", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "formatted_value", R, String, null, null, null), Y = R;
  } });
  var V;
  Object.defineProperty(this, "tag", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "tag", R, String, null, null, null), V = R;
  } });
  var E;
  Object.defineProperty(this, "user", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "user", R, null, "user", null, null), E = R;
  } });
  var Q;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "value", R, Number, null, null, null), Q = R;
  } }), O)
    this.fromObject(O);
};
P.io.model.score.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.score.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.score.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "user" && O)
      O = new P.io.model.user(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.score.prototype.constructor = P.io.model.score;
P.io.model.scoreboard = function(I, O) {
  var Y, V;
  this.__property_names = ["id", "name"], this.__classname = "Newgrounds.io.model.scoreboard", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "id", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "id", E, Number, null, null, null), Y = E;
  } });
  var V;
  if (Object.defineProperty(this, "name", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(E) {
    P.io.model.checkStrictValue(this.__classname, "name", E, String, null, null, null), V = E;
  } }), O)
    this.fromObject(O);
};
P.io.model.scoreboard.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.scoreboard.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.scoreboard.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.scoreboard.prototype.postScore = function(I, O, Y) {
  var V = this;
  if (typeof O == "function" && !Y)
    Y = O, O = null;
  if (!O)
    O = null;
  if (this._has_ngio_user())
    this.__ngio.callComponent("ScoreBoard.postScore", { id: this.id, value: I, tag: O }, function(R) {
      Y(R);
    });
  else if (typeof Y == "function") {
    var E = P.io.model.error.get("This function requires a valid user session.", P.io.model.error.LOGIN_REQUIRED), Q = { success: false, error: E };
    Y(Q);
  }
};
P.io.model.scoreboard.prototype.constructor = P.io.model.scoreboard;
P.io.model.session = function(I, O) {
  var Y, V, E, Q, R;
  this.__property_names = ["expired", "id", "passport_url", "remember", "user"], this.__classname = "Newgrounds.io.model.session", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "expired", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "expired", H, Boolean, null, null, null), Y = H;
  } });
  var V;
  Object.defineProperty(this, "id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "id", H, String, null, null, null), V = H;
  } });
  var E;
  Object.defineProperty(this, "passport_url", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "passport_url", H, String, null, null, null), E = H;
  } });
  var Q;
  Object.defineProperty(this, "remember", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "remember", H, Boolean, null, null, null), Q = H;
  } });
  var R;
  if (Object.defineProperty(this, "user", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function(H) {
    P.io.model.checkStrictValue(this.__classname, "user", H, null, "user", null, null), R = H;
  } }), O)
    this.fromObject(O);
};
P.io.model.session.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.session.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.session.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "user" && O)
      O = new P.io.model.user(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.session.prototype.constructor = P.io.model.session;
P.io.model.user = function(I, O) {
  var Y, V, E, Q;
  this.__property_names = ["icons", "id", "name", "supporter"], this.__classname = "Newgrounds.io.model.user", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "icons", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "icons", R, null, "usericons", null, null), Y = R;
  } });
  var V;
  Object.defineProperty(this, "id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "id", R, Number, null, null, null), V = R;
  } });
  var E;
  Object.defineProperty(this, "name", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "name", R, String, null, null, null), E = R;
  } });
  var Q;
  if (Object.defineProperty(this, "supporter", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function(R) {
    P.io.model.checkStrictValue(this.__classname, "supporter", R, Boolean, null, null, null), Q = R;
  } }), O)
    this.fromObject(O);
};
P.io.model.user.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.user.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.user.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++) {
    if (O = I[this.__property_names[V]], this.__property_names[V] == "icons" && O)
      O = new P.io.model.usericons(this.__ngio, O);
    this[this.__property_names[V]] = O;
  }
};
P.io.model.user.prototype.constructor = P.io.model.user;
P.io.model.usericons = function(I, O) {
  var Y, V, E;
  this.__property_names = ["large", "medium", "small"], this.__classname = "Newgrounds.io.model.usericons", this.__ngio = I;
  var Y;
  Object.defineProperty(this, "large", { get: function() {
    return typeof Y == "undefined" ? null : Y;
  }, set: function(Q) {
    P.io.model.checkStrictValue(this.__classname, "large", Q, String, null, null, null), Y = Q;
  } });
  var V;
  Object.defineProperty(this, "medium", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function(Q) {
    P.io.model.checkStrictValue(this.__classname, "medium", Q, String, null, null, null), V = Q;
  } });
  var E;
  if (Object.defineProperty(this, "small", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function(Q) {
    P.io.model.checkStrictValue(this.__classname, "small", Q, String, null, null, null), E = Q;
  } }), O)
    this.fromObject(O);
};
P.io.model.usericons.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
P.io.model.usericons.prototype.toObject = function() {
  var I = {};
  for (var O = 0;O < this.__property_names.length; O++)
    if (typeof this[this.__property_names[O]] != "undefined")
      I[this.__property_names[O]] = this[this.__property_names[O]];
  return I;
};
P.io.model.usericons.prototype.fromObject = function(I) {
  var O, Y;
  for (var V = 0;V < this.__property_names.length; V++)
    O = I[this.__property_names[V]], this[this.__property_names[V]] = O;
};
P.io.model.usericons.prototype.constructor = P.io.model.usericons;
P.io.call_validators.getValidator = function(I) {
  var O = I.split("."), Y = O[0], V = O[1], E = P.io.call_validators[Y] && P.io.call_validators[Y][V] ? P.io.call_validators[Y][V] : null;
  return E;
};
P.io.call_validators.App = { checkSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: { session: { object: "session", description: null } } }, endSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: {} }, getCurrentVersion: { require_session: false, secure: false, redirect: false, import: false, params: { version: { type: String, extract_from: null, required: null, description: 'The version number (in "X.Y.Z" format) of the client-side app. (default = "0.0.0")' } }, returns: {} }, getHostLicense: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: null, description: "The host domain to check (ei, somesite.com)." } }, returns: {} }, logView: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Examples: "www.somesite.com", "localHost"' } }, returns: {} }, startSession: { require_session: false, secure: false, redirect: false, import: false, params: { force: { type: Boolean, extract_from: null, required: null, description: "If true, will create a new session even if the user already has an existing one.\n\nNote: Any previous session ids will no longer be valid if this is used." } }, returns: { session: { object: "session", description: null } } } };
P.io.call_validators.Event = { logEvent: { require_session: false, secure: false, redirect: false, import: false, params: { event_name: { type: String, extract_from: null, required: true, description: "The name of your custom event as defined in your Referrals & Events settings." }, host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "newgrounds.com", "localHost"' } }, returns: {} } };
P.io.call_validators.Gateway = { getDatetime: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, getVersion: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, ping: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} } };
P.io.call_validators.Loader = { loadAuthorUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadMoreGames: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadNewgrounds: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadOfficialUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadReferral: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." }, referral_name: { type: String, extract_from: null, required: true, description: 'The name of the referral (as defined in your "Referrals & Events" settings).' } }, returns: {} } };
P.io.call_validators.Medal = { getList: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { medals: { array: { object: "medal" }, description: "An array of medal objects." } } }, unlock: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "medal", alias: "medal", property: "id" }, required: true, description: "The numeric ID of the medal to unlock." } }, returns: { medal: { object: "medal", description: "The #medal that was unlocked." } } } };
P.io.call_validators.ScoreBoard = { getBoards: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { scoreboards: { array: { object: "scoreboard" }, description: "An array of #scoreboard objects." } } }, getScores: { require_session: false, secure: false, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, limit: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to include in the list. Default = 10." }, period: { type: String, extract_from: null, required: null, description: "The time-frame to pull scores from (see notes for acceptable values)." }, skip: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to skip before starting the list. Default = 0." }, social: { type: Boolean, extract_from: null, required: null, description: "If set to true, only social scores will be loaded (scores by the user and their friends). This param will be ignored if there is no valid session id and the \'user\' param is absent." }, tag: { type: String, extract_from: null, required: null, description: "A tag to filter results by." }, user: { type: "mixed", extract_from: null, required: null, description: "A user\'s ID or name.  If \'social\' is true, this user and their friends will be included. Otherwise, only scores for this user will be loaded. If this param is missing and there is a valid session id, that user will be used by default." } }, returns: { scoreboard: { object: "scoreboard", description: "The #scoreboard being queried." }, scores: { array: { object: "score" }, description: "An array of #score objects." }, user: { object: "user", description: "The #user the score list is associated with (either as defined in the \'user\' param, or extracted from the current session when \'social\' is set to true)" } } }, postScore: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, tag: { type: String, extract_from: null, required: null, description: "An optional tag that can be used to filter scores via ScoreBoard.getScores" }, value: { type: Number, extract_from: null, required: true, description: "The int value of the score." } }, returns: { score: { object: "score", description: "The #score that was posted to the board." }, scoreboard: { object: "scoreboard", description: "The #scoreboard that was posted to." } } } };
P.io.SessionLoader = function(I) {
  if (!I || I.constructor !== P.io.core)
    throw new Error("\'ngio\' must be a \'Newgrounds.io.core\' instance.");
  this.__ngio = I;
  var O = null;
  Object.defineProperty(this, "session", { set: function(Y) {
    if (Y && !Y.constructor === P.io.model.session)
      throw new Error("\'session\' must be a \'Newgrounds.io.model.session\' instance.");
    O = Y;
  }, get: function() {
    return O;
  } });
};
P.io.SessionLoader.prototype = { _event_listeners: {}, last_error: null, passport_window: null, addEventListener: P.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: P.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: P.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: P.io.events.EventDispatcher.prototype.dispatchEvent, getValidSession: function(I, O) {
  var Y = this;
  Y.checkSession(function(V) {
    if (!V || V.expired)
      Y.startSession(I, O);
    else
      I.call(O, V);
  });
}, startSession: function(I, O) {
  var Y = new P.io.events.SessionEvent, V = this;
  this.__ngio.callComponent("App.startSession", function(E) {
    if (!E.success || !E.session) {
      if (E.error)
        V.last_error = E.error;
      else
        V.last_error = new P.io.model.error, V.last_error.message = "Unexpected Error";
      Y.type = P.io.events.SessionEvent.SESSION_EXPIRED, V.session = null;
    } else
      Y.type = P.io.events.SessionEvent.REQUEST_LOGIN, Y.passport_url = E.session.passport_url, V.session = E.session;
    if (V.__ngio.session_id = V.session ? V.session.id : null, V.dispatchEvent(Y), I && I.constructor === Function)
      I.call(O, V.session);
  });
}, checkSession: function(I, O) {
  var Y = new P.io.events.SessionEvent, V = this;
  if (V.session && V.session.user) {
    if (Y.type = P.io.events.SessionEvent.USER_LOADED, Y.user = V.session.user, V.dispatchEvent(Y), I && I.constructor === Function)
      I.call(O, V.session);
  } else if (!this.__ngio.session_id) {
    if (Y.type = P.io.events.SessionEvent.SESSION_EXPIRED, V.session = null, V.dispatchEvent(Y), I && I.constructor === Function)
      I.call(O, null);
  } else
    this.__ngio.callComponent("App.checkSession", function(E) {
      if (!E.success || !E.session || E.session.expired)
        if (Y.type = P.io.events.SessionEvent.SESSION_EXPIRED, V.session = null, E.error)
          V.last_error = E.error;
        else if (V.last_error = new P.io.model.error, E.session && E.session.expired)
          V.last_error.message = "Session is Expired";
        else
          V.last_error.message = "Unexpected Error";
      else if (!E.session.user)
        Y.type = P.io.events.SessionEvent.REQUEST_LOGIN, Y.passport_url = E.session.passport_url, V.session = E.session;
      else
        Y.type = P.io.events.SessionEvent.USER_LOADED, Y.user = E.session.user, V.session = E.session;
      if (V.__ngio.session_id = V.session ? V.session.id : null, V.dispatchEvent(Y), I && I.constructor === Function)
        I.call(O, V.session);
    });
}, endSession: function(I, O) {
  var Y = this, V = this.__ngio;
  this.__ngio.callComponent("App.endSession", function(E) {
    Y.session = null, V.session_id = null;
    var Q = new P.io.events.SessionEvent(P.io.events.SessionEvent.SESSION_EXPIRED);
    if (Y.dispatchEvent(Q), I && I.constructor === Function)
      I.call(O, Y.session);
  }), this.__ngio.session_id = null, this.session = null;
}, loadPassport: function(I) {
  if (typeof I != "string")
    I = "_blank";
  if (!this.session || !this.session.passport_url)
    return console.warn("Attempted to open Newgrounds Passport without a valid passport_url. Be sure you have called getValidSession() first!."), false;
  if (this.passport_window = window.open(this.session.passport_url, I), !this.passport_window)
    console.warn("Unable to detect passport window. Pop-up blockers will prevent loading Newgrounds Passport if loadPassport() or requestLogin() are not called from within a mouse click handler.");
  return this.passportOpen();
}, closePassport: function() {
  if (!this.passport_window)
    return false;
  return this.passport_window.close(), this.passportOpen();
}, passportOpen: function() {
  return this.passport_window && this.passport_window.parent ? true : false;
} };
P.io.SessionLoader.prototype.constructor = P.io.SessionLoader;
var k = k || function(I, O) {
  var Y = {}, V = Y.lib = {}, E = function() {
  }, Q = V.Base = { extend: function(M) {
    E.prototype = this;
    var Z = new E;
    return M && Z.mixIn(M), Z.hasOwnProperty("init") || (Z.init = function() {
      Z.$super.init.apply(this, arguments);
    }), Z.init.prototype = Z, Z.$super = this, Z;
  }, create: function() {
    var M = this.extend();
    return M.init.apply(M, arguments), M;
  }, init: function() {
  }, mixIn: function(M) {
    for (var Z in M)
      M.hasOwnProperty(Z) && (this[Z] = M[Z]);
    M.hasOwnProperty("toString") && (this.toString = M.toString);
  }, clone: function() {
    return this.init.prototype.extend(this);
  } }, R = V.WordArray = Q.extend({ init: function(M, Z) {
    M = this.words = M || [], this.sigBytes = Z != O ? Z : 4 * M.length;
  }, toString: function(M) {
    return (M || z).stringify(this);
  }, concat: function(M) {
    var Z = this.words, K = M.words, X = this.sigBytes;
    if (M = M.sigBytes, this.clamp(), X % 4)
      for (var U = 0;U < M; U++)
        Z[X + U >>> 2] |= (K[U >>> 2] >>> 24 - 8 * (U % 4) & 255) << 24 - 8 * ((X + U) % 4);
    else if (65535 < K.length)
      for (U = 0;U < M; U += 4)
        Z[X + U >>> 2] = K[U >>> 2];
    else
      Z.push.apply(Z, K);
    return this.sigBytes += M, this;
  }, clamp: function() {
    var M = this.words, Z = this.sigBytes;
    M[Z >>> 2] &= 4294967295 << 32 - 8 * (Z % 4), M.length = I.ceil(Z / 4);
  }, clone: function() {
    var M = Q.clone.call(this);
    return M.words = this.words.slice(0), M;
  }, random: function(M) {
    for (var Z = [], K = 0;K < M; K += 4)
      Z.push(4294967296 * I.random() | 0);
    return new R.init(Z, M);
  } }), H = Y.enc = {}, z = H.Hex = { stringify: function(M) {
    var Z = M.words;
    M = M.sigBytes;
    for (var K = [], X = 0;X < M; X++) {
      var U = Z[X >>> 2] >>> 24 - 8 * (X % 4) & 255;
      K.push((U >>> 4).toString(16)), K.push((U & 15).toString(16));
    }
    return K.join("");
  }, parse: function(M) {
    for (var Z = M.length, K = [], X = 0;X < Z; X += 2)
      K[X >>> 3] |= parseInt(M.substr(X, 2), 16) << 24 - 4 * (X % 8);
    return new R.init(K, Z / 2);
  } }, $ = H.Latin1 = { stringify: function(M) {
    var Z = M.words;
    M = M.sigBytes;
    for (var K = [], X = 0;X < M; X++)
      K.push(String.fromCharCode(Z[X >>> 2] >>> 24 - 8 * (X % 4) & 255));
    return K.join("");
  }, parse: function(M) {
    for (var Z = M.length, K = [], X = 0;X < Z; X++)
      K[X >>> 2] |= (M.charCodeAt(X) & 255) << 24 - 8 * (X % 4);
    return new R.init(K, Z);
  } }, B = H.Utf8 = { stringify: function(M) {
    try {
      return decodeURIComponent(escape($.stringify(M)));
    } catch (Z) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse: function(M) {
    return $.parse(unescape(encodeURIComponent(M)));
  } }, A = V.BufferedBlockAlgorithm = Q.extend({ reset: function() {
    this._data = new R.init, this._nDataBytes = 0;
  }, _append: function(M) {
    typeof M == "string" && (M = B.parse(M)), this._data.concat(M), this._nDataBytes += M.sigBytes;
  }, _process: function(M) {
    var Z = this._data, K = Z.words, X = Z.sigBytes, U = this.blockSize, J = X / (4 * U), J = M ? I.ceil(J) : I.max((J | 0) - this._minBufferSize, 0);
    if (M = J * U, X = I.min(4 * M, X), M) {
      for (var C = 0;C < M; C += U)
        this._doProcessBlock(K, C);
      C = K.splice(0, M), Z.sigBytes -= X;
    }
    return new R.init(C, X);
  }, clone: function() {
    var M = Q.clone.call(this);
    return M._data = this._data.clone(), M;
  }, _minBufferSize: 0 });
  V.Hasher = A.extend({ cfg: Q.extend(), init: function(M) {
    this.cfg = this.cfg.extend(M), this.reset();
  }, reset: function() {
    A.reset.call(this), this._doReset();
  }, update: function(M) {
    return this._append(M), this._process(), this;
  }, finalize: function(M) {
    return M && this._append(M), this._doFinalize();
  }, blockSize: 16, _createHelper: function(M) {
    return function(Z, K) {
      return new M.init(K).finalize(Z);
    };
  }, _createHmacHelper: function(M) {
    return function(Z, K) {
      return new T.HMAC.init(M, K).finalize(Z);
    };
  } });
  var T = Y.algo = {};
  return Y;
}(Math);
(function() {
  var I = k, O = I.lib.WordArray;
  I.enc.Base64 = { stringify: function(Y) {
    var { words: V, sigBytes: E } = Y, Q = this._map;
    Y.clamp(), Y = [];
    for (var R = 0;R < E; R += 3)
      for (var H = (V[R >>> 2] >>> 24 - 8 * (R % 4) & 255) << 16 | (V[R + 1 >>> 2] >>> 24 - 8 * ((R + 1) % 4) & 255) << 8 | V[R + 2 >>> 2] >>> 24 - 8 * ((R + 2) % 4) & 255, z = 0;4 > z && R + 0.75 * z < E; z++)
        Y.push(Q.charAt(H >>> 6 * (3 - z) & 63));
    if (V = Q.charAt(64))
      for (;Y.length % 4; )
        Y.push(V);
    return Y.join("");
  }, parse: function(Y) {
    var V = Y.length, E = this._map, Q = E.charAt(64);
    Q && (Q = Y.indexOf(Q), Q != -1 && (V = Q));
    for (var Q = [], R = 0, H = 0;H < V; H++)
      if (H % 4) {
        var z = E.indexOf(Y.charAt(H - 1)) << 2 * (H % 4), $ = E.indexOf(Y.charAt(H)) >>> 6 - 2 * (H % 4);
        Q[R >>> 2] |= (z | $) << 24 - 8 * (R % 4), R++;
      }
    return O.create(Q, R);
  }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
})();
(function(I) {
  function O(A, T, M, Z, K, X, U) {
    return A = A + (T & M | ~T & Z) + K + U, (A << X | A >>> 32 - X) + T;
  }
  function Y(A, T, M, Z, K, X, U) {
    return A = A + (T & Z | M & ~Z) + K + U, (A << X | A >>> 32 - X) + T;
  }
  function V(A, T, M, Z, K, X, U) {
    return A = A + (T ^ M ^ Z) + K + U, (A << X | A >>> 32 - X) + T;
  }
  function E(A, T, M, Z, K, X, U) {
    return A = A + (M ^ (T | ~Z)) + K + U, (A << X | A >>> 32 - X) + T;
  }
  for (var Q = k, z = Q.lib, R = z.WordArray, H = z.Hasher, z = Q.algo, $ = [], B = 0;64 > B; B++)
    $[B] = 4294967296 * I.abs(I.sin(B + 1)) | 0;
  z = z.MD5 = H.extend({ _doReset: function() {
    this._hash = new R.init([1732584193, 4023233417, 2562383102, 271733878]);
  }, _doProcessBlock: function(A, T) {
    for (var M = 0;16 > M; M++) {
      var Z = T + M, K = A[Z];
      A[Z] = (K << 8 | K >>> 24) & 16711935 | (K << 24 | K >>> 8) & 4278255360;
    }
    var M = this._hash.words, Z = A[T + 0], K = A[T + 1], X = A[T + 2], U = A[T + 3], J = A[T + 4], C = A[T + 5], y = A[T + 6], m = A[T + 7], u = A[T + 8], q = A[T + 9], S = A[T + 10], x = A[T + 11], f = A[T + 12], h = A[T + 13], D = A[T + 14], w = A[T + 15], W = M[0], G = M[1], F = M[2], L = M[3], W = O(W, G, F, L, Z, 7, $[0]), L = O(L, W, G, F, K, 12, $[1]), F = O(F, L, W, G, X, 17, $[2]), G = O(G, F, L, W, U, 22, $[3]), W = O(W, G, F, L, J, 7, $[4]), L = O(L, W, G, F, C, 12, $[5]), F = O(F, L, W, G, y, 17, $[6]), G = O(G, F, L, W, m, 22, $[7]), W = O(W, G, F, L, u, 7, $[8]), L = O(L, W, G, F, q, 12, $[9]), F = O(F, L, W, G, S, 17, $[10]), G = O(G, F, L, W, x, 22, $[11]), W = O(W, G, F, L, f, 7, $[12]), L = O(L, W, G, F, h, 12, $[13]), F = O(F, L, W, G, D, 17, $[14]), G = O(G, F, L, W, w, 22, $[15]), W = Y(W, G, F, L, K, 5, $[16]), L = Y(L, W, G, F, y, 9, $[17]), F = Y(F, L, W, G, x, 14, $[18]), G = Y(G, F, L, W, Z, 20, $[19]), W = Y(W, G, F, L, C, 5, $[20]), L = Y(L, W, G, F, S, 9, $[21]), F = Y(F, L, W, G, w, 14, $[22]), G = Y(G, F, L, W, J, 20, $[23]), W = Y(W, G, F, L, q, 5, $[24]), L = Y(L, W, G, F, D, 9, $[25]), F = Y(F, L, W, G, U, 14, $[26]), G = Y(G, F, L, W, u, 20, $[27]), W = Y(W, G, F, L, h, 5, $[28]), L = Y(L, W, G, F, X, 9, $[29]), F = Y(F, L, W, G, m, 14, $[30]), G = Y(G, F, L, W, f, 20, $[31]), W = V(W, G, F, L, C, 4, $[32]), L = V(L, W, G, F, u, 11, $[33]), F = V(F, L, W, G, x, 16, $[34]), G = V(G, F, L, W, D, 23, $[35]), W = V(W, G, F, L, K, 4, $[36]), L = V(L, W, G, F, J, 11, $[37]), F = V(F, L, W, G, m, 16, $[38]), G = V(G, F, L, W, S, 23, $[39]), W = V(W, G, F, L, h, 4, $[40]), L = V(L, W, G, F, Z, 11, $[41]), F = V(F, L, W, G, U, 16, $[42]), G = V(G, F, L, W, y, 23, $[43]), W = V(W, G, F, L, q, 4, $[44]), L = V(L, W, G, F, f, 11, $[45]), F = V(F, L, W, G, w, 16, $[46]), G = V(G, F, L, W, X, 23, $[47]), W = E(W, G, F, L, Z, 6, $[48]), L = E(L, W, G, F, m, 10, $[49]), F = E(F, L, W, G, D, 15, $[50]), G = E(G, F, L, W, C, 21, $[51]), W = E(W, G, F, L, f, 6, $[52]), L = E(L, W, G, F, U, 10, $[53]), F = E(F, L, W, G, S, 15, $[54]), G = E(G, F, L, W, K, 21, $[55]), W = E(W, G, F, L, u, 6, $[56]), L = E(L, W, G, F, w, 10, $[57]), F = E(F, L, W, G, y, 15, $[58]), G = E(G, F, L, W, h, 21, $[59]), W = E(W, G, F, L, J, 6, $[60]), L = E(L, W, G, F, x, 10, $[61]), F = E(F, L, W, G, X, 15, $[62]), G = E(G, F, L, W, q, 21, $[63]);
    M[0] = M[0] + W | 0, M[1] = M[1] + G | 0, M[2] = M[2] + F | 0, M[3] = M[3] + L | 0;
  }, _doFinalize: function() {
    var A = this._data, T = A.words, M = 8 * this._nDataBytes, Z = 8 * A.sigBytes;
    T[Z >>> 5] |= 128 << 24 - Z % 32;
    var K = I.floor(M / 4294967296);
    T[(Z + 64 >>> 9 << 4) + 15] = (K << 8 | K >>> 24) & 16711935 | (K << 24 | K >>> 8) & 4278255360, T[(Z + 64 >>> 9 << 4) + 14] = (M << 8 | M >>> 24) & 16711935 | (M << 24 | M >>> 8) & 4278255360, A.sigBytes = 4 * (T.length + 1), this._process(), A = this._hash, T = A.words;
    for (M = 0;4 > M; M++)
      Z = T[M], T[M] = (Z << 8 | Z >>> 24) & 16711935 | (Z << 24 | Z >>> 8) & 4278255360;
    return A;
  }, clone: function() {
    var A = H.clone.call(this);
    return A._hash = this._hash.clone(), A;
  } }), Q.MD5 = H._createHelper(z), Q.HmacMD5 = H._createHmacHelper(z);
})(Math);
(function() {
  var I = k, V = I.lib, O = V.Base, Y = V.WordArray, V = I.algo, E = V.EvpKDF = O.extend({ cfg: O.extend({ keySize: 4, hasher: V.MD5, iterations: 1 }), init: function(Q) {
    this.cfg = this.cfg.extend(Q);
  }, compute: function(Q, R) {
    for (var A = this.cfg, H = A.hasher.create(), z = Y.create(), $ = z.words, B = A.keySize, A = A.iterations;$.length < B; ) {
      T && H.update(T);
      var T = H.update(Q).finalize(R);
      H.reset();
      for (var M = 1;M < A; M++)
        T = H.finalize(T), H.reset();
      z.concat(T);
    }
    return z.sigBytes = 4 * B, z;
  } });
  I.EvpKDF = function(Q, R, H) {
    return E.create(H).compute(Q, R);
  };
})();
k.lib.Cipher || function(I) {
  var M = k, O = M.lib, Y = O.Base, V = O.WordArray, E = O.BufferedBlockAlgorithm, Q = M.enc.Base64, R = M.algo.EvpKDF, H = O.Cipher = E.extend({ cfg: Y.extend(), createEncryptor: function(K, X) {
    return this.create(this._ENC_XFORM_MODE, K, X);
  }, createDecryptor: function(K, X) {
    return this.create(this._DEC_XFORM_MODE, K, X);
  }, init: function(K, X, U) {
    this.cfg = this.cfg.extend(U), this._xformMode = K, this._key = X, this.reset();
  }, reset: function() {
    E.reset.call(this), this._doReset();
  }, process: function(K) {
    return this._append(K), this._process();
  }, finalize: function(K) {
    return K && this._append(K), this._doFinalize();
  }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function(K) {
    return { encrypt: function(X, U, J) {
      return (typeof U == "string" ? Z : T).encrypt(K, X, U, J);
    }, decrypt: function(X, U, J) {
      return (typeof U == "string" ? Z : T).decrypt(K, X, U, J);
    } };
  } });
  O.StreamCipher = H.extend({ _doFinalize: function() {
    return this._process(true);
  }, blockSize: 1 });
  var A = M.mode = {}, z = function(K, X, U) {
    var J = this._iv;
    J ? this._iv = I : J = this._prevBlock;
    for (var C = 0;C < U; C++)
      K[X + C] ^= J[C];
  }, $ = (O.BlockCipherMode = Y.extend({ createEncryptor: function(K, X) {
    return this.Encryptor.create(K, X);
  }, createDecryptor: function(K, X) {
    return this.Decryptor.create(K, X);
  }, init: function(K, X) {
    this._cipher = K, this._iv = X;
  } })).extend();
  $.Encryptor = $.extend({ processBlock: function(K, X) {
    var U = this._cipher, J = U.blockSize;
    z.call(this, K, X, J), U.encryptBlock(K, X), this._prevBlock = K.slice(X, X + J);
  } }), $.Decryptor = $.extend({ processBlock: function(K, X) {
    var U = this._cipher, J = U.blockSize, C = K.slice(X, X + J);
    U.decryptBlock(K, X), z.call(this, K, X, J), this._prevBlock = C;
  } }), A = A.CBC = $, $ = (M.pad = {}).Pkcs7 = { pad: function(K, X) {
    for (var U = 4 * X, U = U - K.sigBytes % U, J = U << 24 | U << 16 | U << 8 | U, C = [], y = 0;y < U; y += 4)
      C.push(J);
    U = V.create(C, U), K.concat(U);
  }, unpad: function(K) {
    K.sigBytes -= K.words[K.sigBytes - 1 >>> 2] & 255;
  } }, O.BlockCipher = H.extend({ cfg: H.cfg.extend({ mode: A, padding: $ }), reset: function() {
    H.reset.call(this);
    var X = this.cfg, K = X.iv, X = X.mode;
    if (this._xformMode == this._ENC_XFORM_MODE)
      var U = X.createEncryptor;
    else
      U = X.createDecryptor, this._minBufferSize = 1;
    this._mode = U.call(X, this, K && K.words);
  }, _doProcessBlock: function(K, X) {
    this._mode.processBlock(K, X);
  }, _doFinalize: function() {
    var K = this.cfg.padding;
    if (this._xformMode == this._ENC_XFORM_MODE) {
      K.pad(this._data, this.blockSize);
      var X = this._process(true);
    } else
      X = this._process(true), K.unpad(X);
    return X;
  }, blockSize: 4 });
  var B = O.CipherParams = Y.extend({ init: function(K) {
    this.mixIn(K);
  }, toString: function(K) {
    return (K || this.formatter).stringify(this);
  } }), A = (M.format = {}).OpenSSL = { stringify: function(K) {
    var X = K.ciphertext;
    return K = K.salt, (K ? V.create([1398893684, 1701076831]).concat(K).concat(X) : X).toString(Q);
  }, parse: function(K) {
    K = Q.parse(K);
    var X = K.words;
    if (X[0] == 1398893684 && X[1] == 1701076831) {
      var U = V.create(X.slice(2, 4));
      X.splice(0, 4), K.sigBytes -= 16;
    }
    return B.create({ ciphertext: K, salt: U });
  } }, T = O.SerializableCipher = Y.extend({ cfg: Y.extend({ format: A }), encrypt: function(K, X, U, J) {
    J = this.cfg.extend(J);
    var C = K.createEncryptor(U, J);
    return X = C.finalize(X), C = C.cfg, B.create({ ciphertext: X, key: U, iv: C.iv, algorithm: K, mode: C.mode, padding: C.padding, blockSize: K.blockSize, formatter: J.format });
  }, decrypt: function(K, X, U, J) {
    return J = this.cfg.extend(J), X = this._parse(X, J.format), K.createDecryptor(U, J).finalize(X.ciphertext);
  }, _parse: function(K, X) {
    return typeof K == "string" ? X.parse(K, this) : K;
  } }), M = (M.kdf = {}).OpenSSL = { execute: function(K, X, U, J) {
    return J || (J = V.random(8)), K = R.create({ keySize: X + U }).compute(K, J), U = V.create(K.words.slice(X), 4 * U), K.sigBytes = 4 * X, B.create({ key: K, iv: U, salt: J });
  } }, Z = O.PasswordBasedCipher = T.extend({ cfg: T.cfg.extend({ kdf: M }), encrypt: function(K, X, U, J) {
    return J = this.cfg.extend(J), U = J.kdf.execute(U, K.keySize, K.ivSize), J.iv = U.iv, K = T.encrypt.call(this, K, X, U.key, J), K.mixIn(U), K;
  }, decrypt: function(K, X, U, J) {
    return J = this.cfg.extend(J), X = this._parse(X, J.format), U = J.kdf.execute(U, K.keySize, K.ivSize, X.salt), J.iv = U.iv, T.decrypt.call(this, K, X, U.key, J);
  } });
}();
(function() {
  for (var I = k, O = I.lib.BlockCipher, u = I.algo, Y = [], V = [], E = [], Q = [], R = [], H = [], z = [], $ = [], B = [], A = [], T = [], M = 0;256 > M; M++)
    T[M] = 128 > M ? M << 1 : M << 1 ^ 283;
  for (var Z = 0, K = 0, M = 0;256 > M; M++) {
    var X = K ^ K << 1 ^ K << 2 ^ K << 3 ^ K << 4, X = X >>> 8 ^ X & 255 ^ 99;
    Y[Z] = X, V[X] = Z;
    var U = T[Z], J = T[U], C = T[J], y = 257 * T[X] ^ 16843008 * X;
    E[Z] = y << 24 | y >>> 8, Q[Z] = y << 16 | y >>> 16, R[Z] = y << 8 | y >>> 24, H[Z] = y, y = 16843009 * C ^ 65537 * J ^ 257 * U ^ 16843008 * Z, z[X] = y << 24 | y >>> 8, $[X] = y << 16 | y >>> 16, B[X] = y << 8 | y >>> 24, A[X] = y, Z ? (Z = U ^ T[T[T[C ^ U]]], K ^= T[T[K]]) : Z = K = 1;
  }
  var m = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], u = u.AES = O.extend({ _doReset: function() {
    for (var x = this._key, q = x.words, S = x.sigBytes / 4, x = 4 * ((this._nRounds = S + 6) + 1), f = this._keySchedule = [], h = 0;h < x; h++)
      if (h < S)
        f[h] = q[h];
      else {
        var D = f[h - 1];
        h % S ? 6 < S && h % S == 4 && (D = Y[D >>> 24] << 24 | Y[D >>> 16 & 255] << 16 | Y[D >>> 8 & 255] << 8 | Y[D & 255]) : (D = D << 8 | D >>> 24, D = Y[D >>> 24] << 24 | Y[D >>> 16 & 255] << 16 | Y[D >>> 8 & 255] << 8 | Y[D & 255], D ^= m[h / S | 0] << 24), f[h] = f[h - S] ^ D;
      }
    q = this._invKeySchedule = [];
    for (S = 0;S < x; S++)
      h = x - S, D = S % 4 ? f[h] : f[h - 4], q[S] = 4 > S || 4 >= h ? D : z[Y[D >>> 24]] ^ $[Y[D >>> 16 & 255]] ^ B[Y[D >>> 8 & 255]] ^ A[Y[D & 255]];
  }, encryptBlock: function(q, S) {
    this._doCryptBlock(q, S, this._keySchedule, E, Q, R, H, Y);
  }, decryptBlock: function(q, S) {
    var x = q[S + 1];
    q[S + 1] = q[S + 3], q[S + 3] = x, this._doCryptBlock(q, S, this._invKeySchedule, z, $, B, A, V), x = q[S + 1], q[S + 1] = q[S + 3], q[S + 3] = x;
  }, _doCryptBlock: function(q, S, x, f, h, D, w, W) {
    for (var L = this._nRounds, j = q[S] ^ x[0], p = q[S + 1] ^ x[1], g = q[S + 2] ^ x[2], N = q[S + 3] ^ x[3], F = 4, G = 1;G < L; G++)
      var b = f[j >>> 24] ^ h[p >>> 16 & 255] ^ D[g >>> 8 & 255] ^ w[N & 255] ^ x[F++], v = f[p >>> 24] ^ h[g >>> 16 & 255] ^ D[N >>> 8 & 255] ^ w[j & 255] ^ x[F++], s = f[g >>> 24] ^ h[N >>> 16 & 255] ^ D[j >>> 8 & 255] ^ w[p & 255] ^ x[F++], N = f[N >>> 24] ^ h[j >>> 16 & 255] ^ D[p >>> 8 & 255] ^ w[g & 255] ^ x[F++], j = b, p = v, g = s;
    b = (W[j >>> 24] << 24 | W[p >>> 16 & 255] << 16 | W[g >>> 8 & 255] << 8 | W[N & 255]) ^ x[F++], v = (W[p >>> 24] << 24 | W[g >>> 16 & 255] << 16 | W[N >>> 8 & 255] << 8 | W[j & 255]) ^ x[F++], s = (W[g >>> 24] << 24 | W[N >>> 16 & 255] << 16 | W[j >>> 8 & 255] << 8 | W[p & 255]) ^ x[F++], N = (W[N >>> 24] << 24 | W[j >>> 16 & 255] << 16 | W[p >>> 8 & 255] << 8 | W[g & 255]) ^ x[F++], q[S] = b, q[S + 1] = v, q[S + 2] = s, q[S + 3] = N;
  }, keySize: 8 });
  I.AES = O._createHelper(u);
})();
var n = { game: "Divine Techno Run", url: "https://www.newgrounds.com/portal/view/628667", key: "34685:cxZQ5a1E", skey: "aBuRcFJLqDmPe3Gb0uultA==" };

class t {
  #O;
  #M = {};
  #I;
  #V;
  #Q;
  #Y;
  #P;
  #R = new Set;
  #X = new Set;
  audio;
  audioOut;
  gameUrl;
  addLoginListener(I) {
    this.#R.add(I);
  }
  addUnlockListener(I) {
    this.#X.add(I);
  }
  constructor(I = n) {
    this.#O = new P.io.core(I.key, I.skey), this.#Q = I.debug, this.initSession(), this.audio = new Audio(I.audioIn ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound.ogg"), this.audioOut = new Audio(I.audioOut ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound-out.ogg"), this.gameUrl = I.url;
  }
  get loggedIn() {
    return !!this.#O.user;
  }
  get icons() {
    return this.#O.user?.icons;
  }
  get user() {
    return this.#O.user?.name;
  }
  async getScoreboards() {
    return new Promise((I) => {
      if (this.#Y)
        I?.(this.#Y);
      else if (this.#P)
        this.#P.push(I);
      else
        this.#P = [I], this.#O.callComponent("ScoreBoard.getBoards", {}, (O) => {
          if (O.success) {
            this.#Y = O.scoreboards;
            const Y = {};
            this.#Y.forEach((V) => Y[V.id] = V.name), this.#P?.forEach((V) => V?.(this.#Y ?? [])), this.#P = undefined, console.log(Y);
          }
        });
    });
  }
  async getMedals() {
    return new Promise((I) => {
      if (this.#I)
        I(this.#I);
      else if (this.#V)
        this.#V.push(I);
      else
        this.#V = [I], this.#O.callComponent("Medal.getList", {}, (O) => {
          if (O.success) {
            this.#I = O.medals;
            const Y = "font-weight: bold;";
            console.log("%c Unlocked:", Y, this.#I?.filter(({ unlocked: V }) => V).map(({ name: V }) => V).join(", ")), console.log("%c Locked:", Y, this.#I?.filter(({ unlocked: V }) => !V).map(({ name: V }) => V).join(", ")), this.#V?.forEach((V) => V?.(this.#I ?? [])), this.#V = undefined;
          }
        });
    });
  }
  async unlockMedal(I) {
    if (!this.#O.user)
      return;
    console.log("unlocking", I, "for", this.#O.user.name);
    const O = await this.getMedals(), Y = O.filter((V) => V.name === I)[0];
    if (Y)
      return new Promise((V) => {
        if (!Y.unlocked && !this.#M[Y.id])
          this.#O.callComponent("Medal.unlock", { id: Y.id }, (E) => {
            const Q = E.medal;
            if (Q) {
              for (let R = 0;R < O.length; R++)
                if (O[R].id === Q.id)
                  O[R] = Q;
              this.#M[Q.id] = true, this.#X.forEach((R) => R(Q)), this.showReceivedMedal(Q), V(E.medal);
            }
          });
        else
          V(Y);
      });
    else
      console.warn(`Medal doesn't exist: ${I}`);
  }
  requestLogin() {
    this.#O.requestLogin(this.onLoggedIn, this.onLoginFailed, this.onLoginCancelled);
    const I = document.getElementById("newgrounds-login");
    if (I)
      I.style.display = "none";
  }
  onLoginFailed() {
    console.log("There was a problem logging in: ", this.#O.login_error?.message);
    const I = document.getElementById("newgrounds-login");
    if (I)
      I.style.display = "";
  }
  onLoginCancelled() {
    console.log("The user cancelled the login.");
    const I = document.getElementById("newgrounds-login");
    if (I)
      I.style.display = "";
  }
  initSession() {
    this.#O.getValidSession(() => {
      const I = document.body.appendChild(document.createElement("button"));
      if (I.id = "newgrounds-login", I.style.display = this.#Q ? "" : "none", I.style.position = "absolute", I.style.top = "5px", I.style.right = "5px", I.style.height = "24px", I.style.fontSize = "10pt", I.style.zIndex = "1000", I.classList.add("button"), I.innerText = "login newgrounds", I.addEventListener("click", (O) => {
        this.requestLogin(), O.stopPropagation();
      }), this.#O.user)
        I.style.display = "none", this.onLoggedIn();
    });
  }
  onLoggedIn() {
    console.log("Welcome ", this.#O.user?.name + "!"), this.#R.forEach((I) => I()), this.getMedals(), this.getScoreboards();
  }
  #K;
  #Z() {
    if (!this.#K) {
      const I = document.body.appendChild(document.createElement("div"));
      I.style.display = "none", I.style.position = "absolute", I.style.right = "10px", I.style.top = "10px", I.style.padding = "5px 10px", I.style.border = "2px solid #880", I.style.borderRadius = "5px", I.style.background = "linear-gradient(#884, #553)", I.style.boxShadow = "2px 2px black", I.style.flexDirection = "row", I.style.transition = "opacity .5s, margin-right .3s", I.style.opacity = "0", I.style.marginRight = "-300px", I.style.zIndex = "3000", I.style.fontFamily = "Papyrus, fantasy", this.#K = I;
    }
    return this.#K;
  }
  #E;
  showReceivedMedal(I) {
    clearTimeout(this.#E);
    const O = this.#Z();
    O.style.display = "flex", O.innerText = "";
    const Y = O.appendChild(document.createElement("img"));
    Y.addEventListener("load", () => {
      if (O.style.display = "flex", O.style.opacity = "1", O.style.marginRight = "0", !window.mute)
        this.audio.play();
      this.#E = setTimeout(() => {
        if (!window.mute)
          this.audioOut.play();
        O.style.opacity = "0", this.#E = setTimeout(() => {
          O.style.display = "none", O.style.marginRight = "-300px", this.#E = undefined;
        }, 1000);
      }, 5000);
    }), Y.style.width = "50px", Y.style.height = "50px", Y.style.backgroundColor = "black", Y.style.borderRadius = "3px", Y.src = I.icon;
    const V = O.appendChild(document.createElement("div"));
    V.style.marginLeft = "10px";
    const E = V.appendChild(document.createElement("div"));
    E.style.fontWeight = "bold", E.style.fontSize = "12pt", E.style.color = "gold", E.style.margin = "5px", E.innerText = `\uD83C\uDFC6 ${I.name}`;
    const Q = V.appendChild(document.createElement("div"));
    Q.style.fontSize = "10pt", Q.style.color = "silver", Q.innerText = I.description;
  }
  async postScore(I, O) {
    const Y = await this.getScoreboards(), V = O ? Y.find((E) => E.name === O) : Y[0];
    if (V)
      return new Promise((E) => {
        this.#O.callComponent("ScoreBoard.postScore", { id: V.id, value: I }, (Q) => {
          E(Q.success);
        });
      });
  }
  async logView() {
    this.#O.callComponent("App.logView", { host: location.host }, (I) => {
      console.log(I);
    });
  }
  async logEvent(I) {
    this.#O.callComponent("Event.logEvent", { event_name: I, host: location.host }, (O) => {
      console.log(O);
    });
  }
}
export {
  t as Newgrounds
};
