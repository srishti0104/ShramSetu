#!/usr/bin/env node
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
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const grievance_lambda_stack_1 = require("./lib/grievance-lambda-stack");
const app = new cdk.App();
new grievance_lambda_stack_1.GrievanceLambdaStack(app, 'ShramSetuGrievanceStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
    },
    description: 'Shram Setu Voice-based Grievance System with DynamoDB and AWS Transcribe',
    tags: {
        Project: 'ShramSetu',
        Environment: 'Production',
        Component: 'Grievance',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWdyaWV2YW5jZS1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjZGstZ3JpZXZhbmNlLWFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLHlFQUFvRTtBQUVwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixJQUFJLDZDQUFvQixDQUFDLEdBQUcsRUFBRSx5QkFBeUIsRUFBRTtJQUN2RCxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksWUFBWTtLQUN2RDtJQUNELFdBQVcsRUFBRSwwRUFBMEU7SUFDdkYsSUFBSSxFQUFFO1FBQ0osT0FBTyxFQUFFLFdBQVc7UUFDcEIsV0FBVyxFQUFFLFlBQVk7UUFDekIsU0FBUyxFQUFFLFdBQVc7S0FDdkI7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXHJcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgR3JpZXZhbmNlTGFtYmRhU3RhY2sgfSBmcm9tICcuL2xpYi9ncmlldmFuY2UtbGFtYmRhLXN0YWNrJztcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcblxyXG5uZXcgR3JpZXZhbmNlTGFtYmRhU3RhY2soYXBwLCAnU2hyYW1TZXR1R3JpZXZhbmNlU3RhY2snLCB7XHJcbiAgZW52OiB7XHJcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxyXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfHwgJ2FwLXNvdXRoLTEnLFxyXG4gIH0sXHJcbiAgZGVzY3JpcHRpb246ICdTaHJhbSBTZXR1IFZvaWNlLWJhc2VkIEdyaWV2YW5jZSBTeXN0ZW0gd2l0aCBEeW5hbW9EQiBhbmQgQVdTIFRyYW5zY3JpYmUnLFxyXG4gIHRhZ3M6IHtcclxuICAgIFByb2plY3Q6ICdTaHJhbVNldHUnLFxyXG4gICAgRW52aXJvbm1lbnQ6ICdQcm9kdWN0aW9uJyxcclxuICAgIENvbXBvbmVudDogJ0dyaWV2YW5jZScsXHJcbiAgfSxcclxufSk7Il19