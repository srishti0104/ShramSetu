import * as cdk from 'aws-cdk-lib';
import * as location from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';

export class LocationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
