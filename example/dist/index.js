// /Users/vincent/medal-popup/example/node_modules/medal-popup/dist/index.js
var o = {};
o.io = { GATEWAY_URI: "//newgrounds.io/gateway_v3.php" };
o.io.events = {};
o.io.call_validators = {};
o.io.model = { checkStrictValue: function(t, e, n, r, s, a, c) {
  if (r == "mixed")
    return true;
  if (n === null || typeof n == "undefined")
    return true;
  if (r && n.constructor === r)
    return true;
  if (r == Boolean && n.constructor === Number)
    return true;
  if (s && n.constructor === o.io.model[s])
    return true;
  if (n.constructor === Array && (a || c)) {
    for (var h = 0;h < n.length; h++)
      this.checkStrictValue(t, e, n[h], a, c, null, null);
    return true;
  }
  if (t)
    throw new Error("Illegal \'" + e + "\' value set in model " + t);
  return false;
} };
o.io.events.OutputEvent = function(t, e, n) {
  this.type = t, this.call = e, this.data = n, this.success = n && typeof (n.success != "undefined") ? n.success ? true : false : false, this.preventDefault = false;
};
o.io.events.OutputEvent.prototype.constructor = o.io.events.OutputEvent;
o.io.events.SessionEvent = function(t) {
  this.type = t, this.user = null, this.passport_url = null;
};
o.io.events.SessionEvent.USER_LOADED = "user-loaded";
o.io.events.SessionEvent.SESSION_EXPIRED = "session-expired";
o.io.events.SessionEvent.REQUEST_LOGIN = "request-login";
o.io.events.SessionEvent.prototype.constructor = o.io.events.SessionEvent;
o.io.events.EventDispatcher = function() {
};
o.io.events.EventDispatcher.prototype = { _event_listeners: {}, addEventListener: function(t, e) {
  if (t.constructor !== String)
    throw new Error("Event names must be a string format.");
  if (e.constructor !== Function)
    throw new Error("Event listeners must be functions.");
  if (typeof this._event_listeners[t] == "undefined")
    this._event_listeners[t] = [];
  this._event_listeners[t].push(e);
}, removeEventListener: function(t, e) {
  if (typeof this._event_listeners[t] == "undefined")
    return;
  var n = -1;
  for (i = 0;i < this._event_listeners[t].length; i++)
    if (this._event_listeners[t][i] === e) {
      n = i;
      break;
    }
  if (n >= 0)
    return this._event_listeners[t].splice(n, 1), true;
  return false;
}, removeAllEventListeners: function(t) {
  if (typeof this._event_listeners[t] == "undefined")
    return 0;
  var e = this._event_listeners[t].length;
  return this._event_listeners[t] = [], e;
}, dispatchEvent: function(t) {
  var e = false, n;
  for (var r in o.io.events)
    if (t.constructor === o.io.events[r]) {
      e = true;
      break;
    }
  if (!e)
    throw new Error("Unsupported event object");
  if (typeof this._event_listeners[t.type] == "undefined")
    return false;
  for (var s = 0;s < this._event_listeners[t.type].length; s++)
    if (n = this._event_listeners[t.type][s], n(t) === false || t.preventDefault)
      return true;
  return true;
} };
o.io.events.EventDispatcher.prototype.constructor = o.io.events.EventDispatcher;
o.io.core = function(t, e) {
  var n, r, s, a, c = this, h, x = new o.io.urlHelper;
  if (x.getRequestQueryParam("ngio_session_id"))
    r = x.getRequestQueryParam("ngio_session_id");
  if (Object.defineProperty(this, "app_id", { get: function() {
    return n;
  } }), Object.defineProperty(this, "user", { get: function() {
    return this.getCurrentUser();
  } }), Object.defineProperty(this, "session_id", { set: function(f) {
    if (f && typeof f != "string")
      throw new Error("\'session_id\' must be a string value.");
    r = f ? f : null;
  }, get: function() {
    return r ? r : null;
  } }), Object.defineProperty(this, "debug", { set: function(f) {
    a = f ? true : false;
  }, get: function() {
    return a;
  } }), !t)
    throw new Error("Missing required \'app_id\' in Newgrounds.io.core constructor");
  if (typeof t != "string")
    throw new Error("\'app_id\' must be a string value in Newgrounds.io.core constructor");
  if (n = t, e)
    h = b.enc.Base64.parse(e);
  else
    console.warn("You did not set an encryption key. Some calls may not work without this.");
  var d = "Newgrounds-io-app_session-" + n.split(":").join("-");
  function E() {
    if (typeof localStorage != "undefined" && localStorage && localStorage.getItem.constructor == Function)
      return true;
    return console.warn("localStorage unavailable. Are you running from a web server?"), false;
  }
  function g() {
    if (!E())
      return null;
    var f = localStorage.getItem(d);
    return f ? f : null;
  }
  function w(f) {
    if (!E())
      return null;
    localStorage.setItem(d, f);
  }
  function l() {
    if (!E())
      return null;
    localStorage.removeItem(d);
  }
  if (!r && g())
    r = g();
  this.addEventListener("App.endSession", function(f) {
    c.session_id = null, l();
  }), this.addEventListener("App.startSession", function(f) {
    if (f.success)
      c.session_id = f.data.session.id;
  }), this.addEventListener("App.checkSession", (f) => {
    if (f.success) {
      if (f.data.session.expired)
        l(), this.session_id = null;
      else if (f.data.session.remember)
        w(f.data.session.id);
    } else
      this.session_id = null, l();
  }), this._encryptCall = function(f) {
    if (!f || !f.constructor == o.io.model.call_model)
      throw new Error("Attempted to encrypt a non \'call\' object");
    var u = b.lib.WordArray.random(16), p = b.AES.encrypt(JSON.stringify(f.toObject()), h, { iv: u }), _ = b.enc.Base64.stringify(u.concat(p.ciphertext));
    return f.secure = _, f.parameters = null, f;
  };
};
o.io.core.prototype = { _session_loader: null, _call_queue: [], _event_listeners: {}, addEventListener: o.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: o.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: o.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: o.io.events.EventDispatcher.prototype.dispatchEvent, getSessionLoader: function() {
  if (this._session_loader == null)
    this._session_loader = new o.io.SessionLoader(this);
  return this._session_loader;
}, getSession: function() {
  return this.getSessionLoader().session;
}, getCurrentUser: function() {
  var t = this.getSessionLoader();
  if (t.session)
    return t.session.user;
  return null;
}, getLoginError: function() {
  return this.getSessionLoader().last_error;
}, getValidSession: function(t, e) {
  this.getSessionLoader().getValidSession(t, e);
}, requestLogin: function(t, e, n, r) {
  if (!t || t.constructor !== Function)
    throw "Missing required callback for \'on_logged_in\'.";
  if (!e || e.constructor !== Function)
    throw "Missing required callback for \'on_login_failed\'.";
  var s = this, a = this.getSessionLoader(), c;
  function h() {
    if (c)
      clearInterval(c);
    s.removeEventListener("cancelLoginRequest", x), a.closePassport();
  }
  function x() {
    n && n.constructor === Function ? n.call(r) : e.call(r), h();
  }
  if (s.addEventListener("cancelLoginRequest", x), s.getCurrentUser())
    t.call(r);
  else
    a.loadPassport(), c = setInterval(function() {
      a.checkSession(function(d) {
        if (!d || d.expired)
          if (a.last_error.code == 111)
            x();
          else
            h(), e.call(r);
        else if (d.user)
          h(), t.call(r);
      });
    }, 3000);
}, cancelLoginRequest: function() {
  event = new o.io.events.OutputEvent("cancelLoginRequest", null, null), this.dispatchEvent(event);
}, logOut: function(t, e) {
  this.getSessionLoader().endSession(t, e);
}, queueComponent: function(t, e, n, r) {
  if (e && e.constructor === Function && !n)
    n = e, e = null;
  var s = new o.io.model.call(this);
  if (s.component = t, typeof e != "undefined")
    s.parameters = e;
  this._validateCall(s), this._call_queue.push([s, n, r]);
}, executeQueue: function() {
  var t = [], e = [], n = [];
  for (var r = 0;r < this._call_queue.length; r++)
    t.push(this._call_queue[r][0]), e.push(this._call_queue[r][1]), n.push(this._call_queue[r][2]);
  this._doCall(t, e, n), this._call_queue = [];
}, callComponent: function(t, e, n, r) {
  if (e.constructor === Function && !n)
    n = e, e = null;
  var s = new o.io.model.call(this);
  if (s.component = t, typeof e != "undefined")
    s.parameters = e;
  this._validateCall(s), this._doCall(s, n, r);
}, _doCallback: function(t, e, n, r) {
  var s, a, c, h, x, d = { success: false, error: { code: 0, message: "Unexpected Server Response" } };
  if (typeof n == "undefined")
    n = null;
  if (t.constructor === Array && e && e.constructor === Array) {
    for (s = 0;s < t.length; s++)
      a = !n || typeof n[s] == "undefined" ? d : n[s], c = typeof e[s] == "undefined" ? null : e[s], this._doCallback(t[s], c, a, r[s]);
    return;
  }
  if (n && typeof n.data != "undefined") {
    var E;
    if (n.data.constructor === Array) {
      E = [];
      for (s = 0;s < n.data.length; s++)
        E.push(this._formatResults(n.component, n.data[s]));
    } else
      E = this._formatResults(n.component, n.data);
    n.data = E;
  }
  var g;
  if (n)
    if (typeof n.data != "undefined")
      g = n.data;
    else
      console.warn("Received empty data from \'" + t.component + "\'."), g = null;
  else
    g = d;
  var w;
  if (g.constructor === Array)
    for (s = 0;s < g.length; s++)
      w = new o.io.events.OutputEvent(t.component, t[s], g[s]), this.dispatchEvent(w);
  else
    w = new o.io.events.OutputEvent(t.component, t, g), this.dispatchEvent(w);
  if (e && e.constructor === Function)
    e.call(r, g);
}, _formatResults: function(t, e) {
  var n, r, s, a, c, h = null;
  if (typeof e.success != "undefined" && e.success)
    h = o.io.call_validators.getValidator(t);
  if (!h)
    return e;
  var x = h.returns;
  for (r in x) {
    if (typeof e[r] == "undefined" && e.success !== false) {
      console.warn("Newgrounds.io server failed to return expected \'" + r + "\' in \'" + t + "\' data.");
      continue;
    }
    if (typeof x[r].array != "undefined") {
      if (typeof x[r].array.object != "undefined")
        c = x[r].array.object;
      else
        c = x[r].array;
      if (typeof o.io.model[c] == "undefined") {
        console.warn("Received unsupported model \'" + c + "\' from \'" + t + "\'.");
        continue;
      }
      if (e[r].constructor !== Array) {
        console.warn("Expected array<" + c + "> value for \'" + r + "\' in \'" + t + "\' data, got " + typeof e[r]);
        continue;
      }
      a = [];
      for (s = 0;s < e[r].length; s++)
        n = new o.io.model[c](this), n.fromObject(e[r][s]), a.push(n);
      e[r] = a;
    } else if (typeof x[r].object != "undefined" && e[r]) {
      if (c = x[r].object, typeof o.io.model[c] == "undefined") {
        console.warn("Received unsupported model \'" + c + "\' from \'" + t + "\'.");
        continue;
      }
      n = new o.io.model[c](this), n.fromObject(e[r]), e[r] = n;
    }
  }
  return e;
}, _doCall: function(t, e, n) {
  if (!this.app_id)
    throw new Error("Attempted to call Newgrounds.io server without setting an app_id in Newgrounds.io.core instance.");
  var r, s = false, a = this;
  function c(_) {
    var O = o.io.call_validators.getValidator(_.component);
    if (O.hasOwnProperty("redirect") && O.redirect) {
      var A = _.parameters;
      if (!A || !A.hasOwnProperty("redirect") || A.redirect)
        return true;
    }
    return false;
  }
  if (t.constructor === Array) {
    r = [];
    for (i = 0;i < t.length; i++) {
      if (c(t[i]))
        throw new Error("Loader components can not be called in an array without a redirect=false parameter.");
      r.push(t[i].toObject());
    }
  } else
    r = t.toObject(), s = c(t);
  var h = { app_id: this.app_id, session_id: this.session_id, call: r };
  if (this.debug)
    h.debug = 1;
  if (s) {
    var x = { success: true, app_id: this.app_id, result: { component: t.component, data: { success: true } } }, d = document.createElement("form");
    d.action = o.io.GATEWAY_URI, d.target = "_blank", d.method = "POST";
    var E = document.createElement("input");
    E.type = "hidden", E.name = "input", d.appendChild(E), document.body.appendChild(d), E.value = JSON.stringify(h), d.submit(), document.body.removeChild(d);
  } else {
    var g = new XMLHttpRequest, w, l = null, f = this;
    g.onreadystatechange = function() {
      if (g.readyState == 4) {
        var _;
        try {
          _ = JSON.parse(g.responseText).result;
        } catch (O) {
        }
        f._doCallback(t, e, _, n);
      }
    };
    var u = new FormData, p = typeof Array.prototype.toJSON != "undefined" ? Array.prototype.toJSON : null;
    if (p)
      delete Array.prototype.toJSON;
    if (u.append("input", JSON.stringify(h)), p)
      Array.prototype.toJSON = p;
    g.open("POST", o.io.GATEWAY_URI, true), g.send(u);
  }
}, _doValidateCall: function(t, e) {
  var n, r, s, a, c = o.io.call_validators.getValidator(t);
  if (!c)
    throw new Error("\'" + t + "\' is not a valid server component.");
  if (c.require_session && !this.session_id)
    throw new Error("\'" + t + "\' requires a session id");
  if (c.import && c.import.length > 0)
    for (n = 0;n < c.import.length; n++)
      r = c.import[n].split("."), this._doValidateCall(r[0], r[1], e);
  var h;
  for (s in c.params) {
    if (a = c.params[s], h = e && typeof e[s] != "undefined" ? e[s] : null, !h && a.extract_from && a.extract_from.alias)
      h = e[a.extract_from.alias];
    if (h === null) {
      if (a.required)
        throw new Error("Missing required parameter for \'" + t + "\': " + s);
      continue;
    }
    if (a.extract_from && h.constructor === o.io.model[a.extract_from.object])
      h = h[a.extract_from.property];
    if (!o.io.model.checkStrictValue(null, s, h, a.type, null, null, null))
      throw new Error("Illegal value for \'" + s + "\' parameter of \'" + t + "\': " + h);
  }
}, _validateCall: function(t) {
  var e;
  if (t.constructor === Array) {
    var n = [];
    for (e = 0;e < t.length; e++)
      n.push(this._validateCall(t[e]));
    return n;
  } else if (t.constructor !== o.io.model.call)
    throw new Error("Unexpected \'call_model\' value. Expected Newgrounds.io.model.call instance.");
  var { component: r, parameters: s, echo: a } = t;
  if (s && s.constructor === Array)
    for (e = 0;e < s.length; e++)
      this._doValidateCall(r, s[e]);
  else
    this._doValidateCall(r, s);
  var c = { component: t.component }, h = o.io.call_validators.getValidator(t.component);
  if (typeof s != "undefined")
    if (h.secure) {
      var x = this._encryptCall(t);
      c.secure = x.secure;
    } else
      c.parameters = s;
  if (typeof a != "undefined")
    c.echo = a;
  return c;
} };
o.io.core.prototype.constructor = o.io.core;
o.io.core.instance_id = 0;
o.io.core.getNextInstanceID = function() {
  return o.io.core.instance_id++, o.io.core.instance_id;
};
o.io.urlHelper = function() {
  var t = window.location.href, e = {}, n = t.split("?").pop();
  if (n) {
    var r = n.split("&"), s;
    for (var a = 0;a < r.length; a++)
      s = r[a].split("="), e[s[0]] = s[1];
  }
  this.getRequestQueryParam = function(c, h) {
    if (typeof h == "undefined")
      h = null;
    return typeof e[c] == "undefined" ? h : e[c];
  };
};
o.io.model.call = function(t, e) {
  var n, r, s, a;
  this.__property_names = ["component", "echo", "parameters", "secure"], this.__classname = "Newgrounds.io.model.call", this.__ngio = t;
  var n;
  Object.defineProperty(this, "component", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "component", c, String, null, null, null), n = c;
  } });
  var r;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(c) {
    r = c;
  } });
  var s;
  Object.defineProperty(this, "parameters", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "parameters", c, Object, null, Object, null), s = c;
  } });
  var a;
  if (Object.defineProperty(this, "secure", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "secure", c, String, null, null, null), a = c;
  } }), e)
    this.fromObject(e);
};
o.io.model.call.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.call.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.call.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.call.prototype.constructor = o.io.model.call;
o.io.model.debug = function(t, e) {
  var n, r;
  this.__property_names = ["exec_time", "input"], this.__classname = "Newgrounds.io.model.debug", this.__ngio = t;
  var n;
  Object.defineProperty(this, "exec_time", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "exec_time", s, String, null, null, null), n = s;
  } });
  var r;
  if (Object.defineProperty(this, "input", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "input", s, null, "input", null, null), r = s;
  } }), e)
    this.fromObject(e);
};
o.io.model.debug.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.debug.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.debug.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "input" && e)
      e = new o.io.model.input(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.debug.prototype.constructor = o.io.model.debug;
o.io.model.error = function(t, e) {
  var n, r;
  this.__property_names = ["code", "message"], this.__classname = "Newgrounds.io.model.error", this.__ngio = t;
  var n;
  Object.defineProperty(this, "code", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "code", s, Number, null, null, null), n = s;
  } });
  var r;
  if (Object.defineProperty(this, "message", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "message", s, String, null, null, null), r = s;
  } }), e)
    this.fromObject(e);
};
o.io.model.error.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.error.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.error.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.error.get = function(t, e) {
  var n = new o.io.model.error;
  return n.message = t ? t : "Unknown Error", n.code = e ? e : 0, n;
};
o.io.model.error.MISSING_INPUT = 100;
o.io.model.error.INVALID_INPUT = 101;
o.io.model.error.MISSING_PARAMETER = 102;
o.io.model.error.INVALID_PARAMETER = 103;
o.io.model.error.EXPIRED_SESSION = 104;
o.io.model.error.DUPLICATE_SESSION = 105;
o.io.model.error.MAX_CONNECTIONS_EXCEEDED = 106;
o.io.model.error.MAX_CALLS_EXCEEDED = 107;
o.io.model.error.MEMORY_EXCEEDED = 108;
o.io.model.error.TIMED_OUT = 109;
o.io.model.error.LOGIN_REQUIRED = 110;
o.io.model.error.INVALID_APP_ID = 200;
o.io.model.error.INVALID_ENCRYPTION = 201;
o.io.model.error.INVALID_MEDAL_ID = 202;
o.io.model.error.INVALID_SCOREBOARD_ID = 203;
o.io.model.error.INVALID_SAVEGROUP_ID = 204;
o.io.model.error.SERVER_UNAVAILABLE = 504;
o.io.model.error.prototype.constructor = o.io.model.error;
o.io.model.input = function(t, e) {
  var n, r, s, a, c;
  this.__property_names = ["app_id", "call", "debug", "echo", "session_id"], this.__classname = "Newgrounds.io.model.input", this.__ngio = t;
  var n;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "app_id", h, String, null, null, null), n = h;
  } });
  var r;
  Object.defineProperty(this, "call", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "call", h, null, "call", null, "call"), r = h;
  } });
  var s;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "debug", h, Boolean, null, null, null), s = h;
  } });
  var a;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(h) {
    a = h;
  } });
  var c;
  if (Object.defineProperty(this, "session_id", { get: function() {
    return typeof c == "undefined" ? null : c;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "session_id", h, String, null, null, null), c = h;
  } }), e)
    this.fromObject(e);
};
o.io.model.input.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.input.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.input.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "call" && e)
      e = new o.io.model.call(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.input.prototype.constructor = o.io.model.input;
o.io.model.medal = function(t, e) {
  var n, r, s, a, c, h, x, d;
  this.__property_names = ["description", "difficulty", "icon", "id", "name", "secret", "unlocked", "value"], this.__classname = "Newgrounds.io.model.medal", this.__ngio = t;
  var n;
  Object.defineProperty(this, "description", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "description", E, String, null, null, null), n = E;
  } });
  var r;
  Object.defineProperty(this, "difficulty", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "difficulty", E, Number, null, null, null), r = E;
  } });
  var s;
  Object.defineProperty(this, "icon", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "icon", E, String, null, null, null), s = E;
  } });
  var a;
  Object.defineProperty(this, "id", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "id", E, Number, null, null, null), a = E;
  } });
  var c;
  Object.defineProperty(this, "name", { get: function() {
    return typeof c == "undefined" ? null : c;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "name", E, String, null, null, null), c = E;
  } });
  var h;
  Object.defineProperty(this, "secret", { get: function() {
    return typeof h == "undefined" ? null : h;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "secret", E, Boolean, null, null, null), h = E;
  } });
  var x;
  Object.defineProperty(this, "unlocked", { get: function() {
    return typeof x == "undefined" ? null : x;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "unlocked", E, Boolean, null, null, null), x = E;
  } });
  var d;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof d == "undefined" ? null : d;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "value", E, Number, null, null, null), d = E;
  } }), e)
    this.fromObject(e);
};
o.io.model.medal.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.medal.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.medal.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.medal.prototype.unlock = function(t) {
  var e = this;
  if (this._has_ngio_user())
    this.__ngio.callComponent("Medal.unlock", { id: this.id }, function(s) {
      if (s.success)
        this.unlocked = true;
      t(s);
    });
  else if (typeof t == "function") {
    var n = o.io.model.error.get("This function requires a valid user session.", o.io.model.error.LOGIN_REQUIRED), r = { success: false, error: n };
    t(r);
  }
};
o.io.model.medal.prototype.constructor = o.io.model.medal;
o.io.model.output = function(t, e) {
  var n, r, s, a, c, h, x, d;
  this.__property_names = ["api_version", "app_id", "debug", "echo", "error", "help_url", "result", "success"], this.__classname = "Newgrounds.io.model.output", this.__ngio = t;
  var n;
  Object.defineProperty(this, "api_version", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "api_version", E, String, null, null, null), n = E;
  } });
  var r;
  Object.defineProperty(this, "app_id", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "app_id", E, String, null, null, null), r = E;
  } });
  var s;
  Object.defineProperty(this, "debug", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "debug", E, null, "debug", null, null), s = E;
  } });
  var a;
  Object.defineProperty(this, "echo", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(E) {
    a = E;
  } });
  var c;
  Object.defineProperty(this, "error", { get: function() {
    return typeof c == "undefined" ? null : c;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "error", E, null, "error", null, null), c = E;
  } });
  var h;
  Object.defineProperty(this, "help_url", { get: function() {
    return typeof h == "undefined" ? null : h;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "help_url", E, String, null, null, null), h = E;
  } });
  var x;
  Object.defineProperty(this, "result", { get: function() {
    return typeof x == "undefined" ? null : x;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "result", E, null, "result", null, "result"), x = E;
  } });
  var d;
  if (Object.defineProperty(this, "success", { get: function() {
    return typeof d == "undefined" ? null : d;
  }, set: function(E) {
    o.io.model.checkStrictValue(this.__classname, "success", E, Boolean, null, null, null), d = E;
  } }), e)
    this.fromObject(e);
};
o.io.model.output.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.output.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.output.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "debug" && e)
      e = new o.io.model.debug(this.__ngio, e);
    else if (this.__property_names[r] == "error" && e)
      e = new o.io.model.error(this.__ngio, e);
    else if (this.__property_names[r] == "result" && e)
      e = new o.io.model.result(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.output.prototype.constructor = o.io.model.output;
o.io.model.result = function(t, e) {
  var n, r, s;
  this.__property_names = ["component", "data", "echo"], this.__classname = "Newgrounds.io.model.result", this.__ngio = t;
  var n;
  Object.defineProperty(this, "component", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(a) {
    o.io.model.checkStrictValue(this.__classname, "component", a, String, null, null, null), n = a;
  } });
  var r;
  Object.defineProperty(this, "data", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(a) {
    o.io.model.checkStrictValue(this.__classname, "data", a, Object, null, Object, null), r = a;
  } });
  var s;
  if (Object.defineProperty(this, "echo", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(a) {
    s = a;
  } }), e)
    this.fromObject(e);
};
o.io.model.result.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.result.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.result.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.result.prototype.constructor = o.io.model.result;
o.io.model.score = function(t, e) {
  var n, r, s, a;
  this.__property_names = ["formatted_value", "tag", "user", "value"], this.__classname = "Newgrounds.io.model.score", this.__ngio = t;
  var n;
  Object.defineProperty(this, "formatted_value", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "formatted_value", c, String, null, null, null), n = c;
  } });
  var r;
  Object.defineProperty(this, "tag", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "tag", c, String, null, null, null), r = c;
  } });
  var s;
  Object.defineProperty(this, "user", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "user", c, null, "user", null, null), s = c;
  } });
  var a;
  if (Object.defineProperty(this, "value", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "value", c, Number, null, null, null), a = c;
  } }), e)
    this.fromObject(e);
};
o.io.model.score.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.score.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.score.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "user" && e)
      e = new o.io.model.user(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.score.prototype.constructor = o.io.model.score;
o.io.model.scoreboard = function(t, e) {
  var n, r;
  this.__property_names = ["id", "name"], this.__classname = "Newgrounds.io.model.scoreboard", this.__ngio = t;
  var n;
  Object.defineProperty(this, "id", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "id", s, Number, null, null, null), n = s;
  } });
  var r;
  if (Object.defineProperty(this, "name", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(s) {
    o.io.model.checkStrictValue(this.__classname, "name", s, String, null, null, null), r = s;
  } }), e)
    this.fromObject(e);
};
o.io.model.scoreboard.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.scoreboard.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.scoreboard.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.scoreboard.prototype.postScore = function(t, e, n) {
  var r = this;
  if (typeof e == "function" && !n)
    n = e, e = null;
  if (!e)
    e = null;
  if (this._has_ngio_user())
    this.__ngio.callComponent("ScoreBoard.postScore", { id: this.id, value: t, tag: e }, function(c) {
      n(c);
    });
  else if (typeof n == "function") {
    var s = o.io.model.error.get("This function requires a valid user session.", o.io.model.error.LOGIN_REQUIRED), a = { success: false, error: s };
    n(a);
  }
};
o.io.model.scoreboard.prototype.constructor = o.io.model.scoreboard;
o.io.model.session = function(t, e) {
  var n, r, s, a, c;
  this.__property_names = ["expired", "id", "passport_url", "remember", "user"], this.__classname = "Newgrounds.io.model.session", this.__ngio = t;
  var n;
  Object.defineProperty(this, "expired", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "expired", h, Boolean, null, null, null), n = h;
  } });
  var r;
  Object.defineProperty(this, "id", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "id", h, String, null, null, null), r = h;
  } });
  var s;
  Object.defineProperty(this, "passport_url", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "passport_url", h, String, null, null, null), s = h;
  } });
  var a;
  Object.defineProperty(this, "remember", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "remember", h, Boolean, null, null, null), a = h;
  } });
  var c;
  if (Object.defineProperty(this, "user", { get: function() {
    return typeof c == "undefined" ? null : c;
  }, set: function(h) {
    o.io.model.checkStrictValue(this.__classname, "user", h, null, "user", null, null), c = h;
  } }), e)
    this.fromObject(e);
};
o.io.model.session.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.session.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.session.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "user" && e)
      e = new o.io.model.user(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.session.prototype.constructor = o.io.model.session;
o.io.model.user = function(t, e) {
  var n, r, s, a;
  this.__property_names = ["icons", "id", "name", "supporter"], this.__classname = "Newgrounds.io.model.user", this.__ngio = t;
  var n;
  Object.defineProperty(this, "icons", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "icons", c, null, "usericons", null, null), n = c;
  } });
  var r;
  Object.defineProperty(this, "id", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "id", c, Number, null, null, null), r = c;
  } });
  var s;
  Object.defineProperty(this, "name", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "name", c, String, null, null, null), s = c;
  } });
  var a;
  if (Object.defineProperty(this, "supporter", { get: function() {
    return typeof a == "undefined" ? null : a;
  }, set: function(c) {
    o.io.model.checkStrictValue(this.__classname, "supporter", c, Boolean, null, null, null), a = c;
  } }), e)
    this.fromObject(e);
};
o.io.model.user.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.user.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.user.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++) {
    if (e = t[this.__property_names[r]], this.__property_names[r] == "icons" && e)
      e = new o.io.model.usericons(this.__ngio, e);
    this[this.__property_names[r]] = e;
  }
};
o.io.model.user.prototype.constructor = o.io.model.user;
o.io.model.usericons = function(t, e) {
  var n, r, s;
  this.__property_names = ["large", "medium", "small"], this.__classname = "Newgrounds.io.model.usericons", this.__ngio = t;
  var n;
  Object.defineProperty(this, "large", { get: function() {
    return typeof n == "undefined" ? null : n;
  }, set: function(a) {
    o.io.model.checkStrictValue(this.__classname, "large", a, String, null, null, null), n = a;
  } });
  var r;
  Object.defineProperty(this, "medium", { get: function() {
    return typeof r == "undefined" ? null : r;
  }, set: function(a) {
    o.io.model.checkStrictValue(this.__classname, "medium", a, String, null, null, null), r = a;
  } });
  var s;
  if (Object.defineProperty(this, "small", { get: function() {
    return typeof s == "undefined" ? null : s;
  }, set: function(a) {
    o.io.model.checkStrictValue(this.__classname, "small", a, String, null, null, null), s = a;
  } }), e)
    this.fromObject(e);
};
o.io.model.usericons.prototype._has_ngio_user = function() {
  return this.__ngio && this.__ngio.user;
};
o.io.model.usericons.prototype.toObject = function() {
  var t = {};
  for (var e = 0;e < this.__property_names.length; e++)
    if (typeof this[this.__property_names[e]] != "undefined")
      t[this.__property_names[e]] = this[this.__property_names[e]];
  return t;
};
o.io.model.usericons.prototype.fromObject = function(t) {
  var e, n;
  for (var r = 0;r < this.__property_names.length; r++)
    e = t[this.__property_names[r]], this[this.__property_names[r]] = e;
};
o.io.model.usericons.prototype.constructor = o.io.model.usericons;
o.io.call_validators.getValidator = function(t) {
  var e = t.split("."), n = e[0], r = e[1], s = o.io.call_validators[n] && o.io.call_validators[n][r] ? o.io.call_validators[n][r] : null;
  return s;
};
o.io.call_validators.App = { checkSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: { session: { object: "session", description: null } } }, endSession: { require_session: true, secure: false, redirect: false, import: false, params: {}, returns: {} }, getCurrentVersion: { require_session: false, secure: false, redirect: false, import: false, params: { version: { type: String, extract_from: null, required: null, description: 'The version number (in "X.Y.Z" format) of the client-side app. (default = "0.0.0")' } }, returns: {} }, getHostLicense: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: null, description: "The host domain to check (ei, somesite.com)." } }, returns: {} }, logView: { require_session: false, secure: false, redirect: false, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Examples: "www.somesite.com", "localHost"' } }, returns: {} }, startSession: { require_session: false, secure: false, redirect: false, import: false, params: { force: { type: Boolean, extract_from: null, required: null, description: "If true, will create a new session even if the user already has an existing one.\n\nNote: Any previous session ids will no longer be valid if this is used." } }, returns: { session: { object: "session", description: null } } } };
o.io.call_validators.Event = { logEvent: { require_session: false, secure: false, redirect: false, import: false, params: { event_name: { type: String, extract_from: null, required: true, description: "The name of your custom event as defined in your Referrals & Events settings." }, host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "newgrounds.com", "localHost"' } }, returns: {} } };
o.io.call_validators.Gateway = { getDatetime: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, getVersion: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} }, ping: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: {} } };
o.io.call_validators.Loader = { loadAuthorUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadMoreGames: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadNewgrounds: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadOfficialUrl: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." } }, returns: {} }, loadReferral: { require_session: false, secure: false, redirect: true, import: false, params: { host: { type: String, extract_from: null, required: true, description: 'The domain hosting your app. Example: "www.somesite.com", "localHost"' }, redirect: { type: Boolean, extract_from: null, required: false, description: "Set this to false to get a JSON response containing the URL instead of doing an actual redirect." }, referral_name: { type: String, extract_from: null, required: true, description: 'The name of the referral (as defined in your "Referrals & Events" settings).' } }, returns: {} } };
o.io.call_validators.Medal = { getList: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { medals: { array: { object: "medal" }, description: "An array of medal objects." } } }, unlock: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "medal", alias: "medal", property: "id" }, required: true, description: "The numeric ID of the medal to unlock." } }, returns: { medal: { object: "medal", description: "The #medal that was unlocked." } } } };
o.io.call_validators.ScoreBoard = { getBoards: { require_session: false, secure: false, redirect: false, import: false, params: {}, returns: { scoreboards: { array: { object: "scoreboard" }, description: "An array of #scoreboard objects." } } }, getScores: { require_session: false, secure: false, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, limit: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to include in the list. Default = 10." }, period: { type: String, extract_from: null, required: null, description: "The time-frame to pull scores from (see notes for acceptable values)." }, skip: { type: Number, extract_from: null, required: null, description: "An integer indicating the number of scores to skip before starting the list. Default = 0." }, social: { type: Boolean, extract_from: null, required: null, description: "If set to true, only social scores will be loaded (scores by the user and their friends). This param will be ignored if there is no valid session id and the \'user\' param is absent." }, tag: { type: String, extract_from: null, required: null, description: "A tag to filter results by." }, user: { type: "mixed", extract_from: null, required: null, description: "A user\'s ID or name.  If \'social\' is true, this user and their friends will be included. Otherwise, only scores for this user will be loaded. If this param is missing and there is a valid session id, that user will be used by default." } }, returns: { scoreboard: { object: "scoreboard", description: "The #scoreboard being queried." }, scores: { array: { object: "score" }, description: "An array of #score objects." }, user: { object: "user", description: "The #user the score list is associated with (either as defined in the \'user\' param, or extracted from the current session when \'social\' is set to true)" } } }, postScore: { require_session: true, secure: true, redirect: false, import: false, params: { id: { type: Number, extract_from: { object: "scoreboard", alias: "scoreboard", property: "id" }, required: true, description: "The numeric ID of the scoreboard." }, tag: { type: String, extract_from: null, required: null, description: "An optional tag that can be used to filter scores via ScoreBoard.getScores" }, value: { type: Number, extract_from: null, required: true, description: "The int value of the score." } }, returns: { score: { object: "score", description: "The #score that was posted to the board." }, scoreboard: { object: "scoreboard", description: "The #scoreboard that was posted to." } } } };
o.io.SessionLoader = function(t) {
  if (!t || t.constructor !== o.io.core)
    throw new Error("\'ngio\' must be a \'Newgrounds.io.core\' instance.");
  this.__ngio = t;
  var e = null;
  Object.defineProperty(this, "session", { set: function(n) {
    if (n && !n.constructor === o.io.model.session)
      throw new Error("\'session\' must be a \'Newgrounds.io.model.session\' instance.");
    e = n;
  }, get: function() {
    return e;
  } });
};
o.io.SessionLoader.prototype = { _event_listeners: {}, last_error: null, passport_window: null, addEventListener: o.io.events.EventDispatcher.prototype.addEventListener, removeEventListener: o.io.events.EventDispatcher.prototype.removeEventListener, removeAllEventListeners: o.io.events.EventDispatcher.prototype.removeAllEventListeners, dispatchEvent: o.io.events.EventDispatcher.prototype.dispatchEvent, getValidSession: function(t, e) {
  var n = this;
  n.checkSession(function(r) {
    if (!r || r.expired)
      n.startSession(t, e);
    else
      t.call(e, r);
  });
}, startSession: function(t, e) {
  var n = new o.io.events.SessionEvent, r = this;
  this.__ngio.callComponent("App.startSession", function(s) {
    if (!s.success || !s.session) {
      if (s.error)
        r.last_error = s.error;
      else
        r.last_error = new o.io.model.error, r.last_error.message = "Unexpected Error";
      n.type = o.io.events.SessionEvent.SESSION_EXPIRED, r.session = null;
    } else
      n.type = o.io.events.SessionEvent.REQUEST_LOGIN, n.passport_url = s.session.passport_url, r.session = s.session;
    if (r.__ngio.session_id = r.session ? r.session.id : null, r.dispatchEvent(n), t && t.constructor === Function)
      t.call(e, r.session);
  });
}, checkSession: function(t, e) {
  var n = new o.io.events.SessionEvent, r = this;
  if (r.session && r.session.user) {
    if (n.type = o.io.events.SessionEvent.USER_LOADED, n.user = r.session.user, r.dispatchEvent(n), t && t.constructor === Function)
      t.call(e, r.session);
  } else if (!this.__ngio.session_id) {
    if (n.type = o.io.events.SessionEvent.SESSION_EXPIRED, r.session = null, r.dispatchEvent(n), t && t.constructor === Function)
      t.call(e, null);
  } else
    this.__ngio.callComponent("App.checkSession", function(s) {
      if (!s.success || !s.session || s.session.expired)
        if (n.type = o.io.events.SessionEvent.SESSION_EXPIRED, r.session = null, s.error)
          r.last_error = s.error;
        else if (r.last_error = new o.io.model.error, s.session && s.session.expired)
          r.last_error.message = "Session is Expired";
        else
          r.last_error.message = "Unexpected Error";
      else if (!s.session.user)
        n.type = o.io.events.SessionEvent.REQUEST_LOGIN, n.passport_url = s.session.passport_url, r.session = s.session;
      else
        n.type = o.io.events.SessionEvent.USER_LOADED, n.user = s.session.user, r.session = s.session;
      if (r.__ngio.session_id = r.session ? r.session.id : null, r.dispatchEvent(n), t && t.constructor === Function)
        t.call(e, r.session);
    });
}, endSession: function(t, e) {
  var n = this, r = this.__ngio;
  this.__ngio.callComponent("App.endSession", function(s) {
    n.session = null, r.session_id = null;
    var a = new o.io.events.SessionEvent(o.io.events.SessionEvent.SESSION_EXPIRED);
    if (n.dispatchEvent(a), t && t.constructor === Function)
      t.call(e, n.session);
  }), this.__ngio.session_id = null, this.session = null;
}, loadPassport: function(t) {
  if (typeof t != "string")
    t = "_blank";
  if (!this.session || !this.session.passport_url)
    return console.warn("Attempted to open Newgrounds Passport without a valid passport_url. Be sure you have called getValidSession() first!."), false;
  if (this.passport_window = window.open(this.session.passport_url, t), !this.passport_window)
    console.warn("Unable to detect passport window. Pop-up blockers will prevent loading Newgrounds Passport if loadPassport() or requestLogin() are not called from within a mouse click handler.");
  return this.passportOpen();
}, closePassport: function() {
  if (!this.passport_window)
    return false;
  return this.passport_window.close(), this.passportOpen();
}, passportOpen: function() {
  return this.passport_window && this.passport_window.parent ? true : false;
} };
o.io.SessionLoader.prototype.constructor = o.io.SessionLoader;
var b = b || function(t, e) {
  var n = {}, r = n.lib = {}, s = function() {
  }, a = r.Base = { extend: function(l) {
    s.prototype = this;
    var f = new s;
    return l && f.mixIn(l), f.hasOwnProperty("init") || (f.init = function() {
      f.$super.init.apply(this, arguments);
    }), f.init.prototype = f, f.$super = this, f;
  }, create: function() {
    var l = this.extend();
    return l.init.apply(l, arguments), l;
  }, init: function() {
  }, mixIn: function(l) {
    for (var f in l)
      l.hasOwnProperty(f) && (this[f] = l[f]);
    l.hasOwnProperty("toString") && (this.toString = l.toString);
  }, clone: function() {
    return this.init.prototype.extend(this);
  } }, c = r.WordArray = a.extend({ init: function(l, f) {
    l = this.words = l || [], this.sigBytes = f != e ? f : 4 * l.length;
  }, toString: function(l) {
    return (l || x).stringify(this);
  }, concat: function(l) {
    var f = this.words, u = l.words, p = this.sigBytes;
    if (l = l.sigBytes, this.clamp(), p % 4)
      for (var _ = 0;_ < l; _++)
        f[p + _ >>> 2] |= (u[_ >>> 2] >>> 24 - 8 * (_ % 4) & 255) << 24 - 8 * ((p + _) % 4);
    else if (65535 < u.length)
      for (_ = 0;_ < l; _ += 4)
        f[p + _ >>> 2] = u[_ >>> 2];
    else
      f.push.apply(f, u);
    return this.sigBytes += l, this;
  }, clamp: function() {
    var l = this.words, f = this.sigBytes;
    l[f >>> 2] &= 4294967295 << 32 - 8 * (f % 4), l.length = t.ceil(f / 4);
  }, clone: function() {
    var l = a.clone.call(this);
    return l.words = this.words.slice(0), l;
  }, random: function(l) {
    for (var f = [], u = 0;u < l; u += 4)
      f.push(4294967296 * t.random() | 0);
    return new c.init(f, l);
  } }), h = n.enc = {}, x = h.Hex = { stringify: function(l) {
    var f = l.words;
    l = l.sigBytes;
    for (var u = [], p = 0;p < l; p++) {
      var _ = f[p >>> 2] >>> 24 - 8 * (p % 4) & 255;
      u.push((_ >>> 4).toString(16)), u.push((_ & 15).toString(16));
    }
    return u.join("");
  }, parse: function(l) {
    for (var f = l.length, u = [], p = 0;p < f; p += 2)
      u[p >>> 3] |= parseInt(l.substr(p, 2), 16) << 24 - 4 * (p % 8);
    return new c.init(u, f / 2);
  } }, d = h.Latin1 = { stringify: function(l) {
    var f = l.words;
    l = l.sigBytes;
    for (var u = [], p = 0;p < l; p++)
      u.push(String.fromCharCode(f[p >>> 2] >>> 24 - 8 * (p % 4) & 255));
    return u.join("");
  }, parse: function(l) {
    for (var f = l.length, u = [], p = 0;p < f; p++)
      u[p >>> 2] |= (l.charCodeAt(p) & 255) << 24 - 8 * (p % 4);
    return new c.init(u, f);
  } }, E = h.Utf8 = { stringify: function(l) {
    try {
      return decodeURIComponent(escape(d.stringify(l)));
    } catch (f) {
      throw Error("Malformed UTF-8 data");
    }
  }, parse: function(l) {
    return d.parse(unescape(encodeURIComponent(l)));
  } }, g = r.BufferedBlockAlgorithm = a.extend({ reset: function() {
    this._data = new c.init, this._nDataBytes = 0;
  }, _append: function(l) {
    typeof l == "string" && (l = E.parse(l)), this._data.concat(l), this._nDataBytes += l.sigBytes;
  }, _process: function(l) {
    var f = this._data, u = f.words, p = f.sigBytes, _ = this.blockSize, O = p / (4 * _), O = l ? t.ceil(O) : t.max((O | 0) - this._minBufferSize, 0);
    if (l = O * _, p = t.min(4 * l, p), l) {
      for (var A = 0;A < l; A += _)
        this._doProcessBlock(u, A);
      A = u.splice(0, l), f.sigBytes -= p;
    }
    return new c.init(A, p);
  }, clone: function() {
    var l = a.clone.call(this);
    return l._data = this._data.clone(), l;
  }, _minBufferSize: 0 });
  r.Hasher = g.extend({ cfg: a.extend(), init: function(l) {
    this.cfg = this.cfg.extend(l), this.reset();
  }, reset: function() {
    g.reset.call(this), this._doReset();
  }, update: function(l) {
    return this._append(l), this._process(), this;
  }, finalize: function(l) {
    return l && this._append(l), this._doFinalize();
  }, blockSize: 16, _createHelper: function(l) {
    return function(f, u) {
      return new l.init(u).finalize(f);
    };
  }, _createHmacHelper: function(l) {
    return function(f, u) {
      return new w.HMAC.init(l, u).finalize(f);
    };
  } });
  var w = n.algo = {};
  return n;
}(Math);
(function() {
  var t = b, e = t.lib.WordArray;
  t.enc.Base64 = { stringify: function(n) {
    var { words: r, sigBytes: s } = n, a = this._map;
    n.clamp(), n = [];
    for (var c = 0;c < s; c += 3)
      for (var h = (r[c >>> 2] >>> 24 - 8 * (c % 4) & 255) << 16 | (r[c + 1 >>> 2] >>> 24 - 8 * ((c + 1) % 4) & 255) << 8 | r[c + 2 >>> 2] >>> 24 - 8 * ((c + 2) % 4) & 255, x = 0;4 > x && c + 0.75 * x < s; x++)
        n.push(a.charAt(h >>> 6 * (3 - x) & 63));
    if (r = a.charAt(64))
      for (;n.length % 4; )
        n.push(r);
    return n.join("");
  }, parse: function(n) {
    var r = n.length, s = this._map, a = s.charAt(64);
    a && (a = n.indexOf(a), a != -1 && (r = a));
    for (var a = [], c = 0, h = 0;h < r; h++)
      if (h % 4) {
        var x = s.indexOf(n.charAt(h - 1)) << 2 * (h % 4), d = s.indexOf(n.charAt(h)) >>> 6 - 2 * (h % 4);
        a[c >>> 2] |= (x | d) << 24 - 8 * (c % 4), c++;
      }
    return e.create(a, c);
  }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
})();
(function(t) {
  function e(g, w, l, f, u, p, _) {
    return g = g + (w & l | ~w & f) + u + _, (g << p | g >>> 32 - p) + w;
  }
  function n(g, w, l, f, u, p, _) {
    return g = g + (w & f | l & ~f) + u + _, (g << p | g >>> 32 - p) + w;
  }
  function r(g, w, l, f, u, p, _) {
    return g = g + (w ^ l ^ f) + u + _, (g << p | g >>> 32 - p) + w;
  }
  function s(g, w, l, f, u, p, _) {
    return g = g + (l ^ (w | ~f)) + u + _, (g << p | g >>> 32 - p) + w;
  }
  for (var a = b, x = a.lib, c = x.WordArray, h = x.Hasher, x = a.algo, d = [], E = 0;64 > E; E++)
    d[E] = 4294967296 * t.abs(t.sin(E + 1)) | 0;
  x = x.MD5 = h.extend({ _doReset: function() {
    this._hash = new c.init([1732584193, 4023233417, 2562383102, 271733878]);
  }, _doProcessBlock: function(g, w) {
    for (var l = 0;16 > l; l++) {
      var f = w + l, u = g[f];
      g[f] = (u << 8 | u >>> 24) & 16711935 | (u << 24 | u >>> 8) & 4278255360;
    }
    var l = this._hash.words, f = g[w + 0], u = g[w + 1], p = g[w + 2], _ = g[w + 3], O = g[w + 4], A = g[w + 5], V = g[w + 6], U = g[w + 7], M = g[w + 8], I = g[w + 9], P = g[w + 10], j = g[w + 11], L = g[w + 12], B = g[w + 13], N = g[w + 14], C = g[w + 15], m = l[0], v = l[1], y = l[2], S = l[3], m = e(m, v, y, S, f, 7, d[0]), S = e(S, m, v, y, u, 12, d[1]), y = e(y, S, m, v, p, 17, d[2]), v = e(v, y, S, m, _, 22, d[3]), m = e(m, v, y, S, O, 7, d[4]), S = e(S, m, v, y, A, 12, d[5]), y = e(y, S, m, v, V, 17, d[6]), v = e(v, y, S, m, U, 22, d[7]), m = e(m, v, y, S, M, 7, d[8]), S = e(S, m, v, y, I, 12, d[9]), y = e(y, S, m, v, P, 17, d[10]), v = e(v, y, S, m, j, 22, d[11]), m = e(m, v, y, S, L, 7, d[12]), S = e(S, m, v, y, B, 12, d[13]), y = e(y, S, m, v, N, 17, d[14]), v = e(v, y, S, m, C, 22, d[15]), m = n(m, v, y, S, u, 5, d[16]), S = n(S, m, v, y, V, 9, d[17]), y = n(y, S, m, v, j, 14, d[18]), v = n(v, y, S, m, f, 20, d[19]), m = n(m, v, y, S, A, 5, d[20]), S = n(S, m, v, y, P, 9, d[21]), y = n(y, S, m, v, C, 14, d[22]), v = n(v, y, S, m, O, 20, d[23]), m = n(m, v, y, S, I, 5, d[24]), S = n(S, m, v, y, N, 9, d[25]), y = n(y, S, m, v, _, 14, d[26]), v = n(v, y, S, m, M, 20, d[27]), m = n(m, v, y, S, B, 5, d[28]), S = n(S, m, v, y, p, 9, d[29]), y = n(y, S, m, v, U, 14, d[30]), v = n(v, y, S, m, L, 20, d[31]), m = r(m, v, y, S, A, 4, d[32]), S = r(S, m, v, y, M, 11, d[33]), y = r(y, S, m, v, j, 16, d[34]), v = r(v, y, S, m, N, 23, d[35]), m = r(m, v, y, S, u, 4, d[36]), S = r(S, m, v, y, O, 11, d[37]), y = r(y, S, m, v, U, 16, d[38]), v = r(v, y, S, m, P, 23, d[39]), m = r(m, v, y, S, B, 4, d[40]), S = r(S, m, v, y, f, 11, d[41]), y = r(y, S, m, v, _, 16, d[42]), v = r(v, y, S, m, V, 23, d[43]), m = r(m, v, y, S, I, 4, d[44]), S = r(S, m, v, y, L, 11, d[45]), y = r(y, S, m, v, C, 16, d[46]), v = r(v, y, S, m, p, 23, d[47]), m = s(m, v, y, S, f, 6, d[48]), S = s(S, m, v, y, U, 10, d[49]), y = s(y, S, m, v, N, 15, d[50]), v = s(v, y, S, m, A, 21, d[51]), m = s(m, v, y, S, L, 6, d[52]), S = s(S, m, v, y, _, 10, d[53]), y = s(y, S, m, v, P, 15, d[54]), v = s(v, y, S, m, u, 21, d[55]), m = s(m, v, y, S, M, 6, d[56]), S = s(S, m, v, y, C, 10, d[57]), y = s(y, S, m, v, V, 15, d[58]), v = s(v, y, S, m, B, 21, d[59]), m = s(m, v, y, S, O, 6, d[60]), S = s(S, m, v, y, j, 10, d[61]), y = s(y, S, m, v, p, 15, d[62]), v = s(v, y, S, m, I, 21, d[63]);
    l[0] = l[0] + m | 0, l[1] = l[1] + v | 0, l[2] = l[2] + y | 0, l[3] = l[3] + S | 0;
  }, _doFinalize: function() {
    var g = this._data, w = g.words, l = 8 * this._nDataBytes, f = 8 * g.sigBytes;
    w[f >>> 5] |= 128 << 24 - f % 32;
    var u = t.floor(l / 4294967296);
    w[(f + 64 >>> 9 << 4) + 15] = (u << 8 | u >>> 24) & 16711935 | (u << 24 | u >>> 8) & 4278255360, w[(f + 64 >>> 9 << 4) + 14] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360, g.sigBytes = 4 * (w.length + 1), this._process(), g = this._hash, w = g.words;
    for (l = 0;4 > l; l++)
      f = w[l], w[l] = (f << 8 | f >>> 24) & 16711935 | (f << 24 | f >>> 8) & 4278255360;
    return g;
  }, clone: function() {
    var g = h.clone.call(this);
    return g._hash = this._hash.clone(), g;
  } }), a.MD5 = h._createHelper(x), a.HmacMD5 = h._createHmacHelper(x);
})(Math);
(function() {
  var t = b, r = t.lib, e = r.Base, n = r.WordArray, r = t.algo, s = r.EvpKDF = e.extend({ cfg: e.extend({ keySize: 4, hasher: r.MD5, iterations: 1 }), init: function(a) {
    this.cfg = this.cfg.extend(a);
  }, compute: function(a, c) {
    for (var g = this.cfg, h = g.hasher.create(), x = n.create(), d = x.words, E = g.keySize, g = g.iterations;d.length < E; ) {
      w && h.update(w);
      var w = h.update(a).finalize(c);
      h.reset();
      for (var l = 1;l < g; l++)
        w = h.finalize(w), h.reset();
      x.concat(w);
    }
    return x.sigBytes = 4 * E, x;
  } });
  t.EvpKDF = function(a, c, h) {
    return s.create(h).compute(a, c);
  };
})();
b.lib.Cipher || function(t) {
  var l = b, e = l.lib, n = e.Base, r = e.WordArray, s = e.BufferedBlockAlgorithm, a = l.enc.Base64, c = l.algo.EvpKDF, h = e.Cipher = s.extend({ cfg: n.extend(), createEncryptor: function(u, p) {
    return this.create(this._ENC_XFORM_MODE, u, p);
  }, createDecryptor: function(u, p) {
    return this.create(this._DEC_XFORM_MODE, u, p);
  }, init: function(u, p, _) {
    this.cfg = this.cfg.extend(_), this._xformMode = u, this._key = p, this.reset();
  }, reset: function() {
    s.reset.call(this), this._doReset();
  }, process: function(u) {
    return this._append(u), this._process();
  }, finalize: function(u) {
    return u && this._append(u), this._doFinalize();
  }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function(u) {
    return { encrypt: function(p, _, O) {
      return (typeof _ == "string" ? f : w).encrypt(u, p, _, O);
    }, decrypt: function(p, _, O) {
      return (typeof _ == "string" ? f : w).decrypt(u, p, _, O);
    } };
  } });
  e.StreamCipher = h.extend({ _doFinalize: function() {
    return this._process(true);
  }, blockSize: 1 });
  var g = l.mode = {}, x = function(u, p, _) {
    var O = this._iv;
    O ? this._iv = t : O = this._prevBlock;
    for (var A = 0;A < _; A++)
      u[p + A] ^= O[A];
  }, d = (e.BlockCipherMode = n.extend({ createEncryptor: function(u, p) {
    return this.Encryptor.create(u, p);
  }, createDecryptor: function(u, p) {
    return this.Decryptor.create(u, p);
  }, init: function(u, p) {
    this._cipher = u, this._iv = p;
  } })).extend();
  d.Encryptor = d.extend({ processBlock: function(u, p) {
    var _ = this._cipher, O = _.blockSize;
    x.call(this, u, p, O), _.encryptBlock(u, p), this._prevBlock = u.slice(p, p + O);
  } }), d.Decryptor = d.extend({ processBlock: function(u, p) {
    var _ = this._cipher, O = _.blockSize, A = u.slice(p, p + O);
    _.decryptBlock(u, p), x.call(this, u, p, O), this._prevBlock = A;
  } }), g = g.CBC = d, d = (l.pad = {}).Pkcs7 = { pad: function(u, p) {
    for (var _ = 4 * p, _ = _ - u.sigBytes % _, O = _ << 24 | _ << 16 | _ << 8 | _, A = [], V = 0;V < _; V += 4)
      A.push(O);
    _ = r.create(A, _), u.concat(_);
  }, unpad: function(u) {
    u.sigBytes -= u.words[u.sigBytes - 1 >>> 2] & 255;
  } }, e.BlockCipher = h.extend({ cfg: h.cfg.extend({ mode: g, padding: d }), reset: function() {
    h.reset.call(this);
    var p = this.cfg, u = p.iv, p = p.mode;
    if (this._xformMode == this._ENC_XFORM_MODE)
      var _ = p.createEncryptor;
    else
      _ = p.createDecryptor, this._minBufferSize = 1;
    this._mode = _.call(p, this, u && u.words);
  }, _doProcessBlock: function(u, p) {
    this._mode.processBlock(u, p);
  }, _doFinalize: function() {
    var u = this.cfg.padding;
    if (this._xformMode == this._ENC_XFORM_MODE) {
      u.pad(this._data, this.blockSize);
      var p = this._process(true);
    } else
      p = this._process(true), u.unpad(p);
    return p;
  }, blockSize: 4 });
  var E = e.CipherParams = n.extend({ init: function(u) {
    this.mixIn(u);
  }, toString: function(u) {
    return (u || this.formatter).stringify(this);
  } }), g = (l.format = {}).OpenSSL = { stringify: function(u) {
    var p = u.ciphertext;
    return u = u.salt, (u ? r.create([1398893684, 1701076831]).concat(u).concat(p) : p).toString(a);
  }, parse: function(u) {
    u = a.parse(u);
    var p = u.words;
    if (p[0] == 1398893684 && p[1] == 1701076831) {
      var _ = r.create(p.slice(2, 4));
      p.splice(0, 4), u.sigBytes -= 16;
    }
    return E.create({ ciphertext: u, salt: _ });
  } }, w = e.SerializableCipher = n.extend({ cfg: n.extend({ format: g }), encrypt: function(u, p, _, O) {
    O = this.cfg.extend(O);
    var A = u.createEncryptor(_, O);
    return p = A.finalize(p), A = A.cfg, E.create({ ciphertext: p, key: _, iv: A.iv, algorithm: u, mode: A.mode, padding: A.padding, blockSize: u.blockSize, formatter: O.format });
  }, decrypt: function(u, p, _, O) {
    return O = this.cfg.extend(O), p = this._parse(p, O.format), u.createDecryptor(_, O).finalize(p.ciphertext);
  }, _parse: function(u, p) {
    return typeof u == "string" ? p.parse(u, this) : u;
  } }), l = (l.kdf = {}).OpenSSL = { execute: function(u, p, _, O) {
    return O || (O = r.random(8)), u = c.create({ keySize: p + _ }).compute(u, O), _ = r.create(u.words.slice(p), 4 * _), u.sigBytes = 4 * p, E.create({ key: u, iv: _, salt: O });
  } }, f = e.PasswordBasedCipher = w.extend({ cfg: w.cfg.extend({ kdf: l }), encrypt: function(u, p, _, O) {
    return O = this.cfg.extend(O), _ = O.kdf.execute(_, u.keySize, u.ivSize), O.iv = _.iv, u = w.encrypt.call(this, u, p, _.key, O), u.mixIn(_), u;
  }, decrypt: function(u, p, _, O) {
    return O = this.cfg.extend(O), p = this._parse(p, O.format), _ = O.kdf.execute(_, u.keySize, u.ivSize, p.salt), O.iv = _.iv, w.decrypt.call(this, u, p, _.key, O);
  } });
}();
(function() {
  for (var t = b, e = t.lib.BlockCipher, M = t.algo, n = [], r = [], s = [], a = [], c = [], h = [], x = [], d = [], E = [], g = [], w = [], l = 0;256 > l; l++)
    w[l] = 128 > l ? l << 1 : l << 1 ^ 283;
  for (var f = 0, u = 0, l = 0;256 > l; l++) {
    var p = u ^ u << 1 ^ u << 2 ^ u << 3 ^ u << 4, p = p >>> 8 ^ p & 255 ^ 99;
    n[f] = p, r[p] = f;
    var _ = w[f], O = w[_], A = w[O], V = 257 * w[p] ^ 16843008 * p;
    s[f] = V << 24 | V >>> 8, a[f] = V << 16 | V >>> 16, c[f] = V << 8 | V >>> 24, h[f] = V, V = 16843009 * A ^ 65537 * O ^ 257 * _ ^ 16843008 * f, x[p] = V << 24 | V >>> 8, d[p] = V << 16 | V >>> 16, E[p] = V << 8 | V >>> 24, g[p] = V, f ? (f = _ ^ w[w[w[A ^ _]]], u ^= w[w[u]]) : f = u = 1;
  }
  var U = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], M = M.AES = e.extend({ _doReset: function() {
    for (var j = this._key, I = j.words, P = j.sigBytes / 4, j = 4 * ((this._nRounds = P + 6) + 1), L = this._keySchedule = [], B = 0;B < j; B++)
      if (B < P)
        L[B] = I[B];
      else {
        var N = L[B - 1];
        B % P ? 6 < P && B % P == 4 && (N = n[N >>> 24] << 24 | n[N >>> 16 & 255] << 16 | n[N >>> 8 & 255] << 8 | n[N & 255]) : (N = N << 8 | N >>> 24, N = n[N >>> 24] << 24 | n[N >>> 16 & 255] << 16 | n[N >>> 8 & 255] << 8 | n[N & 255], N ^= U[B / P | 0] << 24), L[B] = L[B - P] ^ N;
      }
    I = this._invKeySchedule = [];
    for (P = 0;P < j; P++)
      B = j - P, N = P % 4 ? L[B] : L[B - 4], I[P] = 4 > P || 4 >= B ? N : x[n[N >>> 24]] ^ d[n[N >>> 16 & 255]] ^ E[n[N >>> 8 & 255]] ^ g[n[N & 255]];
  }, encryptBlock: function(I, P) {
    this._doCryptBlock(I, P, this._keySchedule, s, a, c, h, n);
  }, decryptBlock: function(I, P) {
    var j = I[P + 1];
    I[P + 1] = I[P + 3], I[P + 3] = j, this._doCryptBlock(I, P, this._invKeySchedule, x, d, E, g, r), j = I[P + 1], I[P + 1] = I[P + 3], I[P + 3] = j;
  }, _doCryptBlock: function(I, P, j, L, B, N, C, m) {
    for (var S = this._nRounds, q = I[P] ^ j[0], D = I[P + 1] ^ j[1], k = I[P + 2] ^ j[2], R = I[P + 3] ^ j[3], y = 4, v = 1;v < S; v++)
      var T = L[q >>> 24] ^ B[D >>> 16 & 255] ^ N[k >>> 8 & 255] ^ C[R & 255] ^ j[y++], F = L[D >>> 24] ^ B[k >>> 16 & 255] ^ N[R >>> 8 & 255] ^ C[q & 255] ^ j[y++], H = L[k >>> 24] ^ B[R >>> 16 & 255] ^ N[q >>> 8 & 255] ^ C[D & 255] ^ j[y++], R = L[R >>> 24] ^ B[q >>> 16 & 255] ^ N[D >>> 8 & 255] ^ C[k & 255] ^ j[y++], q = T, D = F, k = H;
    T = (m[q >>> 24] << 24 | m[D >>> 16 & 255] << 16 | m[k >>> 8 & 255] << 8 | m[R & 255]) ^ j[y++], F = (m[D >>> 24] << 24 | m[k >>> 16 & 255] << 16 | m[R >>> 8 & 255] << 8 | m[q & 255]) ^ j[y++], H = (m[k >>> 24] << 24 | m[R >>> 16 & 255] << 16 | m[q >>> 8 & 255] << 8 | m[D & 255]) ^ j[y++], R = (m[R >>> 24] << 24 | m[q >>> 16 & 255] << 16 | m[D >>> 8 & 255] << 8 | m[k & 255]) ^ j[y++], I[P] = T, I[P + 1] = F, I[P + 2] = H, I[P + 3] = R;
  }, keySize: 8 });
  t.AES = e._createHelper(M);
})();
var X = { game: "Divine Techno Run", url: "https://www.newgrounds.com/portal/view/628667", key: "34685:cxZQ5a1E", skey: "aBuRcFJLqDmPe3Gb0uultA==" };

class z {
  #e;
  config;
  #u = {};
  #t;
  #r;
  #l;
  #n;
  #o;
  #a = new Set;
  #c = new Set;
  audio;
  audioOut;
  gameUrl;
  static async validateSession(t, e = X) {
    const n = new o.io.core(e.key, e.skey);
    return n.session_id = t, new Promise((r) => {
      n.callComponent("App.checkSession", {}, (s) => {
        r(s?.success ? s.session?.user?.name : undefined);
      });
    });
  }
  validateSession(t) {
    return z.validateSession(t, this.config);
  }
  addLoginListener(t) {
    this.#a.add(t);
  }
  addUnlockListener(t) {
    this.#c.add(t);
  }
  constructor(t = X) {
    this.config = t, this.#e = new o.io.core(t.key, t.skey), this.#l = t.debug, this.initSession(), this.audio = document.createElement("audio"), this.audio.src = t.audioIn ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound.ogg", this.audioOut = document.createElement("audio"), this.audioOut.src = t.audioOut ?? "https://jacklehamster.github.io/medal-popup/example/sounds/ng-sound-out.ogg", this.gameUrl = t.url;
  }
  get loggedIn() {
    return !!this.#e.user;
  }
  get icons() {
    return this.#e.user?.icons;
  }
  get user() {
    return this.#e.user?.name;
  }
  async getScoreboards() {
    return new Promise((t) => {
      if (this.#n)
        t?.(this.#n);
      else if (this.#o)
        this.#o.push(t);
      else
        this.#o = [t], this.#e.callComponent("ScoreBoard.getBoards", {}, (e) => {
          if (e.success) {
            this.#n = e.scoreboards;
            const n = {};
            this.#n.forEach((r) => n[r.id] = r.name), this.#o?.forEach((r) => r?.(this.#n ?? [])), this.#o = undefined;
          }
        });
    });
  }
  async getMedals() {
    return new Promise((t) => {
      if (this.#t)
        t(this.#t);
      else if (this.#r)
        this.#r.push(t);
      else
        this.#r = [t], this.#e.callComponent("Medal.getList", {}, (e) => {
          if (e.success) {
            this.#t = e.medals;
            const n = "font-weight: bold;";
            console.log("%c Unlocked:", n, this.#t?.filter(({ unlocked: r }) => r).map(({ name: r }) => r).join(", ")), console.log("%c Locked:", n, this.#t?.filter(({ unlocked: r }) => !r).map(({ name: r }) => r).join(", ")), this.#r?.forEach((r) => r?.(this.#t ?? [])), this.#r = undefined;
          }
        });
    });
  }
  async unlockMedal(t) {
    if (!this.#e.user)
      return;
    console.log("unlocking", t, "for", this.#e.user.name);
    const e = await this.getMedals(), n = e.filter((r) => r.name === t)[0];
    if (n)
      return new Promise((r) => {
        if (!n.unlocked && !this.#u[n.id])
          this.#e.callComponent("Medal.unlock", { id: n.id }, (s) => {
            const a = s.medal;
            if (a) {
              for (let c = 0;c < e.length; c++)
                if (e[c].id === a.id)
                  e[c] = a;
              this.#u[a.id] = true, this.#c.forEach((c) => c(a)), this.showReceivedMedal(a), r(s.medal);
            }
          });
        else
          r(n);
      });
    else
      console.warn(`Medal doesn't exist: ${t}`);
  }
  requestLogin() {
    this.#e.requestLogin(this.onLoggedIn, this.onLoginFailed, this.onLoginCancelled);
    const t = document.getElementById("newgrounds-login");
    if (t)
      t.style.display = "none";
  }
  onLoginFailed() {
    console.log("There was a problem logging in: ", this.#e.login_error?.message);
    const t = document.getElementById("newgrounds-login");
    if (t)
      t.style.display = "";
  }
  onLoginCancelled() {
    console.log("The user cancelled the login.");
    const t = document.getElementById("newgrounds-login");
    if (t)
      t.style.display = "";
  }
  initSession() {
    this.#e.getValidSession(() => {
      this.validateSession(this.#e.session_id);
      const t = !this.#l ? undefined : document.body.appendChild(document.createElement("button"));
      if (t)
        t.id = "newgrounds-login", t.style.position = "absolute", t.style.top = "5px", t.style.right = "5px", t.style.height = "24px", t.style.fontSize = "10pt", t.style.zIndex = "1000", t.classList.add("button"), t.innerText = "login newgrounds", t.addEventListener("click", (e) => {
          this.requestLogin(), e.stopPropagation();
        });
      if (this.#e.user)
        t?.parentElement?.removeChild(t), this.onLoggedIn();
    });
  }
  onLoggedIn() {
    console.log("Welcome ", this.#e.user?.name + "!"), this.#a.forEach((t) => t()), this.getMedals(), this.getScoreboards();
  }
  #s;
  #p() {
    if (!this.#s) {
      const t = document.body.appendChild(document.createElement("div"));
      t.style.display = "none", t.style.position = "absolute", t.style.right = "10px", t.style.top = "10px", t.style.padding = "5px 10px", t.style.border = "2px solid #880", t.style.borderRadius = "5px", t.style.background = "linear-gradient(#884, #553)", t.style.boxShadow = "2px 2px black", t.style.flexDirection = "row", t.style.transition = "opacity .5s, margin-right .3s", t.style.opacity = "0", t.style.marginRight = "-300px", t.style.zIndex = "3000", t.style.fontFamily = "Papyrus, fantasy", this.#s = t;
    }
    return this.#s;
  }
  #i;
  showReceivedMedal(t) {
    clearTimeout(this.#i);
    const e = this.#p();
    e.style.display = "flex", e.innerText = "";
    const n = e.appendChild(document.createElement("img"));
    n.addEventListener("load", () => {
      if (e.style.display = "flex", e.style.opacity = "1", e.style.marginRight = "0", !window.mute)
        this.audio.play();
      this.#i = setTimeout(() => {
        if (!window.mute)
          this.audioOut.play();
        e.style.opacity = "0", this.#i = setTimeout(() => {
          e.style.display = "none", e.style.marginRight = "-300px", this.#i = undefined;
        }, 1000);
      }, 5000);
    }), n.style.width = "50px", n.style.height = "50px", n.style.backgroundColor = "black", n.style.borderRadius = "3px", n.src = t.icon;
    const r = e.appendChild(document.createElement("div"));
    r.style.marginLeft = "10px";
    const s = r.appendChild(document.createElement("div"));
    s.style.fontWeight = "bold", s.style.fontSize = "12pt", s.style.color = "gold", s.style.margin = "5px", s.innerText = `\uD83C\uDFC6 ${t.name}`;
    const a = r.appendChild(document.createElement("div"));
    a.style.fontSize = "10pt", a.style.color = "silver", a.innerText = t.description;
  }
  async postScore(t, e) {
    const n = await this.getScoreboards(), r = e ? n.find((s) => s.name === e) : n[0];
    if (r)
      return new Promise((s) => {
        this.#e.callComponent("ScoreBoard.postScore", { id: r.id, value: t }, (a) => {
          s(a.success);
        });
      });
  }
  async logView() {
    this.#e.callComponent("App.logView", { host: location.host }, (t) => {
      console.log(t);
    });
  }
  async logEvent(t) {
    this.#e.callComponent("Event.logEvent", { event_name: t, host: location.host }, (e) => {
      console.log(e);
    });
  }
}
export {
  z as Newgrounds
};
