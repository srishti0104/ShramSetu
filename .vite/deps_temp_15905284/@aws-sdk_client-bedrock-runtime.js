import {
  EventStreamCodec,
  eventStreamSerdeProvider,
  iterableToReadableStream,
  readableStreamtoIterable,
  resolveEventStreamSerdeConfig
} from "./chunk-WW4TM2QB.js";
import {
  formatUrl
} from "./chunk-2TGQARL6.js";
import {
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_MODE,
  DEFAULT_USE_DUALSTACK_ENDPOINT,
  DEFAULT_USE_FIPS_ENDPOINT,
  EndpointCache,
  Sha256,
  awsEndpointFunctions,
  createDefaultUserAgentProvider,
  customEndpointFunctions,
  getAwsRegionExtensionConfiguration,
  getContentLengthPlugin,
  getHostHeaderPlugin,
  getLoggerPlugin,
  getRecursionDetectionPlugin,
  getRetryPlugin,
  getUserAgentPlugin,
  invalidProvider,
  resolveAwsRegionExtensionConfiguration,
  resolveDefaultsModeConfig,
  resolveEndpoint,
  resolveHostHeaderConfig,
  resolveRegionConfig,
  resolveRetryConfig,
  resolveUserAgentConfig
} from "./chunk-56QAE5IC.js";
import {
  AwsRestJsonProtocol,
  AwsSdkSigV4Signer,
  Client,
  Command,
  DefaultIdentityProviderConfig,
  FetchHttpHandler,
  HttpBearerAuthSigner,
  HttpRequest,
  HttpResponse,
  NoOpLogger,
  ServiceException,
  TypeRegistry,
  calculateBodyLength,
  createAggregatedClient,
  createPaginator,
  doesIdentityRequireRefresh,
  fromBase64,
  fromHex,
  getDefaultExtensionConfiguration,
  getEndpointPlugin,
  getHttpAuthSchemeEndpointRuleSetPlugin,
  getHttpHandlerExtensionConfiguration,
  getHttpSigningPlugin,
  getSchemaSerdePlugin,
  getSmithyContext,
  isIdentityExpired,
  loadConfigsForDefaultMode,
  memoizeIdentityProvider,
  normalizeProvider,
  parseUrl,
  resolveAwsSdkSigV4Config,
  resolveDefaultRuntimeConfig,
  resolveEndpointConfig,
  resolveHttpHandlerRuntimeConfig,
  streamCollector,
  toBase64
} from "./chunk-PQM3ZNLS.js";
import {
  fromUtf8,
  toUtf8
} from "./chunk-27CHP2CF.js";
import {
  __publicField
} from "./chunk-JVWSFFO4.js";

// node_modules/@aws-sdk/middleware-eventstream/dist-es/eventStreamConfiguration.js
function resolveEventStreamConfig(input) {
  const eventSigner = input.signer;
  const messageSigner = input.signer;
  const newInput = Object.assign(input, {
    eventSigner,
    messageSigner
  });
  const eventStreamPayloadHandler = newInput.eventStreamPayloadHandlerProvider(newInput);
  return Object.assign(newInput, {
    eventStreamPayloadHandler
  });
}

// node_modules/@aws-sdk/middleware-eventstream/dist-es/eventStreamHandlingMiddleware.js
var eventStreamHandlingMiddleware = (options) => (next, context) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request))
    return next(args);
  return options.eventStreamPayloadHandler.handle(next, args, context);
};
var eventStreamHandlingMiddlewareOptions = {
  tags: ["EVENT_STREAM", "SIGNATURE", "HANDLE"],
  name: "eventStreamHandlingMiddleware",
  relation: "after",
  toMiddleware: "awsAuthMiddleware",
  override: true
};

// node_modules/@aws-sdk/middleware-eventstream/dist-es/eventStreamHeaderMiddleware.js
var eventStreamHeaderMiddleware = (next) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request))
    return next(args);
  request.headers = {
    ...request.headers,
    "content-type": "application/vnd.amazon.eventstream",
    "x-amz-content-sha256": "STREAMING-AWS4-HMAC-SHA256-EVENTS"
  };
  return next({
    ...args,
    request
  });
};
var eventStreamHeaderMiddlewareOptions = {
  step: "build",
  tags: ["EVENT_STREAM", "HEADER", "CONTENT_TYPE", "CONTENT_SHA256"],
  name: "eventStreamHeaderMiddleware",
  override: true
};

// node_modules/@aws-sdk/middleware-eventstream/dist-es/getEventStreamPlugin.js
var getEventStreamPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(eventStreamHandlingMiddleware(options), eventStreamHandlingMiddlewareOptions);
    clientStack.add(eventStreamHeaderMiddleware, eventStreamHeaderMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-websocket/dist-es/utils.js
var isWebSocketRequest = (request) => request.protocol === "ws:" || request.protocol === "wss:";

// node_modules/@aws-sdk/middleware-websocket/dist-es/WebSocketFetchHandler.js
var DEFAULT_WS_CONNECTION_TIMEOUT_MS = 3e3;
var WebSocketFetchHandler = class _WebSocketFetchHandler {
  constructor(options, httpHandler = new FetchHttpHandler()) {
    __publicField(this, "metadata", {
      handlerProtocol: "websocket/h1.1"
    });
    __publicField(this, "config", {});
    __publicField(this, "configPromise");
    __publicField(this, "httpHandler");
    __publicField(this, "sockets", {});
    this.httpHandler = httpHandler;
    const setConfig = (opts) => {
      this.config = {
        ...opts ?? {}
      };
      return this.config;
    };
    if (typeof options === "function") {
      this.config = {};
      this.configPromise = options().then((opts) => {
        return setConfig(opts);
      });
    } else {
      this.configPromise = Promise.resolve(setConfig(options));
    }
  }
  static create(instanceOrOptions, httpHandler = new FetchHttpHandler()) {
    if (typeof (instanceOrOptions == null ? void 0 : instanceOrOptions.handle) === "function") {
      return instanceOrOptions;
    }
    return new _WebSocketFetchHandler(instanceOrOptions, httpHandler);
  }
  destroy() {
    for (const [key, sockets] of Object.entries(this.sockets)) {
      for (const socket of sockets) {
        socket.close(1e3, `Socket closed through destroy() call`);
      }
      delete this.sockets[key];
    }
  }
  async handle(request) {
    var _a2, _b2;
    this.config = await this.configPromise;
    const { logger } = this.config;
    if (!isWebSocketRequest(request)) {
      (_a2 = logger == null ? void 0 : logger.debug) == null ? void 0 : _a2.call(logger, `@aws-sdk - ws fetching ${request.protocol}${request.hostname}${request.path}`);
      return this.httpHandler.handle(request);
    }
    const url = formatUrl(request);
    (_b2 = logger == null ? void 0 : logger.debug) == null ? void 0 : _b2.call(logger, `@aws-sdk - ws connecting ${url.split("?")[0]}`);
    const socket = new WebSocket(url);
    if (!this.sockets[url]) {
      this.sockets[url] = [];
    }
    this.sockets[url].push(socket);
    socket.binaryType = "arraybuffer";
    const { connectionTimeout = DEFAULT_WS_CONNECTION_TIMEOUT_MS } = this.config;
    await this.waitForReady(socket, connectionTimeout);
    const { body } = request;
    const bodyStream = getIterator(body);
    const asyncIterable = this.connect(socket, bodyStream);
    const outputPayload = toReadableStream(asyncIterable);
    return {
      response: new HttpResponse({
        statusCode: 200,
        body: outputPayload
      })
    };
  }
  updateHttpClientConfig(key, value) {
    this.configPromise = this.configPromise.then((config) => {
      config[key] = value;
      return config;
    });
  }
  httpHandlerConfigs() {
    return this.config ?? {};
  }
  removeNotUsableSockets(url) {
    this.sockets[url] = (this.sockets[url] ?? []).filter((socket) => ![WebSocket.CLOSING, WebSocket.CLOSED].includes(socket.readyState));
  }
  waitForReady(socket, connectionTimeout) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeNotUsableSockets(socket.url);
        reject({
          $metadata: {
            httpStatusCode: 500,
            websocketSynthetic500Error: true
          }
        });
      }, connectionTimeout);
      socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }
  connect(socket, data) {
    const messageQueue = [];
    let pendingResolve = null;
    let pendingReject = null;
    const push = (item) => {
      if (pendingResolve) {
        if (item.error) {
          pendingReject(item.error);
        } else {
          pendingResolve({ done: item.done, value: item.value });
        }
        pendingResolve = null;
        pendingReject = null;
      } else {
        messageQueue.push(item);
      }
    };
    socket.onmessage = (event) => {
      const { data: data2 } = event;
      if (typeof data2 === "string") {
        push({
          done: false,
          value: fromBase64(data2)
        });
      } else {
        push({
          done: false,
          value: new Uint8Array(data2)
        });
      }
    };
    socket.onerror = (event) => {
      socket.close();
      push({ done: true, error: event });
    };
    socket.onclose = () => {
      this.removeNotUsableSockets(socket.url);
      push({ done: true });
    };
    const outputStream = {
      [Symbol.asyncIterator]: () => ({
        async next() {
          if (messageQueue.length > 0) {
            const item = messageQueue.shift();
            if (item.error) {
              throw item.error;
            }
            return { done: item.done, value: item.value };
          }
          return new Promise((resolve, reject) => {
            pendingResolve = resolve;
            pendingReject = reject;
          });
        }
      })
    };
    const send = async () => {
      try {
        for await (const chunk of data) {
          if (socket.readyState >= WebSocket.CLOSING) {
            break;
          } else {
            socket.send(chunk);
          }
        }
      } catch (err) {
        push({
          done: true,
          error: err
        });
      } finally {
        socket.close(1e3);
      }
    };
    send();
    return outputStream;
  }
};
var getIterator = (stream) => {
  if (stream[Symbol.asyncIterator]) {
    return stream;
  }
  if (isReadableStream(stream)) {
    return readableStreamtoIterable(stream);
  }
  return {
    [Symbol.asyncIterator]: async function* () {
      yield stream;
    }
  };
};
var toReadableStream = (asyncIterable) => typeof ReadableStream === "function" ? iterableToReadableStream(asyncIterable) : asyncIterable;
var isReadableStream = (payload) => typeof ReadableStream === "function" && payload instanceof ReadableStream;

// node_modules/@aws-sdk/middleware-websocket/dist-es/middlewares/websocketEndpointMiddleware.js
var websocketEndpointMiddleware = (config, options) => (next) => (args) => {
  var _a2, _b2;
  const { request } = args;
  if (HttpRequest.isInstance(request) && ((_b2 = (_a2 = config.requestHandler.metadata) == null ? void 0 : _a2.handlerProtocol) == null ? void 0 : _b2.toLowerCase().includes("websocket"))) {
    request.protocol = "wss:";
    request.method = "GET";
    request.path = `${request.path}-websocket`;
    const { headers } = request;
    delete headers["content-type"];
    delete headers["x-amz-content-sha256"];
    for (const name of Object.keys(headers)) {
      if (name.indexOf(options.headerPrefix) === 0) {
        const chunkedName = name.replace(options.headerPrefix, "");
        request.query[chunkedName] = headers[name];
      }
    }
    if (headers["x-amz-user-agent"]) {
      request.query["user-agent"] = headers["x-amz-user-agent"];
    }
    request.headers = { host: headers.host ?? request.hostname };
  }
  return next(args);
};
var websocketEndpointMiddlewareOptions = {
  name: "websocketEndpointMiddleware",
  tags: ["WEBSOCKET", "EVENT_STREAM"],
  relation: "after",
  toMiddleware: "eventStreamHeaderMiddleware",
  override: true
};

// node_modules/@aws-sdk/middleware-websocket/dist-es/middlewares/websocketInjectSessionIdMiddleware.js
var injectSessionIdMiddleware = () => (next) => async (args) => {
  const requestParams = {
    ...args.input
  };
  const response = await next(args);
  const output = response.output;
  if (requestParams.SessionId && output.SessionId == null) {
    output.SessionId = requestParams.SessionId;
  }
  return response;
};
var injectSessionIdMiddlewareOptions = {
  step: "initialize",
  name: "injectSessionIdMiddleware",
  tags: ["WEBSOCKET", "EVENT_STREAM"],
  override: true
};

// node_modules/@aws-sdk/middleware-websocket/dist-es/getWebSocketPlugin.js
var getWebSocketPlugin = (config, options) => ({
  applyToStack: (clientStack) => {
    clientStack.addRelativeTo(websocketEndpointMiddleware(config, options), websocketEndpointMiddlewareOptions);
    clientStack.add(injectSessionIdMiddleware(), injectSessionIdMiddlewareOptions);
  }
});

// node_modules/@aws-sdk/middleware-websocket/dist-es/WebsocketSignatureV4.js
var WebsocketSignatureV4 = class {
  constructor(options) {
    __publicField(this, "signer");
    this.signer = options.signer;
  }
  presign(originalRequest, options = {}) {
    return this.signer.presign(originalRequest, options);
  }
  async sign(toSign, options) {
    if (HttpRequest.isInstance(toSign) && isWebSocketRequest(toSign)) {
      const signedRequest = await this.signer.presign({ ...toSign, body: "" }, {
        ...options,
        expiresIn: 60,
        unsignableHeaders: new Set(Object.keys(toSign.headers).filter((header) => header !== "host"))
      });
      return {
        ...signedRequest,
        body: toSign.body
      };
    } else {
      return this.signer.sign(toSign, options);
    }
  }
  signMessage(message, args) {
    return this.signer.signMessage(message, args);
  }
};

// node_modules/@aws-sdk/middleware-websocket/dist-es/resolveWebSocketConfig.js
var resolveWebSocketConfig = (input) => {
  const { signer } = input;
  return Object.assign(input, {
    signer: async (authScheme) => {
      const signerObj = await signer(authScheme);
      if (validateSigner(signerObj)) {
        return new WebsocketSignatureV4({ signer: signerObj });
      }
      throw new Error("Expected WebsocketSignatureV4 signer, please check the client constructor.");
    }
  });
};
var validateSigner = (signer) => !!signer;

// node_modules/@aws-sdk/middleware-websocket/dist-es/ws-eventstream/EventSigningTransformStream.js
var EventSigningTransformStream = class extends TransformStream {
  constructor(initialSignature, messageSigner, eventStreamCodec, systemClockOffsetProvider) {
    let priorSignature = initialSignature;
    super({
      start() {
      },
      async transform(chunk, controller) {
        try {
          const now = new Date(Date.now() + await systemClockOffsetProvider());
          const dateHeader = {
            ":date": { type: "timestamp", value: now }
          };
          const signedMessage = await messageSigner.sign({
            message: {
              body: chunk,
              headers: dateHeader
            },
            priorSignature
          }, {
            signingDate: now
          });
          priorSignature = signedMessage.signature;
          const serializedSigned = eventStreamCodec.encode({
            headers: {
              ...dateHeader,
              ":chunk-signature": {
                type: "binary",
                value: fromHex(signedMessage.signature)
              }
            },
            body: chunk
          });
          controller.enqueue(serializedSigned);
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
};

// node_modules/@aws-sdk/middleware-websocket/dist-es/ws-eventstream/EventStreamPayloadHandler.js
var EventStreamPayloadHandler = class {
  constructor(options) {
    __publicField(this, "messageSigner");
    __publicField(this, "eventStreamCodec");
    __publicField(this, "systemClockOffsetProvider");
    this.messageSigner = options.messageSigner;
    this.eventStreamCodec = new EventStreamCodec(options.utf8Encoder, options.utf8Decoder);
    this.systemClockOffsetProvider = async () => options.systemClockOffset ?? 0;
  }
  async handle(next, args, context = {}) {
    var _a2;
    const request = args.request;
    const { body: payload, headers, query } = request;
    if (!(payload instanceof ReadableStream)) {
      throw new Error("Eventstream payload must be a ReadableStream.");
    }
    const placeHolderStream = new TransformStream();
    request.body = placeHolderStream.readable;
    const match = ((headers == null ? void 0 : headers.authorization) ?? "").match(/Signature=(\w+)$/);
    const priorSignature = (match ?? [])[1] ?? (query && query["X-Amz-Signature"]) ?? "";
    const signingStream = new EventSigningTransformStream(priorSignature, await this.messageSigner(), this.eventStreamCodec, this.systemClockOffsetProvider);
    payload.pipeThrough(signingStream).pipeThrough(placeHolderStream);
    let result;
    try {
      result = await next(args);
    } catch (e2) {
      const p2 = (_a2 = payload.cancel) == null ? void 0 : _a2.call(payload);
      if (p2 instanceof Promise) {
        p2.catch(() => {
        });
      }
      throw e2;
    }
    return result;
  }
};

// node_modules/@aws-sdk/middleware-websocket/dist-es/ws-eventstream/eventStreamPayloadHandlerProvider.js
var eventStreamPayloadHandlerProvider = (options) => new EventStreamPayloadHandler(options);

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/auth/httpAuthSchemeProvider.js
var defaultBedrockRuntimeHttpAuthSchemeParametersProvider = async (config, context, input) => {
  return {
    operation: getSmithyContext(context).operation,
    region: await normalizeProvider(config.region)() || (() => {
      throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
    })()
  };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4",
    signingProperties: {
      name: "bedrock",
      region: authParameters.region
    },
    propertiesExtractor: (config, context) => ({
      signingProperties: {
        config,
        context
      }
    })
  };
}
function createSmithyApiHttpBearerAuthHttpAuthOption(authParameters) {
  return {
    schemeId: "smithy.api#httpBearerAuth",
    propertiesExtractor: ({ profile, filepath, configFilepath, ignoreCache }, context) => ({
      identityProperties: {
        profile,
        filepath,
        configFilepath,
        ignoreCache
      }
    })
  };
}
var defaultBedrockRuntimeHttpAuthSchemeProvider = (authParameters) => {
  const options = [];
  switch (authParameters.operation) {
    default: {
      options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
      options.push(createSmithyApiHttpBearerAuthHttpAuthOption(authParameters));
    }
  }
  return options;
};
var resolveHttpAuthSchemeConfig = (config) => {
  const token = memoizeIdentityProvider(config.token, isIdentityExpired, doesIdentityRequireRefresh);
  const config_0 = resolveAwsSdkSigV4Config(config);
  return Object.assign(config_0, {
    authSchemePreference: normalizeProvider(config.authSchemePreference ?? []),
    token
  });
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "bedrock"
  });
};
var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-bedrock-runtime/package.json
var package_default = {
  name: "@aws-sdk/client-bedrock-runtime",
  description: "AWS SDK for JavaScript Bedrock Runtime Client for Node.js, Browser and React Native",
  version: "3.995.0",
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline client-bedrock-runtime",
    "build:es": "tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service --solo bedrock-runtime",
    "test:index": "tsc --noEmit ./test/index-types.ts && node ./test/index-objects.spec.mjs"
  },
  main: "./dist-cjs/index.js",
  types: "./dist-types/index.d.ts",
  module: "./dist-es/index.js",
  sideEffects: false,
  dependencies: {
    "@aws-crypto/sha256-browser": "5.2.0",
    "@aws-crypto/sha256-js": "5.2.0",
    "@aws-sdk/core": "^3.973.11",
    "@aws-sdk/credential-provider-node": "^3.972.10",
    "@aws-sdk/eventstream-handler-node": "^3.972.5",
    "@aws-sdk/middleware-eventstream": "^3.972.3",
    "@aws-sdk/middleware-host-header": "^3.972.3",
    "@aws-sdk/middleware-logger": "^3.972.3",
    "@aws-sdk/middleware-recursion-detection": "^3.972.3",
    "@aws-sdk/middleware-user-agent": "^3.972.11",
    "@aws-sdk/middleware-websocket": "^3.972.6",
    "@aws-sdk/region-config-resolver": "^3.972.3",
    "@aws-sdk/token-providers": "3.995.0",
    "@aws-sdk/types": "^3.973.1",
    "@aws-sdk/util-endpoints": "3.995.0",
    "@aws-sdk/util-user-agent-browser": "^3.972.3",
    "@aws-sdk/util-user-agent-node": "^3.972.10",
    "@smithy/config-resolver": "^4.4.6",
    "@smithy/core": "^3.23.2",
    "@smithy/eventstream-serde-browser": "^4.2.8",
    "@smithy/eventstream-serde-config-resolver": "^4.3.8",
    "@smithy/eventstream-serde-node": "^4.2.8",
    "@smithy/fetch-http-handler": "^5.3.9",
    "@smithy/hash-node": "^4.2.8",
    "@smithy/invalid-dependency": "^4.2.8",
    "@smithy/middleware-content-length": "^4.2.8",
    "@smithy/middleware-endpoint": "^4.4.16",
    "@smithy/middleware-retry": "^4.4.33",
    "@smithy/middleware-serde": "^4.2.9",
    "@smithy/middleware-stack": "^4.2.8",
    "@smithy/node-config-provider": "^4.3.8",
    "@smithy/node-http-handler": "^4.4.10",
    "@smithy/protocol-http": "^5.3.8",
    "@smithy/smithy-client": "^4.11.5",
    "@smithy/types": "^4.12.0",
    "@smithy/url-parser": "^4.2.8",
    "@smithy/util-base64": "^4.3.0",
    "@smithy/util-body-length-browser": "^4.2.0",
    "@smithy/util-body-length-node": "^4.2.1",
    "@smithy/util-defaults-mode-browser": "^4.3.32",
    "@smithy/util-defaults-mode-node": "^4.2.35",
    "@smithy/util-endpoints": "^3.2.8",
    "@smithy/util-middleware": "^4.2.8",
    "@smithy/util-retry": "^4.2.8",
    "@smithy/util-stream": "^4.5.12",
    "@smithy/util-utf8": "^4.2.0",
    tslib: "^2.6.2"
  },
  devDependencies: {
    "@tsconfig/node20": "20.1.8",
    "@types/node": "^20.14.8",
    concurrently: "7.0.0",
    "downlevel-dts": "0.10.1",
    premove: "4.0.0",
    typescript: "~5.8.3"
  },
  engines: {
    node: ">=20.0.0"
  },
  typesVersions: {
    "<4.0": {
      "dist-types/*": [
        "dist-types/ts3.4/*"
      ]
    }
  },
  files: [
    "dist-*/**"
  ],
  author: {
    name: "AWS SDK for JavaScript Team",
    url: "https://aws.amazon.com/javascript/"
  },
  license: "Apache-2.0",
  browser: {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
  },
  "react-native": {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
  },
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-bedrock-runtime",
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-bedrock-runtime"
  }
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/endpoint/ruleset.js
var s = "required";
var t = "fn";
var u = "argv";
var v = "ref";
var a = true;
var b = "isSet";
var c = "booleanEquals";
var d = "error";
var e = "endpoint";
var f = "tree";
var g = "PartitionResult";
var h = { [s]: false, "type": "string" };
var i = { [s]: true, "default": false, "type": "boolean" };
var j = { [v]: "Endpoint" };
var k = { [t]: c, [u]: [{ [v]: "UseFIPS" }, true] };
var l = { [t]: c, [u]: [{ [v]: "UseDualStack" }, true] };
var m = {};
var n = { [t]: "getAttr", [u]: [{ [v]: g }, "supportsFIPS"] };
var o = { [t]: c, [u]: [true, { [t]: "getAttr", [u]: [{ [v]: g }, "supportsDualStack"] }] };
var p = [k];
var q = [l];
var r = [{ [v]: "Region" }];
var _data = { version: "1.0", parameters: { Region: h, UseDualStack: i, UseFIPS: i, Endpoint: h }, rules: [{ conditions: [{ [t]: b, [u]: [j] }], rules: [{ conditions: p, error: "Invalid Configuration: FIPS and custom endpoint are not supported", type: d }, { rules: [{ conditions: q, error: "Invalid Configuration: Dualstack and custom endpoint are not supported", type: d }, { endpoint: { url: j, properties: m, headers: m }, type: e }], type: f }], type: f }, { rules: [{ conditions: [{ [t]: b, [u]: r }], rules: [{ conditions: [{ [t]: "aws.partition", [u]: r, assign: g }], rules: [{ conditions: [k, l], rules: [{ conditions: [{ [t]: c, [u]: [a, n] }, o], rules: [{ rules: [{ endpoint: { url: "https://bedrock-runtime-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }, { error: "FIPS and DualStack are enabled, but this partition does not support one or both", type: d }], type: f }, { conditions: p, rules: [{ conditions: [{ [t]: c, [u]: [n, a] }], rules: [{ rules: [{ endpoint: { url: "https://bedrock-runtime-fips.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }, { error: "FIPS is enabled but this partition does not support FIPS", type: d }], type: f }, { conditions: q, rules: [{ conditions: [o], rules: [{ rules: [{ endpoint: { url: "https://bedrock-runtime.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }, { error: "DualStack is enabled but this partition does not support DualStack", type: d }], type: f }, { rules: [{ endpoint: { url: "https://bedrock-runtime.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }], type: f }, { error: "Invalid Configuration: Missing Region", type: d }], type: f }] };
var ruleSet = _data;

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/endpoint/endpointResolver.js
var cache = new EndpointCache({
  size: 50,
  params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"]
});
var defaultEndpointResolver = (endpointParams, context = {}) => {
  return cache.get(endpointParams, () => resolveEndpoint(ruleSet, {
    endpointParams,
    logger: context.logger
  }));
};
customEndpointFunctions.aws = awsEndpointFunctions;

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/models/BedrockRuntimeServiceException.js
var BedrockRuntimeServiceException = class _BedrockRuntimeServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _BedrockRuntimeServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/models/errors.js
var AccessDeniedException = class _AccessDeniedException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "AccessDeniedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "AccessDeniedException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _AccessDeniedException.prototype);
  }
};
var InternalServerException = class _InternalServerException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "InternalServerException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InternalServerException");
    __publicField(this, "$fault", "server");
    Object.setPrototypeOf(this, _InternalServerException.prototype);
  }
};
var ThrottlingException = class _ThrottlingException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ThrottlingException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ThrottlingException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ThrottlingException.prototype);
  }
};
var ValidationException = class _ValidationException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ValidationException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ValidationException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ValidationException.prototype);
  }
};
var ConflictException = class _ConflictException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ConflictException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ConflictException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ConflictException.prototype);
  }
};
var ResourceNotFoundException = class _ResourceNotFoundException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ResourceNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceNotFoundException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ResourceNotFoundException.prototype);
  }
};
var ServiceQuotaExceededException = class _ServiceQuotaExceededException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ServiceQuotaExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ServiceQuotaExceededException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ServiceQuotaExceededException.prototype);
  }
};
var ServiceUnavailableException = class _ServiceUnavailableException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ServiceUnavailableException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ServiceUnavailableException");
    __publicField(this, "$fault", "server");
    Object.setPrototypeOf(this, _ServiceUnavailableException.prototype);
  }
};
var ModelErrorException = class _ModelErrorException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ModelErrorException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ModelErrorException");
    __publicField(this, "$fault", "client");
    __publicField(this, "originalStatusCode");
    __publicField(this, "resourceName");
    Object.setPrototypeOf(this, _ModelErrorException.prototype);
    this.originalStatusCode = opts.originalStatusCode;
    this.resourceName = opts.resourceName;
  }
};
var ModelNotReadyException = class _ModelNotReadyException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ModelNotReadyException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ModelNotReadyException");
    __publicField(this, "$fault", "client");
    __publicField(this, "$retryable", {});
    Object.setPrototypeOf(this, _ModelNotReadyException.prototype);
  }
};
var ModelTimeoutException = class _ModelTimeoutException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ModelTimeoutException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ModelTimeoutException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _ModelTimeoutException.prototype);
  }
};
var ModelStreamErrorException = class _ModelStreamErrorException extends BedrockRuntimeServiceException {
  constructor(opts) {
    super({
      name: "ModelStreamErrorException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ModelStreamErrorException");
    __publicField(this, "$fault", "client");
    __publicField(this, "originalStatusCode");
    __publicField(this, "originalMessage");
    Object.setPrototypeOf(this, _ModelStreamErrorException.prototype);
    this.originalStatusCode = opts.originalStatusCode;
    this.originalMessage = opts.originalMessage;
  }
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/schemas/schemas_0.js
var _A = "Accept";
var _AB = "AudioBlock";
var _ADE = "AccessDeniedException";
var _AG = "ApplyGuardrail";
var _AGD = "AppliedGuardrailDetails";
var _AGR = "ApplyGuardrailRequest";
var _AGRp = "ApplyGuardrailResponse";
var _AIM = "AsyncInvokeMessage";
var _AIODC = "AsyncInvokeOutputDataConfig";
var _AIS = "AsyncInvokeSummary";
var _AISODC = "AsyncInvokeS3OutputDataConfig";
var _AISs = "AsyncInvokeSummaries";
var _AS = "AudioSource";
var _ATC = "AnyToolChoice";
var _ATCu = "AutoToolChoice";
var _B = "Body";
var _BIPP = "BidirectionalInputPayloadPart";
var _BOPP = "BidirectionalOutputPayloadPart";
var _C = "Citation";
var _CB = "ContentBlocks";
var _CBD = "ContentBlockDelta";
var _CBDE = "ContentBlockDeltaEvent";
var _CBS = "ContentBlockStart";
var _CBSE = "ContentBlockStartEvent";
var _CBSEo = "ContentBlockStopEvent";
var _CBo = "ContentBlock";
var _CC = "CitationsConfig";
var _CCB = "CitationsContentBlock";
var _CD = "CacheDetail";
var _CDL = "CacheDetailsList";
var _CDi = "CitationsDelta";
var _CE = "ConflictException";
var _CGC = "CitationGeneratedContent";
var _CGCL = "CitationGeneratedContentList";
var _CL = "CitationLocation";
var _CM = "ConverseMetrics";
var _CO = "ConverseOutput";
var _CPB = "CachePointBlock";
var _CR = "ConverseRequest";
var _CRo = "ConverseResponse";
var _CS = "ConverseStream";
var _CSC = "CitationSourceContent";
var _CSCD = "CitationSourceContentDelta";
var _CSCL = "CitationSourceContentList";
var _CSCLD = "CitationSourceContentListDelta";
var _CSM = "ConverseStreamMetrics";
var _CSME = "ConverseStreamMetadataEvent";
var _CSO = "ConverseStreamOutput";
var _CSR = "ConverseStreamRequest";
var _CSRo = "ConverseStreamResponse";
var _CST = "ConverseStreamTrace";
var _CT = "ConverseTrace";
var _CTI = "CountTokensInput";
var _CTR = "ConverseTokensRequest";
var _CTRo = "CountTokensRequest";
var _CTRou = "CountTokensResponse";
var _CT_ = "Content-Type";
var _CTo = "CountTokens";
var _Ci = "Citations";
var _Co = "Converse";
var _DB = "DocumentBlock";
var _DCB = "DocumentContentBlocks";
var _DCBo = "DocumentContentBlock";
var _DCL = "DocumentCharLocation";
var _DCLo = "DocumentChunkLocation";
var _DPL = "DocumentPageLocation";
var _DS = "DocumentSource";
var _EB = "ErrorBlock";
var _GA = "GuardrailAssessment";
var _GAI = "GetAsyncInvoke";
var _GAIR = "GetAsyncInvokeRequest";
var _GAIRe = "GetAsyncInvokeResponse";
var _GAL = "GuardrailAssessmentList";
var _GALM = "GuardrailAssessmentListMap";
var _GAM = "GuardrailAssessmentMap";
var _GARDSL = "GuardrailAutomatedReasoningDifferenceScenarioList";
var _GARF = "GuardrailAutomatedReasoningFinding";
var _GARFL = "GuardrailAutomatedReasoningFindingList";
var _GARIF = "GuardrailAutomatedReasoningImpossibleFinding";
var _GARIFu = "GuardrailAutomatedReasoningInvalidFinding";
var _GARITR = "GuardrailAutomatedReasoningInputTextReference";
var _GARITRL = "GuardrailAutomatedReasoningInputTextReferenceList";
var _GARLW = "GuardrailAutomatedReasoningLogicWarning";
var _GARNTF = "GuardrailAutomatedReasoningNoTranslationsFinding";
var _GARPA = "GuardrailAutomatedReasoningPolicyAssessment";
var _GARR = "GuardrailAutomatedReasoningRule";
var _GARRL = "GuardrailAutomatedReasoningRuleList";
var _GARS = "GuardrailAutomatedReasoningScenario";
var _GARSF = "GuardrailAutomatedReasoningSatisfiableFinding";
var _GARSL = "GuardrailAutomatedReasoningStatementList";
var _GARSLC = "GuardrailAutomatedReasoningStatementLogicContent";
var _GARSNLC = "GuardrailAutomatedReasoningStatementNaturalLanguageContent";
var _GARSu = "GuardrailAutomatedReasoningStatement";
var _GART = "GuardrailAutomatedReasoningTranslation";
var _GARTAF = "GuardrailAutomatedReasoningTranslationAmbiguousFinding";
var _GARTCF = "GuardrailAutomatedReasoningTooComplexFinding";
var _GARTL = "GuardrailAutomatedReasoningTranslationList";
var _GARTO = "GuardrailAutomatedReasoningTranslationOption";
var _GARTOL = "GuardrailAutomatedReasoningTranslationOptionList";
var _GARVF = "GuardrailAutomatedReasoningValidFinding";
var _GC = "GuardrailConfiguration";
var _GCB = "GuardrailContentBlock";
var _GCBL = "GuardrailContentBlockList";
var _GCCB = "GuardrailConverseContentBlock";
var _GCF = "GuardrailContentFilter";
var _GCFL = "GuardrailContentFilterList";
var _GCGF = "GuardrailContextualGroundingFilter";
var _GCGFu = "GuardrailContextualGroundingFilters";
var _GCGPA = "GuardrailContextualGroundingPolicyAssessment";
var _GCIB = "GuardrailConverseImageBlock";
var _GCIS = "GuardrailConverseImageSource";
var _GCPA = "GuardrailContentPolicyAssessment";
var _GCTB = "GuardrailConverseTextBlock";
var _GCW = "GuardrailCustomWord";
var _GCWL = "GuardrailCustomWordList";
var _GCu = "GuardrailCoverage";
var _GIB = "GuardrailImageBlock";
var _GIC = "GuardrailImageCoverage";
var _GIM = "GuardrailInvocationMetrics";
var _GIS = "GuardrailImageSource";
var _GMW = "GuardrailManagedWord";
var _GMWL = "GuardrailManagedWordList";
var _GOC = "GuardrailOutputContent";
var _GOCL = "GuardrailOutputContentList";
var _GPEF = "GuardrailPiiEntityFilter";
var _GPEFL = "GuardrailPiiEntityFilterList";
var _GRF = "GuardrailRegexFilter";
var _GRFL = "GuardrailRegexFilterList";
var _GSC = "GuardrailStreamConfiguration";
var _GSIPA = "GuardrailSensitiveInformationPolicyAssessment";
var _GT = "GuardrailTopic";
var _GTA = "GuardrailTraceAssessment";
var _GTB = "GuardrailTextBlock";
var _GTCC = "GuardrailTextCharactersCoverage";
var _GTL = "GuardrailTopicList";
var _GTPA = "GuardrailTopicPolicyAssessment";
var _GU = "GuardrailUsage";
var _GWPA = "GuardrailWordPolicyAssessment";
var _IB = "ImageBlock";
var _IBD = "ImageBlockDelta";
var _IBS = "ImageBlockStart";
var _IC = "InferenceConfiguration";
var _IM = "InvokeModel";
var _IMR = "InvokeModelRequest";
var _IMRn = "InvokeModelResponse";
var _IMTR = "InvokeModelTokensRequest";
var _IMWBS = "InvokeModelWithBidirectionalStream";
var _IMWBSI = "InvokeModelWithBidirectionalStreamInput";
var _IMWBSO = "InvokeModelWithBidirectionalStreamOutput";
var _IMWBSR = "InvokeModelWithBidirectionalStreamRequest";
var _IMWBSRn = "InvokeModelWithBidirectionalStreamResponse";
var _IMWRS = "InvokeModelWithResponseStream";
var _IMWRSR = "InvokeModelWithResponseStreamRequest";
var _IMWRSRn = "InvokeModelWithResponseStreamResponse";
var _IS = "ImageSource";
var _ISE = "InternalServerException";
var _JSD = "JsonSchemaDefinition";
var _LAI = "ListAsyncInvokes";
var _LAIR = "ListAsyncInvokesRequest";
var _LAIRi = "ListAsyncInvokesResponse";
var _M = "Message";
var _MEE = "ModelErrorException";
var _MIP = "ModelInputPayload";
var _MNRE = "ModelNotReadyException";
var _MSE = "MessageStartEvent";
var _MSEE = "ModelStreamErrorException";
var _MSEe = "MessageStopEvent";
var _MTE = "ModelTimeoutException";
var _Me = "Messages";
var _OC = "OutputConfig";
var _OF = "OutputFormat";
var _OFS = "OutputFormatStructure";
var _PB = "PartBody";
var _PC = "PerformanceConfiguration";
var _PP = "PayloadPart";
var _PRT = "PromptRouterTrace";
var _PVM = "PromptVariableMap";
var _PVV = "PromptVariableValues";
var _RCB = "ReasoningContentBlock";
var _RCBD = "ReasoningContentBlockDelta";
var _RM = "RequestMetadata";
var _RNFE = "ResourceNotFoundException";
var _RS = "ResponseStream";
var _RTB = "ReasoningTextBlock";
var _SAI = "StartAsyncInvoke";
var _SAIR = "StartAsyncInvokeRequest";
var _SAIRt = "StartAsyncInvokeResponse";
var _SCB = "SystemContentBlocks";
var _SCBy = "SystemContentBlock";
var _SL = "S3Location";
var _SQEE = "ServiceQuotaExceededException";
var _SRB = "SearchResultBlock";
var _SRCB = "SearchResultContentBlock";
var _SRCBe = "SearchResultContentBlocks";
var _SRL = "SearchResultLocation";
var _ST = "ServiceTier";
var _STC = "SpecificToolChoice";
var _STy = "SystemTool";
var _SUE = "ServiceUnavailableException";
var _T = "Tag";
var _TC = "ToolConfiguration";
var _TCo = "ToolChoice";
var _TE = "ThrottlingException";
var _TIS = "ToolInputSchema";
var _TL = "TagList";
var _TRB = "ToolResultBlock";
var _TRBD = "ToolResultBlocksDelta";
var _TRBDo = "ToolResultBlockDelta";
var _TRBS = "ToolResultBlockStart";
var _TRCB = "ToolResultContentBlocks";
var _TRCBo = "ToolResultContentBlock";
var _TS = "ToolSpecification";
var _TU = "TokenUsage";
var _TUB = "ToolUseBlock";
var _TUBD = "ToolUseBlockDelta";
var _TUBS = "ToolUseBlockStart";
var _To = "Tools";
var _Too = "Tool";
var _VB = "VideoBlock";
var _VE = "ValidationException";
var _VS = "VideoSource";
var _WL = "WebLocation";
var _XABA = "X-Amzn-Bedrock-Accept";
var _XABCT = "X-Amzn-Bedrock-Content-Type";
var _XABG = "X-Amzn-Bedrock-GuardrailIdentifier";
var _XABG_ = "X-Amzn-Bedrock-GuardrailVersion";
var _XABPL = "X-Amzn-Bedrock-PerformanceConfig-Latency";
var _XABST = "X-Amzn-Bedrock-Service-Tier";
var _XABT = "X-Amzn-Bedrock-Trace";
var _a = "action";
var _aGD = "appliedGuardrailDetails";
var _aIS = "asyncInvokeSummaries";
var _aMRF = "additionalModelRequestFields";
var _aMRFP = "additionalModelResponseFieldPaths";
var _aMRFd = "additionalModelResponseFields";
var _aR = "actionReason";
var _aRP = "automatedReasoningPolicy";
var _aRPU = "automatedReasoningPolicyUnits";
var _aRPu = "automatedReasoningPolicies";
var _ac = "accept";
var _an = "any";
var _as = "assessments";
var _au = "audio";
var _aut = "auto";
var _b = "bytes";
var _bO = "bucketOwner";
var _bo = "body";
var _c = "client";
var _cBD = "contentBlockDelta";
var _cBI = "contentBlockIndex";
var _cBS = "contentBlockStart";
var _cBSo = "contentBlockStop";
var _cC = "citationsContent";
var _cD = "cacheDetails";
var _cFS = "claimsFalseScenario";
var _cGP = "contextualGroundingPolicy";
var _cGPU = "contextualGroundingPolicyUnits";
var _cP = "contentPolicy";
var _cPIU = "contentPolicyImageUnits";
var _cPU = "contentPolicyUnits";
var _cPa = "cachePoint";
var _cR = "contradictingRules";
var _cRIT = "cacheReadInputTokens";
var _cRT = "clientRequestToken";
var _cT = "contentType";
var _cTS = "claimsTrueScenario";
var _cW = "customWords";
var _cWIT = "cacheWriteInputTokens";
var _ch = "chunk";
var _ci = "citations";
var _cit = "citation";
var _cl = "claims";
var _co = "content";
var _con = "context";
var _conf = "confidence";
var _conv = "converse";
var _d = "delta";
var _dC = "documentChar";
var _dCo = "documentChunk";
var _dI = "documentIndex";
var _dP = "documentPage";
var _dS = "differenceScenarios";
var _de = "detected";
var _des = "description";
var _do = "domain";
var _doc = "document";
var _e = "error";
var _eT = "endTime";
var _en = "enabled";
var _end = "end";
var _f = "format";
var _fM = "failureMessage";
var _fS = "filterStrength";
var _fi = "findings";
var _fil = "filters";
var _g = "guardrail";
var _gA = "guardrailArn";
var _gC = "guardrailCoverage";
var _gCu = "guardrailConfig";
var _gCua = "guardContent";
var _gI = "guardrailId";
var _gIu = "guardrailIdentifier";
var _gO = "guardrailOrigin";
var _gOu = "guardrailOwnership";
var _gPL = "guardrailProcessingLatency";
var _gV = "guardrailVersion";
var _gu = "guarded";
var _h = "http";
var _hE = "httpError";
var _hH = "httpHeader";
var _hQ = "httpQuery";
var _i = "input";
var _iA = "invocationArn";
var _iAn = "inputAssessment";
var _iC = "inferenceConfig";
var _iM = "invocationMetrics";
var _iMI = "invokedModelId";
var _iMn = "invokeModel";
var _iS = "inputSchema";
var _iSE = "internalServerException";
var _iT = "inputTokens";
var _id = "identifier";
var _im = "images";
var _ima = "image";
var _imp = "impossible";
var _in = "invalid";
var _j = "json";
var _jS = "jsonSchema";
var _k = "key";
var _kKI = "kmsKeyId";
var _l = "location";
var _lM = "latencyMs";
var _lMT = "lastModifiedTime";
var _lW = "logicWarning";
var _la = "latency";
var _lo = "logic";
var _m = "message";
var _mA = "modelArn";
var _mI = "modelId";
var _mIo = "modelInput";
var _mO = "modelOutput";
var _mR = "maxResults";
var _mS = "messageStart";
var _mSEE = "modelStreamErrorException";
var _mSe = "messageStop";
var _mT = "maxTokens";
var _mTE = "modelTimeoutException";
var _mWL = "managedWordLists";
var _ma = "match";
var _me = "messages";
var _met = "metrics";
var _meta = "metadata";
var _n = "name";
var _nL = "naturalLanguage";
var _nT = "nextToken";
var _nTo = "noTranslations";
var _o = "outputs";
var _oA = "outputAssessments";
var _oC = "outputConfig";
var _oDC = "outputDataConfig";
var _oM = "originalMessage";
var _oS = "outputScope";
var _oSC = "originalStatusCode";
var _oT = "outputTokens";
var _op = "options";
var _ou = "output";
var _p = "premises";
var _pC = "performanceConfig";
var _pCL = "performanceConfigLatency";
var _pE = "piiEntities";
var _pR = "promptRouter";
var _pV = "promptVariables";
var _pVA = "policyVersionArn";
var _q = "qualifiers";
var _r = "regex";
var _rC = "reasoningContent";
var _rCe = "redactedContent";
var _rM = "requestMetadata";
var _rN = "resourceName";
var _rT = "reasoningText";
var _re = "regexes";
var _ro = "role";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.bedrockruntime";
var _sB = "sortBy";
var _sC = "sourceContent";
var _sE = "statusEquals";
var _sIP = "sensitiveInformationPolicy";
var _sIPFU = "sensitiveInformationPolicyFreeUnits";
var _sIPU = "sensitiveInformationPolicyUnits";
var _sL = "s3Location";
var _sO = "sortOrder";
var _sODC = "s3OutputDataConfig";
var _sPM = "streamProcessingMode";
var _sR = "stopReason";
var _sRI = "searchResultIndex";
var _sRL = "searchResultLocation";
var _sRe = "searchResult";
var _sRu = "supportingRules";
var _sS = "stopSequences";
var _sT = "submitTime";
var _sTA = "submitTimeAfter";
var _sTB = "submitTimeBefore";
var _sTe = "serviceTier";
var _sTy = "systemTool";
var _sU = "s3Uri";
var _sUE = "serviceUnavailableException";
var _sa = "satisfiable";
var _sc = "score";
var _sch = "schema";
var _se = "server";
var _si = "signature";
var _so = "source";
var _st = "status";
var _sta = "start";
var _stat = "statements";
var _str = "stream";
var _stre = "streaming";
var _stri = "strict";
var _stru = "structure";
var _sy = "system";
var _t = "ttl";
var _tA = "translationAmbiguous";
var _tC = "toolConfig";
var _tCe = "textCharacters";
var _tCo = "toolChoice";
var _tCoo = "tooComplex";
var _tE = "throttlingException";
var _tF = "textFormat";
var _tP = "topicPolicy";
var _tPU = "topicPolicyUnits";
var _tPo = "topP";
var _tR = "toolResult";
var _tS = "toolSpec";
var _tT = "totalTokens";
var _tU = "toolUse";
var _tUI = "toolUseId";
var _ta = "tags";
var _te = "text";
var _tem = "temperature";
var _th = "threshold";
var _ti = "title";
var _to = "total";
var _too = "tools";
var _tool = "tool";
var _top = "topics";
var _tr = "trace";
var _tra = "translation";
var _tran = "translations";
var _ty = "type";
var _u = "usage";
var _uC = "untranslatedClaims";
var _uP = "untranslatedPremises";
var _ur = "uri";
var _url = "url";
var _v = "value";
var _vE = "validationException";
var _va = "valid";
var _vi = "video";
var _w = "web";
var _wP = "wordPolicy";
var _wPU = "wordPolicyUnits";
var n0 = "com.amazonaws.bedrockruntime";
var _s_registry = TypeRegistry.for(_s);
var BedrockRuntimeServiceException$ = [-3, _s, "BedrockRuntimeServiceException", 0, [], []];
_s_registry.registerError(BedrockRuntimeServiceException$, BedrockRuntimeServiceException);
var n0_registry = TypeRegistry.for(n0);
var AccessDeniedException$ = [
  -3,
  n0,
  _ADE,
  { [_e]: _c, [_hE]: 403 },
  [_m],
  [0]
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var ConflictException$ = [
  -3,
  n0,
  _CE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(ConflictException$, ConflictException);
var InternalServerException$ = [
  -3,
  n0,
  _ISE,
  { [_e]: _se, [_hE]: 500 },
  [_m],
  [0]
];
n0_registry.registerError(InternalServerException$, InternalServerException);
var ModelErrorException$ = [
  -3,
  n0,
  _MEE,
  { [_e]: _c, [_hE]: 424 },
  [_m, _oSC, _rN],
  [0, 1, 0]
];
n0_registry.registerError(ModelErrorException$, ModelErrorException);
var ModelNotReadyException$ = [
  -3,
  n0,
  _MNRE,
  { [_e]: _c, [_hE]: 429 },
  [_m],
  [0]
];
n0_registry.registerError(ModelNotReadyException$, ModelNotReadyException);
var ModelStreamErrorException$ = [
  -3,
  n0,
  _MSEE,
  { [_e]: _c, [_hE]: 424 },
  [_m, _oSC, _oM],
  [0, 1, 0]
];
n0_registry.registerError(ModelStreamErrorException$, ModelStreamErrorException);
var ModelTimeoutException$ = [
  -3,
  n0,
  _MTE,
  { [_e]: _c, [_hE]: 408 },
  [_m],
  [0]
];
n0_registry.registerError(ModelTimeoutException$, ModelTimeoutException);
var ResourceNotFoundException$ = [
  -3,
  n0,
  _RNFE,
  { [_e]: _c, [_hE]: 404 },
  [_m],
  [0]
];
n0_registry.registerError(ResourceNotFoundException$, ResourceNotFoundException);
var ServiceQuotaExceededException$ = [
  -3,
  n0,
  _SQEE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(ServiceQuotaExceededException$, ServiceQuotaExceededException);
var ServiceUnavailableException$ = [
  -3,
  n0,
  _SUE,
  { [_e]: _se, [_hE]: 503 },
  [_m],
  [0]
];
n0_registry.registerError(ServiceUnavailableException$, ServiceUnavailableException);
var ThrottlingException$ = [
  -3,
  n0,
  _TE,
  { [_e]: _c, [_hE]: 429 },
  [_m],
  [0]
];
n0_registry.registerError(ThrottlingException$, ThrottlingException);
var ValidationException$ = [
  -3,
  n0,
  _VE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(ValidationException$, ValidationException);
var errorTypeRegistries = [
  _s_registry,
  n0_registry
];
var AsyncInvokeMessage = [0, n0, _AIM, 8, 0];
var Body = [0, n0, _B, 8, 21];
var GuardrailAutomatedReasoningStatementLogicContent = [0, n0, _GARSLC, 8, 0];
var GuardrailAutomatedReasoningStatementNaturalLanguageContent = [0, n0, _GARSNLC, 8, 0];
var ModelInputPayload = [0, n0, _MIP, 8, 15];
var PartBody = [0, n0, _PB, 8, 21];
var AnyToolChoice$ = [
  3,
  n0,
  _ATC,
  0,
  [],
  []
];
var AppliedGuardrailDetails$ = [
  3,
  n0,
  _AGD,
  0,
  [_gI, _gV, _gA, _gO, _gOu],
  [0, 0, 0, 64 | 0, 0]
];
var ApplyGuardrailRequest$ = [
  3,
  n0,
  _AGR,
  0,
  [_gIu, _gV, _so, _co, _oS],
  [[0, 1], [0, 1], 0, [() => GuardrailContentBlockList, 0], 0],
  4
];
var ApplyGuardrailResponse$ = [
  3,
  n0,
  _AGRp,
  0,
  [_u, _a, _o, _as, _aR, _gC],
  [() => GuardrailUsage$, 0, () => GuardrailOutputContentList, [() => GuardrailAssessmentList, 0], 0, () => GuardrailCoverage$],
  4
];
var AsyncInvokeS3OutputDataConfig$ = [
  3,
  n0,
  _AISODC,
  0,
  [_sU, _kKI, _bO],
  [0, 0, 0],
  1
];
var AsyncInvokeSummary$ = [
  3,
  n0,
  _AIS,
  0,
  [_iA, _mA, _sT, _oDC, _cRT, _st, _fM, _lMT, _eT],
  [0, 0, 5, () => AsyncInvokeOutputDataConfig$, 0, 0, [() => AsyncInvokeMessage, 0], 5, 5],
  4
];
var AudioBlock$ = [
  3,
  n0,
  _AB,
  0,
  [_f, _so, _e],
  [0, [() => AudioSource$, 0], [() => ErrorBlock$, 0]],
  2
];
var AutoToolChoice$ = [
  3,
  n0,
  _ATCu,
  0,
  [],
  []
];
var BidirectionalInputPayloadPart$ = [
  3,
  n0,
  _BIPP,
  8,
  [_b],
  [[() => PartBody, 0]]
];
var BidirectionalOutputPayloadPart$ = [
  3,
  n0,
  _BOPP,
  8,
  [_b],
  [[() => PartBody, 0]]
];
var CacheDetail$ = [
  3,
  n0,
  _CD,
  0,
  [_t, _iT],
  [0, 1],
  2
];
var CachePointBlock$ = [
  3,
  n0,
  _CPB,
  0,
  [_ty, _t],
  [0, 0],
  1
];
var Citation$ = [
  3,
  n0,
  _C,
  0,
  [_ti, _so, _sC, _l],
  [0, 0, () => CitationSourceContentList, () => CitationLocation$]
];
var CitationsConfig$ = [
  3,
  n0,
  _CC,
  0,
  [_en],
  [2],
  1
];
var CitationsContentBlock$ = [
  3,
  n0,
  _CCB,
  0,
  [_co, _ci],
  [() => CitationGeneratedContentList, () => Citations]
];
var CitationsDelta$ = [
  3,
  n0,
  _CDi,
  0,
  [_ti, _so, _sC, _l],
  [0, 0, () => CitationSourceContentListDelta, () => CitationLocation$]
];
var CitationSourceContentDelta$ = [
  3,
  n0,
  _CSCD,
  0,
  [_te],
  [0]
];
var ContentBlockDeltaEvent$ = [
  3,
  n0,
  _CBDE,
  0,
  [_d, _cBI],
  [[() => ContentBlockDelta$, 0], 1],
  2
];
var ContentBlockStartEvent$ = [
  3,
  n0,
  _CBSE,
  0,
  [_sta, _cBI],
  [() => ContentBlockStart$, 1],
  2
];
var ContentBlockStopEvent$ = [
  3,
  n0,
  _CBSEo,
  0,
  [_cBI],
  [1],
  1
];
var ConverseMetrics$ = [
  3,
  n0,
  _CM,
  0,
  [_lM],
  [1],
  1
];
var ConverseRequest$ = [
  3,
  n0,
  _CR,
  0,
  [_mI, _me, _sy, _iC, _tC, _gCu, _aMRF, _pV, _aMRFP, _rM, _pC, _sTe, _oC],
  [[0, 1], [() => Messages, 0], [() => SystemContentBlocks, 0], () => InferenceConfiguration$, () => ToolConfiguration$, () => GuardrailConfiguration$, 15, [() => PromptVariableMap, 0], 64 | 0, [() => RequestMetadata, 0], () => PerformanceConfiguration$, () => ServiceTier$, [() => OutputConfig$, 0]],
  1
];
var ConverseResponse$ = [
  3,
  n0,
  _CRo,
  0,
  [_ou, _sR, _u, _met, _aMRFd, _tr, _pC, _sTe],
  [[() => ConverseOutput$, 0], 0, () => TokenUsage$, () => ConverseMetrics$, 15, [() => ConverseTrace$, 0], () => PerformanceConfiguration$, () => ServiceTier$],
  4
];
var ConverseStreamMetadataEvent$ = [
  3,
  n0,
  _CSME,
  0,
  [_u, _met, _tr, _pC, _sTe],
  [() => TokenUsage$, () => ConverseStreamMetrics$, [() => ConverseStreamTrace$, 0], () => PerformanceConfiguration$, () => ServiceTier$],
  2
];
var ConverseStreamMetrics$ = [
  3,
  n0,
  _CSM,
  0,
  [_lM],
  [1],
  1
];
var ConverseStreamRequest$ = [
  3,
  n0,
  _CSR,
  0,
  [_mI, _me, _sy, _iC, _tC, _gCu, _aMRF, _pV, _aMRFP, _rM, _pC, _sTe, _oC],
  [[0, 1], [() => Messages, 0], [() => SystemContentBlocks, 0], () => InferenceConfiguration$, () => ToolConfiguration$, () => GuardrailStreamConfiguration$, 15, [() => PromptVariableMap, 0], 64 | 0, [() => RequestMetadata, 0], () => PerformanceConfiguration$, () => ServiceTier$, [() => OutputConfig$, 0]],
  1
];
var ConverseStreamResponse$ = [
  3,
  n0,
  _CSRo,
  0,
  [_str],
  [[() => ConverseStreamOutput$, 16]]
];
var ConverseStreamTrace$ = [
  3,
  n0,
  _CST,
  0,
  [_g, _pR],
  [[() => GuardrailTraceAssessment$, 0], () => PromptRouterTrace$]
];
var ConverseTokensRequest$ = [
  3,
  n0,
  _CTR,
  0,
  [_me, _sy, _tC, _aMRF],
  [[() => Messages, 0], [() => SystemContentBlocks, 0], () => ToolConfiguration$, 15]
];
var ConverseTrace$ = [
  3,
  n0,
  _CT,
  0,
  [_g, _pR],
  [[() => GuardrailTraceAssessment$, 0], () => PromptRouterTrace$]
];
var CountTokensRequest$ = [
  3,
  n0,
  _CTRo,
  0,
  [_mI, _i],
  [[0, 1], [() => CountTokensInput$, 0]],
  2
];
var CountTokensResponse$ = [
  3,
  n0,
  _CTRou,
  0,
  [_iT],
  [1],
  1
];
var DocumentBlock$ = [
  3,
  n0,
  _DB,
  0,
  [_n, _so, _f, _con, _ci],
  [0, () => DocumentSource$, 0, 0, () => CitationsConfig$],
  2
];
var DocumentCharLocation$ = [
  3,
  n0,
  _DCL,
  0,
  [_dI, _sta, _end],
  [1, 1, 1]
];
var DocumentChunkLocation$ = [
  3,
  n0,
  _DCLo,
  0,
  [_dI, _sta, _end],
  [1, 1, 1]
];
var DocumentPageLocation$ = [
  3,
  n0,
  _DPL,
  0,
  [_dI, _sta, _end],
  [1, 1, 1]
];
var ErrorBlock$ = [
  3,
  n0,
  _EB,
  8,
  [_m],
  [0]
];
var GetAsyncInvokeRequest$ = [
  3,
  n0,
  _GAIR,
  0,
  [_iA],
  [[0, 1]],
  1
];
var GetAsyncInvokeResponse$ = [
  3,
  n0,
  _GAIRe,
  0,
  [_iA, _mA, _st, _sT, _oDC, _cRT, _fM, _lMT, _eT],
  [0, 0, 0, 5, () => AsyncInvokeOutputDataConfig$, 0, [() => AsyncInvokeMessage, 0], 5, 5],
  5
];
var GuardrailAssessment$ = [
  3,
  n0,
  _GA,
  0,
  [_tP, _cP, _wP, _sIP, _cGP, _aRP, _iM, _aGD],
  [() => GuardrailTopicPolicyAssessment$, () => GuardrailContentPolicyAssessment$, () => GuardrailWordPolicyAssessment$, () => GuardrailSensitiveInformationPolicyAssessment$, () => GuardrailContextualGroundingPolicyAssessment$, [() => GuardrailAutomatedReasoningPolicyAssessment$, 0], () => GuardrailInvocationMetrics$, () => AppliedGuardrailDetails$]
];
var GuardrailAutomatedReasoningImpossibleFinding$ = [
  3,
  n0,
  _GARIF,
  0,
  [_tra, _cR, _lW],
  [[() => GuardrailAutomatedReasoningTranslation$, 0], () => GuardrailAutomatedReasoningRuleList, [() => GuardrailAutomatedReasoningLogicWarning$, 0]]
];
var GuardrailAutomatedReasoningInputTextReference$ = [
  3,
  n0,
  _GARITR,
  0,
  [_te],
  [[() => GuardrailAutomatedReasoningStatementNaturalLanguageContent, 0]]
];
var GuardrailAutomatedReasoningInvalidFinding$ = [
  3,
  n0,
  _GARIFu,
  0,
  [_tra, _cR, _lW],
  [[() => GuardrailAutomatedReasoningTranslation$, 0], () => GuardrailAutomatedReasoningRuleList, [() => GuardrailAutomatedReasoningLogicWarning$, 0]]
];
var GuardrailAutomatedReasoningLogicWarning$ = [
  3,
  n0,
  _GARLW,
  0,
  [_ty, _p, _cl],
  [0, [() => GuardrailAutomatedReasoningStatementList, 0], [() => GuardrailAutomatedReasoningStatementList, 0]]
];
var GuardrailAutomatedReasoningNoTranslationsFinding$ = [
  3,
  n0,
  _GARNTF,
  0,
  [],
  []
];
var GuardrailAutomatedReasoningPolicyAssessment$ = [
  3,
  n0,
  _GARPA,
  0,
  [_fi],
  [[() => GuardrailAutomatedReasoningFindingList, 0]]
];
var GuardrailAutomatedReasoningRule$ = [
  3,
  n0,
  _GARR,
  0,
  [_id, _pVA],
  [0, 0]
];
var GuardrailAutomatedReasoningSatisfiableFinding$ = [
  3,
  n0,
  _GARSF,
  0,
  [_tra, _cTS, _cFS, _lW],
  [[() => GuardrailAutomatedReasoningTranslation$, 0], [() => GuardrailAutomatedReasoningScenario$, 0], [() => GuardrailAutomatedReasoningScenario$, 0], [() => GuardrailAutomatedReasoningLogicWarning$, 0]]
];
var GuardrailAutomatedReasoningScenario$ = [
  3,
  n0,
  _GARS,
  0,
  [_stat],
  [[() => GuardrailAutomatedReasoningStatementList, 0]]
];
var GuardrailAutomatedReasoningStatement$ = [
  3,
  n0,
  _GARSu,
  0,
  [_lo, _nL],
  [[() => GuardrailAutomatedReasoningStatementLogicContent, 0], [() => GuardrailAutomatedReasoningStatementNaturalLanguageContent, 0]]
];
var GuardrailAutomatedReasoningTooComplexFinding$ = [
  3,
  n0,
  _GARTCF,
  0,
  [],
  []
];
var GuardrailAutomatedReasoningTranslation$ = [
  3,
  n0,
  _GART,
  0,
  [_p, _cl, _uP, _uC, _conf],
  [[() => GuardrailAutomatedReasoningStatementList, 0], [() => GuardrailAutomatedReasoningStatementList, 0], [() => GuardrailAutomatedReasoningInputTextReferenceList, 0], [() => GuardrailAutomatedReasoningInputTextReferenceList, 0], 1]
];
var GuardrailAutomatedReasoningTranslationAmbiguousFinding$ = [
  3,
  n0,
  _GARTAF,
  0,
  [_op, _dS],
  [[() => GuardrailAutomatedReasoningTranslationOptionList, 0], [() => GuardrailAutomatedReasoningDifferenceScenarioList, 0]]
];
var GuardrailAutomatedReasoningTranslationOption$ = [
  3,
  n0,
  _GARTO,
  0,
  [_tran],
  [[() => GuardrailAutomatedReasoningTranslationList, 0]]
];
var GuardrailAutomatedReasoningValidFinding$ = [
  3,
  n0,
  _GARVF,
  0,
  [_tra, _cTS, _sRu, _lW],
  [[() => GuardrailAutomatedReasoningTranslation$, 0], [() => GuardrailAutomatedReasoningScenario$, 0], () => GuardrailAutomatedReasoningRuleList, [() => GuardrailAutomatedReasoningLogicWarning$, 0]]
];
var GuardrailConfiguration$ = [
  3,
  n0,
  _GC,
  0,
  [_gIu, _gV, _tr],
  [0, 0, 0]
];
var GuardrailContentFilter$ = [
  3,
  n0,
  _GCF,
  0,
  [_ty, _conf, _a, _fS, _de],
  [0, 0, 0, 0, 2],
  3
];
var GuardrailContentPolicyAssessment$ = [
  3,
  n0,
  _GCPA,
  0,
  [_fil],
  [() => GuardrailContentFilterList],
  1
];
var GuardrailContextualGroundingFilter$ = [
  3,
  n0,
  _GCGF,
  0,
  [_ty, _th, _sc, _a, _de],
  [0, 1, 1, 0, 2],
  4
];
var GuardrailContextualGroundingPolicyAssessment$ = [
  3,
  n0,
  _GCGPA,
  0,
  [_fil],
  [() => GuardrailContextualGroundingFilters]
];
var GuardrailConverseImageBlock$ = [
  3,
  n0,
  _GCIB,
  8,
  [_f, _so],
  [0, [() => GuardrailConverseImageSource$, 0]],
  2
];
var GuardrailConverseTextBlock$ = [
  3,
  n0,
  _GCTB,
  0,
  [_te, _q],
  [0, 64 | 0],
  1
];
var GuardrailCoverage$ = [
  3,
  n0,
  _GCu,
  0,
  [_tCe, _im],
  [() => GuardrailTextCharactersCoverage$, () => GuardrailImageCoverage$]
];
var GuardrailCustomWord$ = [
  3,
  n0,
  _GCW,
  0,
  [_ma, _a, _de],
  [0, 0, 2],
  2
];
var GuardrailImageBlock$ = [
  3,
  n0,
  _GIB,
  8,
  [_f, _so],
  [0, [() => GuardrailImageSource$, 0]],
  2
];
var GuardrailImageCoverage$ = [
  3,
  n0,
  _GIC,
  0,
  [_gu, _to],
  [1, 1]
];
var GuardrailInvocationMetrics$ = [
  3,
  n0,
  _GIM,
  0,
  [_gPL, _u, _gC],
  [1, () => GuardrailUsage$, () => GuardrailCoverage$]
];
var GuardrailManagedWord$ = [
  3,
  n0,
  _GMW,
  0,
  [_ma, _ty, _a, _de],
  [0, 0, 0, 2],
  3
];
var GuardrailOutputContent$ = [
  3,
  n0,
  _GOC,
  0,
  [_te],
  [0]
];
var GuardrailPiiEntityFilter$ = [
  3,
  n0,
  _GPEF,
  0,
  [_ma, _ty, _a, _de],
  [0, 0, 0, 2],
  3
];
var GuardrailRegexFilter$ = [
  3,
  n0,
  _GRF,
  0,
  [_a, _n, _ma, _r, _de],
  [0, 0, 0, 0, 2],
  1
];
var GuardrailSensitiveInformationPolicyAssessment$ = [
  3,
  n0,
  _GSIPA,
  0,
  [_pE, _re],
  [() => GuardrailPiiEntityFilterList, () => GuardrailRegexFilterList],
  2
];
var GuardrailStreamConfiguration$ = [
  3,
  n0,
  _GSC,
  0,
  [_gIu, _gV, _tr, _sPM],
  [0, 0, 0, 0]
];
var GuardrailTextBlock$ = [
  3,
  n0,
  _GTB,
  0,
  [_te, _q],
  [0, 64 | 0],
  1
];
var GuardrailTextCharactersCoverage$ = [
  3,
  n0,
  _GTCC,
  0,
  [_gu, _to],
  [1, 1]
];
var GuardrailTopic$ = [
  3,
  n0,
  _GT,
  0,
  [_n, _ty, _a, _de],
  [0, 0, 0, 2],
  3
];
var GuardrailTopicPolicyAssessment$ = [
  3,
  n0,
  _GTPA,
  0,
  [_top],
  [() => GuardrailTopicList],
  1
];
var GuardrailTraceAssessment$ = [
  3,
  n0,
  _GTA,
  0,
  [_mO, _iAn, _oA, _aR],
  [64 | 0, [() => GuardrailAssessmentMap, 0], [() => GuardrailAssessmentListMap, 0], 0]
];
var GuardrailUsage$ = [
  3,
  n0,
  _GU,
  0,
  [_tPU, _cPU, _wPU, _sIPU, _sIPFU, _cGPU, _cPIU, _aRPU, _aRPu],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  6
];
var GuardrailWordPolicyAssessment$ = [
  3,
  n0,
  _GWPA,
  0,
  [_cW, _mWL],
  [() => GuardrailCustomWordList, () => GuardrailManagedWordList],
  2
];
var ImageBlock$ = [
  3,
  n0,
  _IB,
  0,
  [_f, _so, _e],
  [0, [() => ImageSource$, 0], [() => ErrorBlock$, 0]],
  2
];
var ImageBlockDelta$ = [
  3,
  n0,
  _IBD,
  0,
  [_so, _e],
  [[() => ImageSource$, 0], [() => ErrorBlock$, 0]]
];
var ImageBlockStart$ = [
  3,
  n0,
  _IBS,
  0,
  [_f],
  [0],
  1
];
var InferenceConfiguration$ = [
  3,
  n0,
  _IC,
  0,
  [_mT, _tem, _tPo, _sS],
  [1, 1, 1, 64 | 0]
];
var InvokeModelRequest$ = [
  3,
  n0,
  _IMR,
  0,
  [_mI, _bo, _cT, _ac, _tr, _gIu, _gV, _pCL, _sTe],
  [[0, 1], [() => Body, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _A }], [0, { [_hH]: _XABT }], [0, { [_hH]: _XABG }], [0, { [_hH]: _XABG_ }], [0, { [_hH]: _XABPL }], [0, { [_hH]: _XABST }]],
  1
];
var InvokeModelResponse$ = [
  3,
  n0,
  _IMRn,
  0,
  [_bo, _cT, _pCL, _sTe],
  [[() => Body, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _XABPL }], [0, { [_hH]: _XABST }]],
  2
];
var InvokeModelTokensRequest$ = [
  3,
  n0,
  _IMTR,
  0,
  [_bo],
  [[() => Body, 0]],
  1
];
var InvokeModelWithBidirectionalStreamRequest$ = [
  3,
  n0,
  _IMWBSR,
  0,
  [_mI, _bo],
  [[0, 1], [() => InvokeModelWithBidirectionalStreamInput$, 16]],
  2
];
var InvokeModelWithBidirectionalStreamResponse$ = [
  3,
  n0,
  _IMWBSRn,
  0,
  [_bo],
  [[() => InvokeModelWithBidirectionalStreamOutput$, 16]],
  1
];
var InvokeModelWithResponseStreamRequest$ = [
  3,
  n0,
  _IMWRSR,
  0,
  [_mI, _bo, _cT, _ac, _tr, _gIu, _gV, _pCL, _sTe],
  [[0, 1], [() => Body, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _XABA }], [0, { [_hH]: _XABT }], [0, { [_hH]: _XABG }], [0, { [_hH]: _XABG_ }], [0, { [_hH]: _XABPL }], [0, { [_hH]: _XABST }]],
  1
];
var InvokeModelWithResponseStreamResponse$ = [
  3,
  n0,
  _IMWRSRn,
  0,
  [_bo, _cT, _pCL, _sTe],
  [[() => ResponseStream$, 16], [0, { [_hH]: _XABCT }], [0, { [_hH]: _XABPL }], [0, { [_hH]: _XABST }]],
  2
];
var JsonSchemaDefinition$ = [
  3,
  n0,
  _JSD,
  0,
  [_sch, _n, _des],
  [0, 0, 0],
  1
];
var ListAsyncInvokesRequest$ = [
  3,
  n0,
  _LAIR,
  0,
  [_sTA, _sTB, _sE, _mR, _nT, _sB, _sO],
  [[5, { [_hQ]: _sTA }], [5, { [_hQ]: _sTB }], [0, { [_hQ]: _sE }], [1, { [_hQ]: _mR }], [0, { [_hQ]: _nT }], [0, { [_hQ]: _sB }], [0, { [_hQ]: _sO }]]
];
var ListAsyncInvokesResponse$ = [
  3,
  n0,
  _LAIRi,
  0,
  [_nT, _aIS],
  [0, [() => AsyncInvokeSummaries, 0]]
];
var Message$ = [
  3,
  n0,
  _M,
  0,
  [_ro, _co],
  [0, [() => ContentBlocks, 0]],
  2
];
var MessageStartEvent$ = [
  3,
  n0,
  _MSE,
  0,
  [_ro],
  [0],
  1
];
var MessageStopEvent$ = [
  3,
  n0,
  _MSEe,
  0,
  [_sR, _aMRFd],
  [0, 15],
  1
];
var OutputConfig$ = [
  3,
  n0,
  _OC,
  0,
  [_tF],
  [[() => OutputFormat$, 0]]
];
var OutputFormat$ = [
  3,
  n0,
  _OF,
  0,
  [_ty, _stru],
  [0, [() => OutputFormatStructure$, 0]],
  2
];
var PayloadPart$ = [
  3,
  n0,
  _PP,
  8,
  [_b],
  [[() => PartBody, 0]]
];
var PerformanceConfiguration$ = [
  3,
  n0,
  _PC,
  0,
  [_la],
  [0]
];
var PromptRouterTrace$ = [
  3,
  n0,
  _PRT,
  0,
  [_iMI],
  [0]
];
var ReasoningTextBlock$ = [
  3,
  n0,
  _RTB,
  8,
  [_te, _si],
  [0, 0],
  1
];
var S3Location$ = [
  3,
  n0,
  _SL,
  0,
  [_ur, _bO],
  [0, 0],
  1
];
var SearchResultBlock$ = [
  3,
  n0,
  _SRB,
  0,
  [_so, _ti, _co, _ci],
  [0, 0, () => SearchResultContentBlocks, () => CitationsConfig$],
  3
];
var SearchResultContentBlock$ = [
  3,
  n0,
  _SRCB,
  0,
  [_te],
  [0],
  1
];
var SearchResultLocation$ = [
  3,
  n0,
  _SRL,
  0,
  [_sRI, _sta, _end],
  [1, 1, 1]
];
var ServiceTier$ = [
  3,
  n0,
  _ST,
  0,
  [_ty],
  [0],
  1
];
var SpecificToolChoice$ = [
  3,
  n0,
  _STC,
  0,
  [_n],
  [0],
  1
];
var StartAsyncInvokeRequest$ = [
  3,
  n0,
  _SAIR,
  0,
  [_mI, _mIo, _oDC, _cRT, _ta],
  [0, [() => ModelInputPayload, 0], () => AsyncInvokeOutputDataConfig$, [0, 4], () => TagList],
  3
];
var StartAsyncInvokeResponse$ = [
  3,
  n0,
  _SAIRt,
  0,
  [_iA],
  [0],
  1
];
var SystemTool$ = [
  3,
  n0,
  _STy,
  0,
  [_n],
  [0],
  1
];
var Tag$ = [
  3,
  n0,
  _T,
  0,
  [_k, _v],
  [0, 0],
  2
];
var TokenUsage$ = [
  3,
  n0,
  _TU,
  0,
  [_iT, _oT, _tT, _cRIT, _cWIT, _cD],
  [1, 1, 1, 1, 1, () => CacheDetailsList],
  3
];
var ToolConfiguration$ = [
  3,
  n0,
  _TC,
  0,
  [_too, _tCo],
  [() => Tools, () => ToolChoice$],
  1
];
var ToolResultBlock$ = [
  3,
  n0,
  _TRB,
  0,
  [_tUI, _co, _st, _ty],
  [0, [() => ToolResultContentBlocks, 0], 0, 0],
  2
];
var ToolResultBlockStart$ = [
  3,
  n0,
  _TRBS,
  0,
  [_tUI, _ty, _st],
  [0, 0, 0],
  1
];
var ToolSpecification$ = [
  3,
  n0,
  _TS,
  0,
  [_n, _iS, _des, _stri],
  [0, () => ToolInputSchema$, 0, 2],
  2
];
var ToolUseBlock$ = [
  3,
  n0,
  _TUB,
  0,
  [_tUI, _n, _i, _ty],
  [0, 0, 15, 0],
  3
];
var ToolUseBlockDelta$ = [
  3,
  n0,
  _TUBD,
  0,
  [_i],
  [0],
  1
];
var ToolUseBlockStart$ = [
  3,
  n0,
  _TUBS,
  0,
  [_tUI, _n, _ty],
  [0, 0, 0],
  2
];
var VideoBlock$ = [
  3,
  n0,
  _VB,
  0,
  [_f, _so],
  [0, () => VideoSource$],
  2
];
var WebLocation$ = [
  3,
  n0,
  _WL,
  0,
  [_url, _do],
  [0, 0]
];
var AdditionalModelResponseFieldPaths = 64 | 0;
var AsyncInvokeSummaries = [
  1,
  n0,
  _AISs,
  0,
  [
    () => AsyncInvokeSummary$,
    0
  ]
];
var CacheDetailsList = [
  1,
  n0,
  _CDL,
  0,
  () => CacheDetail$
];
var CitationGeneratedContentList = [
  1,
  n0,
  _CGCL,
  0,
  () => CitationGeneratedContent$
];
var Citations = [
  1,
  n0,
  _Ci,
  0,
  () => Citation$
];
var CitationSourceContentList = [
  1,
  n0,
  _CSCL,
  0,
  () => CitationSourceContent$
];
var CitationSourceContentListDelta = [
  1,
  n0,
  _CSCLD,
  0,
  () => CitationSourceContentDelta$
];
var ContentBlocks = [
  1,
  n0,
  _CB,
  0,
  [
    () => ContentBlock$,
    0
  ]
];
var DocumentContentBlocks = [
  1,
  n0,
  _DCB,
  0,
  () => DocumentContentBlock$
];
var GuardrailAssessmentList = [
  1,
  n0,
  _GAL,
  0,
  [
    () => GuardrailAssessment$,
    0
  ]
];
var GuardrailAutomatedReasoningDifferenceScenarioList = [
  1,
  n0,
  _GARDSL,
  0,
  [
    () => GuardrailAutomatedReasoningScenario$,
    0
  ]
];
var GuardrailAutomatedReasoningFindingList = [
  1,
  n0,
  _GARFL,
  0,
  [
    () => GuardrailAutomatedReasoningFinding$,
    0
  ]
];
var GuardrailAutomatedReasoningInputTextReferenceList = [
  1,
  n0,
  _GARITRL,
  0,
  [
    () => GuardrailAutomatedReasoningInputTextReference$,
    0
  ]
];
var GuardrailAutomatedReasoningRuleList = [
  1,
  n0,
  _GARRL,
  0,
  () => GuardrailAutomatedReasoningRule$
];
var GuardrailAutomatedReasoningStatementList = [
  1,
  n0,
  _GARSL,
  0,
  [
    () => GuardrailAutomatedReasoningStatement$,
    0
  ]
];
var GuardrailAutomatedReasoningTranslationList = [
  1,
  n0,
  _GARTL,
  0,
  [
    () => GuardrailAutomatedReasoningTranslation$,
    0
  ]
];
var GuardrailAutomatedReasoningTranslationOptionList = [
  1,
  n0,
  _GARTOL,
  0,
  [
    () => GuardrailAutomatedReasoningTranslationOption$,
    0
  ]
];
var GuardrailContentBlockList = [
  1,
  n0,
  _GCBL,
  0,
  [
    () => GuardrailContentBlock$,
    0
  ]
];
var GuardrailContentFilterList = [
  1,
  n0,
  _GCFL,
  0,
  () => GuardrailContentFilter$
];
var GuardrailContentQualifierList = 64 | 0;
var GuardrailContextualGroundingFilters = [
  1,
  n0,
  _GCGFu,
  0,
  () => GuardrailContextualGroundingFilter$
];
var GuardrailConverseContentQualifierList = 64 | 0;
var GuardrailCustomWordList = [
  1,
  n0,
  _GCWL,
  0,
  () => GuardrailCustomWord$
];
var GuardrailManagedWordList = [
  1,
  n0,
  _GMWL,
  0,
  () => GuardrailManagedWord$
];
var GuardrailOriginList = 64 | 0;
var GuardrailOutputContentList = [
  1,
  n0,
  _GOCL,
  0,
  () => GuardrailOutputContent$
];
var GuardrailPiiEntityFilterList = [
  1,
  n0,
  _GPEFL,
  0,
  () => GuardrailPiiEntityFilter$
];
var GuardrailRegexFilterList = [
  1,
  n0,
  _GRFL,
  0,
  () => GuardrailRegexFilter$
];
var GuardrailTopicList = [
  1,
  n0,
  _GTL,
  0,
  () => GuardrailTopic$
];
var Messages = [
  1,
  n0,
  _Me,
  0,
  [
    () => Message$,
    0
  ]
];
var ModelOutputs = 64 | 0;
var NonEmptyStringList = 64 | 0;
var SearchResultContentBlocks = [
  1,
  n0,
  _SRCBe,
  0,
  () => SearchResultContentBlock$
];
var SystemContentBlocks = [
  1,
  n0,
  _SCB,
  0,
  [
    () => SystemContentBlock$,
    0
  ]
];
var TagList = [
  1,
  n0,
  _TL,
  0,
  () => Tag$
];
var ToolResultBlocksDelta = [
  1,
  n0,
  _TRBD,
  0,
  () => ToolResultBlockDelta$
];
var ToolResultContentBlocks = [
  1,
  n0,
  _TRCB,
  0,
  [
    () => ToolResultContentBlock$,
    0
  ]
];
var Tools = [
  1,
  n0,
  _To,
  0,
  () => Tool$
];
var GuardrailAssessmentListMap = [
  2,
  n0,
  _GALM,
  0,
  [
    0,
    0
  ],
  [
    () => GuardrailAssessmentList,
    0
  ]
];
var GuardrailAssessmentMap = [
  2,
  n0,
  _GAM,
  0,
  [
    0,
    0
  ],
  [
    () => GuardrailAssessment$,
    0
  ]
];
var PromptVariableMap = [
  2,
  n0,
  _PVM,
  8,
  0,
  () => PromptVariableValues$
];
var RequestMetadata = [
  2,
  n0,
  _RM,
  8,
  0,
  0
];
var AsyncInvokeOutputDataConfig$ = [
  4,
  n0,
  _AIODC,
  0,
  [_sODC],
  [() => AsyncInvokeS3OutputDataConfig$]
];
var AudioSource$ = [
  4,
  n0,
  _AS,
  8,
  [_b, _sL],
  [21, () => S3Location$]
];
var CitationGeneratedContent$ = [
  4,
  n0,
  _CGC,
  0,
  [_te],
  [0]
];
var CitationLocation$ = [
  4,
  n0,
  _CL,
  0,
  [_w, _dC, _dP, _dCo, _sRL],
  [() => WebLocation$, () => DocumentCharLocation$, () => DocumentPageLocation$, () => DocumentChunkLocation$, () => SearchResultLocation$]
];
var CitationSourceContent$ = [
  4,
  n0,
  _CSC,
  0,
  [_te],
  [0]
];
var ContentBlock$ = [
  4,
  n0,
  _CBo,
  0,
  [_te, _ima, _doc, _vi, _au, _tU, _tR, _gCua, _cPa, _rC, _cC, _sRe],
  [0, [() => ImageBlock$, 0], () => DocumentBlock$, () => VideoBlock$, [() => AudioBlock$, 0], () => ToolUseBlock$, [() => ToolResultBlock$, 0], [() => GuardrailConverseContentBlock$, 0], () => CachePointBlock$, [() => ReasoningContentBlock$, 0], () => CitationsContentBlock$, () => SearchResultBlock$]
];
var ContentBlockDelta$ = [
  4,
  n0,
  _CBD,
  0,
  [_te, _tU, _tR, _rC, _cit, _ima],
  [0, () => ToolUseBlockDelta$, () => ToolResultBlocksDelta, [() => ReasoningContentBlockDelta$, 0], () => CitationsDelta$, [() => ImageBlockDelta$, 0]]
];
var ContentBlockStart$ = [
  4,
  n0,
  _CBS,
  0,
  [_tU, _tR, _ima],
  [() => ToolUseBlockStart$, () => ToolResultBlockStart$, () => ImageBlockStart$]
];
var ConverseOutput$ = [
  4,
  n0,
  _CO,
  0,
  [_m],
  [[() => Message$, 0]]
];
var ConverseStreamOutput$ = [
  4,
  n0,
  _CSO,
  { [_stre]: 1 },
  [_mS, _cBS, _cBD, _cBSo, _mSe, _meta, _iSE, _mSEE, _vE, _tE, _sUE],
  [() => MessageStartEvent$, () => ContentBlockStartEvent$, [() => ContentBlockDeltaEvent$, 0], () => ContentBlockStopEvent$, () => MessageStopEvent$, [() => ConverseStreamMetadataEvent$, 0], [() => InternalServerException$, 0], [() => ModelStreamErrorException$, 0], [() => ValidationException$, 0], [() => ThrottlingException$, 0], [() => ServiceUnavailableException$, 0]]
];
var CountTokensInput$ = [
  4,
  n0,
  _CTI,
  0,
  [_iMn, _conv],
  [[() => InvokeModelTokensRequest$, 0], [() => ConverseTokensRequest$, 0]]
];
var DocumentContentBlock$ = [
  4,
  n0,
  _DCBo,
  0,
  [_te],
  [0]
];
var DocumentSource$ = [
  4,
  n0,
  _DS,
  0,
  [_b, _sL, _te, _co],
  [21, () => S3Location$, 0, () => DocumentContentBlocks]
];
var GuardrailAutomatedReasoningFinding$ = [
  4,
  n0,
  _GARF,
  0,
  [_va, _in, _sa, _imp, _tA, _tCoo, _nTo],
  [[() => GuardrailAutomatedReasoningValidFinding$, 0], [() => GuardrailAutomatedReasoningInvalidFinding$, 0], [() => GuardrailAutomatedReasoningSatisfiableFinding$, 0], [() => GuardrailAutomatedReasoningImpossibleFinding$, 0], [() => GuardrailAutomatedReasoningTranslationAmbiguousFinding$, 0], () => GuardrailAutomatedReasoningTooComplexFinding$, () => GuardrailAutomatedReasoningNoTranslationsFinding$]
];
var GuardrailContentBlock$ = [
  4,
  n0,
  _GCB,
  0,
  [_te, _ima],
  [() => GuardrailTextBlock$, [() => GuardrailImageBlock$, 0]]
];
var GuardrailConverseContentBlock$ = [
  4,
  n0,
  _GCCB,
  0,
  [_te, _ima],
  [() => GuardrailConverseTextBlock$, [() => GuardrailConverseImageBlock$, 0]]
];
var GuardrailConverseImageSource$ = [
  4,
  n0,
  _GCIS,
  8,
  [_b],
  [21]
];
var GuardrailImageSource$ = [
  4,
  n0,
  _GIS,
  8,
  [_b],
  [21]
];
var ImageSource$ = [
  4,
  n0,
  _IS,
  8,
  [_b, _sL],
  [21, () => S3Location$]
];
var InvokeModelWithBidirectionalStreamInput$ = [
  4,
  n0,
  _IMWBSI,
  { [_stre]: 1 },
  [_ch],
  [[() => BidirectionalInputPayloadPart$, 0]]
];
var InvokeModelWithBidirectionalStreamOutput$ = [
  4,
  n0,
  _IMWBSO,
  { [_stre]: 1 },
  [_ch, _iSE, _mSEE, _vE, _tE, _mTE, _sUE],
  [[() => BidirectionalOutputPayloadPart$, 0], [() => InternalServerException$, 0], [() => ModelStreamErrorException$, 0], [() => ValidationException$, 0], [() => ThrottlingException$, 0], [() => ModelTimeoutException$, 0], [() => ServiceUnavailableException$, 0]]
];
var OutputFormatStructure$ = [
  4,
  n0,
  _OFS,
  8,
  [_jS],
  [() => JsonSchemaDefinition$]
];
var PromptVariableValues$ = [
  4,
  n0,
  _PVV,
  0,
  [_te],
  [0]
];
var ReasoningContentBlock$ = [
  4,
  n0,
  _RCB,
  8,
  [_rT, _rCe],
  [[() => ReasoningTextBlock$, 0], 21]
];
var ReasoningContentBlockDelta$ = [
  4,
  n0,
  _RCBD,
  8,
  [_te, _rCe, _si],
  [0, 21, 0]
];
var ResponseStream$ = [
  4,
  n0,
  _RS,
  { [_stre]: 1 },
  [_ch, _iSE, _mSEE, _vE, _tE, _mTE, _sUE],
  [[() => PayloadPart$, 0], [() => InternalServerException$, 0], [() => ModelStreamErrorException$, 0], [() => ValidationException$, 0], [() => ThrottlingException$, 0], [() => ModelTimeoutException$, 0], [() => ServiceUnavailableException$, 0]]
];
var SystemContentBlock$ = [
  4,
  n0,
  _SCBy,
  0,
  [_te, _gCua, _cPa],
  [0, [() => GuardrailConverseContentBlock$, 0], () => CachePointBlock$]
];
var Tool$ = [
  4,
  n0,
  _Too,
  0,
  [_tS, _sTy, _cPa],
  [() => ToolSpecification$, () => SystemTool$, () => CachePointBlock$]
];
var ToolChoice$ = [
  4,
  n0,
  _TCo,
  0,
  [_aut, _an, _tool],
  [() => AutoToolChoice$, () => AnyToolChoice$, () => SpecificToolChoice$]
];
var ToolInputSchema$ = [
  4,
  n0,
  _TIS,
  0,
  [_j],
  [15]
];
var ToolResultBlockDelta$ = [
  4,
  n0,
  _TRBDo,
  0,
  [_te, _j],
  [0, 15]
];
var ToolResultContentBlock$ = [
  4,
  n0,
  _TRCBo,
  0,
  [_j, _te, _ima, _doc, _vi, _sRe],
  [15, 0, [() => ImageBlock$, 0], () => DocumentBlock$, () => VideoBlock$, () => SearchResultBlock$]
];
var VideoSource$ = [
  4,
  n0,
  _VS,
  0,
  [_b, _sL],
  [21, () => S3Location$]
];
var ApplyGuardrail$ = [
  9,
  n0,
  _AG,
  { [_h]: ["POST", "/guardrail/{guardrailIdentifier}/version/{guardrailVersion}/apply", 200] },
  () => ApplyGuardrailRequest$,
  () => ApplyGuardrailResponse$
];
var Converse$ = [
  9,
  n0,
  _Co,
  { [_h]: ["POST", "/model/{modelId}/converse", 200] },
  () => ConverseRequest$,
  () => ConverseResponse$
];
var ConverseStream$ = [
  9,
  n0,
  _CS,
  { [_h]: ["POST", "/model/{modelId}/converse-stream", 200] },
  () => ConverseStreamRequest$,
  () => ConverseStreamResponse$
];
var CountTokens$ = [
  9,
  n0,
  _CTo,
  { [_h]: ["POST", "/model/{modelId}/count-tokens", 200] },
  () => CountTokensRequest$,
  () => CountTokensResponse$
];
var GetAsyncInvoke$ = [
  9,
  n0,
  _GAI,
  { [_h]: ["GET", "/async-invoke/{invocationArn}", 200] },
  () => GetAsyncInvokeRequest$,
  () => GetAsyncInvokeResponse$
];
var InvokeModel$ = [
  9,
  n0,
  _IM,
  { [_h]: ["POST", "/model/{modelId}/invoke", 200] },
  () => InvokeModelRequest$,
  () => InvokeModelResponse$
];
var InvokeModelWithBidirectionalStream$ = [
  9,
  n0,
  _IMWBS,
  { [_h]: ["POST", "/model/{modelId}/invoke-with-bidirectional-stream", 200] },
  () => InvokeModelWithBidirectionalStreamRequest$,
  () => InvokeModelWithBidirectionalStreamResponse$
];
var InvokeModelWithResponseStream$ = [
  9,
  n0,
  _IMWRS,
  { [_h]: ["POST", "/model/{modelId}/invoke-with-response-stream", 200] },
  () => InvokeModelWithResponseStreamRequest$,
  () => InvokeModelWithResponseStreamResponse$
];
var ListAsyncInvokes$ = [
  9,
  n0,
  _LAI,
  { [_h]: ["GET", "/async-invoke", 200] },
  () => ListAsyncInvokesRequest$,
  () => ListAsyncInvokesResponse$
];
var StartAsyncInvoke$ = [
  9,
  n0,
  _SAI,
  { [_h]: ["POST", "/async-invoke", 200] },
  () => StartAsyncInvokeRequest$,
  () => StartAsyncInvokeResponse$
];

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2023-09-30",
    base64Decoder: (config == null ? void 0 : config.base64Decoder) ?? fromBase64,
    base64Encoder: (config == null ? void 0 : config.base64Encoder) ?? toBase64,
    disableHostPrefix: (config == null ? void 0 : config.disableHostPrefix) ?? false,
    endpointProvider: (config == null ? void 0 : config.endpointProvider) ?? defaultEndpointResolver,
    extensions: (config == null ? void 0 : config.extensions) ?? [],
    httpAuthSchemeProvider: (config == null ? void 0 : config.httpAuthSchemeProvider) ?? defaultBedrockRuntimeHttpAuthSchemeProvider,
    httpAuthSchemes: (config == null ? void 0 : config.httpAuthSchemes) ?? [
      {
        schemeId: "aws.auth#sigv4",
        identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
        signer: new AwsSdkSigV4Signer()
      },
      {
        schemeId: "smithy.api#httpBearerAuth",
        identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#httpBearerAuth"),
        signer: new HttpBearerAuthSigner()
      }
    ],
    logger: (config == null ? void 0 : config.logger) ?? new NoOpLogger(),
    protocol: (config == null ? void 0 : config.protocol) ?? AwsRestJsonProtocol,
    protocolSettings: (config == null ? void 0 : config.protocolSettings) ?? {
      defaultNamespace: "com.amazonaws.bedrockruntime",
      errorTypeRegistries,
      version: "2023-09-30",
      serviceTarget: "AmazonBedrockFrontendService"
    },
    serviceId: (config == null ? void 0 : config.serviceId) ?? "Bedrock Runtime",
    urlParser: (config == null ? void 0 : config.urlParser) ?? parseUrl,
    utf8Decoder: (config == null ? void 0 : config.utf8Decoder) ?? fromUtf8,
    utf8Encoder: (config == null ? void 0 : config.utf8Encoder) ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/runtimeConfig.browser.js
var getRuntimeConfig2 = (config) => {
  const defaultsMode = resolveDefaultsModeConfig(config);
  const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
  const clientSharedValues = getRuntimeConfig(config);
  return {
    ...clientSharedValues,
    ...config,
    runtime: "browser",
    defaultsMode,
    bodyLengthChecker: (config == null ? void 0 : config.bodyLengthChecker) ?? calculateBodyLength,
    credentialDefaultProvider: (config == null ? void 0 : config.credentialDefaultProvider) ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
    defaultUserAgentProvider: (config == null ? void 0 : config.defaultUserAgentProvider) ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: package_default.version }),
    eventStreamPayloadHandlerProvider: (config == null ? void 0 : config.eventStreamPayloadHandlerProvider) ?? eventStreamPayloadHandlerProvider,
    eventStreamSerdeProvider: (config == null ? void 0 : config.eventStreamSerdeProvider) ?? eventStreamSerdeProvider,
    maxAttempts: (config == null ? void 0 : config.maxAttempts) ?? DEFAULT_MAX_ATTEMPTS,
    region: (config == null ? void 0 : config.region) ?? invalidProvider("Region is missing"),
    requestHandler: WebSocketFetchHandler.create((config == null ? void 0 : config.requestHandler) ?? defaultConfigProvider, FetchHttpHandler.create(defaultConfigProvider)),
    retryMode: (config == null ? void 0 : config.retryMode) ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
    sha256: (config == null ? void 0 : config.sha256) ?? Sha256,
    streamCollector: (config == null ? void 0 : config.streamCollector) ?? streamCollector,
    useDualstackEndpoint: (config == null ? void 0 : config.useDualstackEndpoint) ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
    useFipsEndpoint: (config == null ? void 0 : config.useFipsEndpoint) ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
  };
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
  let _token = runtimeConfig.token;
  return {
    setHttpAuthScheme(httpAuthScheme) {
      const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
      if (index === -1) {
        _httpAuthSchemes.push(httpAuthScheme);
      } else {
        _httpAuthSchemes.splice(index, 1, httpAuthScheme);
      }
    },
    httpAuthSchemes() {
      return _httpAuthSchemes;
    },
    setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
      _httpAuthSchemeProvider = httpAuthSchemeProvider;
    },
    httpAuthSchemeProvider() {
      return _httpAuthSchemeProvider;
    },
    setCredentials(credentials) {
      _credentials = credentials;
    },
    credentials() {
      return _credentials;
    },
    setToken(token) {
      _token = token;
    },
    token() {
      return _token;
    }
  };
};
var resolveHttpAuthRuntimeConfig = (config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials(),
    token: config.token()
  };
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/BedrockRuntimeClient.js
var BedrockRuntimeClient = class extends Client {
  constructor(...[configuration]) {
    const _config_0 = getRuntimeConfig2(configuration || {});
    super(_config_0);
    __publicField(this, "config");
    this.initConfig = _config_0;
    const _config_1 = resolveClientEndpointParameters(_config_0);
    const _config_2 = resolveUserAgentConfig(_config_1);
    const _config_3 = resolveRetryConfig(_config_2);
    const _config_4 = resolveRegionConfig(_config_3);
    const _config_5 = resolveHostHeaderConfig(_config_4);
    const _config_6 = resolveEndpointConfig(_config_5);
    const _config_7 = resolveEventStreamSerdeConfig(_config_6);
    const _config_8 = resolveHttpAuthSchemeConfig(_config_7);
    const _config_9 = resolveEventStreamConfig(_config_8);
    const _config_10 = resolveWebSocketConfig(_config_9);
    const _config_11 = resolveRuntimeExtensions(_config_10, (configuration == null ? void 0 : configuration.extensions) || []);
    this.config = _config_11;
    this.middlewareStack.use(getSchemaSerdePlugin(this.config));
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
    this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
      httpAuthSchemeParametersProvider: defaultBedrockRuntimeHttpAuthSchemeParametersProvider,
      identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
        "aws.auth#sigv4": config.credentials,
        "smithy.api#httpBearerAuth": config.token
      })
    }));
    this.middlewareStack.use(getHttpSigningPlugin(this.config));
  }
  destroy() {
    super.destroy();
  }
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/ApplyGuardrailCommand.js
var ApplyGuardrailCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "ApplyGuardrail", {}).n("BedrockRuntimeClient", "ApplyGuardrailCommand").sc(ApplyGuardrail$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/ConverseCommand.js
var ConverseCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "Converse", {}).n("BedrockRuntimeClient", "ConverseCommand").sc(Converse$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/ConverseStreamCommand.js
var ConverseStreamCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "ConverseStream", {
  eventStream: {
    output: true
  }
}).n("BedrockRuntimeClient", "ConverseStreamCommand").sc(ConverseStream$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/CountTokensCommand.js
var CountTokensCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "CountTokens", {}).n("BedrockRuntimeClient", "CountTokensCommand").sc(CountTokens$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/GetAsyncInvokeCommand.js
var GetAsyncInvokeCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "GetAsyncInvoke", {}).n("BedrockRuntimeClient", "GetAsyncInvokeCommand").sc(GetAsyncInvoke$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/InvokeModelCommand.js
var InvokeModelCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "InvokeModel", {}).n("BedrockRuntimeClient", "InvokeModelCommand").sc(InvokeModel$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/InvokeModelWithBidirectionalStreamCommand.js
var InvokeModelWithBidirectionalStreamCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [
    getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
    getEventStreamPlugin(config),
    getWebSocketPlugin(config, {
      headerPrefix: "x-amz-bedrock-"
    })
  ];
}).s("AmazonBedrockFrontendService", "InvokeModelWithBidirectionalStream", {
  eventStream: {
    input: true,
    output: true
  }
}).n("BedrockRuntimeClient", "InvokeModelWithBidirectionalStreamCommand").sc(InvokeModelWithBidirectionalStream$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/InvokeModelWithResponseStreamCommand.js
var InvokeModelWithResponseStreamCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "InvokeModelWithResponseStream", {
  eventStream: {
    output: true
  }
}).n("BedrockRuntimeClient", "InvokeModelWithResponseStreamCommand").sc(InvokeModelWithResponseStream$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/ListAsyncInvokesCommand.js
var ListAsyncInvokesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "ListAsyncInvokes", {}).n("BedrockRuntimeClient", "ListAsyncInvokesCommand").sc(ListAsyncInvokes$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/commands/StartAsyncInvokeCommand.js
var StartAsyncInvokeCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("AmazonBedrockFrontendService", "StartAsyncInvoke", {}).n("BedrockRuntimeClient", "StartAsyncInvokeCommand").sc(StartAsyncInvoke$).build() {
};

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/pagination/ListAsyncInvokesPaginator.js
var paginateListAsyncInvokes = createPaginator(BedrockRuntimeClient, ListAsyncInvokesCommand, "nextToken", "nextToken", "maxResults");

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/BedrockRuntime.js
var commands = {
  ApplyGuardrailCommand,
  ConverseCommand,
  ConverseStreamCommand,
  CountTokensCommand,
  GetAsyncInvokeCommand,
  InvokeModelCommand,
  InvokeModelWithBidirectionalStreamCommand,
  InvokeModelWithResponseStreamCommand,
  ListAsyncInvokesCommand,
  StartAsyncInvokeCommand
};
var paginators = {
  paginateListAsyncInvokes
};
var BedrockRuntime = class extends BedrockRuntimeClient {
};
createAggregatedClient(commands, BedrockRuntime, { paginators });

// node_modules/@aws-sdk/client-bedrock-runtime/dist-es/models/enums.js
var AsyncInvokeStatus = {
  COMPLETED: "Completed",
  FAILED: "Failed",
  IN_PROGRESS: "InProgress"
};
var SortAsyncInvocationBy = {
  SUBMISSION_TIME: "SubmissionTime"
};
var SortOrder = {
  ASCENDING: "Ascending",
  DESCENDING: "Descending"
};
var GuardrailImageFormat = {
  JPEG: "jpeg",
  PNG: "png"
};
var GuardrailContentQualifier = {
  GROUNDING_SOURCE: "grounding_source",
  GUARD_CONTENT: "guard_content",
  QUERY: "query"
};
var GuardrailOutputScope = {
  FULL: "FULL",
  INTERVENTIONS: "INTERVENTIONS"
};
var GuardrailContentSource = {
  INPUT: "INPUT",
  OUTPUT: "OUTPUT"
};
var GuardrailAction = {
  GUARDRAIL_INTERVENED: "GUARDRAIL_INTERVENED",
  NONE: "NONE"
};
var GuardrailOrigin = {
  ACCOUNT_ENFORCED: "ACCOUNT_ENFORCED",
  ORGANIZATION_ENFORCED: "ORGANIZATION_ENFORCED",
  REQUEST: "REQUEST"
};
var GuardrailOwnership = {
  CROSS_ACCOUNT: "CROSS_ACCOUNT",
  SELF: "SELF"
};
var GuardrailAutomatedReasoningLogicWarningType = {
  ALWAYS_FALSE: "ALWAYS_FALSE",
  ALWAYS_TRUE: "ALWAYS_TRUE"
};
var GuardrailContentPolicyAction = {
  BLOCKED: "BLOCKED",
  NONE: "NONE"
};
var GuardrailContentFilterConfidence = {
  HIGH: "HIGH",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  NONE: "NONE"
};
var GuardrailContentFilterStrength = {
  HIGH: "HIGH",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  NONE: "NONE"
};
var GuardrailContentFilterType = {
  HATE: "HATE",
  INSULTS: "INSULTS",
  MISCONDUCT: "MISCONDUCT",
  PROMPT_ATTACK: "PROMPT_ATTACK",
  SEXUAL: "SEXUAL",
  VIOLENCE: "VIOLENCE"
};
var GuardrailContextualGroundingPolicyAction = {
  BLOCKED: "BLOCKED",
  NONE: "NONE"
};
var GuardrailContextualGroundingFilterType = {
  GROUNDING: "GROUNDING",
  RELEVANCE: "RELEVANCE"
};
var GuardrailSensitiveInformationPolicyAction = {
  ANONYMIZED: "ANONYMIZED",
  BLOCKED: "BLOCKED",
  NONE: "NONE"
};
var GuardrailPiiEntityType = {
  ADDRESS: "ADDRESS",
  AGE: "AGE",
  AWS_ACCESS_KEY: "AWS_ACCESS_KEY",
  AWS_SECRET_KEY: "AWS_SECRET_KEY",
  CA_HEALTH_NUMBER: "CA_HEALTH_NUMBER",
  CA_SOCIAL_INSURANCE_NUMBER: "CA_SOCIAL_INSURANCE_NUMBER",
  CREDIT_DEBIT_CARD_CVV: "CREDIT_DEBIT_CARD_CVV",
  CREDIT_DEBIT_CARD_EXPIRY: "CREDIT_DEBIT_CARD_EXPIRY",
  CREDIT_DEBIT_CARD_NUMBER: "CREDIT_DEBIT_CARD_NUMBER",
  DRIVER_ID: "DRIVER_ID",
  EMAIL: "EMAIL",
  INTERNATIONAL_BANK_ACCOUNT_NUMBER: "INTERNATIONAL_BANK_ACCOUNT_NUMBER",
  IP_ADDRESS: "IP_ADDRESS",
  LICENSE_PLATE: "LICENSE_PLATE",
  MAC_ADDRESS: "MAC_ADDRESS",
  NAME: "NAME",
  PASSWORD: "PASSWORD",
  PHONE: "PHONE",
  PIN: "PIN",
  SWIFT_CODE: "SWIFT_CODE",
  UK_NATIONAL_HEALTH_SERVICE_NUMBER: "UK_NATIONAL_HEALTH_SERVICE_NUMBER",
  UK_NATIONAL_INSURANCE_NUMBER: "UK_NATIONAL_INSURANCE_NUMBER",
  UK_UNIQUE_TAXPAYER_REFERENCE_NUMBER: "UK_UNIQUE_TAXPAYER_REFERENCE_NUMBER",
  URL: "URL",
  USERNAME: "USERNAME",
  US_BANK_ACCOUNT_NUMBER: "US_BANK_ACCOUNT_NUMBER",
  US_BANK_ROUTING_NUMBER: "US_BANK_ROUTING_NUMBER",
  US_INDIVIDUAL_TAX_IDENTIFICATION_NUMBER: "US_INDIVIDUAL_TAX_IDENTIFICATION_NUMBER",
  US_PASSPORT_NUMBER: "US_PASSPORT_NUMBER",
  US_SOCIAL_SECURITY_NUMBER: "US_SOCIAL_SECURITY_NUMBER",
  VEHICLE_IDENTIFICATION_NUMBER: "VEHICLE_IDENTIFICATION_NUMBER"
};
var GuardrailTopicPolicyAction = {
  BLOCKED: "BLOCKED",
  NONE: "NONE"
};
var GuardrailTopicType = {
  DENY: "DENY"
};
var GuardrailWordPolicyAction = {
  BLOCKED: "BLOCKED",
  NONE: "NONE"
};
var GuardrailManagedWordType = {
  PROFANITY: "PROFANITY"
};
var GuardrailTrace = {
  DISABLED: "disabled",
  ENABLED: "enabled",
  ENABLED_FULL: "enabled_full"
};
var AudioFormat = {
  AAC: "aac",
  FLAC: "flac",
  M4A: "m4a",
  MKA: "mka",
  MKV: "mkv",
  MP3: "mp3",
  MP4: "mp4",
  MPEG: "mpeg",
  MPGA: "mpga",
  OGG: "ogg",
  OPUS: "opus",
  PCM: "pcm",
  WAV: "wav",
  WEBM: "webm",
  X_AAC: "x-aac"
};
var CacheTTL = {
  FIVE_MINUTES: "5m",
  ONE_HOUR: "1h"
};
var CachePointType = {
  DEFAULT: "default"
};
var DocumentFormat = {
  CSV: "csv",
  DOC: "doc",
  DOCX: "docx",
  HTML: "html",
  MD: "md",
  PDF: "pdf",
  TXT: "txt",
  XLS: "xls",
  XLSX: "xlsx"
};
var GuardrailConverseImageFormat = {
  JPEG: "jpeg",
  PNG: "png"
};
var GuardrailConverseContentQualifier = {
  GROUNDING_SOURCE: "grounding_source",
  GUARD_CONTENT: "guard_content",
  QUERY: "query"
};
var ImageFormat = {
  GIF: "gif",
  JPEG: "jpeg",
  PNG: "png",
  WEBP: "webp"
};
var VideoFormat = {
  FLV: "flv",
  MKV: "mkv",
  MOV: "mov",
  MP4: "mp4",
  MPEG: "mpeg",
  MPG: "mpg",
  THREE_GP: "three_gp",
  WEBM: "webm",
  WMV: "wmv"
};
var ToolResultStatus = {
  ERROR: "error",
  SUCCESS: "success"
};
var ToolUseType = {
  SERVER_TOOL_USE: "server_tool_use"
};
var ConversationRole = {
  ASSISTANT: "assistant",
  USER: "user"
};
var OutputFormatType = {
  JSON_SCHEMA: "json_schema"
};
var PerformanceConfigLatency = {
  OPTIMIZED: "optimized",
  STANDARD: "standard"
};
var ServiceTierType = {
  DEFAULT: "default",
  FLEX: "flex",
  PRIORITY: "priority",
  RESERVED: "reserved"
};
var StopReason = {
  CONTENT_FILTERED: "content_filtered",
  END_TURN: "end_turn",
  GUARDRAIL_INTERVENED: "guardrail_intervened",
  MALFORMED_MODEL_OUTPUT: "malformed_model_output",
  MALFORMED_TOOL_USE: "malformed_tool_use",
  MAX_TOKENS: "max_tokens",
  MODEL_CONTEXT_WINDOW_EXCEEDED: "model_context_window_exceeded",
  STOP_SEQUENCE: "stop_sequence",
  TOOL_USE: "tool_use"
};
var GuardrailStreamProcessingMode = {
  ASYNC: "async",
  SYNC: "sync"
};
var Trace = {
  DISABLED: "DISABLED",
  ENABLED: "ENABLED",
  ENABLED_FULL: "ENABLED_FULL"
};
export {
  Command as $Command,
  AccessDeniedException,
  AccessDeniedException$,
  AnyToolChoice$,
  AppliedGuardrailDetails$,
  ApplyGuardrail$,
  ApplyGuardrailCommand,
  ApplyGuardrailRequest$,
  ApplyGuardrailResponse$,
  AsyncInvokeOutputDataConfig$,
  AsyncInvokeS3OutputDataConfig$,
  AsyncInvokeStatus,
  AsyncInvokeSummary$,
  AudioBlock$,
  AudioFormat,
  AudioSource$,
  AutoToolChoice$,
  BedrockRuntime,
  BedrockRuntimeClient,
  BedrockRuntimeServiceException,
  BedrockRuntimeServiceException$,
  BidirectionalInputPayloadPart$,
  BidirectionalOutputPayloadPart$,
  CacheDetail$,
  CachePointBlock$,
  CachePointType,
  CacheTTL,
  Citation$,
  CitationGeneratedContent$,
  CitationLocation$,
  CitationSourceContent$,
  CitationSourceContentDelta$,
  CitationsConfig$,
  CitationsContentBlock$,
  CitationsDelta$,
  ConflictException,
  ConflictException$,
  ContentBlock$,
  ContentBlockDelta$,
  ContentBlockDeltaEvent$,
  ContentBlockStart$,
  ContentBlockStartEvent$,
  ContentBlockStopEvent$,
  ConversationRole,
  Converse$,
  ConverseCommand,
  ConverseMetrics$,
  ConverseOutput$,
  ConverseRequest$,
  ConverseResponse$,
  ConverseStream$,
  ConverseStreamCommand,
  ConverseStreamMetadataEvent$,
  ConverseStreamMetrics$,
  ConverseStreamOutput$,
  ConverseStreamRequest$,
  ConverseStreamResponse$,
  ConverseStreamTrace$,
  ConverseTokensRequest$,
  ConverseTrace$,
  CountTokens$,
  CountTokensCommand,
  CountTokensInput$,
  CountTokensRequest$,
  CountTokensResponse$,
  DocumentBlock$,
  DocumentCharLocation$,
  DocumentChunkLocation$,
  DocumentContentBlock$,
  DocumentFormat,
  DocumentPageLocation$,
  DocumentSource$,
  ErrorBlock$,
  GetAsyncInvoke$,
  GetAsyncInvokeCommand,
  GetAsyncInvokeRequest$,
  GetAsyncInvokeResponse$,
  GuardrailAction,
  GuardrailAssessment$,
  GuardrailAutomatedReasoningFinding$,
  GuardrailAutomatedReasoningImpossibleFinding$,
  GuardrailAutomatedReasoningInputTextReference$,
  GuardrailAutomatedReasoningInvalidFinding$,
  GuardrailAutomatedReasoningLogicWarning$,
  GuardrailAutomatedReasoningLogicWarningType,
  GuardrailAutomatedReasoningNoTranslationsFinding$,
  GuardrailAutomatedReasoningPolicyAssessment$,
  GuardrailAutomatedReasoningRule$,
  GuardrailAutomatedReasoningSatisfiableFinding$,
  GuardrailAutomatedReasoningScenario$,
  GuardrailAutomatedReasoningStatement$,
  GuardrailAutomatedReasoningTooComplexFinding$,
  GuardrailAutomatedReasoningTranslation$,
  GuardrailAutomatedReasoningTranslationAmbiguousFinding$,
  GuardrailAutomatedReasoningTranslationOption$,
  GuardrailAutomatedReasoningValidFinding$,
  GuardrailConfiguration$,
  GuardrailContentBlock$,
  GuardrailContentFilter$,
  GuardrailContentFilterConfidence,
  GuardrailContentFilterStrength,
  GuardrailContentFilterType,
  GuardrailContentPolicyAction,
  GuardrailContentPolicyAssessment$,
  GuardrailContentQualifier,
  GuardrailContentSource,
  GuardrailContextualGroundingFilter$,
  GuardrailContextualGroundingFilterType,
  GuardrailContextualGroundingPolicyAction,
  GuardrailContextualGroundingPolicyAssessment$,
  GuardrailConverseContentBlock$,
  GuardrailConverseContentQualifier,
  GuardrailConverseImageBlock$,
  GuardrailConverseImageFormat,
  GuardrailConverseImageSource$,
  GuardrailConverseTextBlock$,
  GuardrailCoverage$,
  GuardrailCustomWord$,
  GuardrailImageBlock$,
  GuardrailImageCoverage$,
  GuardrailImageFormat,
  GuardrailImageSource$,
  GuardrailInvocationMetrics$,
  GuardrailManagedWord$,
  GuardrailManagedWordType,
  GuardrailOrigin,
  GuardrailOutputContent$,
  GuardrailOutputScope,
  GuardrailOwnership,
  GuardrailPiiEntityFilter$,
  GuardrailPiiEntityType,
  GuardrailRegexFilter$,
  GuardrailSensitiveInformationPolicyAction,
  GuardrailSensitiveInformationPolicyAssessment$,
  GuardrailStreamConfiguration$,
  GuardrailStreamProcessingMode,
  GuardrailTextBlock$,
  GuardrailTextCharactersCoverage$,
  GuardrailTopic$,
  GuardrailTopicPolicyAction,
  GuardrailTopicPolicyAssessment$,
  GuardrailTopicType,
  GuardrailTrace,
  GuardrailTraceAssessment$,
  GuardrailUsage$,
  GuardrailWordPolicyAction,
  GuardrailWordPolicyAssessment$,
  ImageBlock$,
  ImageBlockDelta$,
  ImageBlockStart$,
  ImageFormat,
  ImageSource$,
  InferenceConfiguration$,
  InternalServerException,
  InternalServerException$,
  InvokeModel$,
  InvokeModelCommand,
  InvokeModelRequest$,
  InvokeModelResponse$,
  InvokeModelTokensRequest$,
  InvokeModelWithBidirectionalStream$,
  InvokeModelWithBidirectionalStreamCommand,
  InvokeModelWithBidirectionalStreamInput$,
  InvokeModelWithBidirectionalStreamOutput$,
  InvokeModelWithBidirectionalStreamRequest$,
  InvokeModelWithBidirectionalStreamResponse$,
  InvokeModelWithResponseStream$,
  InvokeModelWithResponseStreamCommand,
  InvokeModelWithResponseStreamRequest$,
  InvokeModelWithResponseStreamResponse$,
  JsonSchemaDefinition$,
  ListAsyncInvokes$,
  ListAsyncInvokesCommand,
  ListAsyncInvokesRequest$,
  ListAsyncInvokesResponse$,
  Message$,
  MessageStartEvent$,
  MessageStopEvent$,
  ModelErrorException,
  ModelErrorException$,
  ModelNotReadyException,
  ModelNotReadyException$,
  ModelStreamErrorException,
  ModelStreamErrorException$,
  ModelTimeoutException,
  ModelTimeoutException$,
  OutputConfig$,
  OutputFormat$,
  OutputFormatStructure$,
  OutputFormatType,
  PayloadPart$,
  PerformanceConfigLatency,
  PerformanceConfiguration$,
  PromptRouterTrace$,
  PromptVariableValues$,
  ReasoningContentBlock$,
  ReasoningContentBlockDelta$,
  ReasoningTextBlock$,
  ResourceNotFoundException,
  ResourceNotFoundException$,
  ResponseStream$,
  S3Location$,
  SearchResultBlock$,
  SearchResultContentBlock$,
  SearchResultLocation$,
  ServiceQuotaExceededException,
  ServiceQuotaExceededException$,
  ServiceTier$,
  ServiceTierType,
  ServiceUnavailableException,
  ServiceUnavailableException$,
  SortAsyncInvocationBy,
  SortOrder,
  SpecificToolChoice$,
  StartAsyncInvoke$,
  StartAsyncInvokeCommand,
  StartAsyncInvokeRequest$,
  StartAsyncInvokeResponse$,
  StopReason,
  SystemContentBlock$,
  SystemTool$,
  Tag$,
  ThrottlingException,
  ThrottlingException$,
  TokenUsage$,
  Tool$,
  ToolChoice$,
  ToolConfiguration$,
  ToolInputSchema$,
  ToolResultBlock$,
  ToolResultBlockDelta$,
  ToolResultBlockStart$,
  ToolResultContentBlock$,
  ToolResultStatus,
  ToolSpecification$,
  ToolUseBlock$,
  ToolUseBlockDelta$,
  ToolUseBlockStart$,
  ToolUseType,
  Trace,
  ValidationException,
  ValidationException$,
  VideoBlock$,
  VideoFormat,
  VideoSource$,
  WebLocation$,
  Client as __Client,
  errorTypeRegistries,
  paginateListAsyncInvokes
};
//# sourceMappingURL=@aws-sdk_client-bedrock-runtime.js.map
