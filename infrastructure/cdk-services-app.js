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
const cdk = __importStar(require("aws-cdk-lib"));
const s3_stack_1 = require("./lib/s3-stack");
const location_stack_1 = require("./lib/location-stack");
const app = new cdk.App();
// Deploy S3 bucket for file storage
new s3_stack_1.S3Stack(app, 'ShramSetuS3Stack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'ap-south-1'
    },
    description: 'S3 bucket for Shram Setu file uploads (audio, images, documents)'
});
// Deploy Location Service for geospatial features
new location_stack_1.LocationStack(app, 'ShramSetuLocationStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'ap-south-1'
    },
    description: 'Amazon Location Service for Shram Setu job search'
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXNlcnZpY2VzLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNkay1zZXJ2aWNlcy1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBQ25DLDZDQUF5QztBQUN6Qyx5REFBcUQ7QUFFckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsb0NBQW9DO0FBQ3BDLElBQUksa0JBQU8sQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUU7SUFDbkMsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxZQUFZO0tBQ3JCO0lBQ0QsV0FBVyxFQUFFLGtFQUFrRTtDQUNoRixDQUFDLENBQUM7QUFFSCxrREFBa0Q7QUFDbEQsSUFBSSw4QkFBYSxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsRUFBRTtJQUMvQyxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLFlBQVk7S0FDckI7SUFDRCxXQUFXLEVBQUUsbURBQW1EO0NBQ2pFLENBQUMsQ0FBQztBQUVILEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgUzNTdGFjayB9IGZyb20gJy4vbGliL3MzLXN0YWNrJztcclxuaW1wb3J0IHsgTG9jYXRpb25TdGFjayB9IGZyb20gJy4vbGliL2xvY2F0aW9uLXN0YWNrJztcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XHJcblxyXG4vLyBEZXBsb3kgUzMgYnVja2V0IGZvciBmaWxlIHN0b3JhZ2VcclxubmV3IFMzU3RhY2soYXBwLCAnU2hyYW1TZXR1UzNTdGFjaycsIHtcclxuICBlbnY6IHtcclxuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXHJcbiAgICByZWdpb246ICdhcC1zb3V0aC0xJ1xyXG4gIH0sXHJcbiAgZGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIFNocmFtIFNldHUgZmlsZSB1cGxvYWRzIChhdWRpbywgaW1hZ2VzLCBkb2N1bWVudHMpJ1xyXG59KTtcclxuXHJcbi8vIERlcGxveSBMb2NhdGlvbiBTZXJ2aWNlIGZvciBnZW9zcGF0aWFsIGZlYXR1cmVzXHJcbm5ldyBMb2NhdGlvblN0YWNrKGFwcCwgJ1NocmFtU2V0dUxvY2F0aW9uU3RhY2snLCB7XHJcbiAgZW52OiB7XHJcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxyXG4gICAgcmVnaW9uOiAnYXAtc291dGgtMSdcclxuICB9LFxyXG4gIGRlc2NyaXB0aW9uOiAnQW1hem9uIExvY2F0aW9uIFNlcnZpY2UgZm9yIFNocmFtIFNldHUgam9iIHNlYXJjaCdcclxufSk7XHJcblxyXG5hcHAuc3ludGgoKTtcclxuIl19