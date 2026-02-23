/**
 * Monitoring and Logging Configuration for shram-Setu
 */
export declare const MonitoringConfig: {
    logGroups: {
        apiGateway: {
            logGroupName: string;
            retentionDays: number;
            encryption: boolean;
            kmsKeyId: string;
        };
        lambda: {
            logGroupName: string;
            retentionDays: number;
            encryption: boolean;
            kmsKeyId: string;
        };
        rds: {
            logGroupName: string;
            retentionDays: number;
            encryption: boolean;
            kmsKeyId: string;
        };
        application: {
            logGroupName: string;
            retentionDays: number;
            encryption: boolean;
            kmsKeyId: string;
        };
    };
    customMetrics: {
        namespace: string;
        metrics: ({
            name: string;
            unit: string;
            dimensions: string[];
        } | {
            name: string;
            unit: string;
            dimensions?: undefined;
        })[];
    };
    alarms: {
        apiGateway: ({
            alarmName: string;
            metric: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            treatMissingData: string;
            actions: string[];
            statistic?: undefined;
        } | {
            alarmName: string;
            metric: string;
            statistic: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
            treatMissingData?: undefined;
        })[];
        lambda: ({
            alarmName: string;
            metric: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
            statistic?: undefined;
        } | {
            alarmName: string;
            metric: string;
            statistic: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
        })[];
        dynamodb: {
            alarmName: string;
            metric: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
        }[];
        rds: {
            alarmName: string;
            metric: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
        }[];
        elasticache: {
            alarmName: string;
            metric: string;
            threshold: number;
            evaluationPeriods: number;
            period: number;
            comparisonOperator: string;
            actions: string[];
        }[];
    };
    xray: {
        enabled: boolean;
        samplingRate: number;
        segments: {
            apiGateway: boolean;
            lambda: boolean;
            dynamodb: boolean;
            rds: boolean;
            s3: boolean;
            sns: boolean;
        };
        serviceMap: {
            enabled: boolean;
            refreshInterval: number;
        };
    };
    dashboards: {
        main: {
            dashboardName: string;
            widgets: {
                type: string;
                properties: {
                    metrics: (string | {
                        stat: string;
                    })[][];
                    period: number;
                    stat: string;
                    region: string;
                    title: string;
                };
            }[];
        };
    };
    snsTopics: {
        critical: {
            topicName: string;
            displayName: string;
            subscriptions: {
                protocol: string;
                endpoint: string;
            }[];
        };
        warnings: {
            topicName: string;
            displayName: string;
            subscriptions: {
                protocol: string;
                endpoint: string;
            }[];
        };
    };
    logInsightsQueries: {
        name: string;
        queryString: string;
    }[];
};
