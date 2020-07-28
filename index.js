(function() {
  "use strict";

  function keycloakDebugClient(config, options) {
    const keycloak = Keycloak(config);

    keycloak
      .init({ promiseType: "native", onLoad: "check-sso", pkceMethod: "S256" })
      .then(function() {
        onSuccess(keycloak, options);
      })
      .catch(function(e) {
        showError("Failed to initialize Keycloak", e);
      });
  }

  function onSuccess(keycloak, options) {
    $("realm").innerText = keycloak.realm;

    addEventHandlers(keycloak, options);
    toggleAuthenticated(keycloak.authenticated);

    if (!keycloak.authenticated) return;

    renderTokens(keycloak);
    load("userInfo", keycloak.loadUserInfo.bind(keycloak));
    load("userProfile", keycloak.loadUserProfile.bind(keycloak));
  }

  function toggleAuthenticated(authenticated) {
    $("authenticated").style.display = authenticated ? "block" : "none";
    $("not-authenticated").style.display = authenticated ? "none" : "block";
  }

  function load(id, fn) {
    clearError();
    fn()
      .then(function(data) {
        $(id).innerHTML = stringify(data);
      })
      .catch(function(e) {
        showError("Failed to load " + id, e);
      });
  }

  function renderTokens(keycloak) {
    const tokens = ["idTokenParsed", "tokenParsed", "refreshTokenParsed"];
    tokens.forEach(function(token) {
      $(token).innerHTML = stringify(addDateAnnotations(deepCopy(keycloak[token])));
    });
  }

  function addDateAnnotations(token) {
    const lifespan = tokenLifespan(token);

    ["exp", "iat", "auth_time"].forEach(function(claim) {
      if (token[claim]) {
        const d = formatDate(new Date(token[claim] * 1000));
        token[claim] = token[claim] + span(" - " + d);
      }
    });

    token.exp = token.exp + span(" - valid for " + lifespan + " min");
    return token;
  }

  function tokenLifespan(token) {
    return (token.exp - token.iat) / 60;
  }

  function span(str) {
    return "<span class='date-annotation'>" + str + "</span>";
  }

  function addEventHandlers(keycloak, options) {
    const buttons = ["login", "logout", "register", "accountManagement"];
    buttons.forEach(function(action) {
      $(action).addEventListener("click", function() {
        keycloak[action](options);
      });
    });
  }

  function showError(msg, e) {
    $("error").style.display = "block";
    $("error-message").innerHTML = msg + (e ? ": " + e : "");
    console.error(msg, e);
  }

  function clearError() {
    $("error").style.display = "none";
    $("error-message").innerHTML = "";
  }

  //
  //
  //

  function $(id) {
    return document.getElementById(id);
  }

  function stringify(obj) {
    return JSON.stringify(obj, null, 4);
  }

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function formatDate(d) {
    const tzo = -d.getTimezoneOffset();
    const sgn = tzo >= 0 ? "+" : "-";

    function pad(num) {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? "0" : "") + norm;
    }

    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds()) +
      sgn +
      pad(tzo / 60) +
      ":" +
      pad(tzo % 60)
    );
  }

  window.keycloakDebugClient = keycloakDebugClient;
})();
