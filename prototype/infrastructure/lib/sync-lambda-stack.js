"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncLambdaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
class SyncLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // DynamoDB table for sync data
        const syncTable = new dynamodb.Table(this, 'SyncTable', {
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'serverTimestamp',
                type: dynamodb.AttributeType.NUMBER
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            pointInTimeRecovery: true,
            tableName: 'ShramSetuSyncData'
        });
        // Add GSI for querying by changeId
        syncTable.addGlobalSecondaryIndex({
            indexName: 'changeId-index',
            partitionKey: {
                name: 'changeId',
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });
        // Lambda function
        const syncLambda = new lambda.Function(this, 'SyncFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'sync-handler.handler',
            code: lambda.Code.fromAsset('../lambda-sync'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            environment: {
                REGION: this.region,
                SYNC_TABLE_NAME: syncTable.tableName
            }
        });
        // Grant Lambda permissions to DynamoDB
        syncTable.grantReadWriteData(syncLambda);
        // API Gateway
        const api = new apigateway.RestApi(this, 'SyncAPI', {
            restApiName: 'Shram-Setu Delta Sync API',
            description: 'API for delta synchronization',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization']
            }
        });
        const syncIntegration = new apigateway.LambdaIntegration(syncLambda);
        // POST /sync - Push changes
        const syncResource = api.root.addResource('sync');
        syncResource.addMethod('POST', syncIntegration);
        // GET /changes - Pull changes
        const changesResource = api.root.addResource('changes');
        changesResource.addMethod('GET', syncIntegration);
        // GET /stats - Get sync statistics
        const statsResource = api.root.addResource('stats');
        statsResource.addMethod('GET', syncIntegration);
        // Outputs
        new cdk.CfnOutput(this, 'SyncAPIEndpoint', {
            value: api.url,
            description: 'Delta Sync API Gateway endpoint URL',
            exportName: 'SyncAPIEndpoint'
        });
        new cdk.CfnOutput(this, 'SyncTableName', {
            value: syncTable.tableName,
            description: 'DynamoDB table for sync data',
            exportName: 'SyncTableName'
        });
        new cdk.CfnOutput(this, 'SyncLambdaName', {
            value: syncLambda.functionName,
            description: 'Sync Lambda function name',
            exportName: 'SyncLambdaName'
        });
    }
}
exports.SyncLambdaStack = SyncLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1sYW1iZGEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzeW5jLWxhbWJkYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCxtRUFBcUQ7QUFJckQsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsK0JBQStCO1FBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ3RELFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2FBQ3BDO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDdkMsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixTQUFTLEVBQUUsbUJBQW1CO1NBQy9CLENBQUMsQ0FBQztRQUVILG1DQUFtQztRQUNuQyxTQUFTLENBQUMsdUJBQXVCLENBQUM7WUFDaEMsU0FBUyxFQUFFLGdCQUFnQjtZQUMzQixZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHO1NBQzVDLENBQUMsQ0FBQztRQUVILGtCQUFrQjtRQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUMzRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDO1lBQzdDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsVUFBVSxFQUFFLEdBQUc7WUFDZixXQUFXLEVBQUU7Z0JBQ1gsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixlQUFlLEVBQUUsU0FBUyxDQUFDLFNBQVM7YUFDckM7U0FDRixDQUFDLENBQUM7UUFFSCx1Q0FBdUM7UUFDdkMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLGNBQWM7UUFDZCxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUNsRCxXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsMkJBQTJCLEVBQUU7Z0JBQzNCLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7YUFDaEQ7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRSw0QkFBNEI7UUFDNUIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFaEQsOEJBQThCO1FBQzlCLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRWxELG1DQUFtQztRQUNuQyxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztRQUVoRCxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN6QyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUc7WUFDZCxXQUFXLEVBQUUscUNBQXFDO1lBQ2xELFVBQVUsRUFBRSxpQkFBaUI7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxTQUFTO1lBQzFCLFdBQVcsRUFBRSw4QkFBOEI7WUFDM0MsVUFBVSxFQUFFLGVBQWU7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsVUFBVSxDQUFDLFlBQVk7WUFDOUIsV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxVQUFVLEVBQUUsZ0JBQWdCO1NBQzdCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTFGRCwwQ0EwRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN5bmNMYW1iZGFTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gRHluYW1vREIgdGFibGUgZm9yIHN5bmMgZGF0YVxyXG4gICAgY29uc3Qgc3luY1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdTeW5jVGFibGUnLCB7XHJcbiAgICAgIHBhcnRpdGlvbktleToge1xyXG4gICAgICAgIG5hbWU6ICd1c2VySWQnLFxyXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HXHJcbiAgICAgIH0sXHJcbiAgICAgIHNvcnRLZXk6IHtcclxuICAgICAgICBuYW1lOiAnc2VydmVyVGltZXN0YW1wJyxcclxuICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLk5VTUJFUlxyXG4gICAgICB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICAgIHBvaW50SW5UaW1lUmVjb3Zlcnk6IHRydWUsXHJcbiAgICAgIHRhYmxlTmFtZTogJ1NocmFtU2V0dVN5bmNEYXRhJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIEdTSSBmb3IgcXVlcnlpbmcgYnkgY2hhbmdlSWRcclxuICAgIHN5bmNUYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleCh7XHJcbiAgICAgIGluZGV4TmFtZTogJ2NoYW5nZUlkLWluZGV4JyxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7XHJcbiAgICAgICAgbmFtZTogJ2NoYW5nZUlkJyxcclxuICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklOR1xyXG4gICAgICB9LFxyXG4gICAgICBwcm9qZWN0aW9uVHlwZTogZHluYW1vZGIuUHJvamVjdGlvblR5cGUuQUxMXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb25cclxuICAgIGNvbnN0IHN5bmNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTeW5jRnVuY3Rpb24nLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnc3luYy1oYW5kbGVyLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS1zeW5jJyksXHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIFJFR0lPTjogdGhpcy5yZWdpb24sXHJcbiAgICAgICAgU1lOQ19UQUJMRV9OQU1FOiBzeW5jVGFibGUudGFibGVOYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdyYW50IExhbWJkYSBwZXJtaXNzaW9ucyB0byBEeW5hbW9EQlxyXG4gICAgc3luY1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShzeW5jTGFtYmRhKTtcclxuXHJcbiAgICAvLyBBUEkgR2F0ZXdheVxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnU3luY0FQSScsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6ICdTaHJhbS1TZXR1IERlbHRhIFN5bmMgQVBJJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZm9yIGRlbHRhIHN5bmNocm9uaXphdGlvbicsXHJcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xyXG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxyXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxyXG4gICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN5bmNJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHN5bmNMYW1iZGEpO1xyXG5cclxuICAgIC8vIFBPU1QgL3N5bmMgLSBQdXNoIGNoYW5nZXNcclxuICAgIGNvbnN0IHN5bmNSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdzeW5jJyk7XHJcbiAgICBzeW5jUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgc3luY0ludGVncmF0aW9uKTtcclxuXHJcbiAgICAvLyBHRVQgL2NoYW5nZXMgLSBQdWxsIGNoYW5nZXNcclxuICAgIGNvbnN0IGNoYW5nZXNSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdjaGFuZ2VzJyk7XHJcbiAgICBjaGFuZ2VzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBzeW5jSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIC8vIEdFVCAvc3RhdHMgLSBHZXQgc3luYyBzdGF0aXN0aWNzXHJcbiAgICBjb25zdCBzdGF0c1Jlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3N0YXRzJyk7XHJcbiAgICBzdGF0c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgc3luY0ludGVncmF0aW9uKTtcclxuXHJcbiAgICAvLyBPdXRwdXRzXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3luY0FQSUVuZHBvaW50Jywge1xyXG4gICAgICB2YWx1ZTogYXBpLnVybCxcclxuICAgICAgZGVzY3JpcHRpb246ICdEZWx0YSBTeW5jIEFQSSBHYXRld2F5IGVuZHBvaW50IFVSTCcsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTeW5jQVBJRW5kcG9pbnQnXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3luY1RhYmxlTmFtZScsIHtcclxuICAgICAgdmFsdWU6IHN5bmNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRHluYW1vREIgdGFibGUgZm9yIHN5bmMgZGF0YScsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTeW5jVGFibGVOYW1lJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1N5bmNMYW1iZGFOYW1lJywge1xyXG4gICAgICB2YWx1ZTogc3luY0xhbWJkYS5mdW5jdGlvbk5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3luYyBMYW1iZGEgZnVuY3Rpb24gbmFtZScsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdTeW5jTGFtYmRhTmFtZSdcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=