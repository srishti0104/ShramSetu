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
  NoOpLogger,
  ServiceException,
  TypeRegistry,
  calculateBodyLength,
  createAggregatedClient,
  createPaginator,
  fromBase64,
  getDefaultExtensionConfiguration,
  getEndpointPlugin,
  getHttpAuthSchemeEndpointRuleSetPlugin,
  getHttpHandlerExtensionConfiguration,
  getHttpSigningPlugin,
  getSchemaSerdePlugin,
  getSmithyContext,
  loadConfigsForDefaultMode,
  normalizeProvider,
  parseUrl,
  resolveAwsSdkSigV4Config,
  resolveDefaultRuntimeConfig,
  resolveEndpointConfig,
  resolveHttpHandlerRuntimeConfig,
  sdkStreamMixin,
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

// node_modules/@aws-sdk/client-polly/dist-es/auth/httpAuthSchemeProvider.js
var defaultPollyHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
      name: "polly",
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
var defaultPollyHttpAuthSchemeProvider = (authParameters) => {
  const options = [];
  switch (authParameters.operation) {
    default: {
      options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
    }
  }
  return options;
};
var resolveHttpAuthSchemeConfig = (config) => {
  const config_0 = resolveAwsSdkSigV4Config(config);
  return Object.assign(config_0, {
    authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
  });
};

// node_modules/@aws-sdk/client-polly/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "polly"
  });
};
var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-polly/package.json
var package_default = {
  name: "@aws-sdk/client-polly",
  description: "AWS SDK for JavaScript Polly Client for Node.js, Browser and React Native",
  version: "3.995.0",
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline client-polly",
    "build:es": "tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service --solo polly",
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
    "@aws-sdk/middleware-host-header": "^3.972.3",
    "@aws-sdk/middleware-logger": "^3.972.3",
    "@aws-sdk/middleware-recursion-detection": "^3.972.3",
    "@aws-sdk/middleware-user-agent": "^3.972.11",
    "@aws-sdk/region-config-resolver": "^3.972.3",
    "@aws-sdk/types": "^3.973.1",
    "@aws-sdk/util-endpoints": "3.995.0",
    "@aws-sdk/util-user-agent-browser": "^3.972.3",
    "@aws-sdk/util-user-agent-node": "^3.972.10",
    "@smithy/config-resolver": "^4.4.6",
    "@smithy/core": "^3.23.2",
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
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-polly",
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-polly"
  }
};

// node_modules/@aws-sdk/client-polly/dist-es/endpoint/ruleset.js
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
var _data = { version: "1.0", parameters: { Region: h, UseDualStack: i, UseFIPS: i, Endpoint: h }, rules: [{ conditions: [{ [t]: b, [u]: [j] }], rules: [{ conditions: p, error: "Invalid Configuration: FIPS and custom endpoint are not supported", type: d }, { conditions: q, error: "Invalid Configuration: Dualstack and custom endpoint are not supported", type: d }, { endpoint: { url: j, properties: m, headers: m }, type: e }], type: f }, { conditions: [{ [t]: b, [u]: r }], rules: [{ conditions: [{ [t]: "aws.partition", [u]: r, assign: g }], rules: [{ conditions: [k, l], rules: [{ conditions: [{ [t]: c, [u]: [a, n] }, o], rules: [{ endpoint: { url: "https://polly-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "FIPS and DualStack are enabled, but this partition does not support one or both", type: d }], type: f }, { conditions: p, rules: [{ conditions: [{ [t]: c, [u]: [n, a] }], rules: [{ endpoint: { url: "https://polly-fips.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "FIPS is enabled but this partition does not support FIPS", type: d }], type: f }, { conditions: q, rules: [{ conditions: [o], rules: [{ endpoint: { url: "https://polly.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "DualStack is enabled but this partition does not support DualStack", type: d }], type: f }, { endpoint: { url: "https://polly.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }, { error: "Invalid Configuration: Missing Region", type: d }] };
var ruleSet = _data;

// node_modules/@aws-sdk/client-polly/dist-es/endpoint/endpointResolver.js
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

// node_modules/@aws-sdk/client-polly/dist-es/models/PollyServiceException.js
var PollyServiceException = class _PollyServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _PollyServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-polly/dist-es/models/errors.js
var LexiconNotFoundException = class _LexiconNotFoundException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "LexiconNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "LexiconNotFoundException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _LexiconNotFoundException.prototype);
  }
};
var ServiceFailureException = class _ServiceFailureException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "ServiceFailureException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "ServiceFailureException");
    __publicField(this, "$fault", "server");
    Object.setPrototypeOf(this, _ServiceFailureException.prototype);
  }
};
var InvalidNextTokenException = class _InvalidNextTokenException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidNextTokenException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidNextTokenException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidNextTokenException.prototype);
  }
};
var EngineNotSupportedException = class _EngineNotSupportedException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "EngineNotSupportedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "EngineNotSupportedException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _EngineNotSupportedException.prototype);
  }
};
var InvalidTaskIdException = class _InvalidTaskIdException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidTaskIdException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidTaskIdException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidTaskIdException.prototype);
  }
};
var SynthesisTaskNotFoundException = class _SynthesisTaskNotFoundException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "SynthesisTaskNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SynthesisTaskNotFoundException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _SynthesisTaskNotFoundException.prototype);
  }
};
var InvalidLexiconException = class _InvalidLexiconException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidLexiconException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidLexiconException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidLexiconException.prototype);
  }
};
var InvalidS3BucketException = class _InvalidS3BucketException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidS3BucketException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidS3BucketException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidS3BucketException.prototype);
  }
};
var InvalidS3KeyException = class _InvalidS3KeyException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidS3KeyException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidS3KeyException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidS3KeyException.prototype);
  }
};
var InvalidSampleRateException = class _InvalidSampleRateException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidSampleRateException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidSampleRateException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidSampleRateException.prototype);
  }
};
var InvalidSnsTopicArnException = class _InvalidSnsTopicArnException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidSnsTopicArnException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidSnsTopicArnException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidSnsTopicArnException.prototype);
  }
};
var InvalidSsmlException = class _InvalidSsmlException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "InvalidSsmlException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "InvalidSsmlException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _InvalidSsmlException.prototype);
  }
};
var LanguageNotSupportedException = class _LanguageNotSupportedException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "LanguageNotSupportedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "LanguageNotSupportedException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _LanguageNotSupportedException.prototype);
  }
};
var LexiconSizeExceededException = class _LexiconSizeExceededException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "LexiconSizeExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "LexiconSizeExceededException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _LexiconSizeExceededException.prototype);
  }
};
var MarksNotSupportedForFormatException = class _MarksNotSupportedForFormatException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "MarksNotSupportedForFormatException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "MarksNotSupportedForFormatException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _MarksNotSupportedForFormatException.prototype);
  }
};
var MaxLexemeLengthExceededException = class _MaxLexemeLengthExceededException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "MaxLexemeLengthExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "MaxLexemeLengthExceededException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _MaxLexemeLengthExceededException.prototype);
  }
};
var MaxLexiconsNumberExceededException = class _MaxLexiconsNumberExceededException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "MaxLexiconsNumberExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "MaxLexiconsNumberExceededException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _MaxLexiconsNumberExceededException.prototype);
  }
};
var UnsupportedPlsAlphabetException = class _UnsupportedPlsAlphabetException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "UnsupportedPlsAlphabetException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "UnsupportedPlsAlphabetException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _UnsupportedPlsAlphabetException.prototype);
  }
};
var UnsupportedPlsLanguageException = class _UnsupportedPlsLanguageException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "UnsupportedPlsLanguageException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "UnsupportedPlsLanguageException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _UnsupportedPlsLanguageException.prototype);
  }
};
var SsmlMarksNotSupportedForTextTypeException = class _SsmlMarksNotSupportedForTextTypeException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "SsmlMarksNotSupportedForTextTypeException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "SsmlMarksNotSupportedForTextTypeException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _SsmlMarksNotSupportedForTextTypeException.prototype);
  }
};
var TextLengthExceededException = class _TextLengthExceededException extends PollyServiceException {
  constructor(opts) {
    super({
      name: "TextLengthExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "TextLengthExceededException");
    __publicField(this, "$fault", "client");
    Object.setPrototypeOf(this, _TextLengthExceededException.prototype);
  }
};

// node_modules/@aws-sdk/client-polly/dist-es/schemas/schemas_0.js
var _A = "Alphabet";
var _ALC = "AdditionalLanguageCodes";
var _AS = "AudioStream";
var _At = "Attributes";
var _C = "Content";
var _CT = "CreationTime";
var _CT_ = "Content-Type";
var _CTo = "ContentType";
var _DL = "DeleteLexicon";
var _DLI = "DeleteLexiconInput";
var _DLO = "DeleteLexiconOutput";
var _DV = "DescribeVoices";
var _DVI = "DescribeVoicesInput";
var _DVO = "DescribeVoicesOutput";
var _E = "Engine";
var _ENSE = "EngineNotSupportedException";
var _G = "Gender";
var _GL = "GetLexicon";
var _GLI = "GetLexiconInput";
var _GLO = "GetLexiconOutput";
var _GSST = "GetSpeechSynthesisTask";
var _GSSTI = "GetSpeechSynthesisTaskInput";
var _GSSTO = "GetSpeechSynthesisTaskOutput";
var _I = "Id";
var _IALC = "IncludeAdditionalLanguageCodes";
var _ILE = "InvalidLexiconException";
var _INTE = "InvalidNextTokenException";
var _ISBE = "InvalidS3BucketException";
var _ISE = "InvalidSsmlException";
var _ISKE = "InvalidS3KeyException";
var _ISRE = "InvalidSampleRateException";
var _ISTAE = "InvalidSnsTopicArnException";
var _ITIE = "InvalidTaskIdException";
var _L = "Lexicon";
var _LA = "LexiconAttributes";
var _LAe = "LexiconArn";
var _LC = "LexiconContent";
var _LCa = "LanguageCode";
var _LCe = "LexemesCount";
var _LD = "LexiconDescription";
var _LDL = "LexiconDescriptionList";
var _LL = "ListLexicons";
var _LLI = "ListLexiconsInput";
var _LLO = "ListLexiconsOutput";
var _LM = "LastModified";
var _LN = "LexiconNames";
var _LNFE = "LexiconNotFoundException";
var _LNSE = "LanguageNotSupportedException";
var _LNa = "LanguageName";
var _LSEE = "LexiconSizeExceededException";
var _LSST = "ListSpeechSynthesisTasks";
var _LSSTI = "ListSpeechSynthesisTasksInput";
var _LSSTO = "ListSpeechSynthesisTasksOutput";
var _Le = "Lexicons";
var _MLLEE = "MaxLexemeLengthExceededException";
var _MLNEE = "MaxLexiconsNumberExceededException";
var _MNSFFE = "MarksNotSupportedForFormatException";
var _MR = "MaxResults";
var _N = "Name";
var _NT = "NextToken";
var _OF = "OutputFormat";
var _OSBN = "OutputS3BucketName";
var _OSKP = "OutputS3KeyPrefix";
var _OU = "OutputUri";
var _PL = "PutLexicon";
var _PLI = "PutLexiconInput";
var _PLO = "PutLexiconOutput";
var _RC = "RequestCharacters";
var _S = "Size";
var _SE = "SupportedEngines";
var _SFE = "ServiceFailureException";
var _SMNSFTTE = "SsmlMarksNotSupportedForTextTypeException";
var _SMT = "SpeechMarkTypes";
var _SR = "SampleRate";
var _SS = "SynthesizeSpeech";
var _SSI = "SynthesizeSpeechInput";
var _SSO = "SynthesizeSpeechOutput";
var _SSST = "StartSpeechSynthesisTask";
var _SSSTI = "StartSpeechSynthesisTaskInput";
var _SSSTO = "StartSpeechSynthesisTaskOutput";
var _ST = "SynthesisTask";
var _STA = "SnsTopicArn";
var _STNFE = "SynthesisTaskNotFoundException";
var _STy = "SynthesisTasks";
var _St = "Status";
var _T = "Text";
var _TI = "TaskId";
var _TLEE = "TextLengthExceededException";
var _TS = "TaskStatus";
var _TSR = "TaskStatusReason";
var _TT = "TextType";
var _UPAE = "UnsupportedPlsAlphabetException";
var _UPLE = "UnsupportedPlsLanguageException";
var _V = "Voices";
var _VI = "VoiceId";
var _VL = "VoiceList";
var _Vo = "Voice";
var _c = "client";
var _e = "error";
var _h = "http";
var _hE = "httpError";
var _hH = "httpHeader";
var _hQ = "httpQuery";
var _m = "message";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.polly";
var _se = "server";
var _st = "streaming";
var _xaR = "x-amzn-RequestCharacters";
var n0 = "com.amazonaws.polly";
var _s_registry = TypeRegistry.for(_s);
var PollyServiceException$ = [-3, _s, "PollyServiceException", 0, [], []];
_s_registry.registerError(PollyServiceException$, PollyServiceException);
var n0_registry = TypeRegistry.for(n0);
var EngineNotSupportedException$ = [
  -3,
  n0,
  _ENSE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(EngineNotSupportedException$, EngineNotSupportedException);
var InvalidLexiconException$ = [
  -3,
  n0,
  _ILE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidLexiconException$, InvalidLexiconException);
var InvalidNextTokenException$ = [
  -3,
  n0,
  _INTE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidNextTokenException$, InvalidNextTokenException);
var InvalidS3BucketException$ = [
  -3,
  n0,
  _ISBE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidS3BucketException$, InvalidS3BucketException);
var InvalidS3KeyException$ = [
  -3,
  n0,
  _ISKE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidS3KeyException$, InvalidS3KeyException);
var InvalidSampleRateException$ = [
  -3,
  n0,
  _ISRE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidSampleRateException$, InvalidSampleRateException);
var InvalidSnsTopicArnException$ = [
  -3,
  n0,
  _ISTAE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidSnsTopicArnException$, InvalidSnsTopicArnException);
var InvalidSsmlException$ = [
  -3,
  n0,
  _ISE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidSsmlException$, InvalidSsmlException);
var InvalidTaskIdException$ = [
  -3,
  n0,
  _ITIE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(InvalidTaskIdException$, InvalidTaskIdException);
var LanguageNotSupportedException$ = [
  -3,
  n0,
  _LNSE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(LanguageNotSupportedException$, LanguageNotSupportedException);
var LexiconNotFoundException$ = [
  -3,
  n0,
  _LNFE,
  { [_e]: _c, [_hE]: 404 },
  [_m],
  [0]
];
n0_registry.registerError(LexiconNotFoundException$, LexiconNotFoundException);
var LexiconSizeExceededException$ = [
  -3,
  n0,
  _LSEE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(LexiconSizeExceededException$, LexiconSizeExceededException);
var MarksNotSupportedForFormatException$ = [
  -3,
  n0,
  _MNSFFE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(MarksNotSupportedForFormatException$, MarksNotSupportedForFormatException);
var MaxLexemeLengthExceededException$ = [
  -3,
  n0,
  _MLLEE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(MaxLexemeLengthExceededException$, MaxLexemeLengthExceededException);
var MaxLexiconsNumberExceededException$ = [
  -3,
  n0,
  _MLNEE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(MaxLexiconsNumberExceededException$, MaxLexiconsNumberExceededException);
var ServiceFailureException$ = [
  -3,
  n0,
  _SFE,
  { [_e]: _se, [_hE]: 500 },
  [_m],
  [0]
];
n0_registry.registerError(ServiceFailureException$, ServiceFailureException);
var SsmlMarksNotSupportedForTextTypeException$ = [
  -3,
  n0,
  _SMNSFTTE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(SsmlMarksNotSupportedForTextTypeException$, SsmlMarksNotSupportedForTextTypeException);
var SynthesisTaskNotFoundException$ = [
  -3,
  n0,
  _STNFE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(SynthesisTaskNotFoundException$, SynthesisTaskNotFoundException);
var TextLengthExceededException$ = [
  -3,
  n0,
  _TLEE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(TextLengthExceededException$, TextLengthExceededException);
var UnsupportedPlsAlphabetException$ = [
  -3,
  n0,
  _UPAE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(UnsupportedPlsAlphabetException$, UnsupportedPlsAlphabetException);
var UnsupportedPlsLanguageException$ = [
  -3,
  n0,
  _UPLE,
  { [_e]: _c, [_hE]: 400 },
  [_m],
  [0]
];
n0_registry.registerError(UnsupportedPlsLanguageException$, UnsupportedPlsLanguageException);
var errorTypeRegistries = [
  _s_registry,
  n0_registry
];
var AudioStream = [0, n0, _AS, { [_st]: 1 }, 42];
var LexiconContent = [0, n0, _LC, 8, 0];
var DeleteLexiconInput$ = [
  3,
  n0,
  _DLI,
  0,
  [_N],
  [[0, 1]],
  1
];
var DeleteLexiconOutput$ = [
  3,
  n0,
  _DLO,
  0,
  [],
  []
];
var DescribeVoicesInput$ = [
  3,
  n0,
  _DVI,
  0,
  [_E, _LCa, _IALC, _NT],
  [[0, { [_hQ]: _E }], [0, { [_hQ]: _LCa }], [2, { [_hQ]: _IALC }], [0, { [_hQ]: _NT }]]
];
var DescribeVoicesOutput$ = [
  3,
  n0,
  _DVO,
  0,
  [_V, _NT],
  [() => VoiceList, 0]
];
var GetLexiconInput$ = [
  3,
  n0,
  _GLI,
  0,
  [_N],
  [[0, 1]],
  1
];
var GetLexiconOutput$ = [
  3,
  n0,
  _GLO,
  0,
  [_L, _LA],
  [[() => Lexicon$, 0], () => LexiconAttributes$]
];
var GetSpeechSynthesisTaskInput$ = [
  3,
  n0,
  _GSSTI,
  0,
  [_TI],
  [[0, 1]],
  1
];
var GetSpeechSynthesisTaskOutput$ = [
  3,
  n0,
  _GSSTO,
  0,
  [_ST],
  [() => SynthesisTask$]
];
var Lexicon$ = [
  3,
  n0,
  _L,
  0,
  [_C, _N],
  [[() => LexiconContent, 0], 0]
];
var LexiconAttributes$ = [
  3,
  n0,
  _LA,
  0,
  [_A, _LCa, _LM, _LAe, _LCe, _S],
  [0, 0, 4, 0, 1, 1]
];
var LexiconDescription$ = [
  3,
  n0,
  _LD,
  0,
  [_N, _At],
  [0, () => LexiconAttributes$]
];
var ListLexiconsInput$ = [
  3,
  n0,
  _LLI,
  0,
  [_NT],
  [[0, { [_hQ]: _NT }]]
];
var ListLexiconsOutput$ = [
  3,
  n0,
  _LLO,
  0,
  [_Le, _NT],
  [() => LexiconDescriptionList, 0]
];
var ListSpeechSynthesisTasksInput$ = [
  3,
  n0,
  _LSSTI,
  0,
  [_MR, _NT, _St],
  [[1, { [_hQ]: _MR }], [0, { [_hQ]: _NT }], [0, { [_hQ]: _St }]]
];
var ListSpeechSynthesisTasksOutput$ = [
  3,
  n0,
  _LSSTO,
  0,
  [_NT, _STy],
  [0, () => SynthesisTasks]
];
var PutLexiconInput$ = [
  3,
  n0,
  _PLI,
  0,
  [_N, _C],
  [[0, 1], [() => LexiconContent, 0]],
  2
];
var PutLexiconOutput$ = [
  3,
  n0,
  _PLO,
  0,
  [],
  []
];
var StartSpeechSynthesisTaskInput$ = [
  3,
  n0,
  _SSSTI,
  0,
  [_OF, _OSBN, _T, _VI, _E, _LCa, _LN, _OSKP, _SR, _STA, _SMT, _TT],
  [0, 0, 0, 0, 0, 0, 64 | 0, 0, 0, 0, 64 | 0, 0],
  4
];
var StartSpeechSynthesisTaskOutput$ = [
  3,
  n0,
  _SSSTO,
  0,
  [_ST],
  [() => SynthesisTask$]
];
var SynthesisTask$ = [
  3,
  n0,
  _ST,
  0,
  [_E, _TI, _TS, _TSR, _OU, _CT, _RC, _STA, _LN, _OF, _SR, _SMT, _TT, _VI, _LCa],
  [0, 0, 0, 0, 0, 4, 1, 0, 64 | 0, 0, 0, 64 | 0, 0, 0, 0]
];
var SynthesizeSpeechInput$ = [
  3,
  n0,
  _SSI,
  0,
  [_OF, _T, _VI, _E, _LCa, _LN, _SR, _SMT, _TT],
  [0, 0, 0, 0, 0, 64 | 0, 0, 64 | 0, 0],
  3
];
var SynthesizeSpeechOutput$ = [
  3,
  n0,
  _SSO,
  0,
  [_AS, _CTo, _RC],
  [[() => AudioStream, 16], [0, { [_hH]: _CT_ }], [1, { [_hH]: _xaR }]]
];
var Voice$ = [
  3,
  n0,
  _Vo,
  0,
  [_G, _I, _LCa, _LNa, _N, _ALC, _SE],
  [0, 0, 0, 0, 0, 64 | 0, 64 | 0]
];
var EngineList = 64 | 0;
var LanguageCodeList = 64 | 0;
var LexiconDescriptionList = [
  1,
  n0,
  _LDL,
  0,
  () => LexiconDescription$
];
var LexiconNameList = 64 | 0;
var SpeechMarkTypeList = 64 | 0;
var SynthesisTasks = [
  1,
  n0,
  _STy,
  0,
  () => SynthesisTask$
];
var VoiceList = [
  1,
  n0,
  _VL,
  0,
  () => Voice$
];
var DeleteLexicon$ = [
  9,
  n0,
  _DL,
  { [_h]: ["DELETE", "/v1/lexicons/{Name}", 200] },
  () => DeleteLexiconInput$,
  () => DeleteLexiconOutput$
];
var DescribeVoices$ = [
  9,
  n0,
  _DV,
  { [_h]: ["GET", "/v1/voices", 200] },
  () => DescribeVoicesInput$,
  () => DescribeVoicesOutput$
];
var GetLexicon$ = [
  9,
  n0,
  _GL,
  { [_h]: ["GET", "/v1/lexicons/{Name}", 200] },
  () => GetLexiconInput$,
  () => GetLexiconOutput$
];
var GetSpeechSynthesisTask$ = [
  9,
  n0,
  _GSST,
  { [_h]: ["GET", "/v1/synthesisTasks/{TaskId}", 200] },
  () => GetSpeechSynthesisTaskInput$,
  () => GetSpeechSynthesisTaskOutput$
];
var ListLexicons$ = [
  9,
  n0,
  _LL,
  { [_h]: ["GET", "/v1/lexicons", 200] },
  () => ListLexiconsInput$,
  () => ListLexiconsOutput$
];
var ListSpeechSynthesisTasks$ = [
  9,
  n0,
  _LSST,
  { [_h]: ["GET", "/v1/synthesisTasks", 200] },
  () => ListSpeechSynthesisTasksInput$,
  () => ListSpeechSynthesisTasksOutput$
];
var PutLexicon$ = [
  9,
  n0,
  _PL,
  { [_h]: ["PUT", "/v1/lexicons/{Name}", 200] },
  () => PutLexiconInput$,
  () => PutLexiconOutput$
];
var StartSpeechSynthesisTask$ = [
  9,
  n0,
  _SSST,
  { [_h]: ["POST", "/v1/synthesisTasks", 200] },
  () => StartSpeechSynthesisTaskInput$,
  () => StartSpeechSynthesisTaskOutput$
];
var SynthesizeSpeech$ = [
  9,
  n0,
  _SS,
  { [_h]: ["POST", "/v1/speech", 200] },
  () => SynthesizeSpeechInput$,
  () => SynthesizeSpeechOutput$
];

// node_modules/@aws-sdk/client-polly/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2016-06-10",
    base64Decoder: (config == null ? void 0 : config.base64Decoder) ?? fromBase64,
    base64Encoder: (config == null ? void 0 : config.base64Encoder) ?? toBase64,
    disableHostPrefix: (config == null ? void 0 : config.disableHostPrefix) ?? false,
    endpointProvider: (config == null ? void 0 : config.endpointProvider) ?? defaultEndpointResolver,
    extensions: (config == null ? void 0 : config.extensions) ?? [],
    httpAuthSchemeProvider: (config == null ? void 0 : config.httpAuthSchemeProvider) ?? defaultPollyHttpAuthSchemeProvider,
    httpAuthSchemes: (config == null ? void 0 : config.httpAuthSchemes) ?? [
      {
        schemeId: "aws.auth#sigv4",
        identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
        signer: new AwsSdkSigV4Signer()
      }
    ],
    logger: (config == null ? void 0 : config.logger) ?? new NoOpLogger(),
    protocol: (config == null ? void 0 : config.protocol) ?? AwsRestJsonProtocol,
    protocolSettings: (config == null ? void 0 : config.protocolSettings) ?? {
      defaultNamespace: "com.amazonaws.polly",
      errorTypeRegistries,
      xmlNamespace: "http://polly.amazonaws.com/doc/v1",
      version: "2016-06-10",
      serviceTarget: "Parrot_v1"
    },
    sdkStreamMixin: (config == null ? void 0 : config.sdkStreamMixin) ?? sdkStreamMixin,
    serviceId: (config == null ? void 0 : config.serviceId) ?? "Polly",
    urlParser: (config == null ? void 0 : config.urlParser) ?? parseUrl,
    utf8Decoder: (config == null ? void 0 : config.utf8Decoder) ?? fromUtf8,
    utf8Encoder: (config == null ? void 0 : config.utf8Encoder) ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-polly/dist-es/runtimeConfig.browser.js
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
    maxAttempts: (config == null ? void 0 : config.maxAttempts) ?? DEFAULT_MAX_ATTEMPTS,
    region: (config == null ? void 0 : config.region) ?? invalidProvider("Region is missing"),
    requestHandler: FetchHttpHandler.create((config == null ? void 0 : config.requestHandler) ?? defaultConfigProvider),
    retryMode: (config == null ? void 0 : config.retryMode) ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
    sha256: (config == null ? void 0 : config.sha256) ?? Sha256,
    streamCollector: (config == null ? void 0 : config.streamCollector) ?? streamCollector,
    useDualstackEndpoint: (config == null ? void 0 : config.useDualstackEndpoint) ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
    useFipsEndpoint: (config == null ? void 0 : config.useFipsEndpoint) ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
  };
};

// node_modules/@aws-sdk/client-polly/dist-es/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
  const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
  let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
  let _credentials = runtimeConfig.credentials;
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
    }
  };
};
var resolveHttpAuthRuntimeConfig = (config) => {
  return {
    httpAuthSchemes: config.httpAuthSchemes(),
    httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
    credentials: config.credentials()
  };
};

// node_modules/@aws-sdk/client-polly/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-polly/dist-es/PollyClient.js
var PollyClient = class extends Client {
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
    const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
    const _config_8 = resolveRuntimeExtensions(_config_7, (configuration == null ? void 0 : configuration.extensions) || []);
    this.config = _config_8;
    this.middlewareStack.use(getSchemaSerdePlugin(this.config));
    this.middlewareStack.use(getUserAgentPlugin(this.config));
    this.middlewareStack.use(getRetryPlugin(this.config));
    this.middlewareStack.use(getContentLengthPlugin(this.config));
    this.middlewareStack.use(getHostHeaderPlugin(this.config));
    this.middlewareStack.use(getLoggerPlugin(this.config));
    this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
    this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
      httpAuthSchemeParametersProvider: defaultPollyHttpAuthSchemeParametersProvider,
      identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
        "aws.auth#sigv4": config.credentials
      })
    }));
    this.middlewareStack.use(getHttpSigningPlugin(this.config));
  }
  destroy() {
    super.destroy();
  }
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/DeleteLexiconCommand.js
var DeleteLexiconCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "DeleteLexicon", {}).n("PollyClient", "DeleteLexiconCommand").sc(DeleteLexicon$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/DescribeVoicesCommand.js
var DescribeVoicesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "DescribeVoices", {}).n("PollyClient", "DescribeVoicesCommand").sc(DescribeVoices$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/GetLexiconCommand.js
var GetLexiconCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "GetLexicon", {}).n("PollyClient", "GetLexiconCommand").sc(GetLexicon$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/GetSpeechSynthesisTaskCommand.js
var GetSpeechSynthesisTaskCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "GetSpeechSynthesisTask", {}).n("PollyClient", "GetSpeechSynthesisTaskCommand").sc(GetSpeechSynthesisTask$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/ListLexiconsCommand.js
var ListLexiconsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "ListLexicons", {}).n("PollyClient", "ListLexiconsCommand").sc(ListLexicons$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/ListSpeechSynthesisTasksCommand.js
var ListSpeechSynthesisTasksCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "ListSpeechSynthesisTasks", {}).n("PollyClient", "ListSpeechSynthesisTasksCommand").sc(ListSpeechSynthesisTasks$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/PutLexiconCommand.js
var PutLexiconCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "PutLexicon", {}).n("PollyClient", "PutLexiconCommand").sc(PutLexicon$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/StartSpeechSynthesisTaskCommand.js
var StartSpeechSynthesisTaskCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "StartSpeechSynthesisTask", {}).n("PollyClient", "StartSpeechSynthesisTaskCommand").sc(StartSpeechSynthesisTask$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/commands/SynthesizeSpeechCommand.js
var SynthesizeSpeechCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Parrot_v1", "SynthesizeSpeech", {}).n("PollyClient", "SynthesizeSpeechCommand").sc(SynthesizeSpeech$).build() {
};

// node_modules/@aws-sdk/client-polly/dist-es/pagination/ListSpeechSynthesisTasksPaginator.js
var paginateListSpeechSynthesisTasks = createPaginator(PollyClient, ListSpeechSynthesisTasksCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-polly/dist-es/Polly.js
var commands = {
  DeleteLexiconCommand,
  DescribeVoicesCommand,
  GetLexiconCommand,
  GetSpeechSynthesisTaskCommand,
  ListLexiconsCommand,
  ListSpeechSynthesisTasksCommand,
  PutLexiconCommand,
  StartSpeechSynthesisTaskCommand,
  SynthesizeSpeechCommand
};
var paginators = {
  paginateListSpeechSynthesisTasks
};
var Polly = class extends PollyClient {
};
createAggregatedClient(commands, Polly, { paginators });

// node_modules/@aws-sdk/client-polly/dist-es/models/enums.js
var Engine = {
  GENERATIVE: "generative",
  LONG_FORM: "long-form",
  NEURAL: "neural",
  STANDARD: "standard"
};
var LanguageCode = {
  ar_AE: "ar-AE",
  arb: "arb",
  ca_ES: "ca-ES",
  cmn_CN: "cmn-CN",
  cs_CZ: "cs-CZ",
  cy_GB: "cy-GB",
  da_DK: "da-DK",
  de_AT: "de-AT",
  de_CH: "de-CH",
  de_DE: "de-DE",
  en_AU: "en-AU",
  en_GB: "en-GB",
  en_GB_WLS: "en-GB-WLS",
  en_IE: "en-IE",
  en_IN: "en-IN",
  en_NZ: "en-NZ",
  en_SG: "en-SG",
  en_US: "en-US",
  en_ZA: "en-ZA",
  es_ES: "es-ES",
  es_MX: "es-MX",
  es_US: "es-US",
  fi_FI: "fi-FI",
  fr_BE: "fr-BE",
  fr_CA: "fr-CA",
  fr_FR: "fr-FR",
  hi_IN: "hi-IN",
  is_IS: "is-IS",
  it_IT: "it-IT",
  ja_JP: "ja-JP",
  ko_KR: "ko-KR",
  nb_NO: "nb-NO",
  nl_BE: "nl-BE",
  nl_NL: "nl-NL",
  pl_PL: "pl-PL",
  pt_BR: "pt-BR",
  pt_PT: "pt-PT",
  ro_RO: "ro-RO",
  ru_RU: "ru-RU",
  sv_SE: "sv-SE",
  tr_TR: "tr-TR",
  yue_CN: "yue-CN"
};
var Gender = {
  Female: "Female",
  Male: "Male"
};
var VoiceId = {
  Aditi: "Aditi",
  Adriano: "Adriano",
  Amy: "Amy",
  Andres: "Andres",
  Aria: "Aria",
  Arlet: "Arlet",
  Arthur: "Arthur",
  Astrid: "Astrid",
  Ayanda: "Ayanda",
  Bianca: "Bianca",
  Brian: "Brian",
  Burcu: "Burcu",
  Camila: "Camila",
  Carla: "Carla",
  Carmen: "Carmen",
  Celine: "Celine",
  Chantal: "Chantal",
  Conchita: "Conchita",
  Cristiano: "Cristiano",
  Daniel: "Daniel",
  Danielle: "Danielle",
  Dora: "Dora",
  Elin: "Elin",
  Emma: "Emma",
  Enrique: "Enrique",
  Ewa: "Ewa",
  Filiz: "Filiz",
  Gabrielle: "Gabrielle",
  Geraint: "Geraint",
  Giorgio: "Giorgio",
  Gregory: "Gregory",
  Gwyneth: "Gwyneth",
  Hala: "Hala",
  Hannah: "Hannah",
  Hans: "Hans",
  Hiujin: "Hiujin",
  Ida: "Ida",
  Ines: "Ines",
  Isabelle: "Isabelle",
  Ivy: "Ivy",
  Jacek: "Jacek",
  Jan: "Jan",
  Jasmine: "Jasmine",
  Jihye: "Jihye",
  Jitka: "Jitka",
  Joanna: "Joanna",
  Joey: "Joey",
  Justin: "Justin",
  Kajal: "Kajal",
  Karl: "Karl",
  Kazuha: "Kazuha",
  Kendra: "Kendra",
  Kevin: "Kevin",
  Kimberly: "Kimberly",
  Laura: "Laura",
  Lea: "Lea",
  Liam: "Liam",
  Lisa: "Lisa",
  Liv: "Liv",
  Lotte: "Lotte",
  Lucia: "Lucia",
  Lupe: "Lupe",
  Mads: "Mads",
  Maja: "Maja",
  Marlene: "Marlene",
  Mathieu: "Mathieu",
  Matthew: "Matthew",
  Maxim: "Maxim",
  Mia: "Mia",
  Miguel: "Miguel",
  Mizuki: "Mizuki",
  Naja: "Naja",
  Niamh: "Niamh",
  Nicole: "Nicole",
  Ola: "Ola",
  Olivia: "Olivia",
  Pedro: "Pedro",
  Penelope: "Penelope",
  Raveena: "Raveena",
  Remi: "Remi",
  Ricardo: "Ricardo",
  Ruben: "Ruben",
  Russell: "Russell",
  Ruth: "Ruth",
  Sabrina: "Sabrina",
  Salli: "Salli",
  Seoyeon: "Seoyeon",
  Sergio: "Sergio",
  Sofie: "Sofie",
  Stephen: "Stephen",
  Suvi: "Suvi",
  Takumi: "Takumi",
  Tatyana: "Tatyana",
  Thiago: "Thiago",
  Tomoko: "Tomoko",
  Vicki: "Vicki",
  Vitoria: "Vitoria",
  Zayd: "Zayd",
  Zeina: "Zeina",
  Zhiyu: "Zhiyu"
};
var OutputFormat = {
  JSON: "json",
  MP3: "mp3",
  OGG_OPUS: "ogg_opus",
  OGG_VORBIS: "ogg_vorbis",
  PCM: "pcm"
};
var SpeechMarkType = {
  SENTENCE: "sentence",
  SSML: "ssml",
  VISEME: "viseme",
  WORD: "word"
};
var TaskStatus = {
  COMPLETED: "completed",
  FAILED: "failed",
  IN_PROGRESS: "inProgress",
  SCHEDULED: "scheduled"
};
var TextType = {
  SSML: "ssml",
  TEXT: "text"
};
export {
  Command as $Command,
  DeleteLexicon$,
  DeleteLexiconCommand,
  DeleteLexiconInput$,
  DeleteLexiconOutput$,
  DescribeVoices$,
  DescribeVoicesCommand,
  DescribeVoicesInput$,
  DescribeVoicesOutput$,
  Engine,
  EngineNotSupportedException,
  EngineNotSupportedException$,
  Gender,
  GetLexicon$,
  GetLexiconCommand,
  GetLexiconInput$,
  GetLexiconOutput$,
  GetSpeechSynthesisTask$,
  GetSpeechSynthesisTaskCommand,
  GetSpeechSynthesisTaskInput$,
  GetSpeechSynthesisTaskOutput$,
  InvalidLexiconException,
  InvalidLexiconException$,
  InvalidNextTokenException,
  InvalidNextTokenException$,
  InvalidS3BucketException,
  InvalidS3BucketException$,
  InvalidS3KeyException,
  InvalidS3KeyException$,
  InvalidSampleRateException,
  InvalidSampleRateException$,
  InvalidSnsTopicArnException,
  InvalidSnsTopicArnException$,
  InvalidSsmlException,
  InvalidSsmlException$,
  InvalidTaskIdException,
  InvalidTaskIdException$,
  LanguageCode,
  LanguageNotSupportedException,
  LanguageNotSupportedException$,
  Lexicon$,
  LexiconAttributes$,
  LexiconDescription$,
  LexiconNotFoundException,
  LexiconNotFoundException$,
  LexiconSizeExceededException,
  LexiconSizeExceededException$,
  ListLexicons$,
  ListLexiconsCommand,
  ListLexiconsInput$,
  ListLexiconsOutput$,
  ListSpeechSynthesisTasks$,
  ListSpeechSynthesisTasksCommand,
  ListSpeechSynthesisTasksInput$,
  ListSpeechSynthesisTasksOutput$,
  MarksNotSupportedForFormatException,
  MarksNotSupportedForFormatException$,
  MaxLexemeLengthExceededException,
  MaxLexemeLengthExceededException$,
  MaxLexiconsNumberExceededException,
  MaxLexiconsNumberExceededException$,
  OutputFormat,
  Polly,
  PollyClient,
  PollyServiceException,
  PollyServiceException$,
  PutLexicon$,
  PutLexiconCommand,
  PutLexiconInput$,
  PutLexiconOutput$,
  ServiceFailureException,
  ServiceFailureException$,
  SpeechMarkType,
  SsmlMarksNotSupportedForTextTypeException,
  SsmlMarksNotSupportedForTextTypeException$,
  StartSpeechSynthesisTask$,
  StartSpeechSynthesisTaskCommand,
  StartSpeechSynthesisTaskInput$,
  StartSpeechSynthesisTaskOutput$,
  SynthesisTask$,
  SynthesisTaskNotFoundException,
  SynthesisTaskNotFoundException$,
  SynthesizeSpeech$,
  SynthesizeSpeechCommand,
  SynthesizeSpeechInput$,
  SynthesizeSpeechOutput$,
  TaskStatus,
  TextLengthExceededException,
  TextLengthExceededException$,
  TextType,
  UnsupportedPlsAlphabetException,
  UnsupportedPlsAlphabetException$,
  UnsupportedPlsLanguageException,
  UnsupportedPlsLanguageException$,
  Voice$,
  VoiceId,
  Client as __Client,
  errorTypeRegistries,
  paginateListSpeechSynthesisTasks
};
//# sourceMappingURL=@aws-sdk_client-polly.js.map
