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
    for (var $ = 0;$ < Y.length; $++)
      this.checkStrictValue(I, O, Y[$], Q, R, null, null);
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
  var Y, V, E, Q, R = this, $, z = new P.io.urlHelper;
  if (z.getRequestQueryParam("ngio_session_id"))
    V = z.getRequestQueryParam("ngio_session_id");
  if (Object.defineProperty(this, "app_id", { get: function() {
    return Y;
  } }), Object.defineProperty(this, "user", { get: function() {
    return this.getCurrentUser();
  } }), Object.defineProperty(this, "session_id", { set: function(X) {
    if (X && typeof X != "string")
      throw new Error("\'session_id\' must be a string value.");
    V = X ? X : null;
  }, get: function() {
    return V ? V : null;
  } }), Object.defineProperty(this, "debug", { set: function(X) {
    Q = X ? true : false;
  }, get: function() {
    return Q;
  } }), !I)
    throw new Error("Missing required \'app_id\' in Newgrounds.io.core constructor");
  if (typeof I != "string")
    throw new Error("\'app_id\' must be a string value in Newgrounds.io.core constructor");
  if (Y = I, O)
    $ = k.enc.Base64.parse(O);
  else
    console.warn("You did not set an encryption key. Some calls may not work without this.");
  var Z = "Newgrounds-io-app_session-" + Y.split(":").join("-");
  function B() {
    if (typeof localStorage != "undefined" && localStorage && localStorage.getItem.constructor == Function)
      return true;
    return console.warn("localStorage unavailable. Are you running from a web server?"), false;
  }
  function A() {
    if (!B())
      return null;
    var X = localStorage.getItem(Z);
    return X ? X : null;
  }
  function T(X) {
    if (!B())
      return null;
    localStorage.setItem(Z, X);
  }
  function M() {
    if (!B())
      return null;
    localStorage.removeItem(Z);
  }
  if (!V && A())
    V = A();
  this.addEventListener("App.endSession", function(X) {
    R.session_id = null, M();
  }), this.addEventListener("App.startSession", function(X) {
    if (X.success)
      R.session_id = X.data.session.id;
  }), this.addEventListener("App.checkSession", function(X) {
    if (X.success) {
      if (X.data.session.expired)
        M(), this.session_id = null;
      else if (X.data.session.remember)
        T(X.data.session.id);
    } else
      this.session_id = null, M();
  }), this._encryptCall = function(X) {
    if (!X || !X.constructor == P.io.model.call_model)
      throw new Error("Attempted to encrypt a non \'call\' object");
    var K = k.lib.WordArray.random(16), W = k.AES.encrypt(JSON.stringify(X.toObject()), $, { iv: K }), H = k.enc.Base64.stringify(K.concat(W.ciphertext));
    return X.secure = H, X.parameters = null, X;
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
  function $() {
    if (R)
      clearInterval(R);
    E.removeEventListener("cancelLoginRequest", z), Q.closePassport();
  }
  function z() {
    Y && Y.constructor === Function ? Y.call(V) : O.call(V), $();
  }
  if (E.addEventListener("cancelLoginRequest", z), E.getCurrentUser())
    I.call(V);
  else
    Q.loadPassport(), R = setInterval(function() {
      Q.checkSession(function(Z) {
        if (!Z || Z.expired)
          if (Q.last_error.code == 111)
            z();
          else
            $(), O.call(V);
        else if (Z.user)
          $(), I.call(V);
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
  var E, Q, R, $, z, Z = { success: false, error: { code: 0, message: "Unexpected Server Response" } };
  if (typeof Y == "undefined")
    Y = null;
  if (I.constructor === Array && O && O.constructor === Array) {
    for (E = 0;E < I.length; E++)
      Q = !Y || typeof Y[E] == "undefined" ? Z : Y[E], R = typeof O[E] == "undefined" ? null : O[E], this._doCallback(I[E], R, Q, V[E]);
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
    A = Z;
  var T;
  if (A.constructor === Array)
    for (E = 0;E < A.length; E++)
      T = new P.io.events.OutputEvent(I.component, I[E], A[E]), this.dispatchEvent(T);
  else
    T = new P.io.events.OutputEvent(I.component, I, A), this.dispatchEvent(T);
  if (O && O.constructor === Function)
    O.call(V, A);
}, _formatResults: function(I, O) {
  var Y, V, E, Q, R, $ = null;
  if (typeof O.success != "undefined" && O.success)
    $ = P.io.call_validators.getValidator(I);
  if (!$)
    return O;
  var z = $.returns;
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
  function R(H) {
    var J = P.io.call_validators.getValidator(H.component);
    if (J.hasOwnProperty("redirect") && J.redirect) {
      var C = H.parameters;
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
  var $ = { app_id: this.app_id, session_id: this.session_id, call: V };
  if (this.debug)
    $.debug = 1;
  if (E) {
    var z = { success: true, app_id: this.app_id, result: { component: I.component, data: { success: true } } }, Z = document.createElement("form");
    Z.action = P.io.GATEWAY_URI, Z.target = "_blank", Z.method = "POST";
    var B = document.createElement("input");
    B.type = "hidden", B.name = "input", Z.appendChild(B), document.body.appendChild(Z), B.value = JSON.stringify($), Z.submit(), document.body.removeChild(Z);
  } else {
    var A = new XMLHttpRequest, T, M = null, X = this;
    A.onreadystatechange = function() {
      if (A.readyState == 4) {
        var H;
        try {
          H = JSON.parse(A.responseText).result;
        } catch (J) {
        }
        X._doCallback(I, O, H, Y);
      }
    };
    var K = new FormData, W = typeof Array.prototype.toJSON != "undefined" ? Array.prototype.toJSON : null;
    if (W)
      delete Array.prototype.toJSON;
    if (K.append("input", JSON.stringify($)), W)
      Array.prototype.toJSON = W;
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
  var $;
  for (E in R.params) {
    if (Q = R.params[E], $ = O && typeof O[E] != "undefined" ? O[E] : null, !$ && Q.extract_from && Q.extract_from.alias)
      $ = O[Q.extract_from.alias];
    if ($ === null) {
      if (Q.required)
        throw new Error("Missing required parameter for \'" + I + "\': " + E);
      continue;
    }
    if (Q.extract_from && $.constructor === P.io.model[Q.extract_from.object])
      $ = $[Q.extract_from.property];
    if (!P.io.model.checkStrictValue(null, E, $, Q.type, null, null, null))
      throw new Error("Illegal value for \'" + E + "\' parameter of \'" + I + "\': " + $);
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
  var R = { component: I.component }, $ = P.io.call_validators.getValidator(I.component);
  if (typeof E != "undefined")
    if ($.secure) {
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
  this.getRequestQueryParam = function(R, $) {
    if (typeof $ == "undefined")
      $ = null;
    return typeof O[R] == "undefined" ? $ : O[R];
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
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "app_id", $, String, null, null, null), Y = $;
  } });
  var V;
  Object.defineProperty(this, "call", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "call", $, null, "call", null, "call"), V = $;
  } });
  var E;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "debug", $, Boolean, null, null, null), E = $;
  } });
  var Q;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function($) {
    Q = $;
  } });
  var R;
  if (Object.defineProperty(this, "session_id", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "session_id", $, String, null, null, null), R = $;
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
  var Y, V, E, Q, R, $, z, Z;
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
  var $;
  Object.defineProperty(this, "secret", { get: function() {
    return typeof $ == "undefined" ? null : $;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "secret", B, Boolean, null, null, null), $ = B;
  } });
  var z;
  Object.defineProperty(this, "unlocked", { get: function() {
    return typeof z == "undefined" ? null : z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "unlocked", B, Boolean, null, null, null), z = B;
  } });
  var Z;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "value", B, Number, null, null, null), Z = B;
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
  var Y, V, E, Q, R, $, z, Z;
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
  var $;
  Object.defineProperty(this, "help_url", { get: function() {
    return typeof $ == "undefined" ? null : $;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "help_url", B, String, null, null, null), $ = B;
  } });
  var z;
  Object.defineProperty(this, "result", { get: function() {
    return typeof z == "undefined" ? null : z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "result", B, null, "result", null, "result"), z = B;
  } });
  var Z;
  if (Object.defineProperty(this, "success", { get: function() {
    return typeof Z == "undefined" ? null : Z;
  }, set: function(B) {
    P.io.model.checkStrictValue(this.__classname, "success", B, Boolean, null, null, null), Z = B;
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
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "expired", $, Boolean, null, null, null), Y = $;
  } });
  var V;
  Object.defineProperty(this, "id", { get: function() {
    return typeof V == "undefined" ? null : V;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "id", $, String, null, null, null), V = $;
  } });
  var E;
  Object.defineProperty(this, "passport_url", { get: function() {
    return typeof E == "undefined" ? null : E;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "passport_url", $, String, null, null, null), E = $;
  } });
  var Q;
  Object.defineProperty(this, "remember", { get: function() {
    return typeof Q == "undefined" ? null : Q;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "remember", $, Boolean, null, null, null), Q = $;
  } });
  var R;
  if (Object.defineProperty(this, "user", { get: function() {
    return typeof R == "undefined" ? null : R;
  }, set: function($) {
    P.io.model.checkStrictValue(this.__classname, "user", $, null, "user", null, null), R = $;
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
    var X = new E;
    return M && X.mixIn(M), X.hasOwnProperty("init") || (X.init = function() {
      X.$super.init.apply(this, arguments);
    }), X.init.prototype = X, X.$super = this, X;
  }, create: function() {
    var M = this.extend();
    return M.init.apply(M, arguments), M;
  }, init: function() {
  }, mixIn: function(M) {
    for (var X in M)
      M.hasOwnProperty(X) && (this[X] = M[X]);
    M.hasOwnProperty("toString") && (this.toString = M.toString);
  }, clone: function() {
    return this.init.prototype.extend(this);
  } }, R = V.WordArray = Q.extend({ init: function(M, X) {
    M = this.words = M || [], this.sigBytes = X != O ? X : 4 * M.length;
  }, toString: function(M) {
    return (M || z).stringify(this);
  }, concat: function(M) {
    var X = this.words, K = M.words, W = this.sigBytes;
    if (M = M.sigBytes, this.clamp(), W % 4)
      for (var H = 0;H < M; H++)
        X[W + H >>> 2] |= (K[H >>> 2] >>> 24 - 8 * (H % 4) & 255) << 24 - 8 * ((W + H) % 4);
    else if (65535 < K.length)
      for (H = 0;H < M; H += 4)
        X[W + H >>> 2] = K[H >>> 2];
    else
      X.push.apply(X, K);
    return this.sigBytes += M, this;
  }, clamp: function() {
    var M = this.words, X = this.sigBytes;
    M[X >>> 2] &= 4294967295 << 32 - 8 * (X % 4), M.length = I.ceil(X / 4);
  }, clone: function() {
    var M = Q.clone.call(this);
    return M.words = this.words.slice(0), M;
  }, random: function(M) {
    for (var X = [], K = 0;K < M; K += 4)
      X.push(4294967296 * I.random() | 0);
    return new R.init(X, M);
  } }), $ = Y.enc = {}, z = $.Hex = { stringify: function(M) {
    var X = M.words;
    M = M.sigBytes;
    for (var K = [], W = 0;W < M; W++) {
      var H = X[W >>> 2] >>> 24 - 8 * (W % 4) & 255;
      K.push((H >>> 4).toString(16)), K.push((H & 15).toString(16));
    }
    return K.join("");
  }, parse: function(M) {
    for (var X = M.length, K = [], W = 0;W < X; W += 2)
      K[W >>> 3] |= parseInt(M.substr(W, 2), 16) << 24 - 4 * (W % 8);
    return new R.init(K, X / 2);
  } }, Z = $.Latin1 = { stringify: function(M) {
    var X = M.words;
    M = M.sigBytes;
    for (var K = [], W = 0;W < M; W++)
      K.push(String.fromCharCode(X[W >>> 2] >>> 24 - 8 * (W % 4) & 255));
    return K.join("");
  }, parse: function(M) {
    for (var X = M.length, K = [], W = 0;W < X; W++)
      K[W >>> 2] |= (M.charCodeAt(W) & 255) << 24 - 8 * (W % 4);
    return new R.init(K, X);
  } }, B = $.Utf8 = { stringify: function(M) {
    try {
      return decodeURIComponent(escape(Z.stringify(M)));
    } catch (X) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse: function(M) {
    return Z.parse(unescape(encodeURIComponent(M)));
  } }, A = V.BufferedBlockAlgorithm = Q.extend({ reset: function() {
    this._data = new R.init, this._nDataBytes = 0;
  }, _append: function(M) {
    typeof M == "string" && (M = B.parse(M)), this._data.concat(M), this._nDataBytes += M.sigBytes;
  }, _process: function(M) {
    var X = this._data, K = X.words, W = X.sigBytes, H = this.blockSize, J = W / (4 * H), J = M ? I.ceil(J) : I.max((J | 0) - this._minBufferSize, 0);
    if (M = J * H, W = I.min(4 * M, W), M) {
      for (var C = 0;C < M; C += H)
        this._doProcessBlock(K, C);
      C = K.splice(0, M), X.sigBytes -= W;
    }
    return new R.init(C, W);
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
    return function(X, K) {
      return new M.init(K).finalize(X);
    };
  }, _createHmacHelper: function(M) {
    return function(X, K) {
      return new T.HMAC.init(M, K).finalize(X);
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
      for (var $ = (V[R >>> 2] >>> 24 - 8 * (R % 4) & 255) << 16 | (V[R + 1 >>> 2] >>> 24 - 8 * ((R + 1) % 4) & 255) << 8 | V[R + 2 >>> 2] >>> 24 - 8 * ((R + 2) % 4) & 255, z = 0;4 > z && R + 0.75 * z < E; z++)
        Y.push(Q.charAt($ >>> 6 * (3 - z) & 63));
    if (V = Q.charAt(64))
      for (;Y.length % 4; )
        Y.push(V);
    return Y.join("");
  }, parse: function(Y) {
    var V = Y.length, E = this._map, Q = E.charAt(64);
    Q && (Q = Y.indexOf(Q), Q != -1 && (V = Q));
    for (var Q = [], R = 0, $ = 0;$ < V; $++)
      if ($ % 4) {
        var z = E.indexOf(Y.charAt($ - 1)) << 2 * ($ % 4), Z = E.indexOf(Y.charAt($)) >>> 6 - 2 * ($ % 4);
        Q[R >>> 2] |= (z | Z) << 24 - 8 * (R % 4), R++;
      }
    return O.create(Q, R);
  }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
})();
(function(I) {
  function O(A, T, M, X, K, W, H) {
    return A = A + (T & M | ~T & X) + K + H, (A << W | A >>> 32 - W) + T;
  }
  function Y(A, T, M, X, K, W, H) {
    return A = A + (T & X | M & ~X) + K + H, (A << W | A >>> 32 - W) + T;
  }
  function V(A, T, M, X, K, W, H) {
    return A = A + (T ^ M ^ X) + K + H, (A << W | A >>> 32 - W) + T;
  }
  function E(A, T, M, X, K, W, H) {
    return A = A + (M ^ (T | ~X)) + K + H, (A << W | A >>> 32 - W) + T;
  }
  for (var Q = k, z = Q.lib, R = z.WordArray, $ = z.Hasher, z = Q.algo, Z = [], B = 0;64 > B; B++)
    Z[B] = 4294967296 * I.abs(I.sin(B + 1)) | 0;
  z = z.MD5 = $.extend({ _doReset: function() {
    this._hash = new R.init([1732584193, 4023233417, 2562383102, 271733878]);
  }, _doProcessBlock: function(A, T) {
    for (var M = 0;16 > M; M++) {
      var X = T + M, K = A[X];
      A[X] = (K << 8 | K >>> 24) & 16711935 | (K << 24 | K >>> 8) & 4278255360;
    }
    var M = this._hash.words, X = A[T + 0], K = A[T + 1], W = A[T + 2], H = A[T + 3], J = A[T + 4], C = A[T + 5], y = A[T + 6], m = A[T + 7], u = A[T + 8], q = A[T + 9], S = A[T + 10], x = A[T + 11], f = A[T + 12], h = A[T + 13], D = A[T + 14], w = A[T + 15], U = M[0], G = M[1], F = M[2], L = M[3], U = O(U, G, F, L, X, 7, Z[0]), L = O(L, U, G, F, K, 12, Z[1]), F = O(F, L, U, G, W, 17, Z[2]), G = O(G, F, L, U, H, 22, Z[3]), U = O(U, G, F, L, J, 7, Z[4]), L = O(L, U, G, F, C, 12, Z[5]), F = O(F, L, U, G, y, 17, Z[6]), G = O(G, F, L, U, m, 22, Z[7]), U = O(U, G, F, L, u, 7, Z[8]), L = O(L, U, G, F, q, 12, Z[9]), F = O(F, L, U, G, S, 17, Z[10]), G = O(G, F, L, U, x, 22, Z[11]), U = O(U, G, F, L, f, 7, Z[12]), L = O(L, U, G, F, h, 12, Z[13]), F = O(F, L, U, G, D, 17, Z[14]), G = O(G, F, L, U, w, 22, Z[15]), U = Y(U, G, F, L, K, 5, Z[16]), L = Y(L, U, G, F, y, 9, Z[17]), F = Y(F, L, U, G, x, 14, Z[18]), G = Y(G, F, L, U, X, 20, Z[19]), U = Y(U, G, F, L, C, 5, Z[20]), L = Y(L, U, G, F, S, 9, Z[21]), F = Y(F, L, U, G, w, 14, Z[22]), G = Y(G, F, L, U, J, 20, Z[23]), U = Y(U, G, F, L, q, 5, Z[24]), L = Y(L, U, G, F, D, 9, Z[25]), F = Y(F, L, U, G, H, 14, Z[26]), G = Y(G, F, L, U, u, 20, Z[27]), U = Y(U, G, F, L, h, 5, Z[28]), L = Y(L, U, G, F, W, 9, Z[29]), F = Y(F, L, U, G, m, 14, Z[30]), G = Y(G, F, L, U, f, 20, Z[31]), U = V(U, G, F, L, C, 4, Z[32]), L = V(L, U, G, F, u, 11, Z[33]), F = V(F, L, U, G, x, 16, Z[34]), G = V(G, F, L, U, D, 23, Z[35]), U = V(U, G, F, L, K, 4, Z[36]), L = V(L, U, G, F, J, 11, Z[37]), F = V(F, L, U, G, m, 16, Z[38]), G = V(G, F, L, U, S, 23, Z[39]), U = V(U, G, F, L, h, 4, Z[40]), L = V(L, U, G, F, X, 11, Z[41]), F = V(F, L, U, G, H, 16, Z[42]), G = V(G, F, L, U, y, 23, Z[43]), U = V(U, G, F, L, q, 4, Z[44]), L = V(L, U, G, F, f, 11, Z[45]), F = V(F, L, U, G, w, 16, Z[46]), G = V(G, F, L, U, W, 23, Z[47]), U = E(U, G, F, L, X, 6, Z[48]), L = E(L, U, G, F, m, 10, Z[49]), F = E(F, L, U, G, D, 15, Z[50]), G = E(G, F, L, U, C, 21, Z[51]), U = E(U, G, F, L, f, 6, Z[52]), L = E(L, U, G, F, H, 10, Z[53]), F = E(F, L, U, G, S, 15, Z[54]), G = E(G, F, L, U, K, 21, Z[55]), U = E(U, G, F, L, u, 6, Z[56]), L = E(L, U, G, F, w, 10, Z[57]), F = E(F, L, U, G, y, 15, Z[58]), G = E(G, F, L, U, h, 21, Z[59]), U = E(U, G, F, L, J, 6, Z[60]), L = E(L, U, G, F, x, 10, Z[61]), F = E(F, L, U, G, W, 15, Z[62]), G = E(G, F, L, U, q, 21, Z[63]);
    M[0] = M[0] + U | 0, M[1] = M[1] + G | 0, M[2] = M[2] + F | 0, M[3] = M[3] + L | 0;
  }, _doFinalize: function() {
    var A = this._data, T = A.words, M = 8 * this._nDataBytes, X = 8 * A.sigBytes;
    T[X >>> 5] |= 128 << 24 - X % 32;
    var K = I.floor(M / 4294967296);
    T[(X + 64 >>> 9 << 4) + 15] = (K << 8 | K >>> 24) & 16711935 | (K << 24 | K >>> 8) & 4278255360, T[(X + 64 >>> 9 << 4) + 14] = (M << 8 | M >>> 24) & 16711935 | (M << 24 | M >>> 8) & 4278255360, A.sigBytes = 4 * (T.length + 1), this._process(), A = this._hash, T = A.words;
    for (M = 0;4 > M; M++)
      X = T[M], T[M] = (X << 8 | X >>> 24) & 16711935 | (X << 24 | X >>> 8) & 4278255360;
    return A;
  }, clone: function() {
    var A = $.clone.call(this);
    return A._hash = this._hash.clone(), A;
  } }), Q.MD5 = $._createHelper(z), Q.HmacMD5 = $._createHmacHelper(z);
})(Math);
(function() {
  var I = k, V = I.lib, O = V.Base, Y = V.WordArray, V = I.algo, E = V.EvpKDF = O.extend({ cfg: O.extend({ keySize: 4, hasher: V.MD5, iterations: 1 }), init: function(Q) {
    this.cfg = this.cfg.extend(Q);
  }, compute: function(Q, R) {
    for (var A = this.cfg, $ = A.hasher.create(), z = Y.create(), Z = z.words, B = A.keySize, A = A.iterations;Z.length < B; ) {
      T && $.update(T);
      var T = $.update(Q).finalize(R);
      $.reset();
      for (var M = 1;M < A; M++)
        T = $.finalize(T), $.reset();
      z.concat(T);
    }
    return z.sigBytes = 4 * B, z;
  } });
  I.EvpKDF = function(Q, R, $) {
    return E.create($).compute(Q, R);
  };
})();
k.lib.Cipher || function(I) {
  var M = k, O = M.lib, Y = O.Base, V = O.WordArray, E = O.BufferedBlockAlgorithm, Q = M.enc.Base64, R = M.algo.EvpKDF, $ = O.Cipher = E.extend({ cfg: Y.extend(), createEncryptor: function(K, W) {
    return this.create(this._ENC_XFORM_MODE, K, W);
  }, createDecryptor: function(K, W) {
    return this.create(this._DEC_XFORM_MODE, K, W);
  }, init: function(K, W, H) {
    this.cfg = this.cfg.extend(H), this._xformMode = K, this._key = W, this.reset();
  }, reset: function() {
    E.reset.call(this), this._doReset();
  }, process: function(K) {
    return this._append(K), this._process();
  }, finalize: function(K) {
    return K && this._append(K), this._doFinalize();
  }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function(K) {
    return { encrypt: function(W, H, J) {
      return (typeof H == "string" ? X : T).encrypt(K, W, H, J);
    }, decrypt: function(W, H, J) {
      return (typeof H == "string" ? X : T).decrypt(K, W, H, J);
    } };
  } });
  O.StreamCipher = $.extend({ _doFinalize: function() {
    return this._process(true);
  }, blockSize: 1 });
  var A = M.mode = {}, z = function(K, W, H) {
    var J = this._iv;
    J ? this._iv = I : J = this._prevBlock;
    for (var C = 0;C < H; C++)
      K[W + C] ^= J[C];
  }, Z = (O.BlockCipherMode = Y.extend({ createEncryptor: function(K, W) {
    return this.Encryptor.create(K, W);
  }, createDecryptor: function(K, W) {
    return this.Decryptor.create(K, W);
  }, init: function(K, W) {
    this._cipher = K, this._iv = W;
  } })).extend();
  Z.Encryptor = Z.extend({ processBlock: function(K, W) {
    var H = this._cipher, J = H.blockSize;
    z.call(this, K, W, J), H.encryptBlock(K, W), this._prevBlock = K.slice(W, W + J);
  } }), Z.Decryptor = Z.extend({ processBlock: function(K, W) {
    var H = this._cipher, J = H.blockSize, C = K.slice(W, W + J);
    H.decryptBlock(K, W), z.call(this, K, W, J), this._prevBlock = C;
  } }), A = A.CBC = Z, Z = (M.pad = {}).Pkcs7 = { pad: function(K, W) {
    for (var H = 4 * W, H = H - K.sigBytes % H, J = H << 24 | H << 16 | H << 8 | H, C = [], y = 0;y < H; y += 4)
      C.push(J);
    H = V.create(C, H), K.concat(H);
  }, unpad: function(K) {
    K.sigBytes -= K.words[K.sigBytes - 1 >>> 2] & 255;
  } }, O.BlockCipher = $.extend({ cfg: $.cfg.extend({ mode: A, padding: Z }), reset: function() {
    $.reset.call(this);
    var W = this.cfg, K = W.iv, W = W.mode;
    if (this._xformMode == this._ENC_XFORM_MODE)
      var H = W.createEncryptor;
    else
      H = W.createDecryptor, this._minBufferSize = 1;
    this._mode = H.call(W, this, K && K.words);
  }, _doProcessBlock: function(K, W) {
    this._mode.processBlock(K, W);
  }, _doFinalize: function() {
    var K = this.cfg.padding;
    if (this._xformMode == this._ENC_XFORM_MODE) {
      K.pad(this._data, this.blockSize);
      var W = this._process(true);
    } else
      W = this._process(true), K.unpad(W);
    return W;
  }, blockSize: 4 });
  var B = O.CipherParams = Y.extend({ init: function(K) {
    this.mixIn(K);
  }, toString: function(K) {
    return (K || this.formatter).stringify(this);
  } }), A = (M.format = {}).OpenSSL = { stringify: function(K) {
    var W = K.ciphertext;
    return K = K.salt, (K ? V.create([1398893684, 1701076831]).concat(K).concat(W) : W).toString(Q);
  }, parse: function(K) {
    K = Q.parse(K);
    var W = K.words;
    if (W[0] == 1398893684 && W[1] == 1701076831) {
      var H = V.create(W.slice(2, 4));
      W.splice(0, 4), K.sigBytes -= 16;
    }
    return B.create({ ciphertext: K, salt: H });
  } }, T = O.SerializableCipher = Y.extend({ cfg: Y.extend({ format: A }), encrypt: function(K, W, H, J) {
    J = this.cfg.extend(J);
    var C = K.createEncryptor(H, J);
    return W = C.finalize(W), C = C.cfg, B.create({ ciphertext: W, key: H, iv: C.iv, algorithm: K, mode: C.mode, padding: C.padding, blockSize: K.blockSize, formatter: J.format });
  }, decrypt: function(K, W, H, J) {
    return J = this.cfg.extend(J), W = this._parse(W, J.format), K.createDecryptor(H, J).finalize(W.ciphertext);
  }, _parse: function(K, W) {
    return typeof K == "string" ? W.parse(K, this) : K;
  } }), M = (M.kdf = {}).OpenSSL = { execute: function(K, W, H, J) {
    return J || (J = V.random(8)), K = R.create({ keySize: W + H }).compute(K, J), H = V.create(K.words.slice(W), 4 * H), K.sigBytes = 4 * W, B.create({ key: K, iv: H, salt: J });
  } }, X = O.PasswordBasedCipher = T.extend({ cfg: T.cfg.extend({ kdf: M }), encrypt: function(K, W, H, J) {
    return J = this.cfg.extend(J), H = J.kdf.execute(H, K.keySize, K.ivSize), J.iv = H.iv, K = T.encrypt.call(this, K, W, H.key, J), K.mixIn(H), K;
  }, decrypt: function(K, W, H, J) {
    return J = this.cfg.extend(J), W = this._parse(W, J.format), H = J.kdf.execute(H, K.keySize, K.ivSize, W.salt), J.iv = H.iv, T.decrypt.call(this, K, W, H.key, J);
  } });
}();
(function() {
  for (var I = k, O = I.lib.BlockCipher, u = I.algo, Y = [], V = [], E = [], Q = [], R = [], $ = [], z = [], Z = [], B = [], A = [], T = [], M = 0;256 > M; M++)
    T[M] = 128 > M ? M << 1 : M << 1 ^ 283;
  for (var X = 0, K = 0, M = 0;256 > M; M++) {
    var W = K ^ K << 1 ^ K << 2 ^ K << 3 ^ K << 4, W = W >>> 8 ^ W & 255 ^ 99;
    Y[X] = W, V[W] = X;
    var H = T[X], J = T[H], C = T[J], y = 257 * T[W] ^ 16843008 * W;
    E[X] = y << 24 | y >>> 8, Q[X] = y << 16 | y >>> 16, R[X] = y << 8 | y >>> 24, $[X] = y, y = 16843009 * C ^ 65537 * J ^ 257 * H ^ 16843008 * X, z[W] = y << 24 | y >>> 8, Z[W] = y << 16 | y >>> 16, B[W] = y << 8 | y >>> 24, A[W] = y, X ? (X = H ^ T[T[T[C ^ H]]], K ^= T[T[K]]) : X = K = 1;
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
      h = x - S, D = S % 4 ? f[h] : f[h - 4], q[S] = 4 > S || 4 >= h ? D : z[Y[D >>> 24]] ^ Z[Y[D >>> 16 & 255]] ^ B[Y[D >>> 8 & 255]] ^ A[Y[D & 255]];
  }, encryptBlock: function(q, S) {
    this._doCryptBlock(q, S, this._keySchedule, E, Q, R, $, Y);
  }, decryptBlock: function(q, S) {
    var x = q[S + 1];
    q[S + 1] = q[S + 3], q[S + 3] = x, this._doCryptBlock(q, S, this._invKeySchedule, z, Z, B, A, V), x = q[S + 1], q[S + 1] = q[S + 3], q[S + 3] = x;
  }, _doCryptBlock: function(q, S, x, f, h, D, w, U) {
    for (var L = this._nRounds, j = q[S] ^ x[0], p = q[S + 1] ^ x[1], g = q[S + 2] ^ x[2], N = q[S + 3] ^ x[3], F = 4, G = 1;G < L; G++)
      var v = f[j >>> 24] ^ h[p >>> 16 & 255] ^ D[g >>> 8 & 255] ^ w[N & 255] ^ x[F++], s = f[p >>> 24] ^ h[g >>> 16 & 255] ^ D[N >>> 8 & 255] ^ w[j & 255] ^ x[F++], t = f[g >>> 24] ^ h[N >>> 16 & 255] ^ D[j >>> 8 & 255] ^ w[p & 255] ^ x[F++], N = f[N >>> 24] ^ h[j >>> 16 & 255] ^ D[p >>> 8 & 255] ^ w[g & 255] ^ x[F++], j = v, p = s, g = t;
    v = (U[j >>> 24] << 24 | U[p >>> 16 & 255] << 16 | U[g >>> 8 & 255] << 8 | U[N & 255]) ^ x[F++], s = (U[p >>> 24] << 24 | U[g >>> 16 & 255] << 16 | U[N >>> 8 & 255] << 8 | U[j & 255]) ^ x[F++], t = (U[g >>> 24] << 24 | U[N >>> 16 & 255] << 16 | U[j >>> 8 & 255] << 8 | U[p & 255]) ^ x[F++], N = (U[N >>> 24] << 24 | U[j >>> 16 & 255] << 16 | U[p >>> 8 & 255] << 8 | U[g & 255]) ^ x[F++], q[S] = v, q[S + 1] = s, q[S + 2] = t, q[S + 3] = N;
  }, keySize: 8 });
  I.AES = O._createHelper(u);
})();
var b = { game: "Divine Techno Run", url: "https://www.newgrounds.com/portal/view/628667", key: "34685:cxZQ5a1E", skey: "aBuRcFJLqDmPe3Gb0uultA==", audio: "sounds/ng-sound.ogg", audioOut: "sounds/ng-sound-out.ogg" };

class n {
  #O;
  #M = {};
  #I;
  #V;
  #Q;
  #Y;
  #P;
  #R = new Set;
  #W = new Set;
  audio;
  audioOut;
  gameUrl;
  addLoginListener(I) {
    this.#R.add(I);
  }
  addUnlockListener(I) {
    this.#W.add(I);
  }
  constructor(I = b) {
    this.#O = new P.io.core(I.key, I.skey), this.#Q = I.debug, this.initSession(), this.audio = b.audio ? new Audio(b.audio) : undefined, this.audioOut = b.audioOut ? new Audio(b.audioOut) : undefined, this.gameUrl = I.url;
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
          if (O.success)
            this.#Y = O.scoreboards, this.#Y.forEach((Y) => console.log("Scoreboard:", Y.name, Y.id)), this.#P?.forEach((Y) => Y?.(this.#Y ?? [])), this.#P = undefined;
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
    console.log("unlocking", I, "for", this.#O.user);
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
              this.#M[Q.id] = true, this.#W.forEach((R) => R(Q)), this.showReceivedMedal(Q), V(E.medal);
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
  #X() {
    if (!this.#K) {
      const I = document.body.appendChild(document.createElement("div"));
      I.style.display = "none", I.style.position = "absolute", I.style.right = "10px", I.style.top = "10px", I.style.padding = "5px 10px", I.style.border = "2px solid #880", I.style.borderRadius = "5px", I.style.background = "linear-gradient(#884, #553)", I.style.boxShadow = "2px 2px black", I.style.flexDirection = "row", I.style.transition = "opacity .5s, margin-right .3s", I.style.opacity = "0", I.style.marginRight = "-300px", I.style.zIndex = "3000", I.style.fontFamily = "Papyrus, fantasy", this.#K = I;
    }
    return this.#K;
  }
  #E;
  showReceivedMedal(I) {
    clearTimeout(this.#E);
    const O = this.#X();
    O.style.display = "flex", O.innerText = "";
    const Y = O.appendChild(document.createElement("img"));
    Y.addEventListener("load", () => {
      if (O.style.display = "flex", O.style.opacity = "1", O.style.marginRight = "0", !window.mute)
        this.audio?.play();
      this.#E = setTimeout(() => {
        if (!window.mute)
          this.audioOut?.play();
        O.style.opacity = "0", this.#E = setTimeout(() => {
          O.style.display = "none", O.style.marginRight = "-300px", this.#E = undefined;
        }, 1000);
      }, 5000);
    }), Y.style.width = "50px", Y.style.height = "50px", Y.style.backgroundColor = "black", Y.src = I.icon;
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
}
export {
  n as Newgrounds
};
