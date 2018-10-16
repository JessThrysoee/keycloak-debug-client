(function() {
  "use strict";

  function keycloakDebugClient(options) {
    const keycloak = Keycloak(options);

    keycloak
      .init({ onLoad: "check-sso" })
      .success(function() {
        onSuccess(keycloak);
      })
      .error(function(e) {
        console.error("failed to initialize", e);
      });
  }

  function onSuccess(keycloak) {
    $("realm").innerText = keycloak.realm;

    addEventHandlers(keycloak);
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
    fn()
      .success(function(data) {
        $(id).innerHTML = stringify(data);
      })
      .error(function(e) {
        console.error("Failed to load " + id, e);
      });
  }

  function renderTokens(keycloak) {
    const tokens = ["idTokenParsed", "tokenParsed", "refreshTokenParsed"];
    tokens.forEach(function(token) {
      $(token).innerHTML = stringify(addDateAnnotations(keycloak[token]));
    });
  }

  function addDateAnnotations(token) {
    const lifespan = tokenLifespan(token);

    ["exp", "iat", "auth_time"].forEach(function(claim) {
      const d = formatDate(new Date(token[claim] * 1000));
      token[claim] = token[claim] + span(" - " + d);
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

  function addEventHandlers(keycloak) {
    const buttons = ["login", "logout", "register", "accountManagement"];
    buttons.forEach(function(action) {
      $(action).addEventListener("click", keycloak[action]);
    });
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
