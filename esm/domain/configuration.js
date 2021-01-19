import { __assign } from "tslib";
import { BuildMode, Datacenter, INTAKE_SITE } from '../boot/init';
import { getCurrentSite } from '../browser/cookie';
import { includes, ONE_KILO_BYTE, ONE_SECOND } from '../tools/utils';
export var DEFAULT_CONFIGURATION = {
    allowedTracingOrigins: [],
    maxErrorsByMinute: 3000,
    maxInternalMonitoringMessagesPerPage: 15,
    resourceSampleRate: 100,
    sampleRate: 100,
    silentMultipleInit: false,
    trackInteractions: false,
    /**
     * arbitrary value, byte precision not needed
     */
    requestErrorResponseLengthLimit: 32 * ONE_KILO_BYTE,
    /**
     * flush automatically, aim to be lower than ALB connection timeout
     * to maximize connection reuse.
     */
    flushTimeout: 30 * ONE_SECOND,
    /**
     * Logs intake limit
     */
    maxBatchSize: 50,
    maxMessageSize: 256 * ONE_KILO_BYTE,
    /**
     * beacon payload max queue size implementation is 64kb
     * ensure that we leave room for logs, rum and potential other users
     */
    batchBytesLimit: 16 * ONE_KILO_BYTE,
};
var ENDPOINTS = {
    alternate: {
        logs: 'logs',
        rum: 'rum',
        trace: 'trace',
    },
    classic: {
        logs: 'browser',
        rum: 'rum',
        trace: 'public-trace',
    },
};
export function buildConfiguration(userConfiguration, buildEnv) {
    var transportConfiguration = {
        applicationId: userConfiguration.applicationId,
        buildMode: buildEnv.buildMode,
        clientToken: userConfiguration.clientToken,
        env: userConfiguration.env,
        proxyHost: userConfiguration.proxyHost,
        sdkVersion: buildEnv.sdkVersion,
        service: userConfiguration.service,
        site: userConfiguration.site || INTAKE_SITE[userConfiguration.datacenter || buildEnv.datacenter],
        version: userConfiguration.version,
    };
    var enableExperimentalFeatures = Array.isArray(userConfiguration.enableExperimentalFeatures)
        ? userConfiguration.enableExperimentalFeatures
        : [];
    var intakeType = getIntakeType(transportConfiguration.site, userConfiguration);
    var intakeUrls = getIntakeUrls(intakeType, transportConfiguration, userConfiguration.replica !== undefined);
    var configuration = __assign({ beforeSend: userConfiguration.beforeSend, cookieOptions: buildCookieOptions(userConfiguration), isEnabled: function (feature) {
            return includes(enableExperimentalFeatures, feature);
        }, logsEndpoint: getEndpoint(intakeType, 'logs', transportConfiguration), proxyHost: userConfiguration.proxyHost, rumEndpoint: getEndpoint(intakeType, 'rum', transportConfiguration), service: userConfiguration.service, traceEndpoint: getEndpoint(intakeType, 'trace', transportConfiguration), isIntakeUrl: function (url) { return intakeUrls.some(function (intakeUrl) { return url.indexOf(intakeUrl) === 0; }); } }, DEFAULT_CONFIGURATION);
    if (userConfiguration.internalMonitoringApiKey) {
        configuration.internalMonitoringEndpoint = getEndpoint(intakeType, 'logs', transportConfiguration, 'browser-agent-internal-monitoring');
    }
    if ('allowedTracingOrigins' in userConfiguration) {
        configuration.allowedTracingOrigins = userConfiguration.allowedTracingOrigins;
    }
    if ('sampleRate' in userConfiguration) {
        configuration.sampleRate = userConfiguration.sampleRate;
    }
    if ('resourceSampleRate' in userConfiguration) {
        configuration.resourceSampleRate = userConfiguration.resourceSampleRate;
    }
    if ('trackInteractions' in userConfiguration) {
        configuration.trackInteractions = !!userConfiguration.trackInteractions;
    }
    if (transportConfiguration.buildMode === BuildMode.E2E_TEST) {
        configuration.internalMonitoringEndpoint = '<<< E2E INTERNAL MONITORING ENDPOINT >>>';
        configuration.logsEndpoint = '<<< E2E LOGS ENDPOINT >>>';
        configuration.rumEndpoint = '<<< E2E RUM ENDPOINT >>>';
    }
    if (transportConfiguration.buildMode === BuildMode.STAGING) {
        if (userConfiguration.replica !== undefined) {
            var replicaTransportConfiguration = __assign(__assign({}, transportConfiguration), { applicationId: userConfiguration.replica.applicationId, clientToken: userConfiguration.replica.clientToken, site: INTAKE_SITE[Datacenter.US] });
            configuration.replica = {
                applicationId: userConfiguration.replica.applicationId,
                internalMonitoringEndpoint: getEndpoint(intakeType, 'logs', replicaTransportConfiguration, 'browser-agent-internal-monitoring'),
                logsEndpoint: getEndpoint(intakeType, 'logs', replicaTransportConfiguration),
                rumEndpoint: getEndpoint(intakeType, 'rum', replicaTransportConfiguration),
            };
        }
    }
    return configuration;
}
export function buildCookieOptions(userConfiguration) {
    var cookieOptions = {};
    cookieOptions.secure = mustUseSecureCookie(userConfiguration);
    cookieOptions.crossSite = !!userConfiguration.useCrossSiteSessionCookie;
    if (!!userConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = getCurrentSite();
    }
    return cookieOptions;
}
function getEndpoint(intakeType, endpointType, conf, source) {
    var tags = "sdk_version:" + conf.sdkVersion +
        ("" + (conf.env ? ",env:" + conf.env : '')) +
        ("" + (conf.service ? ",service:" + conf.service : '')) +
        ("" + (conf.version ? ",version:" + conf.version : ''));
    var datadogHost = getHost(intakeType, endpointType, conf.site);
    var host = conf.proxyHost ? conf.proxyHost : datadogHost;
    var proxyParameter = conf.proxyHost ? "ddhost=" + datadogHost + "&" : '';
    var applicationIdParameter = conf.applicationId ? "_dd.application_id=" + conf.applicationId + "&" : '';
    var parameters = "" + applicationIdParameter + proxyParameter + "ddsource=" + (source || 'browser') + "&ddtags=" + tags;
    return "https://" + host + "/v1/input/" + conf.clientToken + "?" + parameters;
}
function getHost(intakeType, endpointType, site) {
    var endpoint = ENDPOINTS[intakeType][endpointType];
    if (intakeType === 'classic') {
        return endpoint + "-http-intake.logs." + site;
    }
    var domainParts = site.split('.');
    var extension = domainParts.pop();
    var suffix = domainParts.join('-') + "." + extension;
    return endpoint + ".browser-intake-" + suffix;
}
function getIntakeType(site, userConfiguration) {
    // TODO when new intake will be available for gov, only allow classic intake for us and eu
    return userConfiguration.useAlternateIntakeDomains || site === 'us3.datadoghq.com' ? 'alternate' : 'classic';
}
function getIntakeUrls(intakeType, conf, withReplica) {
    if (conf.proxyHost) {
        return ["https://" + conf.proxyHost + "/v1/input/"];
    }
    var sites = [conf.site];
    if (conf.buildMode === BuildMode.STAGING && withReplica) {
        sites.push(INTAKE_SITE[Datacenter.US]);
    }
    var urls = [];
    var endpointTypes = Object.keys(ENDPOINTS[intakeType]);
    for (var _i = 0, sites_1 = sites; _i < sites_1.length; _i++) {
        var site = sites_1[_i];
        for (var _a = 0, endpointTypes_1 = endpointTypes; _a < endpointTypes_1.length; _a++) {
            var endpointType = endpointTypes_1[_a];
            urls.push("https://" + getHost(intakeType, endpointType, site) + "/v1/input/");
        }
    }
    return urls;
}
function mustUseSecureCookie(userConfiguration) {
    return !!userConfiguration.useSecureSessionCookie || !!userConfiguration.useCrossSiteSessionCookie;
}
//# sourceMappingURL=configuration.js.map