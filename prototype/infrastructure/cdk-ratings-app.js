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
const ratings_lambda_stack_1 = require("./lib/ratings-lambda-stack");
const app = new cdk.App();
// Get environment configuration
const account = process.env.CDK_DEFAULT_ACCOUNT || '808840719701';
const region = process.env.CDK_DEFAULT_REGION || 'ap-south-1';
const env = {
    account,
    region,
};
// Deploy Ratings Stack
new ratings_lambda_stack_1.RatingsLambdaStack(app, 'ShramSetuRatingsStack', {
    env,
    description: 'Shram Setu Ratings System with DynamoDB and API Gateway',
    tags: {
        Project: 'ShramSetu',
        Component: 'Ratings',
        Environment: 'Production',
    },
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXJhdGluZ3MtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXJhdGluZ3MtYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUFxQztBQUNyQyxpREFBbUM7QUFDbkMscUVBQWdFO0FBRWhFLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLGdDQUFnQztBQUNoQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixJQUFJLGNBQWMsQ0FBQztBQUNsRSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLFlBQVksQ0FBQztBQUU5RCxNQUFNLEdBQUcsR0FBRztJQUNWLE9BQU87SUFDUCxNQUFNO0NBQ1AsQ0FBQztBQUVGLHVCQUF1QjtBQUN2QixJQUFJLHlDQUFrQixDQUFDLEdBQUcsRUFBRSx1QkFBdUIsRUFBRTtJQUNuRCxHQUFHO0lBQ0gsV0FBVyxFQUFFLHlEQUF5RDtJQUN0RSxJQUFJLEVBQUU7UUFDSixPQUFPLEVBQUUsV0FBVztRQUNwQixTQUFTLEVBQUUsU0FBUztRQUNwQixXQUFXLEVBQUUsWUFBWTtLQUMxQjtDQUNGLENBQUMsQ0FBQztBQUVILEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcclxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBSYXRpbmdzTGFtYmRhU3RhY2sgfSBmcm9tICcuL2xpYi9yYXRpbmdzLWxhbWJkYS1zdGFjayc7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xyXG5cclxuLy8gR2V0IGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb25cclxuY29uc3QgYWNjb3VudCA9IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQgfHwgJzgwODg0MDcxOTcwMSc7XHJcbmNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAnYXAtc291dGgtMSc7XHJcblxyXG5jb25zdCBlbnYgPSB7XHJcbiAgYWNjb3VudCxcclxuICByZWdpb24sXHJcbn07XHJcblxyXG4vLyBEZXBsb3kgUmF0aW5ncyBTdGFja1xyXG5uZXcgUmF0aW5nc0xhbWJkYVN0YWNrKGFwcCwgJ1NocmFtU2V0dVJhdGluZ3NTdGFjaycsIHtcclxuICBlbnYsXHJcbiAgZGVzY3JpcHRpb246ICdTaHJhbSBTZXR1IFJhdGluZ3MgU3lzdGVtIHdpdGggRHluYW1vREIgYW5kIEFQSSBHYXRld2F5JyxcclxuICB0YWdzOiB7XHJcbiAgICBQcm9qZWN0OiAnU2hyYW1TZXR1JyxcclxuICAgIENvbXBvbmVudDogJ1JhdGluZ3MnLFxyXG4gICAgRW52aXJvbm1lbnQ6ICdQcm9kdWN0aW9uJyxcclxuICB9LFxyXG59KTtcclxuXHJcbmFwcC5zeW50aCgpOyJdfQ==