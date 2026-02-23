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
exports.LocationStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const location = __importStar(require("aws-cdk-lib/aws-location"));
class LocationStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create Place Index for searching locations
        const placeIndex = new location.CfnPlaceIndex(this, 'ShramSetuPlaceIndex', {
            indexName: 'ShramSetuPlaceIndex',
            dataSource: 'Esri', // Using Esri as data provider
            description: 'Place index for Shram Setu job search',
            pricingPlan: 'RequestBasedUsage'
        });
        // Create Route Calculator for distance calculations
        const routeCalculator = new location.CfnRouteCalculator(this, 'ShramSetuRouteCalculator', {
            calculatorName: 'ShramSetuRouteCalculator',
            dataSource: 'Esri',
            description: 'Route calculator for Shram Setu job distance',
            pricingPlan: 'RequestBasedUsage'
        });
        // Outputs
        new cdk.CfnOutput(this, 'PlaceIndexName', {
            value: placeIndex.indexName,
            description: 'Place Index name for location search',
            exportName: 'ShramSetuPlaceIndexName'
        });
        new cdk.CfnOutput(this, 'RouteCalculatorName', {
            value: routeCalculator.calculatorName,
            description: 'Route Calculator name for distance calculation',
            exportName: 'ShramSetuRouteCalculatorName'
        });
    }
}
exports.LocationStack = LocationStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24tc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NhdGlvbi1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsbUVBQXFEO0FBR3JELE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBQzdDLE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDekUsU0FBUyxFQUFFLHFCQUFxQjtZQUNoQyxVQUFVLEVBQUUsTUFBTSxFQUFFLDhCQUE4QjtZQUNsRCxXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELFdBQVcsRUFBRSxtQkFBbUI7U0FDakMsQ0FBQyxDQUFDO1FBRUgsb0RBQW9EO1FBQ3BELE1BQU0sZUFBZSxHQUFHLElBQUksUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRTtZQUN4RixjQUFjLEVBQUUsMEJBQTBCO1lBQzFDLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLFdBQVcsRUFBRSw4Q0FBOEM7WUFDM0QsV0FBVyxFQUFFLG1CQUFtQjtTQUNqQyxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDM0IsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxVQUFVLEVBQUUseUJBQXlCO1NBQ3RDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLGVBQWUsQ0FBQyxjQUFjO1lBQ3JDLFdBQVcsRUFBRSxnREFBZ0Q7WUFDN0QsVUFBVSxFQUFFLDhCQUE4QjtTQUMzQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqQ0Qsc0NBaUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0ICogYXMgbG9jYXRpb24gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvY2F0aW9uJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9jYXRpb25TdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIFBsYWNlIEluZGV4IGZvciBzZWFyY2hpbmcgbG9jYXRpb25zXHJcbiAgICBjb25zdCBwbGFjZUluZGV4ID0gbmV3IGxvY2F0aW9uLkNmblBsYWNlSW5kZXgodGhpcywgJ1NocmFtU2V0dVBsYWNlSW5kZXgnLCB7XHJcbiAgICAgIGluZGV4TmFtZTogJ1NocmFtU2V0dVBsYWNlSW5kZXgnLFxyXG4gICAgICBkYXRhU291cmNlOiAnRXNyaScsIC8vIFVzaW5nIEVzcmkgYXMgZGF0YSBwcm92aWRlclxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1BsYWNlIGluZGV4IGZvciBTaHJhbSBTZXR1IGpvYiBzZWFyY2gnLFxyXG4gICAgICBwcmljaW5nUGxhbjogJ1JlcXVlc3RCYXNlZFVzYWdlJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIFJvdXRlIENhbGN1bGF0b3IgZm9yIGRpc3RhbmNlIGNhbGN1bGF0aW9uc1xyXG4gICAgY29uc3Qgcm91dGVDYWxjdWxhdG9yID0gbmV3IGxvY2F0aW9uLkNmblJvdXRlQ2FsY3VsYXRvcih0aGlzLCAnU2hyYW1TZXR1Um91dGVDYWxjdWxhdG9yJywge1xyXG4gICAgICBjYWxjdWxhdG9yTmFtZTogJ1NocmFtU2V0dVJvdXRlQ2FsY3VsYXRvcicsXHJcbiAgICAgIGRhdGFTb3VyY2U6ICdFc3JpJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdSb3V0ZSBjYWxjdWxhdG9yIGZvciBTaHJhbSBTZXR1IGpvYiBkaXN0YW5jZScsXHJcbiAgICAgIHByaWNpbmdQbGFuOiAnUmVxdWVzdEJhc2VkVXNhZ2UnXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPdXRwdXRzXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUGxhY2VJbmRleE5hbWUnLCB7XHJcbiAgICAgIHZhbHVlOiBwbGFjZUluZGV4LmluZGV4TmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246ICdQbGFjZSBJbmRleCBuYW1lIGZvciBsb2NhdGlvbiBzZWFyY2gnLFxyXG4gICAgICBleHBvcnROYW1lOiAnU2hyYW1TZXR1UGxhY2VJbmRleE5hbWUnXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUm91dGVDYWxjdWxhdG9yTmFtZScsIHtcclxuICAgICAgdmFsdWU6IHJvdXRlQ2FsY3VsYXRvci5jYWxjdWxhdG9yTmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246ICdSb3V0ZSBDYWxjdWxhdG9yIG5hbWUgZm9yIGRpc3RhbmNlIGNhbGN1bGF0aW9uJyxcclxuICAgICAgZXhwb3J0TmFtZTogJ1NocmFtU2V0dVJvdXRlQ2FsY3VsYXRvck5hbWUnXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19