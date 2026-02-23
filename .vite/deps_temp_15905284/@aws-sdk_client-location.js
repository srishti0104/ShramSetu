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

// node_modules/@aws-sdk/client-location/dist-es/auth/httpAuthSchemeProvider.js
var defaultLocationHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
      name: "geo",
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
var defaultLocationHttpAuthSchemeProvider = (authParameters) => {
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

// node_modules/@aws-sdk/client-location/dist-es/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
  return Object.assign(options, {
    useDualstackEndpoint: options.useDualstackEndpoint ?? false,
    useFipsEndpoint: options.useFipsEndpoint ?? false,
    defaultSigningName: "geo"
  });
};
var commonParams = {
  UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
  Endpoint: { type: "builtInParams", name: "endpoint" },
  Region: { type: "builtInParams", name: "region" },
  UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
};

// node_modules/@aws-sdk/client-location/package.json
var package_default = {
  name: "@aws-sdk/client-location",
  description: "AWS SDK for JavaScript Location Client for Node.js, Browser and React Native",
  version: "3.995.0",
  scripts: {
    build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
    "build:cjs": "node ../../scripts/compilation/inline client-location",
    "build:es": "tsc -p tsconfig.es.json",
    "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
    "build:types": "tsc -p tsconfig.types.json",
    "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
    clean: "premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo",
    "extract:docs": "api-extractor run --local",
    "generate:client": "node ../../scripts/generate-clients/single-service --solo location",
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
  homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-location",
  repository: {
    type: "git",
    url: "https://github.com/aws/aws-sdk-js-v3.git",
    directory: "clients/client-location"
  }
};

// node_modules/@aws-sdk/client-location/dist-es/endpoint/ruleset.js
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
var _data = { version: "1.0", parameters: { Region: h, UseDualStack: i, UseFIPS: i, Endpoint: h }, rules: [{ conditions: [{ [t]: b, [u]: [j] }], rules: [{ conditions: p, error: "Invalid Configuration: FIPS and custom endpoint are not supported", type: d }, { conditions: q, error: "Invalid Configuration: Dualstack and custom endpoint are not supported", type: d }, { endpoint: { url: j, properties: m, headers: m }, type: e }], type: f }, { conditions: [{ [t]: b, [u]: r }], rules: [{ conditions: [{ [t]: "aws.partition", [u]: r, assign: g }], rules: [{ conditions: [k, l], rules: [{ conditions: [{ [t]: c, [u]: [a, n] }, o], rules: [{ endpoint: { url: "https://geo-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "FIPS and DualStack are enabled, but this partition does not support one or both", type: d }], type: f }, { conditions: p, rules: [{ conditions: [{ [t]: c, [u]: [n, a] }], rules: [{ endpoint: { url: "https://geo-fips.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "FIPS is enabled but this partition does not support FIPS", type: d }], type: f }, { conditions: q, rules: [{ conditions: [o], rules: [{ endpoint: { url: "https://geo.{Region}.{PartitionResult#dualStackDnsSuffix}", properties: m, headers: m }, type: e }], type: f }, { error: "DualStack is enabled but this partition does not support DualStack", type: d }], type: f }, { endpoint: { url: "https://geo.{Region}.{PartitionResult#dnsSuffix}", properties: m, headers: m }, type: e }], type: f }], type: f }, { error: "Invalid Configuration: Missing Region", type: d }] };
var ruleSet = _data;

// node_modules/@aws-sdk/client-location/dist-es/endpoint/endpointResolver.js
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

// node_modules/@aws-sdk/client-location/dist-es/models/LocationServiceException.js
var LocationServiceException = class _LocationServiceException extends ServiceException {
  constructor(options) {
    super(options);
    Object.setPrototypeOf(this, _LocationServiceException.prototype);
  }
};

// node_modules/@aws-sdk/client-location/dist-es/models/errors.js
var AccessDeniedException = class _AccessDeniedException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "AccessDeniedException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "AccessDeniedException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _AccessDeniedException.prototype);
    this.Message = opts.Message;
  }
};
var ConflictException = class _ConflictException extends LocationServiceException {
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
var InternalServerException = class _InternalServerException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "InternalServerException",
      $fault: "server",
      ...opts
    });
    __publicField(this, "name", "InternalServerException");
    __publicField(this, "$fault", "server");
    __publicField(this, "$retryable", {});
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _InternalServerException.prototype);
    this.Message = opts.Message;
  }
};
var ServiceQuotaExceededException = class _ServiceQuotaExceededException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "ServiceQuotaExceededException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ServiceQuotaExceededException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ServiceQuotaExceededException.prototype);
    this.Message = opts.Message;
  }
};
var ThrottlingException = class _ThrottlingException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "ThrottlingException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ThrottlingException");
    __publicField(this, "$fault", "client");
    __publicField(this, "$retryable", {});
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ThrottlingException.prototype);
    this.Message = opts.Message;
  }
};
var ValidationException = class _ValidationException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "ValidationException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ValidationException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    __publicField(this, "Reason");
    __publicField(this, "FieldList");
    Object.setPrototypeOf(this, _ValidationException.prototype);
    this.Message = opts.Message;
    this.Reason = opts.Reason;
    this.FieldList = opts.FieldList;
  }
};
var ResourceNotFoundException = class _ResourceNotFoundException extends LocationServiceException {
  constructor(opts) {
    super({
      name: "ResourceNotFoundException",
      $fault: "client",
      ...opts
    });
    __publicField(this, "name", "ResourceNotFoundException");
    __publicField(this, "$fault", "client");
    __publicField(this, "Message");
    Object.setPrototypeOf(this, _ResourceNotFoundException.prototype);
    this.Message = opts.Message;
  }
};

// node_modules/@aws-sdk/client-location/dist-es/schemas/schemas_0.js
var _A = "Accuracy";
var _AA = "AndroidApp";
var _AAA = "AllowAndroidApps";
var _AAAl = "AllowAppleApps";
var _AAL = "AndroidAppList";
var _AALp = "AppleAppList";
var _AAl = "AllowActions";
var _AAp = "AppleApp";
var _ADE = "AccessDeniedException";
var _AF = "AvoidFerries";
var _AK = "ApiKey";
var _AKF = "ApiKeyFilter";
var _AKR = "ApiKeyRestrictions";
var _AN = "AddressNumber";
var _AR = "AllowResources";
var _ARl = "AllowReferers";
var _AT = "AvoidTolls";
var _ATC = "AssociateTrackerConsumer";
var _ATCR = "AssociateTrackerConsumerRequest";
var _ATCRs = "AssociateTrackerConsumerResponse";
var _ATr = "ArrivalTime";
var _B = "Blob";
var _BB = "BoundingBox";
var _BDDPH = "BatchDeleteDevicePositionHistory";
var _BDDPHE = "BatchDeleteDevicePositionHistoryError";
var _BDDPHEL = "BatchDeleteDevicePositionHistoryErrorList";
var _BDDPHR = "BatchDeleteDevicePositionHistoryRequest";
var _BDDPHRa = "BatchDeleteDevicePositionHistoryResponse";
var _BDG = "BatchDeleteGeofence";
var _BDGE = "BatchDeleteGeofenceError";
var _BDGEL = "BatchDeleteGeofenceErrorList";
var _BDGR = "BatchDeleteGeofenceRequest";
var _BDGRa = "BatchDeleteGeofenceResponse";
var _BEG = "Base64EncodedGeobuf";
var _BEGE = "BatchEvaluateGeofencesError";
var _BEGEL = "BatchEvaluateGeofencesErrorList";
var _BEGR = "BatchEvaluateGeofencesRequest";
var _BEGRa = "BatchEvaluateGeofencesResponse";
var _BEGa = "BatchEvaluateGeofences";
var _BGDP = "BatchGetDevicePosition";
var _BGDPE = "BatchGetDevicePositionError";
var _BGDPEL = "BatchGetDevicePositionErrorList";
var _BGDPR = "BatchGetDevicePositionRequest";
var _BGDPRa = "BatchGetDevicePositionResponse";
var _BI = "BundleId";
var _BIE = "BatchItemError";
var _BP = "BiasPosition";
var _BPG = "BatchPutGeofence";
var _BPGE = "BatchPutGeofenceError";
var _BPGEL = "BatchPutGeofenceErrorList";
var _BPGR = "BatchPutGeofenceRequest";
var _BPGRE = "BatchPutGeofenceRequestEntry";
var _BPGREL = "BatchPutGeofenceRequestEntryList";
var _BPGRa = "BatchPutGeofenceResponse";
var _BPGS = "BatchPutGeofenceSuccess";
var _BPGSL = "BatchPutGeofenceSuccessList";
var _BUDP = "BatchUpdateDevicePosition";
var _BUDPE = "BatchUpdateDevicePositionError";
var _BUDPEL = "BatchUpdateDevicePositionErrorList";
var _BUDPR = "BatchUpdateDevicePositionRequest";
var _BUDPRa = "BatchUpdateDevicePositionResponse";
var _C = "Code";
var _CA = "ConsumerArn";
var _CAa = "CalculatorArn";
var _CAo = "CollectionArn";
var _CAon = "ConsumerArns";
var _CC = "CountryCode3";
var _CCL = "CountryCodeList";
var _CCOE = "CountryCode3OrEmpty";
var _CC_ = "Cache-Control";
var _CCa = "CacheControl";
var _CE = "ConflictException";
var _CF = "CertificateFingerprint";
var _CGC = "CreateGeofenceCollection";
var _CGCR = "CreateGeofenceCollectionRequest";
var _CGCRr = "CreateGeofenceCollectionResponse";
var _CI = "CellId";
var _CK = "CreateKey";
var _CKR = "CreateKeyRequest";
var _CKRr = "CreateKeyResponse";
var _CL = "CustomLayers";
var _CM = "CreateMap";
var _CMO = "CarModeOptions";
var _CMR = "CreateMapRequest";
var _CMRr = "CreateMapResponse";
var _CN = "CollectionName";
var _CNa = "CalculatorName";
var _CPI = "CreatePlaceIndex";
var _CPIR = "CreatePlaceIndexRequest";
var _CPIRr = "CreatePlaceIndexResponse";
var _CR = "CalculateRoute";
var _CRC = "CreateRouteCalculator";
var _CRCMO = "CalculateRouteCarModeOptions";
var _CRCR = "CreateRouteCalculatorRequest";
var _CRCRr = "CreateRouteCalculatorResponse";
var _CRM = "CalculateRouteMatrix";
var _CRMR = "CalculateRouteMatrixRequest";
var _CRMRa = "CalculateRouteMatrixResponse";
var _CRMS = "CalculateRouteMatrixSummary";
var _CRR = "CalculateRouteRequest";
var _CRRa = "CalculateRouteResponse";
var _CRS = "CalculateRouteSummary";
var _CRTMO = "CalculateRouteTruckModeOptions";
var _CS = "CellSignals";
var _CT = "CreateTime";
var _CTR = "CreateTrackerRequest";
var _CTRr = "CreateTrackerResponse";
var _CT_ = "Content-Type";
var _CTo = "ContentType";
var _CTr = "CreateTracker";
var _CU = "ConfigurationUpdate";
var _Ca = "Categories";
var _Ce = "Center";
var _Ci = "Circle";
var _Co = "Configuration";
var _Cou = "Country";
var _D = "Distance";
var _DD = "DeviationDistance";
var _DGC = "DeleteGeofenceCollection";
var _DGCR = "DeleteGeofenceCollectionRequest";
var _DGCRe = "DeleteGeofenceCollectionResponse";
var _DGCRes = "DescribeGeofenceCollectionRequest";
var _DGCResc = "DescribeGeofenceCollectionResponse";
var _DGCe = "DescribeGeofenceCollection";
var _DI = "DeviceId";
var _DIe = "DeviceIds";
var _DK = "DeleteKey";
var _DKR = "DeleteKeyRequest";
var _DKRe = "DeleteKeyResponse";
var _DKRes = "DescribeKeyRequest";
var _DKResc = "DescribeKeyResponse";
var _DKe = "DescribeKey";
var _DM = "DeleteMap";
var _DMR = "DeleteMapRequest";
var _DMRe = "DeleteMapResponse";
var _DMRes = "DescribeMapRequest";
var _DMResc = "DescribeMapResponse";
var _DMe = "DescribeMap";
var _DN = "DepartNow";
var _DP = "DevicePositions";
var _DPI = "DeletePlaceIndex";
var _DPIR = "DeletePlaceIndexRequest";
var _DPIRe = "DeletePlaceIndexResponse";
var _DPIRes = "DescribePlaceIndexRequest";
var _DPIResc = "DescribePlaceIndexResponse";
var _DPIe = "DescribePlaceIndex";
var _DPL = "DevicePositionList";
var _DPU = "DevicePositionUpdates";
var _DPUL = "DevicePositionUpdateList";
var _DPUe = "DevicePositionUpdate";
var _DPe = "DeparturePositions";
var _DPep = "DeparturePosition";
var _DPes = "DestinationPositions";
var _DPest = "DestinationPosition";
var _DPev = "DevicePosition";
var _DRC = "DeleteRouteCalculator";
var _DRCR = "DeleteRouteCalculatorRequest";
var _DRCRe = "DeleteRouteCalculatorResponse";
var _DRCRes = "DescribeRouteCalculatorRequest";
var _DRCResc = "DescribeRouteCalculatorResponse";
var _DRCe = "DescribeRouteCalculator";
var _DS = "DataSource";
var _DSC = "DataSourceConfiguration";
var _DSe = "DeviceState";
var _DSu = "DurationSeconds";
var _DT = "DepartureTime";
var _DTC = "DisassociateTrackerConsumer";
var _DTCR = "DisassociateTrackerConsumerRequest";
var _DTCRi = "DisassociateTrackerConsumerResponse";
var _DTR = "DeleteTrackerRequest";
var _DTRe = "DeleteTrackerResponse";
var _DTRes = "DescribeTrackerRequest";
var _DTResc = "DescribeTrackerResponse";
var _DTe = "DeleteTracker";
var _DTes = "DescribeTracker";
var _DU = "DistanceUnit";
var _De = "Description";
var _Di = "Dimensions";
var _E = "Error";
var _EBE = "EventBridgeEnabled";
var _EC = "ErrorCount";
var _EI = "EventId";
var _EP = "EndPosition";
var _ET = "ExpireTime";
var _ETE = "EndTimeExclusive";
var _ETv = "EventType";
var _Ea = "Earfcn";
var _En = "Entries";
var _Er = "Errors";
var _F = "Filter";
var _FBB = "FilterBBox";
var _FBT = "ForecastedBreachTime";
var _FC = "FilterCountries";
var _FCi = "FilterCategories";
var _FD = "ForceDelete";
var _FE = "ForecastedEvent";
var _FEL = "ForecastedEventsList";
var _FEo = "ForecastedEvents";
var _FG = "FilterGeometry";
var _FGE = "ForecastGeofenceEvents";
var _FGEDS = "ForecastGeofenceEventsDeviceState";
var _FGER = "ForecastGeofenceEventsRequest";
var _FGERo = "ForecastGeofenceEventsResponse";
var _FL = "FieldList";
var _FN = "FileName";
var _FPCL = "FilterPlaceCategoryList";
var _FS = "FontStack";
var _FU = "ForceUpdate";
var _FUR = "FontUnicodeRange";
var _G = "Geometry";
var _GC = "GeofenceCount";
var _GDP = "GetDevicePosition";
var _GDPH = "GetDevicePositionHistory";
var _GDPHR = "GetDevicePositionHistoryRequest";
var _GDPHRe = "GetDevicePositionHistoryResponse";
var _GDPR = "GetDevicePositionRequest";
var _GDPRe = "GetDevicePositionResponse";
var _GG = "GeofenceGeometry";
var _GGR = "GetGeofenceRequest";
var _GGRe = "GetGeofenceResponse";
var _GGe = "GetGeofence";
var _GI = "GeofenceId";
var _GIe = "GeofenceIds";
var _GMG = "GetMapGlyphs";
var _GMGR = "GetMapGlyphsRequest";
var _GMGRe = "GetMapGlyphsResponse";
var _GMS = "GetMapSprites";
var _GMSD = "GetMapStyleDescriptor";
var _GMSDR = "GetMapStyleDescriptorRequest";
var _GMSDRe = "GetMapStyleDescriptorResponse";
var _GMSR = "GetMapSpritesRequest";
var _GMSRe = "GetMapSpritesResponse";
var _GMT = "GetMapTile";
var _GMTR = "GetMapTileRequest";
var _GMTRe = "GetMapTileResponse";
var _GO = "GeometryOffset";
var _GP = "GeofenceProperties";
var _GPR = "GetPlaceRequest";
var _GPRe = "GetPlaceResponse";
var _GPe = "GetPlace";
var _Ge = "Geobuf";
var _H = "Horizontal";
var _He = "Height";
var _I = "Interpolated";
var _IA = "IndexArn";
var _IAp = "Ipv4Address";
var _IDIG = "IsDeviceInGeofence";
var _ILG = "IncludeLegGeometry";
var _IN = "IndexName";
var _IS = "InferredState";
var _ISE = "InternalServerException";
var _IU = "IntendedUse";
var _K = "Key";
var _KA = "KeyArn";
var _KKEGQ = "KmsKeyEnableGeospatialQueries";
var _KKI = "KmsKeyId";
var _KN = "KeyName";
var _KS = "KeyStatus";
var _L = "Legs";
var _LCD = "LteCellDetails";
var _LCDL = "LteCellDetailsList";
var _LDP = "ListDevicePositions";
var _LDPR = "ListDevicePositionsRequest";
var _LDPRE = "ListDevicePositionsResponseEntry";
var _LDPREL = "ListDevicePositionsResponseEntryList";
var _LDPRi = "ListDevicePositionsResponse";
var _LG = "LegGeometry";
var _LGC = "ListGeofenceCollections";
var _LGCR = "ListGeofenceCollectionsRequest";
var _LGCRE = "ListGeofenceCollectionsResponseEntry";
var _LGCREL = "ListGeofenceCollectionsResponseEntryList";
var _LGCRi = "ListGeofenceCollectionsResponse";
var _LGR = "ListGeofencesRequest";
var _LGRE = "ListGeofenceResponseEntry";
var _LGREL = "ListGeofenceResponseEntryList";
var _LGRi = "ListGeofencesResponse";
var _LGi = "ListGeofences";
var _LI = "LocalId";
var _LK = "ListKeys";
var _LKR = "ListKeysRequest";
var _LKRE = "ListKeysResponseEntry";
var _LKREL = "ListKeysResponseEntryList";
var _LKRi = "ListKeysResponse";
var _LL = "LegList";
var _LLI = "LteLocalId";
var _LM = "ListMaps";
var _LMR = "ListMapsRequest";
var _LMRE = "ListMapsResponseEntry";
var _LMREL = "ListMapsResponseEntryList";
var _LMRi = "ListMapsResponse";
var _LNM = "LteNetworkMeasurements";
var _LNML = "LteNetworkMeasurementsList";
var _LPI = "ListPlaceIndexes";
var _LPIR = "ListPlaceIndexesRequest";
var _LPIRE = "ListPlaceIndexesResponseEntry";
var _LPIREL = "ListPlaceIndexesResponseEntryList";
var _LPIRi = "ListPlaceIndexesResponse";
var _LR = "LinearRing";
var _LRC = "ListRouteCalculators";
var _LRCR = "ListRouteCalculatorsRequest";
var _LRCRE = "ListRouteCalculatorsResponseEntry";
var _LRCREL = "ListRouteCalculatorsResponseEntryList";
var _LRCRi = "ListRouteCalculatorsResponse";
var _LRi = "LinearRings";
var _LS = "LineString";
var _LT = "ListTrackers";
var _LTC = "ListTrackerConsumers";
var _LTCR = "ListTrackerConsumersRequest";
var _LTCRi = "ListTrackerConsumersResponse";
var _LTFR = "ListTagsForResource";
var _LTFRR = "ListTagsForResourceRequest";
var _LTFRRi = "ListTagsForResourceResponse";
var _LTR = "ListTrackersRequest";
var _LTRE = "ListTrackersResponseEntry";
var _LTREL = "ListTrackersResponseEntryList";
var _LTRi = "ListTrackersResponse";
var _La = "Language";
var _Lab = "Label";
var _Le = "Leg";
var _Len = "Length";
var _M = "Message";
var _MA = "MapArn";
var _MAa = "MacAddress";
var _MC = "MapConfiguration";
var _MCU = "MapConfigurationUpdate";
var _MLR = "MultiLinearRings";
var _MN = "MapName";
var _MP = "MultiPolygon";
var _MR = "MaxResults";
var _Mc = "Mcc";
var _Mn = "Mnc";
var _Mu = "Municipality";
var _N = "Neighborhood";
var _NC = "NrCapable";
var _ND = "NearestDistance";
var _NE = "NoExpiry";
var _NM = "NetworkMeasurements";
var _NT = "NextToken";
var _Na = "Name";
var _O = "Offset";
var _OF = "OptimizeFor";
var _P = "Package";
var _PA = "PositionalAccuracy";
var _PC = "PlaceCategory";
var _PCL = "PlaceCategoryList";
var _PCo = "PostalCode";
var _PD = "ProxyDetected";
var _PF = "PositionFiltering";
var _PG = "PlaceGeometry";
var _PGR = "PutGeofenceRequest";
var _PGRu = "PutGeofenceResponse";
var _PGu = "PutGeofence";
var _PI = "PlaceId";
var _PL = "PositionList";
var _PM = "PropertyMap";
var _PP = "PricingPlan";
var _PPDS = "PricingPlanDataSource";
var _PPM = "PositionPropertyMap";
var _PPo = "PositionProperties";
var _PSC = "PlaceSupplementalCategory";
var _PSCL = "PlaceSupplementalCategoryList";
var _PV = "PoliticalView";
var _Pc = "Pci";
var _Pl = "Place";
var _Po = "Position";
var _Poi = "Point";
var _Pol = "Polygon";
var _R = "Reason";
var _RA = "ResourceArn";
var _RBB = "RouteBBox";
var _RBBe = "ResultBBox";
var _RC = "RouteCount";
var _RM = "RouteMatrix";
var _RME = "RouteMatrixEntry";
var _RMEE = "RouteMatrixEntryError";
var _RMR = "RouteMatrixRow";
var _RNFE = "ResourceNotFoundException";
var _RP = "RefererPattern";
var _RPL = "RefererPatternList";
var _RT = "ReceivedTime";
var _Ra = "Radius";
var _Re = "Restrictions";
var _Reg = "Region";
var _Rel = "Relevance";
var _Res = "Results";
var _Rs = "Rsrp";
var _Rsr = "Rsrq";
var _Rss = "Rss";
var _S = "Successes";
var _SB = "SensitiveBoolean";
var _SC = "SupplementalCategories";
var _SD = "SensitiveDouble";
var _SDP = "SnappedDeparturePositions";
var _SDPn = "SnappedDestinationPositions";
var _SFPR = "SearchForPositionResult";
var _SFPRL = "SearchForPositionResultList";
var _SFSR = "SearchForSuggestionsResult";
var _SFSRL = "SearchForSuggestionsResultList";
var _SFTR = "SearchForTextResult";
var _SFTRL = "SearchForTextResultList";
var _SI = "SensitiveInteger";
var _SL = "StepList";
var _SM = "SubMunicipality";
var _SP = "StartPosition";
var _SPIFP = "SearchPlaceIndexForPosition";
var _SPIFPR = "SearchPlaceIndexForPositionRequest";
var _SPIFPRe = "SearchPlaceIndexForPositionResponse";
var _SPIFPS = "SearchPlaceIndexForPositionSummary";
var _SPIFS = "SearchPlaceIndexForSuggestions";
var _SPIFSR = "SearchPlaceIndexForSuggestionsRequest";
var _SPIFSRe = "SearchPlaceIndexForSuggestionsResponse";
var _SPIFSS = "SearchPlaceIndexForSuggestionsSummary";
var _SPIFT = "SearchPlaceIndexForText";
var _SPIFTR = "SearchPlaceIndexForTextRequest";
var _SPIFTRe = "SearchPlaceIndexForTextResponse";
var _SPIFTS = "SearchPlaceIndexForTextSummary";
var _SQEE = "ServiceQuotaExceededException";
var _SR = "SubRegion";
var _SS = "SensitiveString";
var _ST = "SampleTime";
var _STI = "StartTimeInclusive";
var _SU = "SpeedUnit";
var _Sp = "Speed";
var _St = "Status";
var _Ste = "Steps";
var _Step = "Step";
var _Str = "Street";
var _Sty = "Style";
var _Su = "Summary";
var _T = "Timestamp";
var _TA = "TrackerArn";
var _TAi = "TimingAdvance";
var _TD = "TruckDimensions";
var _TE = "ThrottlingException";
var _TFG = "TrackingFilterGeometry";
var _THM = "TimeHorizonMinutes";
var _TK = "TagKeys";
var _TM = "TravelMode";
var _TMO = "TruckModeOptions";
var _TN = "TrackerName";
var _TR = "TagResource";
var _TRR = "TagResourceRequest";
var _TRRa = "TagResourceResponse";
var _TW = "TruckWeight";
var _TZ = "TimeZone";
var _Ta = "Tags";
var _Tac = "Tac";
var _Te = "Text";
var _To = "Total";
var _U = "Updates";
var _UGC = "UpdateGeofenceCollection";
var _UGCR = "UpdateGeofenceCollectionRequest";
var _UGCRp = "UpdateGeofenceCollectionResponse";
var _UK = "UpdateKey";
var _UKR = "UpdateKeyRequest";
var _UKRp = "UpdateKeyResponse";
var _UM = "UpdateMap";
var _UMR = "UpdateMapRequest";
var _UMRp = "UpdateMapResponse";
var _UN = "UnitNumber";
var _UPI = "UpdatePlaceIndex";
var _UPIR = "UpdatePlaceIndexRequest";
var _UPIRp = "UpdatePlaceIndexResponse";
var _UR = "UntagResource";
var _URC = "UpdateRouteCalculator";
var _URCR = "UpdateRouteCalculatorRequest";
var _URCRp = "UpdateRouteCalculatorResponse";
var _URR = "UntagResourceRequest";
var _URRn = "UntagResourceResponse";
var _UT = "UpdateTime";
var _UTR = "UpdateTrackerRequest";
var _UTRp = "UpdateTrackerResponse";
var _UTn = "UnitType";
var _UTp = "UpdateTracker";
var _Un = "Unit";
var _VDP = "VerifyDevicePosition";
var _VDPR = "VerifyDevicePositionRequest";
var _VDPRe = "VerifyDevicePositionResponse";
var _VE = "ValidationException";
var _VEF = "ValidationExceptionField";
var _VEFL = "ValidationExceptionFieldList";
var _W = "Weight";
var _WFAP = "WiFiAccessPoints";
var _WFAPL = "WiFiAccessPointList";
var _WFAPi = "WiFiAccessPoint";
var _WP = "WaypointPositions";
var _WPL = "WaypointPositionList";
var _Wi = "Width";
var _X = "X";
var _Y = "Y";
var _Z = "Z";
var _c = "client";
var _e = "error";
var _en = "endpoint";
var _fD = "forceDelete";
var _fL = "fieldList";
var _h = "http";
var _hE = "httpError";
var _hH = "httpHeader";
var _hQ = "httpQuery";
var _jN = "jsonName";
var _k = "key";
var _l = "language";
var _m = "message";
var _n = "name";
var _r = "reason";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.location";
var _se = "server";
var _tK = "tagKeys";
var n0 = "com.amazonaws.location";
var _s_registry = TypeRegistry.for(_s);
var LocationServiceException$ = [-3, _s, "LocationServiceException", 0, [], []];
_s_registry.registerError(LocationServiceException$, LocationServiceException);
var n0_registry = TypeRegistry.for(n0);
var AccessDeniedException$ = [
  -3,
  n0,
  _ADE,
  { [_e]: _c, [_hE]: 403 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var ConflictException$ = [
  -3,
  n0,
  _CE,
  { [_e]: _c, [_hE]: 409 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(ConflictException$, ConflictException);
var InternalServerException$ = [
  -3,
  n0,
  _ISE,
  { [_e]: _se, [_hE]: 500 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(InternalServerException$, InternalServerException);
var ResourceNotFoundException$ = [
  -3,
  n0,
  _RNFE,
  { [_e]: _c, [_hE]: 404 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(ResourceNotFoundException$, ResourceNotFoundException);
var ServiceQuotaExceededException$ = [
  -3,
  n0,
  _SQEE,
  { [_e]: _c, [_hE]: 402 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(ServiceQuotaExceededException$, ServiceQuotaExceededException);
var ThrottlingException$ = [
  -3,
  n0,
  _TE,
  { [_e]: _c, [_hE]: 429 },
  [_M],
  [[0, { [_jN]: _m }]],
  1
];
n0_registry.registerError(ThrottlingException$, ThrottlingException);
var ValidationException$ = [
  -3,
  n0,
  _VE,
  { [_e]: _c, [_hE]: 400 },
  [_M, _R, _FL],
  [[0, { [_jN]: _m }], [0, { [_jN]: _r }], [() => ValidationExceptionFieldList, { [_jN]: _fL }]],
  3
];
n0_registry.registerError(ValidationException$, ValidationException);
var errorTypeRegistries = [
  _s_registry,
  n0_registry
];
var ApiKey = [0, n0, _AK, 8, 0];
var Base64EncodedGeobuf = [0, n0, _BEG, 8, 21];
var CountryCode3 = [0, n0, _CC, 8, 0];
var CountryCode3OrEmpty = [0, n0, _CCOE, 8, 0];
var PlaceCategory = [0, n0, _PC, 8, 0];
var PlaceId = [0, n0, _PI, 8, 0];
var PlaceSupplementalCategory = [0, n0, _PSC, 8, 0];
var RefererPattern = [0, n0, _RP, 8, 0];
var SensitiveBoolean = [0, n0, _SB, 8, 2];
var SensitiveDouble = [0, n0, _SD, 8, 1];
var SensitiveInteger = [0, n0, _SI, 8, 1];
var SensitiveString = [0, n0, _SS, 8, 0];
var Timestamp = [0, n0, _T, 8, 5];
var AndroidApp$ = [
  3,
  n0,
  _AA,
  0,
  [_P, _CF],
  [0, 0],
  2
];
var ApiKeyFilter$ = [
  3,
  n0,
  _AKF,
  0,
  [_KS],
  [0]
];
var ApiKeyRestrictions$ = [
  3,
  n0,
  _AKR,
  0,
  [_AAl, _AR, _ARl, _AAA, _AAAl],
  [64 | 0, 64 | 0, [() => RefererPatternList, 0], () => AndroidAppList, () => AppleAppList],
  2
];
var AppleApp$ = [
  3,
  n0,
  _AAp,
  0,
  [_BI],
  [0],
  1
];
var AssociateTrackerConsumerRequest$ = [
  3,
  n0,
  _ATCR,
  0,
  [_TN, _CA],
  [[0, 1], 0],
  2
];
var AssociateTrackerConsumerResponse$ = [
  3,
  n0,
  _ATCRs,
  0,
  [],
  []
];
var BatchDeleteDevicePositionHistoryError$ = [
  3,
  n0,
  _BDDPHE,
  0,
  [_DI, _E],
  [0, () => BatchItemError$],
  2
];
var BatchDeleteDevicePositionHistoryRequest$ = [
  3,
  n0,
  _BDDPHR,
  0,
  [_TN, _DIe],
  [[0, 1], 64 | 0],
  2
];
var BatchDeleteDevicePositionHistoryResponse$ = [
  3,
  n0,
  _BDDPHRa,
  0,
  [_Er],
  [() => BatchDeleteDevicePositionHistoryErrorList],
  1
];
var BatchDeleteGeofenceError$ = [
  3,
  n0,
  _BDGE,
  0,
  [_GI, _E],
  [0, () => BatchItemError$],
  2
];
var BatchDeleteGeofenceRequest$ = [
  3,
  n0,
  _BDGR,
  0,
  [_CN, _GIe],
  [[0, 1], 64 | 0],
  2
];
var BatchDeleteGeofenceResponse$ = [
  3,
  n0,
  _BDGRa,
  0,
  [_Er],
  [() => BatchDeleteGeofenceErrorList],
  1
];
var BatchEvaluateGeofencesError$ = [
  3,
  n0,
  _BEGE,
  0,
  [_DI, _ST, _E],
  [0, [() => Timestamp, 0], () => BatchItemError$],
  3
];
var BatchEvaluateGeofencesRequest$ = [
  3,
  n0,
  _BEGR,
  0,
  [_CN, _DPU],
  [[0, 1], [() => DevicePositionUpdateList, 0]],
  2
];
var BatchEvaluateGeofencesResponse$ = [
  3,
  n0,
  _BEGRa,
  0,
  [_Er],
  [[() => BatchEvaluateGeofencesErrorList, 0]],
  1
];
var BatchGetDevicePositionError$ = [
  3,
  n0,
  _BGDPE,
  0,
  [_DI, _E],
  [0, () => BatchItemError$],
  2
];
var BatchGetDevicePositionRequest$ = [
  3,
  n0,
  _BGDPR,
  0,
  [_TN, _DIe],
  [[0, 1], 64 | 0],
  2
];
var BatchGetDevicePositionResponse$ = [
  3,
  n0,
  _BGDPRa,
  0,
  [_Er, _DP],
  [() => BatchGetDevicePositionErrorList, [() => DevicePositionList, 0]],
  2
];
var BatchItemError$ = [
  3,
  n0,
  _BIE,
  0,
  [_C, _M],
  [0, 0]
];
var BatchPutGeofenceError$ = [
  3,
  n0,
  _BPGE,
  0,
  [_GI, _E],
  [0, () => BatchItemError$],
  2
];
var BatchPutGeofenceRequest$ = [
  3,
  n0,
  _BPGR,
  0,
  [_CN, _En],
  [[0, 1], [() => BatchPutGeofenceRequestEntryList, 0]],
  2
];
var BatchPutGeofenceRequestEntry$ = [
  3,
  n0,
  _BPGRE,
  0,
  [_GI, _G, _GP],
  [0, [() => GeofenceGeometry$, 0], [() => PropertyMap, 0]],
  2
];
var BatchPutGeofenceResponse$ = [
  3,
  n0,
  _BPGRa,
  0,
  [_S, _Er],
  [[() => BatchPutGeofenceSuccessList, 0], () => BatchPutGeofenceErrorList],
  2
];
var BatchPutGeofenceSuccess$ = [
  3,
  n0,
  _BPGS,
  0,
  [_GI, _CT, _UT],
  [0, [() => Timestamp, 0], [() => Timestamp, 0]],
  3
];
var BatchUpdateDevicePositionError$ = [
  3,
  n0,
  _BUDPE,
  0,
  [_DI, _ST, _E],
  [0, [() => Timestamp, 0], () => BatchItemError$],
  3
];
var BatchUpdateDevicePositionRequest$ = [
  3,
  n0,
  _BUDPR,
  0,
  [_TN, _U],
  [[0, 1], [() => DevicePositionUpdateList, 0]],
  2
];
var BatchUpdateDevicePositionResponse$ = [
  3,
  n0,
  _BUDPRa,
  0,
  [_Er],
  [[() => BatchUpdateDevicePositionErrorList, 0]],
  1
];
var CalculateRouteCarModeOptions$ = [
  3,
  n0,
  _CRCMO,
  0,
  [_AF, _AT],
  [[() => SensitiveBoolean, 0], [() => SensitiveBoolean, 0]]
];
var CalculateRouteMatrixRequest$ = [
  3,
  n0,
  _CRMR,
  0,
  [_CNa, _DPe, _DPes, _TM, _DT, _DN, _DU, _CMO, _TMO, _K],
  [[0, 1], [() => PositionList, 0], [() => PositionList, 0], 0, [() => Timestamp, 0], [() => SensitiveBoolean, 0], 0, [() => CalculateRouteCarModeOptions$, 0], [() => CalculateRouteTruckModeOptions$, 0], [() => ApiKey, { [_hQ]: _k }]],
  3
];
var CalculateRouteMatrixResponse$ = [
  3,
  n0,
  _CRMRa,
  0,
  [_RM, _Su, _SDP, _SDPn],
  [[() => RouteMatrix, 0], () => CalculateRouteMatrixSummary$, [() => PositionList, 0], [() => PositionList, 0]],
  2
];
var CalculateRouteMatrixSummary$ = [
  3,
  n0,
  _CRMS,
  0,
  [_DS, _RC, _EC, _DU],
  [0, 1, 1, 0],
  4
];
var CalculateRouteRequest$ = [
  3,
  n0,
  _CRR,
  0,
  [_CNa, _DPep, _DPest, _WP, _TM, _DT, _DN, _DU, _ILG, _CMO, _TMO, _ATr, _OF, _K],
  [[0, 1], [() => Position, 0], [() => Position, 0], [() => WaypointPositionList, 0], 0, [() => Timestamp, 0], [() => SensitiveBoolean, 0], 0, [() => SensitiveBoolean, 0], [() => CalculateRouteCarModeOptions$, 0], [() => CalculateRouteTruckModeOptions$, 0], [() => Timestamp, 0], 0, [() => ApiKey, { [_hQ]: _k }]],
  3
];
var CalculateRouteResponse$ = [
  3,
  n0,
  _CRRa,
  0,
  [_L, _Su],
  [[() => LegList, 0], [() => CalculateRouteSummary$, 0]],
  2
];
var CalculateRouteSummary$ = [
  3,
  n0,
  _CRS,
  0,
  [_RBB, _DS, _D, _DSu, _DU],
  [[() => BoundingBox, 0], 0, [() => SensitiveDouble, 0], [() => SensitiveDouble, 0], 0],
  5
];
var CalculateRouteTruckModeOptions$ = [
  3,
  n0,
  _CRTMO,
  0,
  [_AF, _AT, _Di, _W],
  [[() => SensitiveBoolean, 0], [() => SensitiveBoolean, 0], [() => TruckDimensions$, 0], [() => TruckWeight$, 0]]
];
var CellSignals$ = [
  3,
  n0,
  _CS,
  0,
  [_LCD],
  [() => LteCellDetailsList],
  1
];
var Circle$ = [
  3,
  n0,
  _Ci,
  8,
  [_Ce, _Ra],
  [[() => Position, 0], [() => SensitiveDouble, 0]],
  2
];
var CreateGeofenceCollectionRequest$ = [
  3,
  n0,
  _CGCR,
  0,
  [_CN, _PP, _PPDS, _De, _Ta, _KKI],
  [0, 0, 0, 0, 128 | 0, 0],
  1
];
var CreateGeofenceCollectionResponse$ = [
  3,
  n0,
  _CGCRr,
  0,
  [_CN, _CAo, _CT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var CreateKeyRequest$ = [
  3,
  n0,
  _CKR,
  0,
  [_KN, _Re, _De, _ET, _NE, _Ta],
  [0, [() => ApiKeyRestrictions$, 0], 0, [() => Timestamp, 0], 2, 128 | 0],
  2
];
var CreateKeyResponse$ = [
  3,
  n0,
  _CKRr,
  0,
  [_K, _KA, _KN, _CT],
  [[() => ApiKey, 0], 0, 0, [() => Timestamp, 0]],
  4
];
var CreateMapRequest$ = [
  3,
  n0,
  _CMR,
  0,
  [_MN, _Co, _PP, _De, _Ta],
  [0, [() => MapConfiguration$, 0], 0, 0, 128 | 0],
  2
];
var CreateMapResponse$ = [
  3,
  n0,
  _CMRr,
  0,
  [_MN, _MA, _CT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var CreatePlaceIndexRequest$ = [
  3,
  n0,
  _CPIR,
  0,
  [_IN, _DS, _PP, _De, _DSC, _Ta],
  [0, 0, 0, 0, () => DataSourceConfiguration$, 128 | 0],
  2
];
var CreatePlaceIndexResponse$ = [
  3,
  n0,
  _CPIRr,
  0,
  [_IN, _IA, _CT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var CreateRouteCalculatorRequest$ = [
  3,
  n0,
  _CRCR,
  0,
  [_CNa, _DS, _PP, _De, _Ta],
  [0, 0, 0, 0, 128 | 0],
  2
];
var CreateRouteCalculatorResponse$ = [
  3,
  n0,
  _CRCRr,
  0,
  [_CNa, _CAa, _CT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var CreateTrackerRequest$ = [
  3,
  n0,
  _CTR,
  0,
  [_TN, _PP, _KKI, _PPDS, _De, _Ta, _PF, _EBE, _KKEGQ],
  [0, 0, 0, 0, 0, 128 | 0, 0, 2, 2],
  1
];
var CreateTrackerResponse$ = [
  3,
  n0,
  _CTRr,
  0,
  [_TN, _TA, _CT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var DataSourceConfiguration$ = [
  3,
  n0,
  _DSC,
  0,
  [_IU],
  [0]
];
var DeleteGeofenceCollectionRequest$ = [
  3,
  n0,
  _DGCR,
  0,
  [_CN],
  [[0, 1]],
  1
];
var DeleteGeofenceCollectionResponse$ = [
  3,
  n0,
  _DGCRe,
  0,
  [],
  []
];
var DeleteKeyRequest$ = [
  3,
  n0,
  _DKR,
  0,
  [_KN, _FD],
  [[0, 1], [2, { [_hQ]: _fD }]],
  1
];
var DeleteKeyResponse$ = [
  3,
  n0,
  _DKRe,
  0,
  [],
  []
];
var DeleteMapRequest$ = [
  3,
  n0,
  _DMR,
  0,
  [_MN],
  [[0, 1]],
  1
];
var DeleteMapResponse$ = [
  3,
  n0,
  _DMRe,
  0,
  [],
  []
];
var DeletePlaceIndexRequest$ = [
  3,
  n0,
  _DPIR,
  0,
  [_IN],
  [[0, 1]],
  1
];
var DeletePlaceIndexResponse$ = [
  3,
  n0,
  _DPIRe,
  0,
  [],
  []
];
var DeleteRouteCalculatorRequest$ = [
  3,
  n0,
  _DRCR,
  0,
  [_CNa],
  [[0, 1]],
  1
];
var DeleteRouteCalculatorResponse$ = [
  3,
  n0,
  _DRCRe,
  0,
  [],
  []
];
var DeleteTrackerRequest$ = [
  3,
  n0,
  _DTR,
  0,
  [_TN],
  [[0, 1]],
  1
];
var DeleteTrackerResponse$ = [
  3,
  n0,
  _DTRe,
  0,
  [],
  []
];
var DescribeGeofenceCollectionRequest$ = [
  3,
  n0,
  _DGCRes,
  0,
  [_CN],
  [[0, 1]],
  1
];
var DescribeGeofenceCollectionResponse$ = [
  3,
  n0,
  _DGCResc,
  0,
  [_CN, _CAo, _De, _CT, _UT, _PP, _PPDS, _KKI, _Ta, _GC],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 0, 0, 128 | 0, 1],
  5
];
var DescribeKeyRequest$ = [
  3,
  n0,
  _DKRes,
  0,
  [_KN],
  [[0, 1]],
  1
];
var DescribeKeyResponse$ = [
  3,
  n0,
  _DKResc,
  0,
  [_K, _KA, _KN, _Re, _CT, _ET, _UT, _De, _Ta],
  [[() => ApiKey, 0], 0, 0, [() => ApiKeyRestrictions$, 0], [() => Timestamp, 0], [() => Timestamp, 0], [() => Timestamp, 0], 0, 128 | 0],
  7
];
var DescribeMapRequest$ = [
  3,
  n0,
  _DMRes,
  0,
  [_MN],
  [[0, 1]],
  1
];
var DescribeMapResponse$ = [
  3,
  n0,
  _DMResc,
  0,
  [_MN, _MA, _DS, _Co, _De, _CT, _UT, _PP, _Ta],
  [0, 0, 0, [() => MapConfiguration$, 0], 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 128 | 0],
  7
];
var DescribePlaceIndexRequest$ = [
  3,
  n0,
  _DPIRes,
  0,
  [_IN],
  [[0, 1]],
  1
];
var DescribePlaceIndexResponse$ = [
  3,
  n0,
  _DPIResc,
  0,
  [_IN, _IA, _De, _CT, _UT, _DS, _DSC, _PP, _Ta],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, () => DataSourceConfiguration$, 0, 128 | 0],
  7
];
var DescribeRouteCalculatorRequest$ = [
  3,
  n0,
  _DRCRes,
  0,
  [_CNa],
  [[0, 1]],
  1
];
var DescribeRouteCalculatorResponse$ = [
  3,
  n0,
  _DRCResc,
  0,
  [_CNa, _CAa, _De, _CT, _UT, _DS, _PP, _Ta],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 0, 128 | 0],
  6
];
var DescribeTrackerRequest$ = [
  3,
  n0,
  _DTRes,
  0,
  [_TN],
  [[0, 1]],
  1
];
var DescribeTrackerResponse$ = [
  3,
  n0,
  _DTResc,
  0,
  [_TN, _TA, _De, _CT, _UT, _PP, _PPDS, _Ta, _KKI, _PF, _EBE, _KKEGQ],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 0, 128 | 0, 0, 0, 2, 2],
  5
];
var DevicePosition$ = [
  3,
  n0,
  _DPev,
  0,
  [_ST, _RT, _Po, _DI, _A, _PPo],
  [[() => Timestamp, 0], [() => Timestamp, 0], [() => Position, 0], 0, [() => PositionalAccuracy$, 0], [() => PositionPropertyMap, 0]],
  3
];
var DevicePositionUpdate$ = [
  3,
  n0,
  _DPUe,
  0,
  [_DI, _ST, _Po, _A, _PPo],
  [0, [() => Timestamp, 0], [() => Position, 0], [() => PositionalAccuracy$, 0], [() => PositionPropertyMap, 0]],
  3
];
var DeviceState$ = [
  3,
  n0,
  _DSe,
  0,
  [_DI, _ST, _Po, _A, _IAp, _WFAP, _CS],
  [0, [() => Timestamp, 0], [() => Position, 0], [() => PositionalAccuracy$, 0], 0, () => WiFiAccessPointList, () => CellSignals$],
  3
];
var DisassociateTrackerConsumerRequest$ = [
  3,
  n0,
  _DTCR,
  0,
  [_TN, _CA],
  [[0, 1], [0, 1]],
  2
];
var DisassociateTrackerConsumerResponse$ = [
  3,
  n0,
  _DTCRi,
  0,
  [],
  []
];
var ForecastedEvent$ = [
  3,
  n0,
  _FE,
  0,
  [_EI, _GI, _IDIG, _ND, _ETv, _FBT, _GP],
  [0, 0, 2, 1, 0, [() => Timestamp, 0], [() => PropertyMap, 0]],
  5
];
var ForecastGeofenceEventsDeviceState$ = [
  3,
  n0,
  _FGEDS,
  0,
  [_Po, _Sp],
  [[() => Position, 0], 1],
  1
];
var ForecastGeofenceEventsRequest$ = [
  3,
  n0,
  _FGER,
  0,
  [_CN, _DSe, _THM, _DU, _SU, _NT, _MR],
  [[0, 1], [() => ForecastGeofenceEventsDeviceState$, 0], 1, 0, 0, 0, 1],
  2
];
var ForecastGeofenceEventsResponse$ = [
  3,
  n0,
  _FGERo,
  0,
  [_FEo, _DU, _SU, _NT],
  [[() => ForecastedEventsList, 0], 0, 0, 0],
  3
];
var GeofenceGeometry$ = [
  3,
  n0,
  _GG,
  0,
  [_Pol, _Ci, _Ge, _MP],
  [[() => LinearRings, 0], [() => Circle$, 0], [() => Base64EncodedGeobuf, 0], [() => MultiLinearRings, 0]]
];
var GetDevicePositionHistoryRequest$ = [
  3,
  n0,
  _GDPHR,
  0,
  [_TN, _DI, _NT, _STI, _ETE, _MR],
  [[0, 1], [0, 1], 0, [() => Timestamp, 0], [() => Timestamp, 0], 1],
  2
];
var GetDevicePositionHistoryResponse$ = [
  3,
  n0,
  _GDPHRe,
  0,
  [_DP, _NT],
  [[() => DevicePositionList, 0], 0],
  1
];
var GetDevicePositionRequest$ = [
  3,
  n0,
  _GDPR,
  0,
  [_TN, _DI],
  [[0, 1], [0, 1]],
  2
];
var GetDevicePositionResponse$ = [
  3,
  n0,
  _GDPRe,
  0,
  [_ST, _RT, _Po, _DI, _A, _PPo],
  [[() => Timestamp, 0], [() => Timestamp, 0], [() => Position, 0], 0, [() => PositionalAccuracy$, 0], [() => PositionPropertyMap, 0]],
  3
];
var GetGeofenceRequest$ = [
  3,
  n0,
  _GGR,
  0,
  [_CN, _GI],
  [[0, 1], [0, 1]],
  2
];
var GetGeofenceResponse$ = [
  3,
  n0,
  _GGRe,
  0,
  [_GI, _G, _St, _CT, _UT, _GP],
  [0, [() => GeofenceGeometry$, 0], 0, [() => Timestamp, 0], [() => Timestamp, 0], [() => PropertyMap, 0]],
  5
];
var GetMapGlyphsRequest$ = [
  3,
  n0,
  _GMGR,
  0,
  [_MN, _FS, _FUR, _K],
  [[0, 1], [0, 1], [0, 1], [() => ApiKey, { [_hQ]: _k }]],
  3
];
var GetMapGlyphsResponse$ = [
  3,
  n0,
  _GMGRe,
  0,
  [_B, _CTo, _CCa],
  [[21, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _CC_ }]]
];
var GetMapSpritesRequest$ = [
  3,
  n0,
  _GMSR,
  0,
  [_MN, _FN, _K],
  [[0, 1], [0, 1], [() => ApiKey, { [_hQ]: _k }]],
  2
];
var GetMapSpritesResponse$ = [
  3,
  n0,
  _GMSRe,
  0,
  [_B, _CTo, _CCa],
  [[21, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _CC_ }]]
];
var GetMapStyleDescriptorRequest$ = [
  3,
  n0,
  _GMSDR,
  0,
  [_MN, _K],
  [[0, 1], [() => ApiKey, { [_hQ]: _k }]],
  1
];
var GetMapStyleDescriptorResponse$ = [
  3,
  n0,
  _GMSDRe,
  0,
  [_B, _CTo, _CCa],
  [[21, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _CC_ }]]
];
var GetMapTileRequest$ = [
  3,
  n0,
  _GMTR,
  0,
  [_MN, _Z, _X, _Y, _K],
  [[0, 1], [() => SensitiveString, 1], [() => SensitiveString, 1], [() => SensitiveString, 1], [() => ApiKey, { [_hQ]: _k }]],
  4
];
var GetMapTileResponse$ = [
  3,
  n0,
  _GMTRe,
  0,
  [_B, _CTo, _CCa],
  [[21, 16], [0, { [_hH]: _CT_ }], [0, { [_hH]: _CC_ }]]
];
var GetPlaceRequest$ = [
  3,
  n0,
  _GPR,
  0,
  [_IN, _PI, _La, _K],
  [[0, 1], [() => PlaceId, 1], [0, { [_hQ]: _l }], [() => ApiKey, { [_hQ]: _k }]],
  2
];
var GetPlaceResponse$ = [
  3,
  n0,
  _GPRe,
  0,
  [_Pl],
  [[() => Place$, 0]],
  1
];
var InferredState$ = [
  3,
  n0,
  _IS,
  0,
  [_PD, _Po, _A, _DD],
  [2, [() => Position, 0], [() => PositionalAccuracy$, 0], 1],
  1
];
var Leg$ = [
  3,
  n0,
  _Le,
  0,
  [_SP, _EP, _D, _DSu, _Ste, _G],
  [[() => Position, 0], [() => Position, 0], [() => SensitiveDouble, 0], [() => SensitiveDouble, 0], [() => StepList, 0], [() => LegGeometry$, 0]],
  5
];
var LegGeometry$ = [
  3,
  n0,
  _LG,
  0,
  [_LS],
  [[() => LineString, 0]]
];
var ListDevicePositionsRequest$ = [
  3,
  n0,
  _LDPR,
  0,
  [_TN, _MR, _NT, _FG],
  [[0, 1], 1, 0, [() => TrackingFilterGeometry$, 0]],
  1
];
var ListDevicePositionsResponse$ = [
  3,
  n0,
  _LDPRi,
  0,
  [_En, _NT],
  [[() => ListDevicePositionsResponseEntryList, 0], 0],
  1
];
var ListDevicePositionsResponseEntry$ = [
  3,
  n0,
  _LDPRE,
  0,
  [_DI, _ST, _Po, _A, _PPo],
  [0, [() => Timestamp, 0], [() => Position, 0], [() => PositionalAccuracy$, 0], [() => PositionPropertyMap, 0]],
  3
];
var ListGeofenceCollectionsRequest$ = [
  3,
  n0,
  _LGCR,
  0,
  [_MR, _NT],
  [1, 0]
];
var ListGeofenceCollectionsResponse$ = [
  3,
  n0,
  _LGCRi,
  0,
  [_En, _NT],
  [[() => ListGeofenceCollectionsResponseEntryList, 0], 0],
  1
];
var ListGeofenceCollectionsResponseEntry$ = [
  3,
  n0,
  _LGCRE,
  0,
  [_CN, _De, _CT, _UT, _PP, _PPDS],
  [0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 0],
  4
];
var ListGeofenceResponseEntry$ = [
  3,
  n0,
  _LGRE,
  0,
  [_GI, _G, _St, _CT, _UT, _GP],
  [0, [() => GeofenceGeometry$, 0], 0, [() => Timestamp, 0], [() => Timestamp, 0], [() => PropertyMap, 0]],
  5
];
var ListGeofencesRequest$ = [
  3,
  n0,
  _LGR,
  0,
  [_CN, _NT, _MR],
  [[0, 1], 0, 1],
  1
];
var ListGeofencesResponse$ = [
  3,
  n0,
  _LGRi,
  0,
  [_En, _NT],
  [[() => ListGeofenceResponseEntryList, 0], 0],
  1
];
var ListKeysRequest$ = [
  3,
  n0,
  _LKR,
  0,
  [_MR, _NT, _F],
  [1, 0, () => ApiKeyFilter$]
];
var ListKeysResponse$ = [
  3,
  n0,
  _LKRi,
  0,
  [_En, _NT],
  [[() => ListKeysResponseEntryList, 0], 0],
  1
];
var ListKeysResponseEntry$ = [
  3,
  n0,
  _LKRE,
  0,
  [_KN, _ET, _Re, _CT, _UT, _De],
  [0, [() => Timestamp, 0], [() => ApiKeyRestrictions$, 0], [() => Timestamp, 0], [() => Timestamp, 0], 0],
  5
];
var ListMapsRequest$ = [
  3,
  n0,
  _LMR,
  0,
  [_MR, _NT],
  [1, 0]
];
var ListMapsResponse$ = [
  3,
  n0,
  _LMRi,
  0,
  [_En, _NT],
  [[() => ListMapsResponseEntryList, 0], 0],
  1
];
var ListMapsResponseEntry$ = [
  3,
  n0,
  _LMRE,
  0,
  [_MN, _De, _DS, _CT, _UT, _PP],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0],
  5
];
var ListPlaceIndexesRequest$ = [
  3,
  n0,
  _LPIR,
  0,
  [_MR, _NT],
  [1, 0]
];
var ListPlaceIndexesResponse$ = [
  3,
  n0,
  _LPIRi,
  0,
  [_En, _NT],
  [[() => ListPlaceIndexesResponseEntryList, 0], 0],
  1
];
var ListPlaceIndexesResponseEntry$ = [
  3,
  n0,
  _LPIRE,
  0,
  [_IN, _De, _DS, _CT, _UT, _PP],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0],
  5
];
var ListRouteCalculatorsRequest$ = [
  3,
  n0,
  _LRCR,
  0,
  [_MR, _NT],
  [1, 0]
];
var ListRouteCalculatorsResponse$ = [
  3,
  n0,
  _LRCRi,
  0,
  [_En, _NT],
  [[() => ListRouteCalculatorsResponseEntryList, 0], 0],
  1
];
var ListRouteCalculatorsResponseEntry$ = [
  3,
  n0,
  _LRCRE,
  0,
  [_CNa, _De, _DS, _CT, _UT, _PP],
  [0, 0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0],
  5
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
  [_Ta],
  [128 | 0]
];
var ListTrackerConsumersRequest$ = [
  3,
  n0,
  _LTCR,
  0,
  [_TN, _MR, _NT],
  [[0, 1], 1, 0],
  1
];
var ListTrackerConsumersResponse$ = [
  3,
  n0,
  _LTCRi,
  0,
  [_CAon, _NT],
  [64 | 0, 0],
  1
];
var ListTrackersRequest$ = [
  3,
  n0,
  _LTR,
  0,
  [_MR, _NT],
  [1, 0]
];
var ListTrackersResponse$ = [
  3,
  n0,
  _LTRi,
  0,
  [_En, _NT],
  [[() => ListTrackersResponseEntryList, 0], 0],
  1
];
var ListTrackersResponseEntry$ = [
  3,
  n0,
  _LTRE,
  0,
  [_TN, _De, _CT, _UT, _PP, _PPDS],
  [0, 0, [() => Timestamp, 0], [() => Timestamp, 0], 0, 0],
  4
];
var LteCellDetails$ = [
  3,
  n0,
  _LCD,
  0,
  [_CI, _Mc, _Mn, _LI, _NM, _TAi, _NC, _Rs, _Rsr, _Tac],
  [1, 1, 1, () => LteLocalId$, () => LteNetworkMeasurementsList, 1, 2, 1, 1, 1],
  3
];
var LteLocalId$ = [
  3,
  n0,
  _LLI,
  0,
  [_Ea, _Pc],
  [1, 1],
  2
];
var LteNetworkMeasurements$ = [
  3,
  n0,
  _LNM,
  0,
  [_Ea, _CI, _Pc, _Rs, _Rsr],
  [1, 1, 1, 1, 1],
  3
];
var MapConfiguration$ = [
  3,
  n0,
  _MC,
  0,
  [_Sty, _PV, _CL],
  [0, [() => CountryCode3, 0], 64 | 0],
  1
];
var MapConfigurationUpdate$ = [
  3,
  n0,
  _MCU,
  0,
  [_PV, _CL],
  [[() => CountryCode3OrEmpty, 0], 64 | 0]
];
var Place$ = [
  3,
  n0,
  _Pl,
  0,
  [_G, _Lab, _AN, _Str, _N, _Mu, _SR, _Reg, _Cou, _PCo, _I, _TZ, _UTn, _UN, _Ca, _SC, _SM],
  [[() => PlaceGeometry$, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => SensitiveBoolean, 0], [() => TimeZone$, 0], [() => SensitiveString, 0], [() => SensitiveString, 0], [() => PlaceCategoryList, 0], [() => PlaceSupplementalCategoryList, 0], [() => SensitiveString, 0]],
  1
];
var PlaceGeometry$ = [
  3,
  n0,
  _PG,
  0,
  [_Poi],
  [[() => Position, 0]]
];
var PositionalAccuracy$ = [
  3,
  n0,
  _PA,
  0,
  [_H],
  [[() => SensitiveDouble, 0]],
  1
];
var PutGeofenceRequest$ = [
  3,
  n0,
  _PGR,
  0,
  [_CN, _GI, _G, _GP],
  [[0, 1], [0, 1], [() => GeofenceGeometry$, 0], [() => PropertyMap, 0]],
  3
];
var PutGeofenceResponse$ = [
  3,
  n0,
  _PGRu,
  0,
  [_GI, _CT, _UT],
  [0, [() => Timestamp, 0], [() => Timestamp, 0]],
  3
];
var RouteMatrixEntry$ = [
  3,
  n0,
  _RME,
  0,
  [_D, _DSu, _E],
  [[() => SensitiveDouble, 0], [() => SensitiveDouble, 0], () => RouteMatrixEntryError$]
];
var RouteMatrixEntryError$ = [
  3,
  n0,
  _RMEE,
  0,
  [_C, _M],
  [0, 0],
  1
];
var SearchForPositionResult$ = [
  3,
  n0,
  _SFPR,
  0,
  [_Pl, _D, _PI],
  [[() => Place$, 0], [() => SensitiveDouble, 0], [() => PlaceId, 0]],
  2
];
var SearchForSuggestionsResult$ = [
  3,
  n0,
  _SFSR,
  0,
  [_Te, _PI, _Ca, _SC],
  [[() => SensitiveString, 0], [() => PlaceId, 0], [() => PlaceCategoryList, 0], [() => PlaceSupplementalCategoryList, 0]],
  1
];
var SearchForTextResult$ = [
  3,
  n0,
  _SFTR,
  0,
  [_Pl, _D, _Rel, _PI],
  [[() => Place$, 0], [() => SensitiveDouble, 0], [() => SensitiveDouble, 0], [() => PlaceId, 0]],
  1
];
var SearchPlaceIndexForPositionRequest$ = [
  3,
  n0,
  _SPIFPR,
  0,
  [_IN, _Po, _MR, _La, _K],
  [[0, 1], [() => Position, 0], 1, 0, [() => ApiKey, { [_hQ]: _k }]],
  2
];
var SearchPlaceIndexForPositionResponse$ = [
  3,
  n0,
  _SPIFPRe,
  0,
  [_Su, _Res],
  [[() => SearchPlaceIndexForPositionSummary$, 0], [() => SearchForPositionResultList, 0]],
  2
];
var SearchPlaceIndexForPositionSummary$ = [
  3,
  n0,
  _SPIFPS,
  0,
  [_Po, _DS, _MR, _La],
  [[() => Position, 0], 0, 1, 0],
  2
];
var SearchPlaceIndexForSuggestionsRequest$ = [
  3,
  n0,
  _SPIFSR,
  0,
  [_IN, _Te, _BP, _FBB, _FC, _MR, _La, _FCi, _K],
  [[0, 1], [() => SensitiveString, 0], [() => Position, 0], [() => BoundingBox, 0], [() => CountryCodeList, 0], 1, 0, [() => FilterPlaceCategoryList, 0], [() => ApiKey, { [_hQ]: _k }]],
  2
];
var SearchPlaceIndexForSuggestionsResponse$ = [
  3,
  n0,
  _SPIFSRe,
  0,
  [_Su, _Res],
  [[() => SearchPlaceIndexForSuggestionsSummary$, 0], [() => SearchForSuggestionsResultList, 0]],
  2
];
var SearchPlaceIndexForSuggestionsSummary$ = [
  3,
  n0,
  _SPIFSS,
  0,
  [_Te, _DS, _BP, _FBB, _FC, _MR, _La, _FCi],
  [[() => SensitiveString, 0], 0, [() => Position, 0], [() => BoundingBox, 0], [() => CountryCodeList, 0], 1, 0, [() => FilterPlaceCategoryList, 0]],
  2
];
var SearchPlaceIndexForTextRequest$ = [
  3,
  n0,
  _SPIFTR,
  0,
  [_IN, _Te, _BP, _FBB, _FC, _MR, _La, _FCi, _K],
  [[0, 1], [() => SensitiveString, 0], [() => Position, 0], [() => BoundingBox, 0], [() => CountryCodeList, 0], 1, 0, [() => FilterPlaceCategoryList, 0], [() => ApiKey, { [_hQ]: _k }]],
  2
];
var SearchPlaceIndexForTextResponse$ = [
  3,
  n0,
  _SPIFTRe,
  0,
  [_Su, _Res],
  [[() => SearchPlaceIndexForTextSummary$, 0], [() => SearchForTextResultList, 0]],
  2
];
var SearchPlaceIndexForTextSummary$ = [
  3,
  n0,
  _SPIFTS,
  0,
  [_Te, _DS, _BP, _FBB, _FC, _MR, _RBBe, _La, _FCi],
  [[() => SensitiveString, 0], 0, [() => Position, 0], [() => BoundingBox, 0], [() => CountryCodeList, 0], 1, [() => BoundingBox, 0], 0, [() => FilterPlaceCategoryList, 0]],
  2
];
var Step$ = [
  3,
  n0,
  _Step,
  0,
  [_SP, _EP, _D, _DSu, _GO],
  [[() => Position, 0], [() => Position, 0], [() => SensitiveDouble, 0], [() => SensitiveDouble, 0], 1],
  4
];
var TagResourceRequest$ = [
  3,
  n0,
  _TRR,
  0,
  [_RA, _Ta],
  [[0, 1], 128 | 0],
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
var TimeZone$ = [
  3,
  n0,
  _TZ,
  0,
  [_Na, _O],
  [[() => SensitiveString, 0], [() => SensitiveInteger, 0]],
  1
];
var TrackingFilterGeometry$ = [
  3,
  n0,
  _TFG,
  0,
  [_Pol],
  [[() => LinearRings, 0]]
];
var TruckDimensions$ = [
  3,
  n0,
  _TD,
  0,
  [_Len, _He, _Wi, _Un],
  [[() => SensitiveDouble, 0], [() => SensitiveDouble, 0], [() => SensitiveDouble, 0], 0]
];
var TruckWeight$ = [
  3,
  n0,
  _TW,
  0,
  [_To, _Un],
  [[() => SensitiveDouble, 0], 0]
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
var UpdateGeofenceCollectionRequest$ = [
  3,
  n0,
  _UGCR,
  0,
  [_CN, _PP, _PPDS, _De],
  [[0, 1], 0, 0, 0],
  1
];
var UpdateGeofenceCollectionResponse$ = [
  3,
  n0,
  _UGCRp,
  0,
  [_CN, _CAo, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var UpdateKeyRequest$ = [
  3,
  n0,
  _UKR,
  0,
  [_KN, _De, _ET, _NE, _FU, _Re],
  [[0, 1], 0, [() => Timestamp, 0], 2, 2, [() => ApiKeyRestrictions$, 0]],
  1
];
var UpdateKeyResponse$ = [
  3,
  n0,
  _UKRp,
  0,
  [_KA, _KN, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var UpdateMapRequest$ = [
  3,
  n0,
  _UMR,
  0,
  [_MN, _PP, _De, _CU],
  [[0, 1], 0, 0, [() => MapConfigurationUpdate$, 0]],
  1
];
var UpdateMapResponse$ = [
  3,
  n0,
  _UMRp,
  0,
  [_MN, _MA, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var UpdatePlaceIndexRequest$ = [
  3,
  n0,
  _UPIR,
  0,
  [_IN, _PP, _De, _DSC],
  [[0, 1], 0, 0, () => DataSourceConfiguration$],
  1
];
var UpdatePlaceIndexResponse$ = [
  3,
  n0,
  _UPIRp,
  0,
  [_IN, _IA, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var UpdateRouteCalculatorRequest$ = [
  3,
  n0,
  _URCR,
  0,
  [_CNa, _PP, _De],
  [[0, 1], 0, 0],
  1
];
var UpdateRouteCalculatorResponse$ = [
  3,
  n0,
  _URCRp,
  0,
  [_CNa, _CAa, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var UpdateTrackerRequest$ = [
  3,
  n0,
  _UTR,
  0,
  [_TN, _PP, _PPDS, _De, _PF, _EBE, _KKEGQ],
  [[0, 1], 0, 0, 0, 0, 2, 2],
  1
];
var UpdateTrackerResponse$ = [
  3,
  n0,
  _UTRp,
  0,
  [_TN, _TA, _UT],
  [0, 0, [() => Timestamp, 0]],
  3
];
var ValidationExceptionField$ = [
  3,
  n0,
  _VEF,
  0,
  [_Na, _M],
  [[0, { [_jN]: _n }], [0, { [_jN]: _m }]],
  2
];
var VerifyDevicePositionRequest$ = [
  3,
  n0,
  _VDPR,
  0,
  [_TN, _DSe, _DU],
  [[0, 1], [() => DeviceState$, 0], 0],
  2
];
var VerifyDevicePositionResponse$ = [
  3,
  n0,
  _VDPRe,
  0,
  [_IS, _DI, _ST, _RT, _DU],
  [[() => InferredState$, 0], 0, [() => Timestamp, 0], [() => Timestamp, 0], 0],
  5
];
var WiFiAccessPoint$ = [
  3,
  n0,
  _WFAPi,
  0,
  [_MAa, _Rss],
  [0, 1],
  2
];
var AndroidAppList = [
  1,
  n0,
  _AAL,
  0,
  () => AndroidApp$
];
var ApiKeyActionList = 64 | 0;
var AppleAppList = [
  1,
  n0,
  _AALp,
  0,
  () => AppleApp$
];
var ArnList = 64 | 0;
var BatchDeleteDevicePositionHistoryErrorList = [
  1,
  n0,
  _BDDPHEL,
  0,
  () => BatchDeleteDevicePositionHistoryError$
];
var BatchDeleteGeofenceErrorList = [
  1,
  n0,
  _BDGEL,
  0,
  () => BatchDeleteGeofenceError$
];
var BatchEvaluateGeofencesErrorList = [
  1,
  n0,
  _BEGEL,
  0,
  [
    () => BatchEvaluateGeofencesError$,
    0
  ]
];
var BatchGetDevicePositionErrorList = [
  1,
  n0,
  _BGDPEL,
  0,
  () => BatchGetDevicePositionError$
];
var BatchPutGeofenceErrorList = [
  1,
  n0,
  _BPGEL,
  0,
  () => BatchPutGeofenceError$
];
var BatchPutGeofenceRequestEntryList = [
  1,
  n0,
  _BPGREL,
  0,
  [
    () => BatchPutGeofenceRequestEntry$,
    0
  ]
];
var BatchPutGeofenceSuccessList = [
  1,
  n0,
  _BPGSL,
  0,
  [
    () => BatchPutGeofenceSuccess$,
    0
  ]
];
var BatchUpdateDevicePositionErrorList = [
  1,
  n0,
  _BUDPEL,
  0,
  [
    () => BatchUpdateDevicePositionError$,
    0
  ]
];
var BoundingBox = [
  1,
  n0,
  _BB,
  8,
  1
];
var CountryCodeList = [
  1,
  n0,
  _CCL,
  0,
  [
    () => CountryCode3,
    0
  ]
];
var CustomLayerList = 64 | 0;
var DeviceIdsList = 64 | 0;
var DevicePositionList = [
  1,
  n0,
  _DPL,
  0,
  [
    () => DevicePosition$,
    0
  ]
];
var DevicePositionUpdateList = [
  1,
  n0,
  _DPUL,
  0,
  [
    () => DevicePositionUpdate$,
    0
  ]
];
var FilterPlaceCategoryList = [
  1,
  n0,
  _FPCL,
  0,
  [
    () => PlaceCategory,
    0
  ]
];
var ForecastedEventsList = [
  1,
  n0,
  _FEL,
  0,
  [
    () => ForecastedEvent$,
    0
  ]
];
var GeoArnList = 64 | 0;
var IdList = 64 | 0;
var LegList = [
  1,
  n0,
  _LL,
  0,
  [
    () => Leg$,
    0
  ]
];
var LinearRing = [
  1,
  n0,
  _LR,
  0,
  [
    () => Position,
    0
  ]
];
var LinearRings = [
  1,
  n0,
  _LRi,
  0,
  [
    () => LinearRing,
    0
  ]
];
var LineString = [
  1,
  n0,
  _LS,
  0,
  [
    () => Position,
    0
  ]
];
var ListDevicePositionsResponseEntryList = [
  1,
  n0,
  _LDPREL,
  0,
  [
    () => ListDevicePositionsResponseEntry$,
    0
  ]
];
var ListGeofenceCollectionsResponseEntryList = [
  1,
  n0,
  _LGCREL,
  0,
  [
    () => ListGeofenceCollectionsResponseEntry$,
    0
  ]
];
var ListGeofenceResponseEntryList = [
  1,
  n0,
  _LGREL,
  0,
  [
    () => ListGeofenceResponseEntry$,
    0
  ]
];
var ListKeysResponseEntryList = [
  1,
  n0,
  _LKREL,
  0,
  [
    () => ListKeysResponseEntry$,
    0
  ]
];
var ListMapsResponseEntryList = [
  1,
  n0,
  _LMREL,
  0,
  [
    () => ListMapsResponseEntry$,
    0
  ]
];
var ListPlaceIndexesResponseEntryList = [
  1,
  n0,
  _LPIREL,
  0,
  [
    () => ListPlaceIndexesResponseEntry$,
    0
  ]
];
var ListRouteCalculatorsResponseEntryList = [
  1,
  n0,
  _LRCREL,
  0,
  [
    () => ListRouteCalculatorsResponseEntry$,
    0
  ]
];
var ListTrackersResponseEntryList = [
  1,
  n0,
  _LTREL,
  0,
  [
    () => ListTrackersResponseEntry$,
    0
  ]
];
var LteCellDetailsList = [
  1,
  n0,
  _LCDL,
  0,
  () => LteCellDetails$
];
var LteNetworkMeasurementsList = [
  1,
  n0,
  _LNML,
  0,
  () => LteNetworkMeasurements$
];
var MultiLinearRings = [
  1,
  n0,
  _MLR,
  0,
  [
    () => LinearRings,
    0
  ]
];
var PlaceCategoryList = [
  1,
  n0,
  _PCL,
  0,
  [
    () => PlaceCategory,
    0
  ]
];
var PlaceSupplementalCategoryList = [
  1,
  n0,
  _PSCL,
  0,
  [
    () => PlaceSupplementalCategory,
    0
  ]
];
var Position = [
  1,
  n0,
  _Po,
  8,
  1
];
var PositionList = [
  1,
  n0,
  _PL,
  0,
  [
    () => Position,
    0
  ]
];
var RefererPatternList = [
  1,
  n0,
  _RPL,
  0,
  [
    () => RefererPattern,
    0
  ]
];
var RouteMatrix = [
  1,
  n0,
  _RM,
  0,
  [
    () => RouteMatrixRow,
    0
  ]
];
var RouteMatrixRow = [
  1,
  n0,
  _RMR,
  0,
  [
    () => RouteMatrixEntry$,
    0
  ]
];
var SearchForPositionResultList = [
  1,
  n0,
  _SFPRL,
  0,
  [
    () => SearchForPositionResult$,
    0
  ]
];
var SearchForSuggestionsResultList = [
  1,
  n0,
  _SFSRL,
  0,
  [
    () => SearchForSuggestionsResult$,
    0
  ]
];
var SearchForTextResultList = [
  1,
  n0,
  _SFTRL,
  0,
  [
    () => SearchForTextResult$,
    0
  ]
];
var StepList = [
  1,
  n0,
  _SL,
  0,
  [
    () => Step$,
    0
  ]
];
var TagKeys = 64 | 0;
var ValidationExceptionFieldList = [
  1,
  n0,
  _VEFL,
  0,
  [
    () => ValidationExceptionField$,
    0
  ]
];
var WaypointPositionList = [
  1,
  n0,
  _WPL,
  0,
  [
    () => Position,
    0
  ]
];
var WiFiAccessPointList = [
  1,
  n0,
  _WFAPL,
  0,
  () => WiFiAccessPoint$
];
var PositionPropertyMap = [
  2,
  n0,
  _PPM,
  8,
  0,
  0
];
var PropertyMap = [
  2,
  n0,
  _PM,
  8,
  0,
  0
];
var TagMap = 128 | 0;
var AssociateTrackerConsumer$ = [
  9,
  n0,
  _ATC,
  { [_en]: ["cp.tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/consumers", 200] },
  () => AssociateTrackerConsumerRequest$,
  () => AssociateTrackerConsumerResponse$
];
var BatchDeleteDevicePositionHistory$ = [
  9,
  n0,
  _BDDPH,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/delete-positions", 200] },
  () => BatchDeleteDevicePositionHistoryRequest$,
  () => BatchDeleteDevicePositionHistoryResponse$
];
var BatchDeleteGeofence$ = [
  9,
  n0,
  _BDG,
  { [_en]: ["geofencing."], [_h]: ["POST", "/geofencing/v0/collections/{CollectionName}/delete-geofences", 200] },
  () => BatchDeleteGeofenceRequest$,
  () => BatchDeleteGeofenceResponse$
];
var BatchEvaluateGeofences$ = [
  9,
  n0,
  _BEGa,
  { [_en]: ["geofencing."], [_h]: ["POST", "/geofencing/v0/collections/{CollectionName}/positions", 200] },
  () => BatchEvaluateGeofencesRequest$,
  () => BatchEvaluateGeofencesResponse$
];
var BatchGetDevicePosition$ = [
  9,
  n0,
  _BGDP,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/get-positions", 200] },
  () => BatchGetDevicePositionRequest$,
  () => BatchGetDevicePositionResponse$
];
var BatchPutGeofence$ = [
  9,
  n0,
  _BPG,
  { [_en]: ["geofencing."], [_h]: ["POST", "/geofencing/v0/collections/{CollectionName}/put-geofences", 200] },
  () => BatchPutGeofenceRequest$,
  () => BatchPutGeofenceResponse$
];
var BatchUpdateDevicePosition$ = [
  9,
  n0,
  _BUDP,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/positions", 200] },
  () => BatchUpdateDevicePositionRequest$,
  () => BatchUpdateDevicePositionResponse$
];
var CalculateRoute$ = [
  9,
  n0,
  _CR,
  { [_en]: ["routes."], [_h]: ["POST", "/routes/v0/calculators/{CalculatorName}/calculate/route", 200] },
  () => CalculateRouteRequest$,
  () => CalculateRouteResponse$
];
var CalculateRouteMatrix$ = [
  9,
  n0,
  _CRM,
  { [_en]: ["routes."], [_h]: ["POST", "/routes/v0/calculators/{CalculatorName}/calculate/route-matrix", 200] },
  () => CalculateRouteMatrixRequest$,
  () => CalculateRouteMatrixResponse$
];
var CreateGeofenceCollection$ = [
  9,
  n0,
  _CGC,
  { [_en]: ["cp.geofencing."], [_h]: ["POST", "/geofencing/v0/collections", 200] },
  () => CreateGeofenceCollectionRequest$,
  () => CreateGeofenceCollectionResponse$
];
var CreateKey$ = [
  9,
  n0,
  _CK,
  { [_en]: ["cp.metadata."], [_h]: ["POST", "/metadata/v0/keys", 200] },
  () => CreateKeyRequest$,
  () => CreateKeyResponse$
];
var CreateMap$ = [
  9,
  n0,
  _CM,
  { [_en]: ["cp.maps."], [_h]: ["POST", "/maps/v0/maps", 200] },
  () => CreateMapRequest$,
  () => CreateMapResponse$
];
var CreatePlaceIndex$ = [
  9,
  n0,
  _CPI,
  { [_en]: ["cp.places."], [_h]: ["POST", "/places/v0/indexes", 200] },
  () => CreatePlaceIndexRequest$,
  () => CreatePlaceIndexResponse$
];
var CreateRouteCalculator$ = [
  9,
  n0,
  _CRC,
  { [_en]: ["cp.routes."], [_h]: ["POST", "/routes/v0/calculators", 200] },
  () => CreateRouteCalculatorRequest$,
  () => CreateRouteCalculatorResponse$
];
var CreateTracker$ = [
  9,
  n0,
  _CTr,
  { [_en]: ["cp.tracking."], [_h]: ["POST", "/tracking/v0/trackers", 200] },
  () => CreateTrackerRequest$,
  () => CreateTrackerResponse$
];
var DeleteGeofenceCollection$ = [
  9,
  n0,
  _DGC,
  { [_en]: ["cp.geofencing."], [_h]: ["DELETE", "/geofencing/v0/collections/{CollectionName}", 200] },
  () => DeleteGeofenceCollectionRequest$,
  () => DeleteGeofenceCollectionResponse$
];
var DeleteKey$ = [
  9,
  n0,
  _DK,
  { [_en]: ["cp.metadata."], [_h]: ["DELETE", "/metadata/v0/keys/{KeyName}", 200] },
  () => DeleteKeyRequest$,
  () => DeleteKeyResponse$
];
var DeleteMap$ = [
  9,
  n0,
  _DM,
  { [_en]: ["cp.maps."], [_h]: ["DELETE", "/maps/v0/maps/{MapName}", 200] },
  () => DeleteMapRequest$,
  () => DeleteMapResponse$
];
var DeletePlaceIndex$ = [
  9,
  n0,
  _DPI,
  { [_en]: ["cp.places."], [_h]: ["DELETE", "/places/v0/indexes/{IndexName}", 200] },
  () => DeletePlaceIndexRequest$,
  () => DeletePlaceIndexResponse$
];
var DeleteRouteCalculator$ = [
  9,
  n0,
  _DRC,
  { [_en]: ["cp.routes."], [_h]: ["DELETE", "/routes/v0/calculators/{CalculatorName}", 200] },
  () => DeleteRouteCalculatorRequest$,
  () => DeleteRouteCalculatorResponse$
];
var DeleteTracker$ = [
  9,
  n0,
  _DTe,
  { [_en]: ["cp.tracking."], [_h]: ["DELETE", "/tracking/v0/trackers/{TrackerName}", 200] },
  () => DeleteTrackerRequest$,
  () => DeleteTrackerResponse$
];
var DescribeGeofenceCollection$ = [
  9,
  n0,
  _DGCe,
  { [_en]: ["cp.geofencing."], [_h]: ["GET", "/geofencing/v0/collections/{CollectionName}", 200] },
  () => DescribeGeofenceCollectionRequest$,
  () => DescribeGeofenceCollectionResponse$
];
var DescribeKey$ = [
  9,
  n0,
  _DKe,
  { [_en]: ["cp.metadata."], [_h]: ["GET", "/metadata/v0/keys/{KeyName}", 200] },
  () => DescribeKeyRequest$,
  () => DescribeKeyResponse$
];
var DescribeMap$ = [
  9,
  n0,
  _DMe,
  { [_en]: ["cp.maps."], [_h]: ["GET", "/maps/v0/maps/{MapName}", 200] },
  () => DescribeMapRequest$,
  () => DescribeMapResponse$
];
var DescribePlaceIndex$ = [
  9,
  n0,
  _DPIe,
  { [_en]: ["cp.places."], [_h]: ["GET", "/places/v0/indexes/{IndexName}", 200] },
  () => DescribePlaceIndexRequest$,
  () => DescribePlaceIndexResponse$
];
var DescribeRouteCalculator$ = [
  9,
  n0,
  _DRCe,
  { [_en]: ["cp.routes."], [_h]: ["GET", "/routes/v0/calculators/{CalculatorName}", 200] },
  () => DescribeRouteCalculatorRequest$,
  () => DescribeRouteCalculatorResponse$
];
var DescribeTracker$ = [
  9,
  n0,
  _DTes,
  { [_en]: ["cp.tracking."], [_h]: ["GET", "/tracking/v0/trackers/{TrackerName}", 200] },
  () => DescribeTrackerRequest$,
  () => DescribeTrackerResponse$
];
var DisassociateTrackerConsumer$ = [
  9,
  n0,
  _DTC,
  { [_en]: ["cp.tracking."], [_h]: ["DELETE", "/tracking/v0/trackers/{TrackerName}/consumers/{ConsumerArn}", 200] },
  () => DisassociateTrackerConsumerRequest$,
  () => DisassociateTrackerConsumerResponse$
];
var ForecastGeofenceEvents$ = [
  9,
  n0,
  _FGE,
  { [_en]: ["geofencing."], [_h]: ["POST", "/geofencing/v0/collections/{CollectionName}/forecast-geofence-events", 200] },
  () => ForecastGeofenceEventsRequest$,
  () => ForecastGeofenceEventsResponse$
];
var GetDevicePosition$ = [
  9,
  n0,
  _GDP,
  { [_en]: ["tracking."], [_h]: ["GET", "/tracking/v0/trackers/{TrackerName}/devices/{DeviceId}/positions/latest", 200] },
  () => GetDevicePositionRequest$,
  () => GetDevicePositionResponse$
];
var GetDevicePositionHistory$ = [
  9,
  n0,
  _GDPH,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/devices/{DeviceId}/list-positions", 200] },
  () => GetDevicePositionHistoryRequest$,
  () => GetDevicePositionHistoryResponse$
];
var GetGeofence$ = [
  9,
  n0,
  _GGe,
  { [_en]: ["geofencing."], [_h]: ["GET", "/geofencing/v0/collections/{CollectionName}/geofences/{GeofenceId}", 200] },
  () => GetGeofenceRequest$,
  () => GetGeofenceResponse$
];
var GetMapGlyphs$ = [
  9,
  n0,
  _GMG,
  { [_en]: ["maps."], [_h]: ["GET", "/maps/v0/maps/{MapName}/glyphs/{FontStack}/{FontUnicodeRange}", 200] },
  () => GetMapGlyphsRequest$,
  () => GetMapGlyphsResponse$
];
var GetMapSprites$ = [
  9,
  n0,
  _GMS,
  { [_en]: ["maps."], [_h]: ["GET", "/maps/v0/maps/{MapName}/sprites/{FileName}", 200] },
  () => GetMapSpritesRequest$,
  () => GetMapSpritesResponse$
];
var GetMapStyleDescriptor$ = [
  9,
  n0,
  _GMSD,
  { [_en]: ["maps."], [_h]: ["GET", "/maps/v0/maps/{MapName}/style-descriptor", 200] },
  () => GetMapStyleDescriptorRequest$,
  () => GetMapStyleDescriptorResponse$
];
var GetMapTile$ = [
  9,
  n0,
  _GMT,
  { [_en]: ["maps."], [_h]: ["GET", "/maps/v0/maps/{MapName}/tiles/{Z}/{X}/{Y}", 200] },
  () => GetMapTileRequest$,
  () => GetMapTileResponse$
];
var GetPlace$ = [
  9,
  n0,
  _GPe,
  { [_en]: ["places."], [_h]: ["GET", "/places/v0/indexes/{IndexName}/places/{PlaceId}", 200] },
  () => GetPlaceRequest$,
  () => GetPlaceResponse$
];
var ListDevicePositions$ = [
  9,
  n0,
  _LDP,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/list-positions", 200] },
  () => ListDevicePositionsRequest$,
  () => ListDevicePositionsResponse$
];
var ListGeofenceCollections$ = [
  9,
  n0,
  _LGC,
  { [_en]: ["cp.geofencing."], [_h]: ["POST", "/geofencing/v0/list-collections", 200] },
  () => ListGeofenceCollectionsRequest$,
  () => ListGeofenceCollectionsResponse$
];
var ListGeofences$ = [
  9,
  n0,
  _LGi,
  { [_en]: ["geofencing."], [_h]: ["POST", "/geofencing/v0/collections/{CollectionName}/list-geofences", 200] },
  () => ListGeofencesRequest$,
  () => ListGeofencesResponse$
];
var ListKeys$ = [
  9,
  n0,
  _LK,
  { [_en]: ["cp.metadata."], [_h]: ["POST", "/metadata/v0/list-keys", 200] },
  () => ListKeysRequest$,
  () => ListKeysResponse$
];
var ListMaps$ = [
  9,
  n0,
  _LM,
  { [_en]: ["cp.maps."], [_h]: ["POST", "/maps/v0/list-maps", 200] },
  () => ListMapsRequest$,
  () => ListMapsResponse$
];
var ListPlaceIndexes$ = [
  9,
  n0,
  _LPI,
  { [_en]: ["cp.places."], [_h]: ["POST", "/places/v0/list-indexes", 200] },
  () => ListPlaceIndexesRequest$,
  () => ListPlaceIndexesResponse$
];
var ListRouteCalculators$ = [
  9,
  n0,
  _LRC,
  { [_en]: ["cp.routes."], [_h]: ["POST", "/routes/v0/list-calculators", 200] },
  () => ListRouteCalculatorsRequest$,
  () => ListRouteCalculatorsResponse$
];
var ListTagsForResource$ = [
  9,
  n0,
  _LTFR,
  { [_en]: ["cp.metadata."], [_h]: ["GET", "/tags/{ResourceArn}", 200] },
  () => ListTagsForResourceRequest$,
  () => ListTagsForResourceResponse$
];
var ListTrackerConsumers$ = [
  9,
  n0,
  _LTC,
  { [_en]: ["cp.tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/list-consumers", 200] },
  () => ListTrackerConsumersRequest$,
  () => ListTrackerConsumersResponse$
];
var ListTrackers$ = [
  9,
  n0,
  _LT,
  { [_en]: ["cp.tracking."], [_h]: ["POST", "/tracking/v0/list-trackers", 200] },
  () => ListTrackersRequest$,
  () => ListTrackersResponse$
];
var PutGeofence$ = [
  9,
  n0,
  _PGu,
  { [_en]: ["geofencing."], [_h]: ["PUT", "/geofencing/v0/collections/{CollectionName}/geofences/{GeofenceId}", 200] },
  () => PutGeofenceRequest$,
  () => PutGeofenceResponse$
];
var SearchPlaceIndexForPosition$ = [
  9,
  n0,
  _SPIFP,
  { [_en]: ["places."], [_h]: ["POST", "/places/v0/indexes/{IndexName}/search/position", 200] },
  () => SearchPlaceIndexForPositionRequest$,
  () => SearchPlaceIndexForPositionResponse$
];
var SearchPlaceIndexForSuggestions$ = [
  9,
  n0,
  _SPIFS,
  { [_en]: ["places."], [_h]: ["POST", "/places/v0/indexes/{IndexName}/search/suggestions", 200] },
  () => SearchPlaceIndexForSuggestionsRequest$,
  () => SearchPlaceIndexForSuggestionsResponse$
];
var SearchPlaceIndexForText$ = [
  9,
  n0,
  _SPIFT,
  { [_en]: ["places."], [_h]: ["POST", "/places/v0/indexes/{IndexName}/search/text", 200] },
  () => SearchPlaceIndexForTextRequest$,
  () => SearchPlaceIndexForTextResponse$
];
var TagResource$ = [
  9,
  n0,
  _TR,
  { [_en]: ["cp.metadata."], [_h]: ["POST", "/tags/{ResourceArn}", 200] },
  () => TagResourceRequest$,
  () => TagResourceResponse$
];
var UntagResource$ = [
  9,
  n0,
  _UR,
  { [_en]: ["cp.metadata."], [_h]: ["DELETE", "/tags/{ResourceArn}", 200] },
  () => UntagResourceRequest$,
  () => UntagResourceResponse$
];
var UpdateGeofenceCollection$ = [
  9,
  n0,
  _UGC,
  { [_en]: ["cp.geofencing."], [_h]: ["PATCH", "/geofencing/v0/collections/{CollectionName}", 200] },
  () => UpdateGeofenceCollectionRequest$,
  () => UpdateGeofenceCollectionResponse$
];
var UpdateKey$ = [
  9,
  n0,
  _UK,
  { [_en]: ["cp.metadata."], [_h]: ["PATCH", "/metadata/v0/keys/{KeyName}", 200] },
  () => UpdateKeyRequest$,
  () => UpdateKeyResponse$
];
var UpdateMap$ = [
  9,
  n0,
  _UM,
  { [_en]: ["cp.maps."], [_h]: ["PATCH", "/maps/v0/maps/{MapName}", 200] },
  () => UpdateMapRequest$,
  () => UpdateMapResponse$
];
var UpdatePlaceIndex$ = [
  9,
  n0,
  _UPI,
  { [_en]: ["cp.places."], [_h]: ["PATCH", "/places/v0/indexes/{IndexName}", 200] },
  () => UpdatePlaceIndexRequest$,
  () => UpdatePlaceIndexResponse$
];
var UpdateRouteCalculator$ = [
  9,
  n0,
  _URC,
  { [_en]: ["cp.routes."], [_h]: ["PATCH", "/routes/v0/calculators/{CalculatorName}", 200] },
  () => UpdateRouteCalculatorRequest$,
  () => UpdateRouteCalculatorResponse$
];
var UpdateTracker$ = [
  9,
  n0,
  _UTp,
  { [_en]: ["cp.tracking."], [_h]: ["PATCH", "/tracking/v0/trackers/{TrackerName}", 200] },
  () => UpdateTrackerRequest$,
  () => UpdateTrackerResponse$
];
var VerifyDevicePosition$ = [
  9,
  n0,
  _VDP,
  { [_en]: ["tracking."], [_h]: ["POST", "/tracking/v0/trackers/{TrackerName}/positions/verify", 200] },
  () => VerifyDevicePositionRequest$,
  () => VerifyDevicePositionResponse$
];

// node_modules/@aws-sdk/client-location/dist-es/runtimeConfig.shared.js
var getRuntimeConfig = (config) => {
  return {
    apiVersion: "2020-11-19",
    base64Decoder: (config == null ? void 0 : config.base64Decoder) ?? fromBase64,
    base64Encoder: (config == null ? void 0 : config.base64Encoder) ?? toBase64,
    disableHostPrefix: (config == null ? void 0 : config.disableHostPrefix) ?? false,
    endpointProvider: (config == null ? void 0 : config.endpointProvider) ?? defaultEndpointResolver,
    extensions: (config == null ? void 0 : config.extensions) ?? [],
    httpAuthSchemeProvider: (config == null ? void 0 : config.httpAuthSchemeProvider) ?? defaultLocationHttpAuthSchemeProvider,
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
      defaultNamespace: "com.amazonaws.location",
      errorTypeRegistries,
      version: "2020-11-19",
      serviceTarget: "LocationService"
    },
    serviceId: (config == null ? void 0 : config.serviceId) ?? "Location",
    urlParser: (config == null ? void 0 : config.urlParser) ?? parseUrl,
    utf8Decoder: (config == null ? void 0 : config.utf8Decoder) ?? fromUtf8,
    utf8Encoder: (config == null ? void 0 : config.utf8Encoder) ?? toUtf8
  };
};

// node_modules/@aws-sdk/client-location/dist-es/runtimeConfig.browser.js
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

// node_modules/@aws-sdk/client-location/dist-es/auth/httpAuthExtensionConfiguration.js
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

// node_modules/@aws-sdk/client-location/dist-es/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
  const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
  extensions.forEach((extension) => extension.configure(extensionConfiguration));
  return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

// node_modules/@aws-sdk/client-location/dist-es/LocationClient.js
var LocationClient = class extends Client {
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
      httpAuthSchemeParametersProvider: defaultLocationHttpAuthSchemeParametersProvider,
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

// node_modules/@aws-sdk/client-location/dist-es/commands/AssociateTrackerConsumerCommand.js
var AssociateTrackerConsumerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "AssociateTrackerConsumer", {}).n("LocationClient", "AssociateTrackerConsumerCommand").sc(AssociateTrackerConsumer$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchDeleteDevicePositionHistoryCommand.js
var BatchDeleteDevicePositionHistoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchDeleteDevicePositionHistory", {}).n("LocationClient", "BatchDeleteDevicePositionHistoryCommand").sc(BatchDeleteDevicePositionHistory$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchDeleteGeofenceCommand.js
var BatchDeleteGeofenceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchDeleteGeofence", {}).n("LocationClient", "BatchDeleteGeofenceCommand").sc(BatchDeleteGeofence$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchEvaluateGeofencesCommand.js
var BatchEvaluateGeofencesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchEvaluateGeofences", {}).n("LocationClient", "BatchEvaluateGeofencesCommand").sc(BatchEvaluateGeofences$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchGetDevicePositionCommand.js
var BatchGetDevicePositionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchGetDevicePosition", {}).n("LocationClient", "BatchGetDevicePositionCommand").sc(BatchGetDevicePosition$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchPutGeofenceCommand.js
var BatchPutGeofenceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchPutGeofence", {}).n("LocationClient", "BatchPutGeofenceCommand").sc(BatchPutGeofence$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/BatchUpdateDevicePositionCommand.js
var BatchUpdateDevicePositionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "BatchUpdateDevicePosition", {}).n("LocationClient", "BatchUpdateDevicePositionCommand").sc(BatchUpdateDevicePosition$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CalculateRouteCommand.js
var CalculateRouteCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CalculateRoute", {}).n("LocationClient", "CalculateRouteCommand").sc(CalculateRoute$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CalculateRouteMatrixCommand.js
var CalculateRouteMatrixCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CalculateRouteMatrix", {}).n("LocationClient", "CalculateRouteMatrixCommand").sc(CalculateRouteMatrix$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreateGeofenceCollectionCommand.js
var CreateGeofenceCollectionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreateGeofenceCollection", {}).n("LocationClient", "CreateGeofenceCollectionCommand").sc(CreateGeofenceCollection$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreateKeyCommand.js
var CreateKeyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreateKey", {}).n("LocationClient", "CreateKeyCommand").sc(CreateKey$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreateMapCommand.js
var CreateMapCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreateMap", {}).n("LocationClient", "CreateMapCommand").sc(CreateMap$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreatePlaceIndexCommand.js
var CreatePlaceIndexCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreatePlaceIndex", {}).n("LocationClient", "CreatePlaceIndexCommand").sc(CreatePlaceIndex$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreateRouteCalculatorCommand.js
var CreateRouteCalculatorCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreateRouteCalculator", {}).n("LocationClient", "CreateRouteCalculatorCommand").sc(CreateRouteCalculator$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/CreateTrackerCommand.js
var CreateTrackerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "CreateTracker", {}).n("LocationClient", "CreateTrackerCommand").sc(CreateTracker$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeleteGeofenceCollectionCommand.js
var DeleteGeofenceCollectionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeleteGeofenceCollection", {}).n("LocationClient", "DeleteGeofenceCollectionCommand").sc(DeleteGeofenceCollection$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeleteKeyCommand.js
var DeleteKeyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeleteKey", {}).n("LocationClient", "DeleteKeyCommand").sc(DeleteKey$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeleteMapCommand.js
var DeleteMapCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeleteMap", {}).n("LocationClient", "DeleteMapCommand").sc(DeleteMap$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeletePlaceIndexCommand.js
var DeletePlaceIndexCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeletePlaceIndex", {}).n("LocationClient", "DeletePlaceIndexCommand").sc(DeletePlaceIndex$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeleteRouteCalculatorCommand.js
var DeleteRouteCalculatorCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeleteRouteCalculator", {}).n("LocationClient", "DeleteRouteCalculatorCommand").sc(DeleteRouteCalculator$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DeleteTrackerCommand.js
var DeleteTrackerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DeleteTracker", {}).n("LocationClient", "DeleteTrackerCommand").sc(DeleteTracker$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribeGeofenceCollectionCommand.js
var DescribeGeofenceCollectionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribeGeofenceCollection", {}).n("LocationClient", "DescribeGeofenceCollectionCommand").sc(DescribeGeofenceCollection$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribeKeyCommand.js
var DescribeKeyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribeKey", {}).n("LocationClient", "DescribeKeyCommand").sc(DescribeKey$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribeMapCommand.js
var DescribeMapCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribeMap", {}).n("LocationClient", "DescribeMapCommand").sc(DescribeMap$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribePlaceIndexCommand.js
var DescribePlaceIndexCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribePlaceIndex", {}).n("LocationClient", "DescribePlaceIndexCommand").sc(DescribePlaceIndex$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribeRouteCalculatorCommand.js
var DescribeRouteCalculatorCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribeRouteCalculator", {}).n("LocationClient", "DescribeRouteCalculatorCommand").sc(DescribeRouteCalculator$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DescribeTrackerCommand.js
var DescribeTrackerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DescribeTracker", {}).n("LocationClient", "DescribeTrackerCommand").sc(DescribeTracker$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/DisassociateTrackerConsumerCommand.js
var DisassociateTrackerConsumerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "DisassociateTrackerConsumer", {}).n("LocationClient", "DisassociateTrackerConsumerCommand").sc(DisassociateTrackerConsumer$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ForecastGeofenceEventsCommand.js
var ForecastGeofenceEventsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ForecastGeofenceEvents", {}).n("LocationClient", "ForecastGeofenceEventsCommand").sc(ForecastGeofenceEvents$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetDevicePositionCommand.js
var GetDevicePositionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetDevicePosition", {}).n("LocationClient", "GetDevicePositionCommand").sc(GetDevicePosition$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetDevicePositionHistoryCommand.js
var GetDevicePositionHistoryCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetDevicePositionHistory", {}).n("LocationClient", "GetDevicePositionHistoryCommand").sc(GetDevicePositionHistory$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetGeofenceCommand.js
var GetGeofenceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetGeofence", {}).n("LocationClient", "GetGeofenceCommand").sc(GetGeofence$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetMapGlyphsCommand.js
var GetMapGlyphsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetMapGlyphs", {}).n("LocationClient", "GetMapGlyphsCommand").sc(GetMapGlyphs$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetMapSpritesCommand.js
var GetMapSpritesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetMapSprites", {}).n("LocationClient", "GetMapSpritesCommand").sc(GetMapSprites$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetMapStyleDescriptorCommand.js
var GetMapStyleDescriptorCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetMapStyleDescriptor", {}).n("LocationClient", "GetMapStyleDescriptorCommand").sc(GetMapStyleDescriptor$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetMapTileCommand.js
var GetMapTileCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetMapTile", {}).n("LocationClient", "GetMapTileCommand").sc(GetMapTile$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/GetPlaceCommand.js
var GetPlaceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "GetPlace", {}).n("LocationClient", "GetPlaceCommand").sc(GetPlace$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListDevicePositionsCommand.js
var ListDevicePositionsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListDevicePositions", {}).n("LocationClient", "ListDevicePositionsCommand").sc(ListDevicePositions$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListGeofenceCollectionsCommand.js
var ListGeofenceCollectionsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListGeofenceCollections", {}).n("LocationClient", "ListGeofenceCollectionsCommand").sc(ListGeofenceCollections$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListGeofencesCommand.js
var ListGeofencesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListGeofences", {}).n("LocationClient", "ListGeofencesCommand").sc(ListGeofences$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListKeysCommand.js
var ListKeysCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListKeys", {}).n("LocationClient", "ListKeysCommand").sc(ListKeys$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListMapsCommand.js
var ListMapsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListMaps", {}).n("LocationClient", "ListMapsCommand").sc(ListMaps$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListPlaceIndexesCommand.js
var ListPlaceIndexesCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListPlaceIndexes", {}).n("LocationClient", "ListPlaceIndexesCommand").sc(ListPlaceIndexes$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListRouteCalculatorsCommand.js
var ListRouteCalculatorsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListRouteCalculators", {}).n("LocationClient", "ListRouteCalculatorsCommand").sc(ListRouteCalculators$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListTagsForResourceCommand.js
var ListTagsForResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListTagsForResource", {}).n("LocationClient", "ListTagsForResourceCommand").sc(ListTagsForResource$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListTrackerConsumersCommand.js
var ListTrackerConsumersCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListTrackerConsumers", {}).n("LocationClient", "ListTrackerConsumersCommand").sc(ListTrackerConsumers$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/ListTrackersCommand.js
var ListTrackersCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "ListTrackers", {}).n("LocationClient", "ListTrackersCommand").sc(ListTrackers$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/PutGeofenceCommand.js
var PutGeofenceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "PutGeofence", {}).n("LocationClient", "PutGeofenceCommand").sc(PutGeofence$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/SearchPlaceIndexForPositionCommand.js
var SearchPlaceIndexForPositionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "SearchPlaceIndexForPosition", {}).n("LocationClient", "SearchPlaceIndexForPositionCommand").sc(SearchPlaceIndexForPosition$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/SearchPlaceIndexForSuggestionsCommand.js
var SearchPlaceIndexForSuggestionsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "SearchPlaceIndexForSuggestions", {}).n("LocationClient", "SearchPlaceIndexForSuggestionsCommand").sc(SearchPlaceIndexForSuggestions$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/SearchPlaceIndexForTextCommand.js
var SearchPlaceIndexForTextCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "SearchPlaceIndexForText", {}).n("LocationClient", "SearchPlaceIndexForTextCommand").sc(SearchPlaceIndexForText$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/TagResourceCommand.js
var TagResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "TagResource", {}).n("LocationClient", "TagResourceCommand").sc(TagResource$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UntagResourceCommand.js
var UntagResourceCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UntagResource", {}).n("LocationClient", "UntagResourceCommand").sc(UntagResource$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdateGeofenceCollectionCommand.js
var UpdateGeofenceCollectionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdateGeofenceCollection", {}).n("LocationClient", "UpdateGeofenceCollectionCommand").sc(UpdateGeofenceCollection$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdateKeyCommand.js
var UpdateKeyCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdateKey", {}).n("LocationClient", "UpdateKeyCommand").sc(UpdateKey$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdateMapCommand.js
var UpdateMapCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdateMap", {}).n("LocationClient", "UpdateMapCommand").sc(UpdateMap$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdatePlaceIndexCommand.js
var UpdatePlaceIndexCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdatePlaceIndex", {}).n("LocationClient", "UpdatePlaceIndexCommand").sc(UpdatePlaceIndex$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdateRouteCalculatorCommand.js
var UpdateRouteCalculatorCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdateRouteCalculator", {}).n("LocationClient", "UpdateRouteCalculatorCommand").sc(UpdateRouteCalculator$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/UpdateTrackerCommand.js
var UpdateTrackerCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "UpdateTracker", {}).n("LocationClient", "UpdateTrackerCommand").sc(UpdateTracker$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/commands/VerifyDevicePositionCommand.js
var VerifyDevicePositionCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs, config, o2) {
  return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
}).s("LocationService", "VerifyDevicePosition", {}).n("LocationClient", "VerifyDevicePositionCommand").sc(VerifyDevicePosition$).build() {
};

// node_modules/@aws-sdk/client-location/dist-es/pagination/ForecastGeofenceEventsPaginator.js
var paginateForecastGeofenceEvents = createPaginator(LocationClient, ForecastGeofenceEventsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/GetDevicePositionHistoryPaginator.js
var paginateGetDevicePositionHistory = createPaginator(LocationClient, GetDevicePositionHistoryCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListDevicePositionsPaginator.js
var paginateListDevicePositions = createPaginator(LocationClient, ListDevicePositionsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListGeofenceCollectionsPaginator.js
var paginateListGeofenceCollections = createPaginator(LocationClient, ListGeofenceCollectionsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListGeofencesPaginator.js
var paginateListGeofences = createPaginator(LocationClient, ListGeofencesCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListKeysPaginator.js
var paginateListKeys = createPaginator(LocationClient, ListKeysCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListMapsPaginator.js
var paginateListMaps = createPaginator(LocationClient, ListMapsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListPlaceIndexesPaginator.js
var paginateListPlaceIndexes = createPaginator(LocationClient, ListPlaceIndexesCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListRouteCalculatorsPaginator.js
var paginateListRouteCalculators = createPaginator(LocationClient, ListRouteCalculatorsCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListTrackerConsumersPaginator.js
var paginateListTrackerConsumers = createPaginator(LocationClient, ListTrackerConsumersCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/pagination/ListTrackersPaginator.js
var paginateListTrackers = createPaginator(LocationClient, ListTrackersCommand, "NextToken", "NextToken", "MaxResults");

// node_modules/@aws-sdk/client-location/dist-es/Location.js
var commands = {
  AssociateTrackerConsumerCommand,
  BatchDeleteDevicePositionHistoryCommand,
  BatchDeleteGeofenceCommand,
  BatchEvaluateGeofencesCommand,
  BatchGetDevicePositionCommand,
  BatchPutGeofenceCommand,
  BatchUpdateDevicePositionCommand,
  CalculateRouteCommand,
  CalculateRouteMatrixCommand,
  CreateGeofenceCollectionCommand,
  CreateKeyCommand,
  CreateMapCommand,
  CreatePlaceIndexCommand,
  CreateRouteCalculatorCommand,
  CreateTrackerCommand,
  DeleteGeofenceCollectionCommand,
  DeleteKeyCommand,
  DeleteMapCommand,
  DeletePlaceIndexCommand,
  DeleteRouteCalculatorCommand,
  DeleteTrackerCommand,
  DescribeGeofenceCollectionCommand,
  DescribeKeyCommand,
  DescribeMapCommand,
  DescribePlaceIndexCommand,
  DescribeRouteCalculatorCommand,
  DescribeTrackerCommand,
  DisassociateTrackerConsumerCommand,
  ForecastGeofenceEventsCommand,
  GetDevicePositionCommand,
  GetDevicePositionHistoryCommand,
  GetGeofenceCommand,
  GetMapGlyphsCommand,
  GetMapSpritesCommand,
  GetMapStyleDescriptorCommand,
  GetMapTileCommand,
  GetPlaceCommand,
  ListDevicePositionsCommand,
  ListGeofenceCollectionsCommand,
  ListGeofencesCommand,
  ListKeysCommand,
  ListMapsCommand,
  ListPlaceIndexesCommand,
  ListRouteCalculatorsCommand,
  ListTagsForResourceCommand,
  ListTrackerConsumersCommand,
  ListTrackersCommand,
  PutGeofenceCommand,
  SearchPlaceIndexForPositionCommand,
  SearchPlaceIndexForSuggestionsCommand,
  SearchPlaceIndexForTextCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateGeofenceCollectionCommand,
  UpdateKeyCommand,
  UpdateMapCommand,
  UpdatePlaceIndexCommand,
  UpdateRouteCalculatorCommand,
  UpdateTrackerCommand,
  VerifyDevicePositionCommand
};
var paginators = {
  paginateForecastGeofenceEvents,
  paginateGetDevicePositionHistory,
  paginateListDevicePositions,
  paginateListGeofenceCollections,
  paginateListGeofences,
  paginateListKeys,
  paginateListMaps,
  paginateListPlaceIndexes,
  paginateListRouteCalculators,
  paginateListTrackerConsumers,
  paginateListTrackers
};
var Location = class extends LocationClient {
};
createAggregatedClient(commands, Location, { paginators });
export {
  Command as $Command,
  AccessDeniedException,
  AccessDeniedException$,
  AndroidApp$,
  ApiKeyFilter$,
  ApiKeyRestrictions$,
  AppleApp$,
  AssociateTrackerConsumer$,
  AssociateTrackerConsumerCommand,
  AssociateTrackerConsumerRequest$,
  AssociateTrackerConsumerResponse$,
  BatchDeleteDevicePositionHistory$,
  BatchDeleteDevicePositionHistoryCommand,
  BatchDeleteDevicePositionHistoryError$,
  BatchDeleteDevicePositionHistoryRequest$,
  BatchDeleteDevicePositionHistoryResponse$,
  BatchDeleteGeofence$,
  BatchDeleteGeofenceCommand,
  BatchDeleteGeofenceError$,
  BatchDeleteGeofenceRequest$,
  BatchDeleteGeofenceResponse$,
  BatchEvaluateGeofences$,
  BatchEvaluateGeofencesCommand,
  BatchEvaluateGeofencesError$,
  BatchEvaluateGeofencesRequest$,
  BatchEvaluateGeofencesResponse$,
  BatchGetDevicePosition$,
  BatchGetDevicePositionCommand,
  BatchGetDevicePositionError$,
  BatchGetDevicePositionRequest$,
  BatchGetDevicePositionResponse$,
  BatchItemError$,
  BatchPutGeofence$,
  BatchPutGeofenceCommand,
  BatchPutGeofenceError$,
  BatchPutGeofenceRequest$,
  BatchPutGeofenceRequestEntry$,
  BatchPutGeofenceResponse$,
  BatchPutGeofenceSuccess$,
  BatchUpdateDevicePosition$,
  BatchUpdateDevicePositionCommand,
  BatchUpdateDevicePositionError$,
  BatchUpdateDevicePositionRequest$,
  BatchUpdateDevicePositionResponse$,
  CalculateRoute$,
  CalculateRouteCarModeOptions$,
  CalculateRouteCommand,
  CalculateRouteMatrix$,
  CalculateRouteMatrixCommand,
  CalculateRouteMatrixRequest$,
  CalculateRouteMatrixResponse$,
  CalculateRouteMatrixSummary$,
  CalculateRouteRequest$,
  CalculateRouteResponse$,
  CalculateRouteSummary$,
  CalculateRouteTruckModeOptions$,
  CellSignals$,
  Circle$,
  ConflictException,
  ConflictException$,
  CreateGeofenceCollection$,
  CreateGeofenceCollectionCommand,
  CreateGeofenceCollectionRequest$,
  CreateGeofenceCollectionResponse$,
  CreateKey$,
  CreateKeyCommand,
  CreateKeyRequest$,
  CreateKeyResponse$,
  CreateMap$,
  CreateMapCommand,
  CreateMapRequest$,
  CreateMapResponse$,
  CreatePlaceIndex$,
  CreatePlaceIndexCommand,
  CreatePlaceIndexRequest$,
  CreatePlaceIndexResponse$,
  CreateRouteCalculator$,
  CreateRouteCalculatorCommand,
  CreateRouteCalculatorRequest$,
  CreateRouteCalculatorResponse$,
  CreateTracker$,
  CreateTrackerCommand,
  CreateTrackerRequest$,
  CreateTrackerResponse$,
  DataSourceConfiguration$,
  DeleteGeofenceCollection$,
  DeleteGeofenceCollectionCommand,
  DeleteGeofenceCollectionRequest$,
  DeleteGeofenceCollectionResponse$,
  DeleteKey$,
  DeleteKeyCommand,
  DeleteKeyRequest$,
  DeleteKeyResponse$,
  DeleteMap$,
  DeleteMapCommand,
  DeleteMapRequest$,
  DeleteMapResponse$,
  DeletePlaceIndex$,
  DeletePlaceIndexCommand,
  DeletePlaceIndexRequest$,
  DeletePlaceIndexResponse$,
  DeleteRouteCalculator$,
  DeleteRouteCalculatorCommand,
  DeleteRouteCalculatorRequest$,
  DeleteRouteCalculatorResponse$,
  DeleteTracker$,
  DeleteTrackerCommand,
  DeleteTrackerRequest$,
  DeleteTrackerResponse$,
  DescribeGeofenceCollection$,
  DescribeGeofenceCollectionCommand,
  DescribeGeofenceCollectionRequest$,
  DescribeGeofenceCollectionResponse$,
  DescribeKey$,
  DescribeKeyCommand,
  DescribeKeyRequest$,
  DescribeKeyResponse$,
  DescribeMap$,
  DescribeMapCommand,
  DescribeMapRequest$,
  DescribeMapResponse$,
  DescribePlaceIndex$,
  DescribePlaceIndexCommand,
  DescribePlaceIndexRequest$,
  DescribePlaceIndexResponse$,
  DescribeRouteCalculator$,
  DescribeRouteCalculatorCommand,
  DescribeRouteCalculatorRequest$,
  DescribeRouteCalculatorResponse$,
  DescribeTracker$,
  DescribeTrackerCommand,
  DescribeTrackerRequest$,
  DescribeTrackerResponse$,
  DevicePosition$,
  DevicePositionUpdate$,
  DeviceState$,
  DisassociateTrackerConsumer$,
  DisassociateTrackerConsumerCommand,
  DisassociateTrackerConsumerRequest$,
  DisassociateTrackerConsumerResponse$,
  ForecastGeofenceEvents$,
  ForecastGeofenceEventsCommand,
  ForecastGeofenceEventsDeviceState$,
  ForecastGeofenceEventsRequest$,
  ForecastGeofenceEventsResponse$,
  ForecastedEvent$,
  GeofenceGeometry$,
  GetDevicePosition$,
  GetDevicePositionCommand,
  GetDevicePositionHistory$,
  GetDevicePositionHistoryCommand,
  GetDevicePositionHistoryRequest$,
  GetDevicePositionHistoryResponse$,
  GetDevicePositionRequest$,
  GetDevicePositionResponse$,
  GetGeofence$,
  GetGeofenceCommand,
  GetGeofenceRequest$,
  GetGeofenceResponse$,
  GetMapGlyphs$,
  GetMapGlyphsCommand,
  GetMapGlyphsRequest$,
  GetMapGlyphsResponse$,
  GetMapSprites$,
  GetMapSpritesCommand,
  GetMapSpritesRequest$,
  GetMapSpritesResponse$,
  GetMapStyleDescriptor$,
  GetMapStyleDescriptorCommand,
  GetMapStyleDescriptorRequest$,
  GetMapStyleDescriptorResponse$,
  GetMapTile$,
  GetMapTileCommand,
  GetMapTileRequest$,
  GetMapTileResponse$,
  GetPlace$,
  GetPlaceCommand,
  GetPlaceRequest$,
  GetPlaceResponse$,
  InferredState$,
  InternalServerException,
  InternalServerException$,
  Leg$,
  LegGeometry$,
  ListDevicePositions$,
  ListDevicePositionsCommand,
  ListDevicePositionsRequest$,
  ListDevicePositionsResponse$,
  ListDevicePositionsResponseEntry$,
  ListGeofenceCollections$,
  ListGeofenceCollectionsCommand,
  ListGeofenceCollectionsRequest$,
  ListGeofenceCollectionsResponse$,
  ListGeofenceCollectionsResponseEntry$,
  ListGeofenceResponseEntry$,
  ListGeofences$,
  ListGeofencesCommand,
  ListGeofencesRequest$,
  ListGeofencesResponse$,
  ListKeys$,
  ListKeysCommand,
  ListKeysRequest$,
  ListKeysResponse$,
  ListKeysResponseEntry$,
  ListMaps$,
  ListMapsCommand,
  ListMapsRequest$,
  ListMapsResponse$,
  ListMapsResponseEntry$,
  ListPlaceIndexes$,
  ListPlaceIndexesCommand,
  ListPlaceIndexesRequest$,
  ListPlaceIndexesResponse$,
  ListPlaceIndexesResponseEntry$,
  ListRouteCalculators$,
  ListRouteCalculatorsCommand,
  ListRouteCalculatorsRequest$,
  ListRouteCalculatorsResponse$,
  ListRouteCalculatorsResponseEntry$,
  ListTagsForResource$,
  ListTagsForResourceCommand,
  ListTagsForResourceRequest$,
  ListTagsForResourceResponse$,
  ListTrackerConsumers$,
  ListTrackerConsumersCommand,
  ListTrackerConsumersRequest$,
  ListTrackerConsumersResponse$,
  ListTrackers$,
  ListTrackersCommand,
  ListTrackersRequest$,
  ListTrackersResponse$,
  ListTrackersResponseEntry$,
  Location,
  LocationClient,
  LocationServiceException,
  LocationServiceException$,
  LteCellDetails$,
  LteLocalId$,
  LteNetworkMeasurements$,
  MapConfiguration$,
  MapConfigurationUpdate$,
  Place$,
  PlaceGeometry$,
  PositionalAccuracy$,
  PutGeofence$,
  PutGeofenceCommand,
  PutGeofenceRequest$,
  PutGeofenceResponse$,
  ResourceNotFoundException,
  ResourceNotFoundException$,
  RouteMatrixEntry$,
  RouteMatrixEntryError$,
  SearchForPositionResult$,
  SearchForSuggestionsResult$,
  SearchForTextResult$,
  SearchPlaceIndexForPosition$,
  SearchPlaceIndexForPositionCommand,
  SearchPlaceIndexForPositionRequest$,
  SearchPlaceIndexForPositionResponse$,
  SearchPlaceIndexForPositionSummary$,
  SearchPlaceIndexForSuggestions$,
  SearchPlaceIndexForSuggestionsCommand,
  SearchPlaceIndexForSuggestionsRequest$,
  SearchPlaceIndexForSuggestionsResponse$,
  SearchPlaceIndexForSuggestionsSummary$,
  SearchPlaceIndexForText$,
  SearchPlaceIndexForTextCommand,
  SearchPlaceIndexForTextRequest$,
  SearchPlaceIndexForTextResponse$,
  SearchPlaceIndexForTextSummary$,
  ServiceQuotaExceededException,
  ServiceQuotaExceededException$,
  Step$,
  TagResource$,
  TagResourceCommand,
  TagResourceRequest$,
  TagResourceResponse$,
  ThrottlingException,
  ThrottlingException$,
  TimeZone$,
  TrackingFilterGeometry$,
  TruckDimensions$,
  TruckWeight$,
  UntagResource$,
  UntagResourceCommand,
  UntagResourceRequest$,
  UntagResourceResponse$,
  UpdateGeofenceCollection$,
  UpdateGeofenceCollectionCommand,
  UpdateGeofenceCollectionRequest$,
  UpdateGeofenceCollectionResponse$,
  UpdateKey$,
  UpdateKeyCommand,
  UpdateKeyRequest$,
  UpdateKeyResponse$,
  UpdateMap$,
  UpdateMapCommand,
  UpdateMapRequest$,
  UpdateMapResponse$,
  UpdatePlaceIndex$,
  UpdatePlaceIndexCommand,
  UpdatePlaceIndexRequest$,
  UpdatePlaceIndexResponse$,
  UpdateRouteCalculator$,
  UpdateRouteCalculatorCommand,
  UpdateRouteCalculatorRequest$,
  UpdateRouteCalculatorResponse$,
  UpdateTracker$,
  UpdateTrackerCommand,
  UpdateTrackerRequest$,
  UpdateTrackerResponse$,
  ValidationException,
  ValidationException$,
  ValidationExceptionField$,
  VerifyDevicePosition$,
  VerifyDevicePositionCommand,
  VerifyDevicePositionRequest$,
  VerifyDevicePositionResponse$,
  WiFiAccessPoint$,
  Client as __Client,
  errorTypeRegistries,
  paginateForecastGeofenceEvents,
  paginateGetDevicePositionHistory,
  paginateListDevicePositions,
  paginateListGeofenceCollections,
  paginateListGeofences,
  paginateListKeys,
  paginateListMaps,
  paginateListPlaceIndexes,
  paginateListRouteCalculators,
  paginateListTrackerConsumers,
  paginateListTrackers
};
//# sourceMappingURL=@aws-sdk_client-location.js.map
