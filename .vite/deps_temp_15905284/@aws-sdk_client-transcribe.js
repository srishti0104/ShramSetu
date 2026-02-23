import {
  WaiterState,
  checkExceptions,
  createWaiter
} from "./chunk-4WNBSDRD.js";
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
  AwsJson1_1Protocol,
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

// node_modules/@aws-sdk/client-transcribe/dist-es/auth/httpAuthSchemeProvider.js
var defaultTranscribeHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
      name: "transcribe",
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
var defaultTranscribeHttpAuthSchemeProvider = (authParameters) => {
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

// node_modules/@aws-sdk/client-transcribe/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "transcribe"
  });
};
var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-transcribe/package.json
var package_default = {
  name: "@aws-sdk/client-transcribe",
  description: "AWS SDK for JavaScript Transcribe Client for Node.js, Browser and React Native",
  version: "3.995.0",
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline client-transcribe",
    "build:es": "tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service --solo transcribe",
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
    "@smithy/util-utf8": "^4.2.0",
    "@smithy/util-waiter": "^4.2.8",
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
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-transcribe",
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-transcribe"
  }
};

// node_modules/@aws-sdk/client-transcribe/dist-es/endpoint/ruleset.js
var w = "required";
var x = "fn";
var y = "argv";
var z = "ref";
var a = true;
var b = "isSet";
var c = "booleanEquals";
var d = "error";
var e = "endpoint";
var f = "tree";
var g = "PartitionResult";
var h = "stringEquals";
var i = { [w]: false, "type": "string" };
var j = { [w]: true, "default": false, "type": "boolean" };
var k = { [z]: "Endpoint" };
var l = { [x]: c, [y]: [{ [z]: "UseFIPS" }, true] };
var m = { [x]: c, [y]: [{ [z]: "UseDualStack" }, true] };
var n = {};
var o = { [z]: "Region" };
var p = { [x]: "getAttr", [y]: [{ [z]: g }, "supportsFIPS"] };
var q = { [x]: c, [y]: [true, { [x]: "getAttr", [y]: [{ [z]: g }, "supportsDualStack"] }] };
var r = { [x]: "getAttr", [y]: [{ [z]: g }, "name"] };
var s = { "url": "https://fips.transcribe.{Region}.amazonaws.com", "properties": {}, "headers": {} };
var t = [l];
var u = [m];
var v = [o];
var _data = { version: "1.0", parameters: { Region: i, UseDualStack: j, UseFIPS: j, Endpoint: i }, rules: [{ conditions: [{ [x]: b, [y]: [k] }], rules: [{ conditions: t, error: "Invalid Configuration: FIPS and custom endpoint are not supported", type: d }, { conditions: u, error: "Invalid Configuration: Dualstack and custom endpoint are not supported", type: d }, { endpoint: { url: k, properties: n, headers: n }, type: e }], type: f }, { conditions: [{ [x]: b, [y]: v }], rules: [{ conditions: [{ [x]: "aws.partition", [y]: v, assign: g }], rules: [{ conditions: [l, m], rules: [{ conditions: [{ [x]: c, [y]: [a, p] }, q], rules: [{ endpoint: { url: "https://transcribe-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: n, headers: n }, type: e }], type: f }, { error: "FIPS and DualStack are enabled, but this partition does not support one or both", type: d }], type: f }, { conditions: t, rules: [{ conditions: [{ [x]: c, [y]: [p, a] }], rules: [{ conditions: [{ [x]: h, [y]: [r, "aws"] }], endpoint: s, type: e }, { conditions: [{ [x]: h, [y]: [r, "aws-us-gov"] }], endpoint: s, type: e }, { endpoint: { url: "https://transcribe-fips.{Region}.{PartitionResult#dnsSuffix}", properties: n, headers: n }, type: e }], type: f }, { error: "FIPS is enabled but this partition does not support FIPS", type: d }], type: f }, { conditions: u, rules: [{ conditions: [q], rules: [{ endpoint: { url: "https://transcribe.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: n, headers: n }, type: e }], type: f }, { error: "DualStack is enabled but this partition does not support DualStack", type: d }], type: f }, { conditions: [{ [x]: h, [y]: [o, "cn-north-1"] }], endpoint: { url: "https://cn.transcribe.cn-north-1.amazonaws.com.cn", properties: n, headers: n }, type: e }, { conditions: [{ [x]: h, [y]: [o, "cn-northwest-1"] }], endpoint: { url: "https://cn.transcribe.cn-northwest-1.amazonaws.com.cn", properties: n, headers: n }, type: e }, { endpoint: { url: "https://transcribe.{Region}.{PartitionResult#dnsSuffix}", properties: n, headers: n }, type: e }], type: f }], type: f }, { error: "Invalid Configuration: Missing Region", type: d }] };
var ruleSet = _data;

// node_modules/@aws-sdk/client-transcribe/dist-es/endpoint/endpointResolver.js
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

// node_modules/@aws-sdk/client-transcribe/dist-es/models/TranscribeServiceException.js
var TranscribeServiceException = class _TranscribeServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _TranscribeServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-transcribe/dist-es/models/errors.js
var BadRequestException = class _BadRequestException extends TranscribeServiceException {
  constructor(opts) {
    super({
      name: "BadRequestException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "BadRequestException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _BadRequestException.prototype);
    this.Message = opts.Message;
  }
};
var ConflictException = class _ConflictException extends TranscribeServiceException {
  constructor(opts) {
    super({
      name: "ConflictException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ConflictException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ConflictException.prototype);
    this.Message = opts.Message;
  }
};
var InternalFailureException = class _InternalFailureException extends TranscribeServiceException {
  constructor(opts) {
    super({
      name: "InternalFailureException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InternalFailureException");
    __publicField(this, "$fault", "server");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InternalFailureException.prototype);
    this.Message = opts.Message;
  }
};
var LimitExceededException = class _LimitExceededException extends TranscribeServiceException {
  constructor(opts) {
    super({
      name: "LimitExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "LimitExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _LimitExceededException.prototype);
    this.Message = opts.Message;
  }
};
var NotFoundException = class _NotFoundException extends TranscribeServiceException {
  constructor(opts) {
    super({
      name: "NotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "NotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _NotFoundException.prototype);
    this.Message = opts.Message;
  }
};

// node_modules/@aws-sdk/client-transcribe/dist-es/schemas/schemas_0.js
var _ADE = "AllowDeferredExecution";
var _ATR = "AbsoluteTimeRange";
var _BMN = "BaseModelName";
var _BRE = "BadRequestException";
var _C = "Categories";
var _CAJ = "CallAnalyticsJob";
var _CAJD = "CallAnalyticsJobDetails";
var _CAJN = "CallAnalyticsJobName";
var _CAJS = "CallAnalyticsJobStatus";
var _CAJSa = "CallAnalyticsJobSettings";
var _CAJSal = "CallAnalyticsJobSummary";
var _CAJSall = "CallAnalyticsJobSummaries";
var _CASF = "CallAnalyticsSkippedFeature";
var _CASFL = "CallAnalyticsSkippedFeatureList";
var _CCAC = "CreateCallAnalyticsCategory";
var _CCACR = "CreateCallAnalyticsCategoryRequest";
var _CCACRr = "CreateCallAnalyticsCategoryResponse";
var _CD = "ChannelDefinitions";
var _CDU = "ClinicalDocumentUri";
var _CDh = "ChannelDefinition";
var _CE = "ConflictException";
var _CI = "ChannelId";
var _CIT = "ContentIdentificationType";
var _CIh = "ChannelIdentification";
var _CLM = "CreateLanguageModel";
var _CLMR = "CreateLanguageModelRequest";
var _CLMRr = "CreateLanguageModelResponse";
var _CMV = "CreateMedicalVocabulary";
var _CMVR = "CreateMedicalVocabularyRequest";
var _CMVRr = "CreateMedicalVocabularyResponse";
var _CN = "CategoryName";
var _CNGS = "ClinicalNoteGenerationSettings";
var _CP = "CategoryProperties";
var _CPL = "CategoryPropertiesList";
var _CR = "ContentRedaction";
var _CT = "CreationTime";
var _CTo = "CompletionTime";
var _CTr = "CreateTime";
var _CV = "CreateVocabulary";
var _CVF = "CreateVocabularyFilter";
var _CVFR = "CreateVocabularyFilterRequest";
var _CVFRr = "CreateVocabularyFilterResponse";
var _CVR = "CreateVocabularyRequest";
var _CVRr = "CreateVocabularyResponse";
var _DARA = "DataAccessRoleArn";
var _DCAC = "DeleteCallAnalyticsCategory";
var _DCACR = "DeleteCallAnalyticsCategoryRequest";
var _DCACRe = "DeleteCallAnalyticsCategoryResponse";
var _DCAJ = "DeleteCallAnalyticsJob";
var _DCAJR = "DeleteCallAnalyticsJobRequest";
var _DCAJRe = "DeleteCallAnalyticsJobResponse";
var _DIS = "DurationInSeconds";
var _DLM = "DeleteLanguageModel";
var _DLMR = "DeleteLanguageModelRequest";
var _DLMRe = "DescribeLanguageModelRequest";
var _DLMRes = "DescribeLanguageModelResponse";
var _DLMe = "DescribeLanguageModel";
var _DMSJ = "DeleteMedicalScribeJob";
var _DMSJR = "DeleteMedicalScribeJobRequest";
var _DMTJ = "DeleteMedicalTranscriptionJob";
var _DMTJR = "DeleteMedicalTranscriptionJobRequest";
var _DMV = "DeleteMedicalVocabulary";
var _DMVR = "DeleteMedicalVocabularyRequest";
var _DTJ = "DeleteTranscriptionJob";
var _DTJR = "DeleteTranscriptionJobRequest";
var _DU = "DownloadUri";
var _DV = "DeleteVocabulary";
var _DVF = "DeleteVocabularyFilter";
var _DVFR = "DeleteVocabularyFilterRequest";
var _DVR = "DeleteVocabularyRequest";
var _EP = "EndPercentage";
var _ET = "EndTime";
var _F = "First";
var _FR = "FailureReason";
var _Fe = "Feature";
var _Fo = "Formats";
var _GAS = "GenerateAbstractiveSummary";
var _GCAC = "GetCallAnalyticsCategory";
var _GCACR = "GetCallAnalyticsCategoryRequest";
var _GCACRe = "GetCallAnalyticsCategoryResponse";
var _GCAJ = "GetCallAnalyticsJob";
var _GCAJR = "GetCallAnalyticsJobRequest";
var _GCAJRe = "GetCallAnalyticsJobResponse";
var _GMSJ = "GetMedicalScribeJob";
var _GMSJR = "GetMedicalScribeJobRequest";
var _GMSJRe = "GetMedicalScribeJobResponse";
var _GMTJ = "GetMedicalTranscriptionJob";
var _GMTJR = "GetMedicalTranscriptionJobRequest";
var _GMTJRe = "GetMedicalTranscriptionJobResponse";
var _GMV = "GetMedicalVocabulary";
var _GMVR = "GetMedicalVocabularyRequest";
var _GMVRe = "GetMedicalVocabularyResponse";
var _GTJ = "GetTranscriptionJob";
var _GTJR = "GetTranscriptionJobRequest";
var _GTJRe = "GetTranscriptionJobResponse";
var _GV = "GetVocabulary";
var _GVF = "GetVocabularyFilter";
var _GVFR = "GetVocabularyFilterRequest";
var _GVFRe = "GetVocabularyFilterResponse";
var _GVR = "GetVocabularyRequest";
var _GVRe = "GetVocabularyResponse";
var _IDC = "InputDataConfig";
var _IF = "InterruptionFilter";
var _IFE = "InternalFailureException";
var _IL = "IdentifyLanguage";
var _ILS = "IdentifiedLanguageScore";
var _IML = "IdentifyMultipleLanguages";
var _IT = "InputType";
var _JES = "JobExecutionSettings";
var _JNC = "JobNameContains";
var _K = "Key";
var _KMSEC = "KMSEncryptionContext";
var _L = "Last";
var _LC = "LanguageCode";
var _LCAC = "ListCallAnalyticsCategories";
var _LCACR = "ListCallAnalyticsCategoriesRequest";
var _LCACRi = "ListCallAnalyticsCategoriesResponse";
var _LCAJ = "ListCallAnalyticsJobs";
var _LCAJR = "ListCallAnalyticsJobsRequest";
var _LCAJRi = "ListCallAnalyticsJobsResponse";
var _LCI = "LanguageCodeItem";
var _LCL = "LanguageCodeList";
var _LCa = "LanguageCodes";
var _LEE = "LimitExceededException";
var _LIS = "LanguageIdSettings";
var _LISM = "LanguageIdSettingsMap";
var _LLM = "ListLanguageModels";
var _LLMR = "ListLanguageModelsRequest";
var _LLMRi = "ListLanguageModelsResponse";
var _LM = "LanguageModel";
var _LMN = "LanguageModelName";
var _LMSJ = "ListMedicalScribeJobs";
var _LMSJR = "ListMedicalScribeJobsRequest";
var _LMSJRi = "ListMedicalScribeJobsResponse";
var _LMT = "LastModifiedTime";
var _LMTJ = "ListMedicalTranscriptionJobs";
var _LMTJR = "ListMedicalTranscriptionJobsRequest";
var _LMTJRi = "ListMedicalTranscriptionJobsResponse";
var _LMV = "ListMedicalVocabularies";
var _LMVR = "ListMedicalVocabulariesRequest";
var _LMVRi = "ListMedicalVocabulariesResponse";
var _LO = "LanguageOptions";
var _LTFR = "ListTagsForResource";
var _LTFRR = "ListTagsForResourceRequest";
var _LTFRRi = "ListTagsForResourceResponse";
var _LTJ = "ListTranscriptionJobs";
var _LTJR = "ListTranscriptionJobsRequest";
var _LTJRi = "ListTranscriptionJobsResponse";
var _LUT = "LastUpdateTime";
var _LV = "ListVocabularies";
var _LVF = "ListVocabularyFilters";
var _LVFR = "ListVocabularyFiltersRequest";
var _LVFRi = "ListVocabularyFiltersResponse";
var _LVR = "ListVocabulariesRequest";
var _LVRi = "ListVocabulariesResponse";
var _M = "Message";
var _MA = "MaxAlternatives";
var _MF = "MediaFormat";
var _MFU = "MediaFileUri";
var _MN = "ModelName";
var _MR = "MaxResults";
var _MS = "ModelStatus";
var _MSC = "MedicalScribeContext";
var _MSCD = "MedicalScribeChannelDefinition";
var _MSCDe = "MedicalScribeChannelDefinitions";
var _MSCP = "MedicalScribeContextProvided";
var _MSJ = "MedicalScribeJob";
var _MSJN = "MedicalScribeJobName";
var _MSJS = "MedicalScribeJobSummaries";
var _MSJSe = "MedicalScribeJobStatus";
var _MSJSed = "MedicalScribeJobSummary";
var _MSL = "MaxSpeakerLabels";
var _MSO = "MedicalScribeOutput";
var _MSPC = "MedicalScribePatientContext";
var _MSRH = "MediaSampleRateHertz";
var _MSS = "MedicalScribeSettings";
var _MSo = "ModelSettings";
var _MT = "MedicalTranscript";
var _MTJ = "MedicalTranscriptionJob";
var _MTJN = "MedicalTranscriptionJobName";
var _MTJS = "MedicalTranscriptionJobSummaries";
var _MTJSe = "MedicalTranscriptionJobSummary";
var _MTS = "MedicalTranscriptionSetting";
var _Me = "Media";
var _Mo = "Models";
var _N = "Negate";
var _NC = "NameContains";
var _NFE = "NotFoundException";
var _NT = "NoteTemplate";
var _NTTF = "NonTalkTimeFilter";
var _NTe = "NextToken";
var _OBN = "OutputBucketName";
var _OEKMSKI = "OutputEncryptionKMSKeyId";
var _OK = "OutputKey";
var _OL = "OutputLocation";
var _OLT = "OutputLocationType";
var _OSI = "OutputStartIndex";
var _P = "Pronouns";
var _PC = "PatientContext";
var _PET = "PiiEntityTypes";
var _PR = "ParticipantRole";
var _Ph = "Phrases";
var _R = "Rules";
var _RA = "ResourceArn";
var _RC = "ReasonCode";
var _RL = "RuleList";
var _RMFU = "RedactedMediaFileUri";
var _RO = "RedactionOutput";
var _RT = "RedactionType";
var _RTFU = "RedactedTranscriptFileUri";
var _RTR = "RelativeTimeRange";
var _Ru = "Rule";
var _S = "Settings";
var _SA = "ShowAlternatives";
var _SCAJ = "StartCallAnalyticsJob";
var _SCAJR = "StartCallAnalyticsJobRequest";
var _SCAJRt = "StartCallAnalyticsJobResponse";
var _SE = "StatusEquals";
var _SEt = "         StatusEquals";
var _SEta = "StateEquals";
var _SF = "SentimentFilter";
var _SFU = "SubtitleFileUris";
var _SMSJ = "StartMedicalScribeJob";
var _SMSJR = "StartMedicalScribeJobRequest";
var _SMSJRt = "StartMedicalScribeJobResponse";
var _SMTJ = "StartMedicalTranscriptionJob";
var _SMTJR = "StartMedicalTranscriptionJobRequest";
var _SMTJRt = "StartMedicalTranscriptionJobResponse";
var _SO = "SubtitlesOutput";
var _SP = "StartPercentage";
var _SSL = "ShowSpeakerLabels";
var _ST = "StartTime";
var _STJ = "StartTranscriptionJob";
var _STJR = "StartTranscriptionJobRequest";
var _STJRt = "StartTranscriptionJobResponse";
var _SU = "S3Uri";
var _Se = "Sentiments";
var _Sk = "Skipped";
var _Sp = "Specialty";
var _St = "Status";
var _Su = "Summarization";
var _Sub = "Subtitles";
var _T = "Transcript";
var _TC = "ToxicityCategories";
var _TD = "ToxicityDetection";
var _TDS = "ToxicityDetectionSettings";
var _TDSU = "TuningDataS3Uri";
var _TF = "TranscriptFilter";
var _TFT = "TranscriptFilterType";
var _TFU = "TranscriptFileUri";
var _TJ = "TranscriptionJob";
var _TJN = "TranscriptionJobName";
var _TJS = "TranscriptionJobSummaries";
var _TJSr = "TranscriptionJobStatus";
var _TJSra = "TranscriptionJobSummary";
var _TK = "TagKeys";
var _TL = "TagList";
var _TR = "TagResource";
var _TRR = "TagResourceRequest";
var _TRRa = "TagResourceResponse";
var _Ta = "Tags";
var _Tag = "Tag";
var _Tar = "Targets";
var _Th = "Threshold";
var _Ty = "Type";
var _UA = "UpgradeAvailability";
var _UCAC = "UpdateCallAnalyticsCategory";
var _UCACR = "UpdateCallAnalyticsCategoryRequest";
var _UCACRp = "UpdateCallAnalyticsCategoryResponse";
var _UMV = "UpdateMedicalVocabulary";
var _UMVR = "UpdateMedicalVocabularyRequest";
var _UMVRp = "UpdateMedicalVocabularyResponse";
var _UR = "UntagResource";
var _URR = "UntagResourceRequest";
var _URRn = "UntagResourceResponse";
var _UV = "UpdateVocabulary";
var _UVF = "UpdateVocabularyFilter";
var _UVFR = "UpdateVocabularyFilterRequest";
var _UVFRp = "UpdateVocabularyFilterResponse";
var _UVR = "UpdateVocabularyRequest";
var _UVRp = "UpdateVocabularyResponse";
var _V = "Vocabularies";
var _VF = "VocabularyFilters";
var _VFFU = "VocabularyFilterFileUri";
var _VFI = "VocabularyFilterInfo";
var _VFM = "VocabularyFilterMethod";
var _VFN = "VocabularyFilterName";
var _VFU = "VocabularyFileUri";
var _VI = "VocabularyInfo";
var _VN = "VocabularyName";
var _VS = "VocabularyState";
var _Va = "Value";
var _W = "Words";
var _c = "client";
var _e = "error";
var _h = "http";
var _hE = "httpError";
var _hQ = "httpQuery";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.transcribe";
var _se = "server";
var _tK = "tagKeys";
var n0 = "com.amazonaws.transcribe";
var _s_registry = TypeRegistry.for(_s);
var TranscribeServiceException$ = [-3, _s, "TranscribeServiceException", 0, [], []];
_s_registry.registerError(TranscribeServiceException$, TranscribeServiceException);
var n0_registry = TypeRegistry.for(n0);
var BadRequestException$ = [
  -3,
  n0,
  _BRE,
  { [_e]: _c, [_hE]: 400 },
  [_M],
  [0]
];
n0_registry.registerError(BadRequestException$, BadRequestException);
var ConflictException$ = [
  -3,
  n0,
  _CE,
  { [_e]: _c, [_hE]: 409 },
  [_M],
  [0]
];
n0_registry.registerError(ConflictException$, ConflictException);
var InternalFailureException$ = [
  -3,
  n0,
  _IFE,
  { [_e]: _se, [_hE]: 500 },
  [_M],
  [0]
];
n0_registry.registerError(InternalFailureException$, InternalFailureException);
var LimitExceededException$ = [
  -3,
  n0,
  _LEE,
  { [_e]: _c, [_hE]: 429 },
  [_M],
  [0]
];
n0_registry.registerError(LimitExceededException$, LimitExceededException);
var NotFoundException$ = [
  -3,
  n0,
  _NFE,
  { [_e]: _c, [_hE]: 404 },
  [_M],
  [0]
];
n0_registry.registerError(NotFoundException$, NotFoundException);
var errorTypeRegistries = [
  _s_registry,
  n0_registry
];
var Pronouns = [0, n0, _P, 8, 0];
var AbsoluteTimeRange$ = [
  3,
  n0,
  _ATR,
  0,
  [_ST, _ET, _F, _L],
  [1, 1, 1, 1]
];
var CallAnalyticsJob$ = [
  3,
  n0,
  _CAJ,
  0,
  [_CAJN, _CAJS, _CAJD, _LC, _MSRH, _MF, _Me, _T, _ST, _CT, _CTo, _FR, _DARA, _ILS, _S, _CD, _Ta],
  [0, 0, () => CallAnalyticsJobDetails$, 0, 1, 0, () => Media$, () => Transcript$, 4, 4, 4, 0, 0, 1, () => CallAnalyticsJobSettings$, () => ChannelDefinitions, () => TagList]
];
var CallAnalyticsJobDetails$ = [
  3,
  n0,
  _CAJD,
  0,
  [_Sk],
  [() => CallAnalyticsSkippedFeatureList]
];
var CallAnalyticsJobSettings$ = [
  3,
  n0,
  _CAJSa,
  0,
  [_VN, _VFN, _VFM, _LMN, _CR, _LO, _LIS, _Su],
  [0, 0, 0, 0, () => ContentRedaction$, 64 | 0, () => LanguageIdSettingsMap, () => Summarization$]
];
var CallAnalyticsJobSummary$ = [
  3,
  n0,
  _CAJSal,
  0,
  [_CAJN, _CT, _ST, _CTo, _LC, _CAJS, _CAJD, _FR],
  [0, 4, 4, 4, 0, 0, () => CallAnalyticsJobDetails$, 0]
];
var CallAnalyticsSkippedFeature$ = [
  3,
  n0,
  _CASF,
  0,
  [_Fe, _RC, _M],
  [0, 0, 0]
];
var CategoryProperties$ = [
  3,
  n0,
  _CP,
  0,
  [_CN, _R, _CTr, _LUT, _Ta, _IT],
  [0, () => RuleList, 4, 4, () => TagList, 0]
];
var ChannelDefinition$ = [
  3,
  n0,
  _CDh,
  0,
  [_CI, _PR],
  [1, 0]
];
var ClinicalNoteGenerationSettings$ = [
  3,
  n0,
  _CNGS,
  0,
  [_NT],
  [0]
];
var ContentRedaction$ = [
  3,
  n0,
  _CR,
  0,
  [_RT, _RO, _PET],
  [0, 0, 64 | 0],
  2
];
var CreateCallAnalyticsCategoryRequest$ = [
  3,
  n0,
  _CCACR,
  0,
  [_CN, _R, _Ta, _IT],
  [[0, 1], () => RuleList, () => TagList, 0],
  2
];
var CreateCallAnalyticsCategoryResponse$ = [
  3,
  n0,
  _CCACRr,
  0,
  [_CP],
  [() => CategoryProperties$]
];
var CreateLanguageModelRequest$ = [
  3,
  n0,
  _CLMR,
  0,
  [_LC, _BMN, _MN, _IDC, _Ta],
  [0, 0, [0, 1], () => InputDataConfig$, () => TagList],
  4
];
var CreateLanguageModelResponse$ = [
  3,
  n0,
  _CLMRr,
  0,
  [_LC, _BMN, _MN, _IDC, _MS],
  [0, 0, 0, () => InputDataConfig$, 0]
];
var CreateMedicalVocabularyRequest$ = [
  3,
  n0,
  _CMVR,
  0,
  [_VN, _LC, _VFU, _Ta],
  [[0, 1], 0, 0, () => TagList],
  3
];
var CreateMedicalVocabularyResponse$ = [
  3,
  n0,
  _CMVRr,
  0,
  [_VN, _LC, _VS, _LMT, _FR],
  [0, 0, 0, 4, 0]
];
var CreateVocabularyFilterRequest$ = [
  3,
  n0,
  _CVFR,
  0,
  [_VFN, _LC, _W, _VFFU, _Ta, _DARA],
  [[0, 1], 0, 64 | 0, 0, () => TagList, 0],
  2
];
var CreateVocabularyFilterResponse$ = [
  3,
  n0,
  _CVFRr,
  0,
  [_VFN, _LC, _LMT],
  [0, 0, 4]
];
var CreateVocabularyRequest$ = [
  3,
  n0,
  _CVR,
  0,
  [_VN, _LC, _Ph, _VFU, _Ta, _DARA],
  [[0, 1], 0, 64 | 0, 0, () => TagList, 0],
  2
];
var CreateVocabularyResponse$ = [
  3,
  n0,
  _CVRr,
  0,
  [_VN, _LC, _VS, _LMT, _FR],
  [0, 0, 0, 4, 0]
];
var DeleteCallAnalyticsCategoryRequest$ = [
  3,
  n0,
  _DCACR,
  0,
  [_CN],
  [[0, 1]],
  1
];
var DeleteCallAnalyticsCategoryResponse$ = [
  3,
  n0,
  _DCACRe,
  0,
  [],
  []
];
var DeleteCallAnalyticsJobRequest$ = [
  3,
  n0,
  _DCAJR,
  0,
  [_CAJN],
  [[0, 1]],
  1
];
var DeleteCallAnalyticsJobResponse$ = [
  3,
  n0,
  _DCAJRe,
  0,
  [],
  []
];
var DeleteLanguageModelRequest$ = [
  3,
  n0,
  _DLMR,
  0,
  [_MN],
  [[0, 1]],
  1
];
var DeleteMedicalScribeJobRequest$ = [
  3,
  n0,
  _DMSJR,
  0,
  [_MSJN],
  [[0, 1]],
  1
];
var DeleteMedicalTranscriptionJobRequest$ = [
  3,
  n0,
  _DMTJR,
  0,
  [_MTJN],
  [[0, 1]],
  1
];
var DeleteMedicalVocabularyRequest$ = [
  3,
  n0,
  _DMVR,
  0,
  [_VN],
  [[0, 1]],
  1
];
var DeleteTranscriptionJobRequest$ = [
  3,
  n0,
  _DTJR,
  0,
  [_TJN],
  [[0, 1]],
  1
];
var DeleteVocabularyFilterRequest$ = [
  3,
  n0,
  _DVFR,
  0,
  [_VFN],
  [[0, 1]],
  1
];
var DeleteVocabularyRequest$ = [
  3,
  n0,
  _DVR,
  0,
  [_VN],
  [[0, 1]],
  1
];
var DescribeLanguageModelRequest$ = [
  3,
  n0,
  _DLMRe,
  0,
  [_MN],
  [[0, 1]],
  1
];
var DescribeLanguageModelResponse$ = [
  3,
  n0,
  _DLMRes,
  0,
  [_LM],
  [() => LanguageModel$]
];
var GetCallAnalyticsCategoryRequest$ = [
  3,
  n0,
  _GCACR,
  0,
  [_CN],
  [[0, 1]],
  1
];
var GetCallAnalyticsCategoryResponse$ = [
  3,
  n0,
  _GCACRe,
  0,
  [_CP],
  [() => CategoryProperties$]
];
var GetCallAnalyticsJobRequest$ = [
  3,
  n0,
  _GCAJR,
  0,
  [_CAJN],
  [[0, 1]],
  1
];
var GetCallAnalyticsJobResponse$ = [
  3,
  n0,
  _GCAJRe,
  0,
  [_CAJ],
  [() => CallAnalyticsJob$]
];
var GetMedicalScribeJobRequest$ = [
  3,
  n0,
  _GMSJR,
  0,
  [_MSJN],
  [[0, 1]],
  1
];
var GetMedicalScribeJobResponse$ = [
  3,
  n0,
  _GMSJRe,
  0,
  [_MSJ],
  [() => MedicalScribeJob$]
];
var GetMedicalTranscriptionJobRequest$ = [
  3,
  n0,
  _GMTJR,
  0,
  [_MTJN],
  [[0, 1]],
  1
];
var GetMedicalTranscriptionJobResponse$ = [
  3,
  n0,
  _GMTJRe,
  0,
  [_MTJ],
  [() => MedicalTranscriptionJob$]
];
var GetMedicalVocabularyRequest$ = [
  3,
  n0,
  _GMVR,
  0,
  [_VN],
  [[0, 1]],
  1
];
var GetMedicalVocabularyResponse$ = [
  3,
  n0,
  _GMVRe,
  0,
  [_VN, _LC, _VS, _LMT, _FR, _DU],
  [0, 0, 0, 4, 0, 0]
];
var GetTranscriptionJobRequest$ = [
  3,
  n0,
  _GTJR,
  0,
  [_TJN],
  [[0, 1]],
  1
];
var GetTranscriptionJobResponse$ = [
  3,
  n0,
  _GTJRe,
  0,
  [_TJ],
  [() => TranscriptionJob$]
];
var GetVocabularyFilterRequest$ = [
  3,
  n0,
  _GVFR,
  0,
  [_VFN],
  [[0, 1]],
  1
];
var GetVocabularyFilterResponse$ = [
  3,
  n0,
  _GVFRe,
  0,
  [_VFN, _LC, _LMT, _DU],
  [0, 0, 4, 0]
];
var GetVocabularyRequest$ = [
  3,
  n0,
  _GVR,
  0,
  [_VN],
  [[0, 1]],
  1
];
var GetVocabularyResponse$ = [
  3,
  n0,
  _GVRe,
  0,
  [_VN, _LC, _VS, _LMT, _FR, _DU],
  [0, 0, 0, 4, 0, 0]
];
var InputDataConfig$ = [
  3,
  n0,
  _IDC,
  0,
  [_SU, _DARA, _TDSU],
  [0, 0, 0],
  2
];
var InterruptionFilter$ = [
  3,
  n0,
  _IF,
  0,
  [_Th, _PR, _ATR, _RTR, _N],
  [1, 0, () => AbsoluteTimeRange$, () => RelativeTimeRange$, 2]
];
var JobExecutionSettings$ = [
  3,
  n0,
  _JES,
  0,
  [_ADE, _DARA],
  [2, 0]
];
var LanguageCodeItem$ = [
  3,
  n0,
  _LCI,
  0,
  [_LC, _DIS],
  [0, 1]
];
var LanguageIdSettings$ = [
  3,
  n0,
  _LIS,
  0,
  [_VN, _VFN, _LMN],
  [0, 0, 0]
];
var LanguageModel$ = [
  3,
  n0,
  _LM,
  0,
  [_MN, _CTr, _LMT, _LC, _BMN, _MS, _UA, _FR, _IDC],
  [0, 4, 4, 0, 0, 0, 2, 0, () => InputDataConfig$]
];
var ListCallAnalyticsCategoriesRequest$ = [
  3,
  n0,
  _LCACR,
  0,
  [_NTe, _MR],
  [[0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListCallAnalyticsCategoriesResponse$ = [
  3,
  n0,
  _LCACRi,
  0,
  [_NTe, _C],
  [0, () => CategoryPropertiesList]
];
var ListCallAnalyticsJobsRequest$ = [
  3,
  n0,
  _LCAJR,
  0,
  [_St, _JNC, _NTe, _MR],
  [[0, { [_hQ]: _St }], [0, { [_hQ]: _JNC }], [0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListCallAnalyticsJobsResponse$ = [
  3,
  n0,
  _LCAJRi,
  0,
  [_St, _NTe, _CAJSall],
  [0, 0, () => CallAnalyticsJobSummaries]
];
var ListLanguageModelsRequest$ = [
  3,
  n0,
  _LLMR,
  0,
  [_SE, _NC, _NTe, _MR],
  [[0, { [_hQ]: _SEt }], [0, { [_hQ]: _NC }], [0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListLanguageModelsResponse$ = [
  3,
  n0,
  _LLMRi,
  0,
  [_NTe, _Mo],
  [0, () => Models]
];
var ListMedicalScribeJobsRequest$ = [
  3,
  n0,
  _LMSJR,
  0,
  [_St, _JNC, _NTe, _MR],
  [[0, { [_hQ]: _St }], [0, { [_hQ]: _JNC }], [0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListMedicalScribeJobsResponse$ = [
  3,
  n0,
  _LMSJRi,
  0,
  [_St, _NTe, _MSJS],
  [0, 0, () => MedicalScribeJobSummaries]
];
var ListMedicalTranscriptionJobsRequest$ = [
  3,
  n0,
  _LMTJR,
  0,
  [_St, _JNC, _NTe, _MR],
  [[0, { [_hQ]: _St }], [0, { [_hQ]: _JNC }], [0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListMedicalTranscriptionJobsResponse$ = [
  3,
  n0,
  _LMTJRi,
  0,
  [_St, _NTe, _MTJS],
  [0, 0, () => MedicalTranscriptionJobSummaries]
];
var ListMedicalVocabulariesRequest$ = [
  3,
  n0,
  _LMVR,
  0,
  [_NTe, _MR, _SEta, _NC],
  [[0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }], [0, { [_hQ]: _SEta }], [0, { [_hQ]: _NC }]]
];
var ListMedicalVocabulariesResponse$ = [
  3,
  n0,
  _LMVRi,
  0,
  [_St, _NTe, _V],
  [0, 0, () => Vocabularies]
];
var ListTagsForResourceRequest$ = [
  3,
  n0,
  _LTFRR,
  0,
  [_RA],
  [[0, 1]],
  1
];
var ListTagsForResourceResponse$ = [
  3,
  n0,
  _LTFRRi,
  0,
  [_RA, _Ta],
  [0, () => TagList]
];
var ListTranscriptionJobsRequest$ = [
  3,
  n0,
  _LTJR,
  0,
  [_St, _JNC, _NTe, _MR],
  [[0, { [_hQ]: _St }], [0, { [_hQ]: _JNC }], [0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }]]
];
var ListTranscriptionJobsResponse$ = [
  3,
  n0,
  _LTJRi,
  0,
  [_St, _NTe, _TJS],
  [0, 0, () => TranscriptionJobSummaries]
];
var ListVocabulariesRequest$ = [
  3,
  n0,
  _LVR,
  0,
  [_NTe, _MR, _SEta, _NC],
  [[0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }], [0, { [_hQ]: _SEta }], [0, { [_hQ]: _NC }]]
];
var ListVocabulariesResponse$ = [
  3,
  n0,
  _LVRi,
  0,
  [_St, _NTe, _V],
  [0, 0, () => Vocabularies]
];
var ListVocabularyFiltersRequest$ = [
  3,
  n0,
  _LVFR,
  0,
  [_NTe, _MR, _NC],
  [[0, { [_hQ]: _NTe }], [1, { [_hQ]: _MR }], [0, { [_hQ]: _NC }]]
];
var ListVocabularyFiltersResponse$ = [
  3,
  n0,
  _LVFRi,
  0,
  [_NTe, _VF],
  [0, () => VocabularyFilters]
];
var Media$ = [
  3,
  n0,
  _Me,
  0,
  [_MFU, _RMFU],
  [0, 0]
];
var MedicalScribeChannelDefinition$ = [
  3,
  n0,
  _MSCD,
  0,
  [_CI, _PR],
  [1, 0],
  2
];
var MedicalScribeContext$ = [
  3,
  n0,
  _MSC,
  0,
  [_PC],
  [[() => MedicalScribePatientContext$, 0]]
];
var MedicalScribeJob$ = [
  3,
  n0,
  _MSJ,
  0,
  [_MSJN, _MSJSe, _LC, _Me, _MSO, _ST, _CT, _CTo, _FR, _S, _DARA, _CD, _MSCP, _Ta],
  [0, 0, 0, () => Media$, () => MedicalScribeOutput$, 4, 4, 4, 0, () => MedicalScribeSettings$, 0, () => MedicalScribeChannelDefinitions, 2, () => TagList]
];
var MedicalScribeJobSummary$ = [
  3,
  n0,
  _MSJSed,
  0,
  [_MSJN, _CT, _ST, _CTo, _LC, _MSJSe, _FR],
  [0, 4, 4, 4, 0, 0, 0]
];
var MedicalScribeOutput$ = [
  3,
  n0,
  _MSO,
  0,
  [_TFU, _CDU],
  [0, 0],
  2
];
var MedicalScribePatientContext$ = [
  3,
  n0,
  _MSPC,
  0,
  [_P],
  [[() => Pronouns, 0]]
];
var MedicalScribeSettings$ = [
  3,
  n0,
  _MSS,
  0,
  [_SSL, _MSL, _CIh, _VN, _VFN, _VFM, _CNGS],
  [2, 1, 2, 0, 0, 0, () => ClinicalNoteGenerationSettings$]
];
var MedicalTranscript$ = [
  3,
  n0,
  _MT,
  0,
  [_TFU],
  [0]
];
var MedicalTranscriptionJob$ = [
  3,
  n0,
  _MTJ,
  0,
  [_MTJN, _TJSr, _LC, _MSRH, _MF, _Me, _T, _ST, _CT, _CTo, _FR, _S, _CIT, _Sp, _Ty, _Ta],
  [0, 0, 0, 1, 0, () => Media$, () => MedicalTranscript$, 4, 4, 4, 0, () => MedicalTranscriptionSetting$, 0, 0, 0, () => TagList]
];
var MedicalTranscriptionJobSummary$ = [
  3,
  n0,
  _MTJSe,
  0,
  [_MTJN, _CT, _ST, _CTo, _LC, _TJSr, _FR, _OLT, _Sp, _CIT, _Ty],
  [0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0]
];
var MedicalTranscriptionSetting$ = [
  3,
  n0,
  _MTS,
  0,
  [_SSL, _MSL, _CIh, _SA, _MA, _VN],
  [2, 1, 2, 2, 1, 0]
];
var ModelSettings$ = [
  3,
  n0,
  _MSo,
  0,
  [_LMN],
  [0]
];
var NonTalkTimeFilter$ = [
  3,
  n0,
  _NTTF,
  0,
  [_Th, _ATR, _RTR, _N],
  [1, () => AbsoluteTimeRange$, () => RelativeTimeRange$, 2]
];
var RelativeTimeRange$ = [
  3,
  n0,
  _RTR,
  0,
  [_SP, _EP, _F, _L],
  [1, 1, 1, 1]
];
var SentimentFilter$ = [
  3,
  n0,
  _SF,
  0,
  [_Se, _ATR, _RTR, _PR, _N],
  [64 | 0, () => AbsoluteTimeRange$, () => RelativeTimeRange$, 0, 2],
  1
];
var Settings$ = [
  3,
  n0,
  _S,
  0,
  [_VN, _SSL, _MSL, _CIh, _SA, _MA, _VFN, _VFM],
  [0, 2, 1, 2, 2, 1, 0, 0]
];
var StartCallAnalyticsJobRequest$ = [
  3,
  n0,
  _SCAJR,
  0,
  [_CAJN, _Me, _OL, _OEKMSKI, _DARA, _S, _Ta, _CD],
  [[0, 1], () => Media$, 0, 0, 0, () => CallAnalyticsJobSettings$, () => TagList, () => ChannelDefinitions],
  2
];
var StartCallAnalyticsJobResponse$ = [
  3,
  n0,
  _SCAJRt,
  0,
  [_CAJ],
  [() => CallAnalyticsJob$]
];
var StartMedicalScribeJobRequest$ = [
  3,
  n0,
  _SMSJR,
  0,
  [_MSJN, _Me, _OBN, _DARA, _S, _OEKMSKI, _KMSEC, _CD, _Ta, _MSC],
  [[0, 1], () => Media$, 0, 0, () => MedicalScribeSettings$, 0, 128 | 0, () => MedicalScribeChannelDefinitions, () => TagList, [() => MedicalScribeContext$, 0]],
  5
];
var StartMedicalScribeJobResponse$ = [
  3,
  n0,
  _SMSJRt,
  0,
  [_MSJ],
  [() => MedicalScribeJob$]
];
var StartMedicalTranscriptionJobRequest$ = [
  3,
  n0,
  _SMTJR,
  0,
  [_MTJN, _LC, _Me, _OBN, _Sp, _Ty, _MSRH, _MF, _OK, _OEKMSKI, _KMSEC, _S, _CIT, _Ta],
  [[0, 1], 0, () => Media$, 0, 0, 0, 1, 0, 0, 0, 128 | 0, () => MedicalTranscriptionSetting$, 0, () => TagList],
  6
];
var StartMedicalTranscriptionJobResponse$ = [
  3,
  n0,
  _SMTJRt,
  0,
  [_MTJ],
  [() => MedicalTranscriptionJob$]
];
var StartTranscriptionJobRequest$ = [
  3,
  n0,
  _STJR,
  0,
  [_TJN, _Me, _LC, _MSRH, _MF, _OBN, _OK, _OEKMSKI, _KMSEC, _S, _MSo, _JES, _CR, _IL, _IML, _LO, _Sub, _Ta, _LIS, _TD],
  [[0, 1], () => Media$, 0, 1, 0, 0, 0, 0, 128 | 0, () => Settings$, () => ModelSettings$, () => JobExecutionSettings$, () => ContentRedaction$, 2, 2, 64 | 0, () => Subtitles$, () => TagList, () => LanguageIdSettingsMap, () => ToxicityDetection],
  2
];
var StartTranscriptionJobResponse$ = [
  3,
  n0,
  _STJRt,
  0,
  [_TJ],
  [() => TranscriptionJob$]
];
var Subtitles$ = [
  3,
  n0,
  _Sub,
  0,
  [_Fo, _OSI],
  [64 | 0, 1]
];
var SubtitlesOutput$ = [
  3,
  n0,
  _SO,
  0,
  [_Fo, _SFU, _OSI],
  [64 | 0, 64 | 0, 1]
];
var Summarization$ = [
  3,
  n0,
  _Su,
  0,
  [_GAS],
  [2],
  1
];
var Tag$ = [
  3,
  n0,
  _Tag,
  0,
  [_K, _Va],
  [0, 0],
  2
];
var TagResourceRequest$ = [
  3,
  n0,
  _TRR,
  0,
  [_RA, _Ta],
  [[0, 1], () => TagList],
  2
];
var TagResourceResponse$ = [
  3,
  n0,
  _TRRa,
  0,
  [],
  []
];
var ToxicityDetectionSettings$ = [
  3,
  n0,
  _TDS,
  0,
  [_TC],
  [64 | 0],
  1
];
var Transcript$ = [
  3,
  n0,
  _T,
  0,
  [_TFU, _RTFU],
  [0, 0]
];
var TranscriptFilter$ = [
  3,
  n0,
  _TF,
  0,
  [_TFT, _Tar, _ATR, _RTR, _PR, _N],
  [0, 64 | 0, () => AbsoluteTimeRange$, () => RelativeTimeRange$, 0, 2],
  2
];
var TranscriptionJob$ = [
  3,
  n0,
  _TJ,
  0,
  [_TJN, _TJSr, _LC, _MSRH, _MF, _Me, _T, _ST, _CT, _CTo, _FR, _S, _MSo, _JES, _CR, _IL, _IML, _LO, _ILS, _LCa, _Ta, _Sub, _LIS, _TD],
  [0, 0, 0, 1, 0, () => Media$, () => Transcript$, 4, 4, 4, 0, () => Settings$, () => ModelSettings$, () => JobExecutionSettings$, () => ContentRedaction$, 2, 2, 64 | 0, 1, () => LanguageCodeList, () => TagList, () => SubtitlesOutput$, () => LanguageIdSettingsMap, () => ToxicityDetection]
];
var TranscriptionJobSummary$ = [
  3,
  n0,
  _TJSra,
  0,
  [_TJN, _CT, _ST, _CTo, _LC, _TJSr, _FR, _OLT, _CR, _MSo, _IL, _IML, _ILS, _LCa, _TD],
  [0, 4, 4, 4, 0, 0, 0, 0, () => ContentRedaction$, () => ModelSettings$, 2, 2, 1, () => LanguageCodeList, () => ToxicityDetection]
];
var UntagResourceRequest$ = [
  3,
  n0,
  _URR,
  0,
  [_RA, _TK],
  [[0, 1], [64 | 0, { [_hQ]: _tK }]],
  2
];
var UntagResourceResponse$ = [
  3,
  n0,
  _URRn,
  0,
  [],
  []
];
var UpdateCallAnalyticsCategoryRequest$ = [
  3,
  n0,
  _UCACR,
  0,
  [_CN, _R, _IT],
  [[0, 1], () => RuleList, 0],
  2
];
var UpdateCallAnalyticsCategoryResponse$ = [
  3,
  n0,
  _UCACRp,
  0,
  [_CP],
  [() => CategoryProperties$]
];
var UpdateMedicalVocabularyRequest$ = [
  3,
  n0,
  _UMVR,
  0,
  [_VN, _LC, _VFU],
  [[0, 1], 0, 0],
  3
];
var UpdateMedicalVocabularyResponse$ = [
  3,
  n0,
  _UMVRp,
  0,
  [_VN, _LC, _LMT, _VS],
  [0, 0, 4, 0]
];
var UpdateVocabularyFilterRequest$ = [
  3,
  n0,
  _UVFR,
  0,
  [_VFN, _W, _VFFU, _DARA],
  [[0, 1], 64 | 0, 0, 0],
  1
];
var UpdateVocabularyFilterResponse$ = [
  3,
  n0,
  _UVFRp,
  0,
  [_VFN, _LC, _LMT],
  [0, 0, 4]
];
var UpdateVocabularyRequest$ = [
  3,
  n0,
  _UVR,
  0,
  [_VN, _LC, _Ph, _VFU, _DARA],
  [[0, 1], 0, 64 | 0, 0, 0],
  2
];
var UpdateVocabularyResponse$ = [
  3,
  n0,
  _UVRp,
  0,
  [_VN, _LC, _LMT, _VS],
  [0, 0, 4, 0]
];
var VocabularyFilterInfo$ = [
  3,
  n0,
  _VFI,
  0,
  [_VFN, _LC, _LMT],
  [0, 0, 4]
];
var VocabularyInfo$ = [
  3,
  n0,
  _VI,
  0,
  [_VN, _LC, _LMT, _VS],
  [0, 0, 4, 0]
];
var __Unit = "unit";
var CallAnalyticsJobSummaries = [
  1,
  n0,
  _CAJSall,
  0,
  () => CallAnalyticsJobSummary$
];
var CallAnalyticsSkippedFeatureList = [
  1,
  n0,
  _CASFL,
  0,
  () => CallAnalyticsSkippedFeature$
];
var CategoryPropertiesList = [
  1,
  n0,
  _CPL,
  0,
  () => CategoryProperties$
];
var ChannelDefinitions = [
  1,
  n0,
  _CD,
  0,
  () => ChannelDefinition$
];
var LanguageCodeList = [
  1,
  n0,
  _LCL,
  0,
  () => LanguageCodeItem$
];
var LanguageOptions = 64 | 0;
var MedicalScribeChannelDefinitions = [
  1,
  n0,
  _MSCDe,
  0,
  () => MedicalScribeChannelDefinition$
];
var MedicalScribeJobSummaries = [
  1,
  n0,
  _MSJS,
  0,
  () => MedicalScribeJobSummary$
];
var MedicalTranscriptionJobSummaries = [
  1,
  n0,
  _MTJS,
  0,
  () => MedicalTranscriptionJobSummary$
];
var Models = [
  1,
  n0,
  _Mo,
  0,
  () => LanguageModel$
];
var Phrases = 64 | 0;
var PiiEntityTypes = 64 | 0;
var RuleList = [
  1,
  n0,
  _RL,
  0,
  () => Rule$
];
var SentimentValueList = 64 | 0;
var StringTargetList = 64 | 0;
var SubtitleFileUris = 64 | 0;
var SubtitleFormats = 64 | 0;
var TagKeyList = 64 | 0;
var TagList = [
  1,
  n0,
  _TL,
  0,
  () => Tag$
];
var ToxicityCategories = 64 | 0;
var ToxicityDetection = [
  1,
  n0,
  _TD,
  0,
  () => ToxicityDetectionSettings$
];
var TranscriptionJobSummaries = [
  1,
  n0,
  _TJS,
  0,
  () => TranscriptionJobSummary$
];
var Vocabularies = [
  1,
  n0,
  _V,
  0,
  () => VocabularyInfo$
];
var VocabularyFilters = [
  1,
  n0,
  _VF,
  0,
  () => VocabularyFilterInfo$
];
var Words = 64 | 0;
var KMSEncryptionContextMap = 128 | 0;
var LanguageIdSettingsMap = [
  2,
  n0,
  _LISM,
  0,
  0,
  () => LanguageIdSettings$
];
var Rule$ = [
  4,
  n0,
  _Ru,
  0,
  [_NTTF, _IF, _TF, _SF],
  [() => NonTalkTimeFilter$, () => InterruptionFilter$, () => TranscriptFilter$, () => SentimentFilter$]
];
var CreateCallAnalyticsCategory$ = [
  9,
  n0,
  _CCAC,
  { [_h]: ["PUT", "/callanalyticscategories/{CategoryName}", 200] },
  () => CreateCallAnalyticsCategoryRequest$,
  () => CreateCallAnalyticsCategoryResponse$
];
var CreateLanguageModel$ = [
  9,
  n0,
  _CLM,
  { [_h]: ["PUT", "/languagemodels/{ModelName}", 200] },
  () => CreateLanguageModelRequest$,
  () => CreateLanguageModelResponse$
];
var CreateMedicalVocabulary$ = [
  9,
  n0,
  _CMV,
  { [_h]: ["PUT", "/medicalvocabularies/{VocabularyName}", 200] },
  () => CreateMedicalVocabularyRequest$,
  () => CreateMedicalVocabularyResponse$
];
var CreateVocabulary$ = [
  9,
  n0,
  _CV,
  { [_h]: ["PUT", "/vocabularies/{VocabularyName}", 200] },
  () => CreateVocabularyRequest$,
  () => CreateVocabularyResponse$
];
var CreateVocabularyFilter$ = [
  9,
  n0,
  _CVF,
  { [_h]: ["POST", "/vocabularyFilters/{VocabularyFilterName}", 201] },
  () => CreateVocabularyFilterRequest$,
  () => CreateVocabularyFilterResponse$
];
var DeleteCallAnalyticsCategory$ = [
  9,
  n0,
  _DCAC,
  { [_h]: ["DELETE", "/callanalyticscategories/{CategoryName}", 204] },
  () => DeleteCallAnalyticsCategoryRequest$,
  () => DeleteCallAnalyticsCategoryResponse$
];
var DeleteCallAnalyticsJob$ = [
  9,
  n0,
  _DCAJ,
  { [_h]: ["DELETE", "/callanalyticsjobs/{CallAnalyticsJobName}", 204] },
  () => DeleteCallAnalyticsJobRequest$,
  () => DeleteCallAnalyticsJobResponse$
];
var DeleteLanguageModel$ = [
  9,
  n0,
  _DLM,
  { [_h]: ["DELETE", "/languagemodels/{ModelName}", 204] },
  () => DeleteLanguageModelRequest$,
  () => __Unit
];
var DeleteMedicalScribeJob$ = [
  9,
  n0,
  _DMSJ,
  { [_h]: ["DELETE", "/medicalscribejobs/{MedicalScribeJobName}", 204] },
  () => DeleteMedicalScribeJobRequest$,
  () => __Unit
];
var DeleteMedicalTranscriptionJob$ = [
  9,
  n0,
  _DMTJ,
  { [_h]: ["DELETE", "/medicaltranscriptionjobs/{MedicalTranscriptionJobName}", 204] },
  () => DeleteMedicalTranscriptionJobRequest$,
  () => __Unit
];
var DeleteMedicalVocabulary$ = [
  9,
  n0,
  _DMV,
  { [_h]: ["DELETE", "/medicalvocabularies/{VocabularyName}", 204] },
  () => DeleteMedicalVocabularyRequest$,
  () => __Unit
];
var DeleteTranscriptionJob$ = [
  9,
  n0,
  _DTJ,
  { [_h]: ["DELETE", "/transcriptionjobs/{TranscriptionJobName}", 204] },
  () => DeleteTranscriptionJobRequest$,
  () => __Unit
];
var DeleteVocabulary$ = [
  9,
  n0,
  _DV,
  { [_h]: ["DELETE", "/vocabularies/{VocabularyName}", 204] },
  () => DeleteVocabularyRequest$,
  () => __Unit
];
var DeleteVocabularyFilter$ = [
  9,
  n0,
  _DVF,
  { [_h]: ["DELETE", "/vocabularyFilters/{VocabularyFilterName}", 204] },
  () => DeleteVocabularyFilterRequest$,
  () => __Unit
];
var DescribeLanguageModel$ = [
  9,
  n0,
  _DLMe,
  { [_h]: ["GET", "/languagemodels/{ModelName}", 200] },
  () => DescribeLanguageModelRequest$,
  () => DescribeLanguageModelResponse$
];
var GetCallAnalyticsCategory$ = [
  9,
  n0,
  _GCAC,
  { [_h]: ["GET", "/callanalyticscategories/{CategoryName}", 200] },
  () => GetCallAnalyticsCategoryRequest$,
  () => GetCallAnalyticsCategoryResponse$
];
var GetCallAnalyticsJob$ = [
  9,
  n0,
  _GCAJ,
  { [_h]: ["GET", "/callanalyticsjobs/{CallAnalyticsJobName}", 200] },
  () => GetCallAnalyticsJobRequest$,
  () => GetCallAnalyticsJobResponse$
];
var GetMedicalScribeJob$ = [
  9,
  n0,
  _GMSJ,
  { [_h]: ["GET", "/medicalscribejobs/{MedicalScribeJobName}", 200] },
  () => GetMedicalScribeJobRequest$,
  () => GetMedicalScribeJobResponse$
];
var GetMedicalTranscriptionJob$ = [
  9,
  n0,
  _GMTJ,
  { [_h]: ["GET", "/medicaltranscriptionjobs/{MedicalTranscriptionJobName}", 200] },
  () => GetMedicalTranscriptionJobRequest$,
  () => GetMedicalTranscriptionJobResponse$
];
var GetMedicalVocabulary$ = [
  9,
  n0,
  _GMV,
  { [_h]: ["GET", "/medicalvocabularies/{VocabularyName}", 200] },
  () => GetMedicalVocabularyRequest$,
  () => GetMedicalVocabularyResponse$
];
var GetTranscriptionJob$ = [
  9,
  n0,
  _GTJ,
  { [_h]: ["GET", "/transcriptionjobs/{TranscriptionJobName}", 200] },
  () => GetTranscriptionJobRequest$,
  () => GetTranscriptionJobResponse$
];
var GetVocabulary$ = [
  9,
  n0,
  _GV,
  { [_h]: ["GET", "/vocabularies/{VocabularyName}", 200] },
  () => GetVocabularyRequest$,
  () => GetVocabularyResponse$
];
var GetVocabularyFilter$ = [
  9,
  n0,
  _GVF,
  { [_h]: ["GET", "/vocabularyFilters/{VocabularyFilterName}", 200] },
  () => GetVocabularyFilterRequest$,
  () => GetVocabularyFilterResponse$
];
var ListCallAnalyticsCategories$ = [
  9,
  n0,
  _LCAC,
  { [_h]: ["GET", "/callanalyticscategories", 200] },
  () => ListCallAnalyticsCategoriesRequest$,
  () => ListCallAnalyticsCategoriesResponse$
];
var ListCallAnalyticsJobs$ = [
  9,
  n0,
  _LCAJ,
  { [_h]: ["GET", "/callanalyticsjobs", 200] },
  () => ListCallAnalyticsJobsRequest$,
  () => ListCallAnalyticsJobsResponse$
];
var ListLanguageModels$ = [
  9,
  n0,
  _LLM,
  { [_h]: ["GET", "/languagemodels", 200] },
  () => ListLanguageModelsRequest$,
  () => ListLanguageModelsResponse$
];
var ListMedicalScribeJobs$ = [
  9,
  n0,
  _LMSJ,
  { [_h]: ["GET", "/medicalscribejobs", 200] },
  () => ListMedicalScribeJobsRequest$,
  () => ListMedicalScribeJobsResponse$
];
var ListMedicalTranscriptionJobs$ = [
  9,
  n0,
  _LMTJ,
  { [_h]: ["GET", "/medicaltranscriptionjobs", 200] },
  () => ListMedicalTranscriptionJobsRequest$,
  () => ListMedicalTranscriptionJobsResponse$
];
var ListMedicalVocabularies$ = [
  9,
  n0,
  _LMV,
  { [_h]: ["GET", "/medicalvocabularies", 200] },
  () => ListMedicalVocabulariesRequest$,
  () => ListMedicalVocabulariesResponse$
];
var ListTagsForResource$ = [
  9,
  n0,
  _LTFR,
  { [_h]: ["GET", "/tags/{ResourceArn}", 200] },
  () => ListTagsForResourceRequest$,
  () => ListTagsForResourceResponse$
];
var ListTranscriptionJobs$ = [
  9,
  n0,
  _LTJ,
  { [_h]: ["GET", "/transcriptionjobs", 200] },
  () => ListTranscriptionJobsRequest$,
  () => ListTranscriptionJobsResponse$
];
var ListVocabularies$ = [
  9,
  n0,
  _LV,
  { [_h]: ["GET", "/vocabularies", 200] },
  () => ListVocabulariesRequest$,
  () => ListVocabulariesResponse$
];
var ListVocabularyFilters$ = [
  9,
  n0,
  _LVF,
  { [_h]: ["GET", "/vocabularyFilters", 200] },
  () => ListVocabularyFiltersRequest$,
  () => ListVocabularyFiltersResponse$
];
var StartCallAnalyticsJob$ = [
  9,
  n0,
  _SCAJ,
  { [_h]: ["PUT", "/callanalyticsjobs/{CallAnalyticsJobName}", 200] },
  () => StartCallAnalyticsJobRequest$,
  () => StartCallAnalyticsJobResponse$
];
var StartMedicalScribeJob$ = [
  9,
  n0,
  _SMSJ,
  { [_h]: ["PUT", "/medicalscribejobs/{MedicalScribeJobName}", 200] },
  () => StartMedicalScribeJobRequest$,
  () => StartMedicalScribeJobResponse$
];
var StartMedicalTranscriptionJob$ = [
  9,
  n0,
  _SMTJ,
  { [_h]: ["PUT", "/medicaltranscriptionjobs/{MedicalTranscriptionJobName}", 200] },
  () => StartMedicalTranscriptionJobRequest$,
  () => StartMedicalTranscriptionJobResponse$
];
var StartTranscriptionJob$ = [
  9,
  n0,
  _STJ,
  { [_h]: ["PUT", "/transcriptionjobs/{TranscriptionJobName}", 200] },
  () => StartTranscriptionJobRequest$,
  () => StartTranscriptionJobResponse$
];
var TagResource$ = [
  9,
  n0,
  _TR,
  { [_h]: ["PUT", "/tags/{ResourceArn}", 200] },
  () => TagResourceRequest$,
  () => TagResourceResponse$
];
var UntagResource$ = [
  9,
  n0,
  _UR,
  { [_h]: ["DELETE", "/tags/{ResourceArn}", 204] },
  () => UntagResourceRequest$,
  () => UntagResourceResponse$
];
var UpdateCallAnalyticsCategory$ = [
  9,
  n0,
  _UCAC,
  { [_h]: ["PATCH", "/callanalyticscategories/{CategoryName}", 200] },
  () => UpdateCallAnalyticsCategoryRequest$,
  () => UpdateCallAnalyticsCategoryResponse$
];
var UpdateMedicalVocabulary$ = [
  9,
  n0,
  _UMV,
  { [_h]: ["PATCH", "/medicalvocabularies/{VocabularyName}", 200] },
  () => UpdateMedicalVocabularyRequest$,
  () => UpdateMedicalVocabularyResponse$
];
var UpdateVocabulary$ = [
  9,
  n0,
  _UV,
  { [_h]: ["PATCH", "/vocabularies/{VocabularyName}", 200] },
  () => UpdateVocabularyRequest$,
  () => UpdateVocabularyResponse$
];
var UpdateVocabularyFilter$ = [
  9,
  n0,
  _UVF,
  { [_h]: ["PUT", "/vocabularyFilters/{VocabularyFilterName}", 200] },
  () => UpdateVocabularyFilterRequest$,
  () => UpdateVocabularyFilterResponse$
];

// node_modules/@aws-sdk/client-transcribe/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2017-10-26",
    base64Decoder: (config == null ? void 0 : config.base64Decoder) ?? fromBase64,
    base64Encoder: (config == null ? void 0 : config.base64Encoder) ?? toBase64,
    disableHostPrefix: (config == null ? void 0 : config.disableHostPrefix) ?? false,
    endpointProvider: (config == null ? void 0 : config.endpointProvider) ?? defaultEndpointResolver,
    extensions: (config == null ? void 0 : config.extensions) ?? [],
    httpAuthSchemeProvider: (config == null ? void 0 : config.httpAuthSchemeProvider) ?? defaultTranscribeHttpAuthSchemeProvider,
    httpAuthSchemes: (config == null ? void 0 : config.httpAuthSchemes) ?? [
      {
        schemeId: "aws.auth#sigv4",
        identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
        signer: new AwsSdkSigV4Signer()
      }
    ],
    logger: (config == null ? void 0 : config.logger) ?? new NoOpLogger(),
    protocol: (config == null ? void 0 : config.protocol) ?? AwsJson1_1Protocol,
    protocolSettings: (config == null ? void 0 : config.protocolSettings) ?? {
      defaultNamespace: "com.amazonaws.transcribe",
      errorTypeRegistries,
      version: "2017-10-26",
      serviceTarget: "Transcribe"
    },
    serviceId: (config == null ? void 0 : config.serviceId) ?? "Transcribe",
    urlParser: (config == null ? void 0 : config.urlParser) ?? parseUrl,
    utf8Decoder: (config == null ? void 0 : config.utf8Decoder) ?? fromUtf8,
    utf8Encoder: (config == null ? void 0 : config.utf8Encoder) ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-transcribe/dist-es/runtimeConfig.browser.js
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

// node_modules/@aws-sdk/client-transcribe/dist-es/auth/httpAuthExtensionConfiguration.js
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

// node_modules/@aws-sdk/client-transcribe/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-transcribe/dist-es/TranscribeClient.js
var TranscribeClient = class extends Client {
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
      httpAuthSchemeParametersProvider: defaultTranscribeHttpAuthSchemeParametersProvider,
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

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/CreateCallAnalyticsCategoryCommand.js
var CreateCallAnalyticsCategoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "CreateCallAnalyticsCategory", {}).n("TranscribeClient", "CreateCallAnalyticsCategoryCommand").sc(CreateCallAnalyticsCategory$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/CreateLanguageModelCommand.js
var CreateLanguageModelCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "CreateLanguageModel", {}).n("TranscribeClient", "CreateLanguageModelCommand").sc(CreateLanguageModel$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/CreateMedicalVocabularyCommand.js
var CreateMedicalVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "CreateMedicalVocabulary", {}).n("TranscribeClient", "CreateMedicalVocabularyCommand").sc(CreateMedicalVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/CreateVocabularyCommand.js
var CreateVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "CreateVocabulary", {}).n("TranscribeClient", "CreateVocabularyCommand").sc(CreateVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/CreateVocabularyFilterCommand.js
var CreateVocabularyFilterCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "CreateVocabularyFilter", {}).n("TranscribeClient", "CreateVocabularyFilterCommand").sc(CreateVocabularyFilter$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteCallAnalyticsCategoryCommand.js
var DeleteCallAnalyticsCategoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteCallAnalyticsCategory", {}).n("TranscribeClient", "DeleteCallAnalyticsCategoryCommand").sc(DeleteCallAnalyticsCategory$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteCallAnalyticsJobCommand.js
var DeleteCallAnalyticsJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteCallAnalyticsJob", {}).n("TranscribeClient", "DeleteCallAnalyticsJobCommand").sc(DeleteCallAnalyticsJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteLanguageModelCommand.js
var DeleteLanguageModelCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteLanguageModel", {}).n("TranscribeClient", "DeleteLanguageModelCommand").sc(DeleteLanguageModel$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteMedicalScribeJobCommand.js
var DeleteMedicalScribeJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteMedicalScribeJob", {}).n("TranscribeClient", "DeleteMedicalScribeJobCommand").sc(DeleteMedicalScribeJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteMedicalTranscriptionJobCommand.js
var DeleteMedicalTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteMedicalTranscriptionJob", {}).n("TranscribeClient", "DeleteMedicalTranscriptionJobCommand").sc(DeleteMedicalTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteMedicalVocabularyCommand.js
var DeleteMedicalVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteMedicalVocabulary", {}).n("TranscribeClient", "DeleteMedicalVocabularyCommand").sc(DeleteMedicalVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteTranscriptionJobCommand.js
var DeleteTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteTranscriptionJob", {}).n("TranscribeClient", "DeleteTranscriptionJobCommand").sc(DeleteTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteVocabularyCommand.js
var DeleteVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteVocabulary", {}).n("TranscribeClient", "DeleteVocabularyCommand").sc(DeleteVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DeleteVocabularyFilterCommand.js
var DeleteVocabularyFilterCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DeleteVocabularyFilter", {}).n("TranscribeClient", "DeleteVocabularyFilterCommand").sc(DeleteVocabularyFilter$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/DescribeLanguageModelCommand.js
var DescribeLanguageModelCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "DescribeLanguageModel", {}).n("TranscribeClient", "DescribeLanguageModelCommand").sc(DescribeLanguageModel$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetCallAnalyticsCategoryCommand.js
var GetCallAnalyticsCategoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetCallAnalyticsCategory", {}).n("TranscribeClient", "GetCallAnalyticsCategoryCommand").sc(GetCallAnalyticsCategory$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetCallAnalyticsJobCommand.js
var GetCallAnalyticsJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetCallAnalyticsJob", {}).n("TranscribeClient", "GetCallAnalyticsJobCommand").sc(GetCallAnalyticsJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetMedicalScribeJobCommand.js
var GetMedicalScribeJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetMedicalScribeJob", {}).n("TranscribeClient", "GetMedicalScribeJobCommand").sc(GetMedicalScribeJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetMedicalTranscriptionJobCommand.js
var GetMedicalTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetMedicalTranscriptionJob", {}).n("TranscribeClient", "GetMedicalTranscriptionJobCommand").sc(GetMedicalTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetMedicalVocabularyCommand.js
var GetMedicalVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetMedicalVocabulary", {}).n("TranscribeClient", "GetMedicalVocabularyCommand").sc(GetMedicalVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetTranscriptionJobCommand.js
var GetTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetTranscriptionJob", {}).n("TranscribeClient", "GetTranscriptionJobCommand").sc(GetTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetVocabularyCommand.js
var GetVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetVocabulary", {}).n("TranscribeClient", "GetVocabularyCommand").sc(GetVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/GetVocabularyFilterCommand.js
var GetVocabularyFilterCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "GetVocabularyFilter", {}).n("TranscribeClient", "GetVocabularyFilterCommand").sc(GetVocabularyFilter$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListCallAnalyticsCategoriesCommand.js
var ListCallAnalyticsCategoriesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListCallAnalyticsCategories", {}).n("TranscribeClient", "ListCallAnalyticsCategoriesCommand").sc(ListCallAnalyticsCategories$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListCallAnalyticsJobsCommand.js
var ListCallAnalyticsJobsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListCallAnalyticsJobs", {}).n("TranscribeClient", "ListCallAnalyticsJobsCommand").sc(ListCallAnalyticsJobs$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListLanguageModelsCommand.js
var ListLanguageModelsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListLanguageModels", {}).n("TranscribeClient", "ListLanguageModelsCommand").sc(ListLanguageModels$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListMedicalScribeJobsCommand.js
var ListMedicalScribeJobsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListMedicalScribeJobs", {}).n("TranscribeClient", "ListMedicalScribeJobsCommand").sc(ListMedicalScribeJobs$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListMedicalTranscriptionJobsCommand.js
var ListMedicalTranscriptionJobsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListMedicalTranscriptionJobs", {}).n("TranscribeClient", "ListMedicalTranscriptionJobsCommand").sc(ListMedicalTranscriptionJobs$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListMedicalVocabulariesCommand.js
var ListMedicalVocabulariesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListMedicalVocabularies", {}).n("TranscribeClient", "ListMedicalVocabulariesCommand").sc(ListMedicalVocabularies$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListTagsForResourceCommand.js
var ListTagsForResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListTagsForResource", {}).n("TranscribeClient", "ListTagsForResourceCommand").sc(ListTagsForResource$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListTranscriptionJobsCommand.js
var ListTranscriptionJobsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListTranscriptionJobs", {}).n("TranscribeClient", "ListTranscriptionJobsCommand").sc(ListTranscriptionJobs$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListVocabulariesCommand.js
var ListVocabulariesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListVocabularies", {}).n("TranscribeClient", "ListVocabulariesCommand").sc(ListVocabularies$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/ListVocabularyFiltersCommand.js
var ListVocabularyFiltersCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "ListVocabularyFilters", {}).n("TranscribeClient", "ListVocabularyFiltersCommand").sc(ListVocabularyFilters$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/StartCallAnalyticsJobCommand.js
var StartCallAnalyticsJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "StartCallAnalyticsJob", {}).n("TranscribeClient", "StartCallAnalyticsJobCommand").sc(StartCallAnalyticsJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/StartMedicalScribeJobCommand.js
var StartMedicalScribeJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "StartMedicalScribeJob", {}).n("TranscribeClient", "StartMedicalScribeJobCommand").sc(StartMedicalScribeJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/StartMedicalTranscriptionJobCommand.js
var StartMedicalTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "StartMedicalTranscriptionJob", {}).n("TranscribeClient", "StartMedicalTranscriptionJobCommand").sc(StartMedicalTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/StartTranscriptionJobCommand.js
var StartTranscriptionJobCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "StartTranscriptionJob", {}).n("TranscribeClient", "StartTranscriptionJobCommand").sc(StartTranscriptionJob$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/TagResourceCommand.js
var TagResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "TagResource", {}).n("TranscribeClient", "TagResourceCommand").sc(TagResource$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/UntagResourceCommand.js
var UntagResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "UntagResource", {}).n("TranscribeClient", "UntagResourceCommand").sc(UntagResource$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/UpdateCallAnalyticsCategoryCommand.js
var UpdateCallAnalyticsCategoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "UpdateCallAnalyticsCategory", {}).n("TranscribeClient", "UpdateCallAnalyticsCategoryCommand").sc(UpdateCallAnalyticsCategory$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/UpdateMedicalVocabularyCommand.js
var UpdateMedicalVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "UpdateMedicalVocabulary", {}).n("TranscribeClient", "UpdateMedicalVocabularyCommand").sc(UpdateMedicalVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/UpdateVocabularyCommand.js
var UpdateVocabularyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "UpdateVocabulary", {}).n("TranscribeClient", "UpdateVocabularyCommand").sc(UpdateVocabulary$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/commands/UpdateVocabularyFilterCommand.js
var UpdateVocabularyFilterCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("Transcribe", "UpdateVocabularyFilter", {}).n("TranscribeClient", "UpdateVocabularyFilterCommand").sc(UpdateVocabularyFilter$).build() {
};

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListCallAnalyticsCategoriesPaginator.js
var paginateListCallAnalyticsCategories = createPaginator(TranscribeClient, ListCallAnalyticsCategoriesCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListCallAnalyticsJobsPaginator.js
var paginateListCallAnalyticsJobs = createPaginator(TranscribeClient, ListCallAnalyticsJobsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListLanguageModelsPaginator.js
var paginateListLanguageModels = createPaginator(TranscribeClient, ListLanguageModelsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListMedicalScribeJobsPaginator.js
var paginateListMedicalScribeJobs = createPaginator(TranscribeClient, ListMedicalScribeJobsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListMedicalTranscriptionJobsPaginator.js
var paginateListMedicalTranscriptionJobs = createPaginator(TranscribeClient, ListMedicalTranscriptionJobsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListMedicalVocabulariesPaginator.js
var paginateListMedicalVocabularies = createPaginator(TranscribeClient, ListMedicalVocabulariesCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListTranscriptionJobsPaginator.js
var paginateListTranscriptionJobs = createPaginator(TranscribeClient, ListTranscriptionJobsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListVocabulariesPaginator.js
var paginateListVocabularies = createPaginator(TranscribeClient, ListVocabulariesCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/pagination/ListVocabularyFiltersPaginator.js
var paginateListVocabularyFilters = createPaginator(TranscribeClient, ListVocabularyFiltersCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForCallAnalyticsJobCompleted.js
var checkState = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetCallAnalyticsJobCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.CallAnalyticsJob.CallAnalyticsJobStatus;
      };
      if (returnComparator() === "COMPLETED") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.CallAnalyticsJob.CallAnalyticsJobStatus;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForCallAnalyticsJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
var waitUntilCallAnalyticsJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForLanguageModelCompleted.js
var checkState2 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new DescribeLanguageModelCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.LanguageModel.ModelStatus;
      };
      if (returnComparator() === "COMPLETED") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.LanguageModel.ModelStatus;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForLanguageModelCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 120, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState2);
};
var waitUntilLanguageModelCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 120, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState2);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForMedicalScribeJobCompleted.js
var checkState3 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetMedicalScribeJobCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.MedicalScribeJob.MedicalScribeJobStatus;
      };
      if (returnComparator() === "COMPLETED") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.MedicalScribeJob.MedicalScribeJobStatus;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForMedicalScribeJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState3);
};
var waitUntilMedicalScribeJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState3);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForMedicalTranscriptionJobCompleted.js
var checkState4 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetMedicalTranscriptionJobCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.MedicalTranscriptionJob.TranscriptionJobStatus;
      };
      if (returnComparator() === "COMPLETED") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.MedicalTranscriptionJob.TranscriptionJobStatus;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForMedicalTranscriptionJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState4);
};
var waitUntilMedicalTranscriptionJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState4);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForMedicalVocabularyReady.js
var checkState5 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetMedicalVocabularyCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.VocabularyState;
      };
      if (returnComparator() === "READY") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.VocabularyState;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForMedicalVocabularyReady = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState5);
};
var waitUntilMedicalVocabularyReady = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState5);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForTranscriptionJobCompleted.js
var checkState6 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetTranscriptionJobCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.TranscriptionJob.TranscriptionJobStatus;
      };
      if (returnComparator() === "COMPLETED") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.TranscriptionJob.TranscriptionJobStatus;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForTranscriptionJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState6);
};
var waitUntilTranscriptionJobCompleted = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState6);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/waiters/waitForVocabularyReady.js
var checkState7 = async (client, input) => {
  let reason;
  try {
    let result = await client.send(new GetVocabularyCommand(input));
    reason = result;
    try {
      const returnComparator = () => {
        return result.VocabularyState;
      };
      if (returnComparator() === "READY") {
        return { state: WaiterState.SUCCESS, reason };
      }
    } catch (e2) {
    }
    try {
      const returnComparator = () => {
        return result.VocabularyState;
      };
      if (returnComparator() === "FAILED") {
        return { state: WaiterState.FAILURE, reason };
      }
    } catch (e2) {
    }
  } catch (exception) {
    reason = exception;
  }
  return { state: WaiterState.RETRY, reason };
};
var waitForVocabularyReady = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  return createWaiter({ ...serviceDefaults, ...params }, input, checkState7);
};
var waitUntilVocabularyReady = async (params, input) => {
  const serviceDefaults = { minDelay: 10, maxDelay: 120 };
  const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState7);
  return checkExceptions(result);
};

// node_modules/@aws-sdk/client-transcribe/dist-es/Transcribe.js
var commands = {
  CreateCallAnalyticsCategoryCommand,
  CreateLanguageModelCommand,
  CreateMedicalVocabularyCommand,
  CreateVocabularyCommand,
  CreateVocabularyFilterCommand,
  DeleteCallAnalyticsCategoryCommand,
  DeleteCallAnalyticsJobCommand,
  DeleteLanguageModelCommand,
  DeleteMedicalScribeJobCommand,
  DeleteMedicalTranscriptionJobCommand,
  DeleteMedicalVocabularyCommand,
  DeleteTranscriptionJobCommand,
  DeleteVocabularyCommand,
  DeleteVocabularyFilterCommand,
  DescribeLanguageModelCommand,
  GetCallAnalyticsCategoryCommand,
  GetCallAnalyticsJobCommand,
  GetMedicalScribeJobCommand,
  GetMedicalTranscriptionJobCommand,
  GetMedicalVocabularyCommand,
  GetTranscriptionJobCommand,
  GetVocabularyCommand,
  GetVocabularyFilterCommand,
  ListCallAnalyticsCategoriesCommand,
  ListCallAnalyticsJobsCommand,
  ListLanguageModelsCommand,
  ListMedicalScribeJobsCommand,
  ListMedicalTranscriptionJobsCommand,
  ListMedicalVocabulariesCommand,
  ListTagsForResourceCommand,
  ListTranscriptionJobsCommand,
  ListVocabulariesCommand,
  ListVocabularyFiltersCommand,
  StartCallAnalyticsJobCommand,
  StartMedicalScribeJobCommand,
  StartMedicalTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateCallAnalyticsCategoryCommand,
  UpdateMedicalVocabularyCommand,
  UpdateVocabularyCommand,
  UpdateVocabularyFilterCommand
};
var paginators = {
  paginateListCallAnalyticsCategories,
  paginateListCallAnalyticsJobs,
  paginateListLanguageModels,
  paginateListMedicalScribeJobs,
  paginateListMedicalTranscriptionJobs,
  paginateListMedicalVocabularies,
  paginateListTranscriptionJobs,
  paginateListVocabularies,
  paginateListVocabularyFilters
};
var waiters = {
  waitUntilLanguageModelCompleted,
  waitUntilCallAnalyticsJobCompleted,
  waitUntilMedicalScribeJobCompleted,
  waitUntilMedicalTranscriptionJobCompleted,
  waitUntilMedicalVocabularyReady,
  waitUntilTranscriptionJobCompleted,
  waitUntilVocabularyReady
};
var Transcribe = class extends TranscribeClient {
};
createAggregatedClient(commands, Transcribe, { paginators, waiters });

// node_modules/@aws-sdk/client-transcribe/dist-es/models/enums.js
var BaseModelName = {
  NARROW_BAND: "NarrowBand",
  WIDE_BAND: "WideBand"
};
var CallAnalyticsFeature = {
  GENERATIVE_SUMMARIZATION: "GENERATIVE_SUMMARIZATION"
};
var CallAnalyticsSkippedReasonCode = {
  FAILED_SAFETY_GUIDELINES: "FAILED_SAFETY_GUIDELINES",
  INSUFFICIENT_CONVERSATION_CONTENT: "INSUFFICIENT_CONVERSATION_CONTENT"
};
var CallAnalyticsJobStatus = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  IN_PROGRESS: "IN_PROGRESS",
  QUEUED: "QUEUED"
};
var ParticipantRole = {
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER"
};
var LanguageCode = {
  AB_GE: "ab-GE",
  AF_ZA: "af-ZA",
  AR_AE: "ar-AE",
  AR_SA: "ar-SA",
  AST_ES: "ast-ES",
  AZ_AZ: "az-AZ",
  BA_RU: "ba-RU",
  BE_BY: "be-BY",
  BG_BG: "bg-BG",
  BN_IN: "bn-IN",
  BS_BA: "bs-BA",
  CA_ES: "ca-ES",
  CKB_IQ: "ckb-IQ",
  CKB_IR: "ckb-IR",
  CS_CZ: "cs-CZ",
  CY_WL: "cy-WL",
  DA_DK: "da-DK",
  DE_CH: "de-CH",
  DE_DE: "de-DE",
  EL_GR: "el-GR",
  EN_AB: "en-AB",
  EN_AU: "en-AU",
  EN_GB: "en-GB",
  EN_IE: "en-IE",
  EN_IN: "en-IN",
  EN_NZ: "en-NZ",
  EN_US: "en-US",
  EN_WL: "en-WL",
  EN_ZA: "en-ZA",
  ES_ES: "es-ES",
  ES_US: "es-US",
  ET_EE: "et-EE",
  ET_ET: "et-ET",
  EU_ES: "eu-ES",
  FA_IR: "fa-IR",
  FI_FI: "fi-FI",
  FR_CA: "fr-CA",
  FR_FR: "fr-FR",
  GL_ES: "gl-ES",
  GU_IN: "gu-IN",
  HA_NG: "ha-NG",
  HE_IL: "he-IL",
  HI_IN: "hi-IN",
  HR_HR: "hr-HR",
  HU_HU: "hu-HU",
  HY_AM: "hy-AM",
  ID_ID: "id-ID",
  IS_IS: "is-IS",
  IT_IT: "it-IT",
  JA_JP: "ja-JP",
  KAB_DZ: "kab-DZ",
  KA_GE: "ka-GE",
  KK_KZ: "kk-KZ",
  KN_IN: "kn-IN",
  KO_KR: "ko-KR",
  KY_KG: "ky-KG",
  LG_IN: "lg-IN",
  LT_LT: "lt-LT",
  LV_LV: "lv-LV",
  MHR_RU: "mhr-RU",
  MI_NZ: "mi-NZ",
  MK_MK: "mk-MK",
  ML_IN: "ml-IN",
  MN_MN: "mn-MN",
  MR_IN: "mr-IN",
  MS_MY: "ms-MY",
  MT_MT: "mt-MT",
  NL_NL: "nl-NL",
  NO_NO: "no-NO",
  OR_IN: "or-IN",
  PA_IN: "pa-IN",
  PL_PL: "pl-PL",
  PS_AF: "ps-AF",
  PT_BR: "pt-BR",
  PT_PT: "pt-PT",
  RO_RO: "ro-RO",
  RU_RU: "ru-RU",
  RW_RW: "rw-RW",
  SI_LK: "si-LK",
  SK_SK: "sk-SK",
  SL_SI: "sl-SI",
  SO_SO: "so-SO",
  SR_RS: "sr-RS",
  SU_ID: "su-ID",
  SV_SE: "sv-SE",
  SW_BI: "sw-BI",
  SW_KE: "sw-KE",
  SW_RW: "sw-RW",
  SW_TZ: "sw-TZ",
  SW_UG: "sw-UG",
  TA_IN: "ta-IN",
  TE_IN: "te-IN",
  TH_TH: "th-TH",
  TL_PH: "tl-PH",
  TR_TR: "tr-TR",
  TT_RU: "tt-RU",
  UG_CN: "ug-CN",
  UK_UA: "uk-UA",
  UZ_UZ: "uz-UZ",
  VI_VN: "vi-VN",
  WO_SN: "wo-SN",
  ZH_CN: "zh-CN",
  ZH_HK: "zh-HK",
  ZH_TW: "zh-TW",
  ZU_ZA: "zu-ZA"
};
var MediaFormat = {
  AMR: "amr",
  FLAC: "flac",
  M4A: "m4a",
  MP3: "mp3",
  MP4: "mp4",
  OGG: "ogg",
  WAV: "wav",
  WEBM: "webm"
};
var PiiEntityType = {
  ADDRESS: "ADDRESS",
  ALL: "ALL",
  BANK_ACCOUNT_NUMBER: "BANK_ACCOUNT_NUMBER",
  BANK_ROUTING: "BANK_ROUTING",
  CREDIT_DEBIT_CVV: "CREDIT_DEBIT_CVV",
  CREDIT_DEBIT_EXPIRY: "CREDIT_DEBIT_EXPIRY",
  CREDIT_DEBIT_NUMBER: "CREDIT_DEBIT_NUMBER",
  EMAIL: "EMAIL",
  NAME: "NAME",
  PHONE: "PHONE",
  PIN: "PIN",
  SSN: "SSN"
};
var RedactionOutput = {
  REDACTED: "redacted",
  REDACTED_AND_UNREDACTED: "redacted_and_unredacted"
};
var RedactionType = {
  PII: "PII"
};
var VocabularyFilterMethod = {
  MASK: "mask",
  REMOVE: "remove",
  TAG: "tag"
};
var InputType = {
  POST_CALL: "POST_CALL",
  REAL_TIME: "REAL_TIME"
};
var SentimentValue = {
  MIXED: "MIXED",
  NEGATIVE: "NEGATIVE",
  NEUTRAL: "NEUTRAL",
  POSITIVE: "POSITIVE"
};
var TranscriptFilterType = {
  EXACT: "EXACT"
};
var MedicalScribeNoteTemplate = {
  BEHAVIORAL_SOAP: "BEHAVIORAL_SOAP",
  BIRP: "BIRP",
  DAP: "DAP",
  GIRPP: "GIRPP",
  HISTORY_AND_PHYSICAL: "HISTORY_AND_PHYSICAL",
  PHYSICAL_SOAP: "PHYSICAL_SOAP",
  SIRP: "SIRP"
};
var CLMLanguageCode = {
  DE_DE: "de-DE",
  EN_AU: "en-AU",
  EN_GB: "en-GB",
  EN_US: "en-US",
  ES_US: "es-US",
  HI_IN: "hi-IN",
  JA_JP: "ja-JP"
};
var ModelStatus = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  IN_PROGRESS: "IN_PROGRESS"
};
var VocabularyState = {
  FAILED: "FAILED",
  PENDING: "PENDING",
  READY: "READY"
};
var MedicalScribeParticipantRole = {
  CLINICIAN: "CLINICIAN",
  PATIENT: "PATIENT"
};
var MedicalScribeLanguageCode = {
  EN_US: "en-US"
};
var MedicalScribeJobStatus = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  IN_PROGRESS: "IN_PROGRESS",
  QUEUED: "QUEUED"
};
var MedicalContentIdentificationType = {
  PHI: "PHI"
};
var Specialty = {
  PRIMARYCARE: "PRIMARYCARE"
};
var TranscriptionJobStatus = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  IN_PROGRESS: "IN_PROGRESS",
  QUEUED: "QUEUED"
};
var Type = {
  CONVERSATION: "CONVERSATION",
  DICTATION: "DICTATION"
};
var SubtitleFormat = {
  SRT: "srt",
  VTT: "vtt"
};
var ToxicityCategory = {
  ALL: "ALL"
};
var OutputLocationType = {
  CUSTOMER_BUCKET: "CUSTOMER_BUCKET",
  SERVICE_BUCKET: "SERVICE_BUCKET"
};
var Pronouns2 = {
  HE_HIM: "HE_HIM",
  SHE_HER: "SHE_HER",
  THEY_THEM: "THEY_THEM"
};
export {
  Command as $Command,
  AbsoluteTimeRange$,
  BadRequestException,
  BadRequestException$,
  BaseModelName,
  CLMLanguageCode,
  CallAnalyticsFeature,
  CallAnalyticsJob$,
  CallAnalyticsJobDetails$,
  CallAnalyticsJobSettings$,
  CallAnalyticsJobStatus,
  CallAnalyticsJobSummary$,
  CallAnalyticsSkippedFeature$,
  CallAnalyticsSkippedReasonCode,
  CategoryProperties$,
  ChannelDefinition$,
  ClinicalNoteGenerationSettings$,
  ConflictException,
  ConflictException$,
  ContentRedaction$,
  CreateCallAnalyticsCategory$,
  CreateCallAnalyticsCategoryCommand,
  CreateCallAnalyticsCategoryRequest$,
  CreateCallAnalyticsCategoryResponse$,
  CreateLanguageModel$,
  CreateLanguageModelCommand,
  CreateLanguageModelRequest$,
  CreateLanguageModelResponse$,
  CreateMedicalVocabulary$,
  CreateMedicalVocabularyCommand,
  CreateMedicalVocabularyRequest$,
  CreateMedicalVocabularyResponse$,
  CreateVocabulary$,
  CreateVocabularyCommand,
  CreateVocabularyFilter$,
  CreateVocabularyFilterCommand,
  CreateVocabularyFilterRequest$,
  CreateVocabularyFilterResponse$,
  CreateVocabularyRequest$,
  CreateVocabularyResponse$,
  DeleteCallAnalyticsCategory$,
  DeleteCallAnalyticsCategoryCommand,
  DeleteCallAnalyticsCategoryRequest$,
  DeleteCallAnalyticsCategoryResponse$,
  DeleteCallAnalyticsJob$,
  DeleteCallAnalyticsJobCommand,
  DeleteCallAnalyticsJobRequest$,
  DeleteCallAnalyticsJobResponse$,
  DeleteLanguageModel$,
  DeleteLanguageModelCommand,
  DeleteLanguageModelRequest$,
  DeleteMedicalScribeJob$,
  DeleteMedicalScribeJobCommand,
  DeleteMedicalScribeJobRequest$,
  DeleteMedicalTranscriptionJob$,
  DeleteMedicalTranscriptionJobCommand,
  DeleteMedicalTranscriptionJobRequest$,
  DeleteMedicalVocabulary$,
  DeleteMedicalVocabularyCommand,
  DeleteMedicalVocabularyRequest$,
  DeleteTranscriptionJob$,
  DeleteTranscriptionJobCommand,
  DeleteTranscriptionJobRequest$,
  DeleteVocabulary$,
  DeleteVocabularyCommand,
  DeleteVocabularyFilter$,
  DeleteVocabularyFilterCommand,
  DeleteVocabularyFilterRequest$,
  DeleteVocabularyRequest$,
  DescribeLanguageModel$,
  DescribeLanguageModelCommand,
  DescribeLanguageModelRequest$,
  DescribeLanguageModelResponse$,
  GetCallAnalyticsCategory$,
  GetCallAnalyticsCategoryCommand,
  GetCallAnalyticsCategoryRequest$,
  GetCallAnalyticsCategoryResponse$,
  GetCallAnalyticsJob$,
  GetCallAnalyticsJobCommand,
  GetCallAnalyticsJobRequest$,
  GetCallAnalyticsJobResponse$,
  GetMedicalScribeJob$,
  GetMedicalScribeJobCommand,
  GetMedicalScribeJobRequest$,
  GetMedicalScribeJobResponse$,
  GetMedicalTranscriptionJob$,
  GetMedicalTranscriptionJobCommand,
  GetMedicalTranscriptionJobRequest$,
  GetMedicalTranscriptionJobResponse$,
  GetMedicalVocabulary$,
  GetMedicalVocabularyCommand,
  GetMedicalVocabularyRequest$,
  GetMedicalVocabularyResponse$,
  GetTranscriptionJob$,
  GetTranscriptionJobCommand,
  GetTranscriptionJobRequest$,
  GetTranscriptionJobResponse$,
  GetVocabulary$,
  GetVocabularyCommand,
  GetVocabularyFilter$,
  GetVocabularyFilterCommand,
  GetVocabularyFilterRequest$,
  GetVocabularyFilterResponse$,
  GetVocabularyRequest$,
  GetVocabularyResponse$,
  InputDataConfig$,
  InputType,
  InternalFailureException,
  InternalFailureException$,
  InterruptionFilter$,
  JobExecutionSettings$,
  LanguageCode,
  LanguageCodeItem$,
  LanguageIdSettings$,
  LanguageModel$,
  LimitExceededException,
  LimitExceededException$,
  ListCallAnalyticsCategories$,
  ListCallAnalyticsCategoriesCommand,
  ListCallAnalyticsCategoriesRequest$,
  ListCallAnalyticsCategoriesResponse$,
  ListCallAnalyticsJobs$,
  ListCallAnalyticsJobsCommand,
  ListCallAnalyticsJobsRequest$,
  ListCallAnalyticsJobsResponse$,
  ListLanguageModels$,
  ListLanguageModelsCommand,
  ListLanguageModelsRequest$,
  ListLanguageModelsResponse$,
  ListMedicalScribeJobs$,
  ListMedicalScribeJobsCommand,
  ListMedicalScribeJobsRequest$,
  ListMedicalScribeJobsResponse$,
  ListMedicalTranscriptionJobs$,
  ListMedicalTranscriptionJobsCommand,
  ListMedicalTranscriptionJobsRequest$,
  ListMedicalTranscriptionJobsResponse$,
  ListMedicalVocabularies$,
  ListMedicalVocabulariesCommand,
  ListMedicalVocabulariesRequest$,
  ListMedicalVocabulariesResponse$,
  ListTagsForResource$,
  ListTagsForResourceCommand,
  ListTagsForResourceRequest$,
  ListTagsForResourceResponse$,
  ListTranscriptionJobs$,
  ListTranscriptionJobsCommand,
  ListTranscriptionJobsRequest$,
  ListTranscriptionJobsResponse$,
  ListVocabularies$,
  ListVocabulariesCommand,
  ListVocabulariesRequest$,
  ListVocabulariesResponse$,
  ListVocabularyFilters$,
  ListVocabularyFiltersCommand,
  ListVocabularyFiltersRequest$,
  ListVocabularyFiltersResponse$,
  Media$,
  MediaFormat,
  MedicalContentIdentificationType,
  MedicalScribeChannelDefinition$,
  MedicalScribeContext$,
  MedicalScribeJob$,
  MedicalScribeJobStatus,
  MedicalScribeJobSummary$,
  MedicalScribeLanguageCode,
  MedicalScribeNoteTemplate,
  MedicalScribeOutput$,
  MedicalScribeParticipantRole,
  MedicalScribePatientContext$,
  MedicalScribeSettings$,
  MedicalTranscript$,
  MedicalTranscriptionJob$,
  MedicalTranscriptionJobSummary$,
  MedicalTranscriptionSetting$,
  ModelSettings$,
  ModelStatus,
  NonTalkTimeFilter$,
  NotFoundException,
  NotFoundException$,
  OutputLocationType,
  ParticipantRole,
  PiiEntityType,
  Pronouns2 as Pronouns,
  RedactionOutput,
  RedactionType,
  RelativeTimeRange$,
  Rule$,
  SentimentFilter$,
  SentimentValue,
  Settings$,
  Specialty,
  StartCallAnalyticsJob$,
  StartCallAnalyticsJobCommand,
  StartCallAnalyticsJobRequest$,
  StartCallAnalyticsJobResponse$,
  StartMedicalScribeJob$,
  StartMedicalScribeJobCommand,
  StartMedicalScribeJobRequest$,
  StartMedicalScribeJobResponse$,
  StartMedicalTranscriptionJob$,
  StartMedicalTranscriptionJobCommand,
  StartMedicalTranscriptionJobRequest$,
  StartMedicalTranscriptionJobResponse$,
  StartTranscriptionJob$,
  StartTranscriptionJobCommand,
  StartTranscriptionJobRequest$,
  StartTranscriptionJobResponse$,
  SubtitleFormat,
  Subtitles$,
  SubtitlesOutput$,
  Summarization$,
  Tag$,
  TagResource$,
  TagResourceCommand,
  TagResourceRequest$,
  TagResourceResponse$,
  ToxicityCategory,
  ToxicityDetectionSettings$,
  Transcribe,
  TranscribeClient,
  TranscribeServiceException,
  TranscribeServiceException$,
  Transcript$,
  TranscriptFilter$,
  TranscriptFilterType,
  TranscriptionJob$,
  TranscriptionJobStatus,
  TranscriptionJobSummary$,
  Type,
  UntagResource$,
  UntagResourceCommand,
  UntagResourceRequest$,
  UntagResourceResponse$,
  UpdateCallAnalyticsCategory$,
  UpdateCallAnalyticsCategoryCommand,
  UpdateCallAnalyticsCategoryRequest$,
  UpdateCallAnalyticsCategoryResponse$,
  UpdateMedicalVocabulary$,
  UpdateMedicalVocabularyCommand,
  UpdateMedicalVocabularyRequest$,
  UpdateMedicalVocabularyResponse$,
  UpdateVocabulary$,
  UpdateVocabularyCommand,
  UpdateVocabularyFilter$,
  UpdateVocabularyFilterCommand,
  UpdateVocabularyFilterRequest$,
  UpdateVocabularyFilterResponse$,
  UpdateVocabularyRequest$,
  UpdateVocabularyResponse$,
  VocabularyFilterInfo$,
  VocabularyFilterMethod,
  VocabularyInfo$,
  VocabularyState,
  Client as __Client,
  errorTypeRegistries,
  paginateListCallAnalyticsCategories,
  paginateListCallAnalyticsJobs,
  paginateListLanguageModels,
  paginateListMedicalScribeJobs,
  paginateListMedicalTranscriptionJobs,
  paginateListMedicalVocabularies,
  paginateListTranscriptionJobs,
  paginateListVocabularies,
  paginateListVocabularyFilters,
  waitForCallAnalyticsJobCompleted,
  waitForLanguageModelCompleted,
  waitForMedicalScribeJobCompleted,
  waitForMedicalTranscriptionJobCompleted,
  waitForMedicalVocabularyReady,
  waitForTranscriptionJobCompleted,
  waitForVocabularyReady,
  waitUntilCallAnalyticsJobCompleted,
  waitUntilLanguageModelCompleted,
  waitUntilMedicalScribeJobCompleted,
  waitUntilMedicalTranscriptionJobCompleted,
  waitUntilMedicalVocabularyReady,
  waitUntilTranscriptionJobCompleted,
  waitUntilVocabularyReady
};
//# sourceMappingURL=@aws-sdk_client-transcribe.js.map
