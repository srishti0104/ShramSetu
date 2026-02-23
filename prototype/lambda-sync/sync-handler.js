/**
 * Delta Sync Lambda Handler
 * 
 * Handles delta sync operations for efficient data synchronization
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const SYNC_TABLE = process.env.SYNC_TABLE_NAME;

/**
 * Push changes from client to server
 */
async function pushChanges(event) {
  const body = JSON.parse(event.body);
  const { changes, userId, lastSync } = body;

  if (!changes || !Array.isArray(changes)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid changes array' })
    };
  }

  console.log(`📤 Pushing ${changes.length} changes for user ${userId}`);

  try {
    // Store each change in DynamoDB individually to avoid duplicate key issues
    const results = [];
    
    for (const change of changes) {
      try {
        await docClient.send(new PutCommand({
          TableName: SYNC_TABLE,
          Item: {
            userId: userId || 'anonymous',
            serverTimestamp: Date.now() + results.length, // Ensure unique timestamp
            changeId: change.id,
            type: change.type,
            operation: change.operation,
            data: change.data,
            clientTimestamp: change.timestamp,
            synced: true
          }
        }));
        results.push(change.id);
      } catch (itemError) {
        console.error('Failed to store change:', change.id, itemError);
        // Continue with other items
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        synced: results.length,
        serverTimestamp: Date.now()
      })
    };

  } catch (error) {
    console.error('❌ Push error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * Pull changes from server to client
 */
async function pullChanges(event) {
  const userId = event.queryStringParameters?.userId || 'anonymous';
  const since = parseInt(event.queryStringParameters?.since || '0');

  console.log(`📥 Pulling changes for user ${userId} since ${since}`);

  try {
    // Query changes since last sync
    const result = await docClient.send(new QueryCommand({
      TableName: SYNC_TABLE,
      KeyConditionExpression: 'userId = :userId AND serverTimestamp > :since',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':since': since
      },
      ScanIndexForward: true // Oldest first
    }));

    const changes = result.Items.map(item => ({
      type: item.type,
      operation: item.operation,
      data: item.data,
      timestamp: item.serverTimestamp
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        changes,
        serverTimestamp: Date.now()
      })
    };

  } catch (error) {
    console.error('❌ Pull error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * Get sync statistics
 */
async function getSyncStats(event) {
  const userId = event.queryStringParameters?.userId || 'anonymous';

  try {
    // Count total synced items
    const result = await docClient.send(new QueryCommand({
      TableName: SYNC_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      Select: 'COUNT'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        totalSynced: result.Count,
        serverTimestamp: Date.now()
      })
    };

  } catch (error) {
    console.error('❌ Stats error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const path = event.path || event.rawPath;
  const method = event.httpMethod || event.requestContext?.http?.method;

  try {
    // Route based on path and method
    if (path.includes('/sync') && method === 'POST') {
      return await pushChanges(event);
    } else if (path.includes('/changes') && method === 'GET') {
      return await pullChanges(event);
    } else if (path.includes('/stats') && method === 'GET') {
      return await getSyncStats(event);
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Not found'
        })
      };
    }

  } catch (error) {
    console.error('❌ Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
