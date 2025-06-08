// src/server/models/BaseModel.js
import { 
    PutItemCommand,
    GetItemCommand,
    DeleteItemCommand,
    ScanCommand,
    QueryCommand,
  } from '@aws-sdk/client-dynamodb';
  import { getDynamoDBClient } from '../lib/aws/dynamodb.js';
  import { v4 as uuidv4 } from 'uuid';
  
  /**
   * Base Model class for DynamoDB operations
   * All model classes should extend this base class
   */
  export default class BaseModel {
    constructor(tableName, idField = null) {
      this.tableName = tableName;
      this.idField = idField;
      this.client = getDynamoDBClient();
    }
  
    /**
     * Get the ID key name for the current entity
     * @param {String} idField - Optional override for the ID field
     * @returns {String} - The ID key name
     */
    getIdKey(idField = null) {
      const entityType = this.tableName.slice(0, -1).toLowerCase();
      return idField || this.idField || `${entityType}Id`;
    }

    genIdKey() {
      return { [this.getIdKey()]: uuidv4() }
    }
  
    /**
     * Create a new item in the database
     * @param {Object} item - Item data to create
     * @param {String} idField - Name of the ID field (optional, defaults to entityType + 'Id')
     * @returns {Promise<Object>} - Created item
     */
    async create(item, idField = null) {
      const idKey = this.getIdKey(idField);
      
      // Generate a UUID if ID is not provided
      if (!item[idKey]) {
        item[idKey] = uuidv4();
      }
      
      // Convert JavaScript object to DynamoDB format
      const dynamoItem = this.convertToDynamoFormat(item);
      
      const params = {
        TableName: this.tableName,
        Item: dynamoItem
      };
      
      await this.client.send(new PutItemCommand(params));
      return item;
    }
  
    /**
     * Get an item by its ID
     * @param {String} id - Item ID
     * @param {String} idField - Name of the ID field (optional)
     * @returns {Promise<Object>} - Retrieved item
     */
    async getById(id, idField = null) {
      const idKey = this.getIdKey(idField);
      
      const params = {
        TableName: this.tableName,
        Key: {
          [idKey]: { S: id }
        }
      };
      
      const result = await this.client.send(new GetItemCommand(params));
      
      if (!result.Item) {
        return null;
      }
      
      return this.convertFromDynamoFormat(result.Item);
    }
  
    /**
     * Update an existing item
     * @param {String} id - Item ID
     * @param {Object} updates - Fields to update
     * @param {String} idField - Name of the ID field (optional)
     * @returns {Promise<Object>} - Updated item
     */
    async update(id, updates, idField = null) {
      const idKey = this.getIdKey(idField);
      
      // Get the existing item first
      const existingItem = await this.getById(id, idKey);
      
      if (!existingItem) {
        throw new Error(`Item with ${idKey} ${id} not found`);
      }
      
      // Merge existing data with updates
      const updatedItem = { ...existingItem, ...updates };
      
      // Convert to DynamoDB format
      const dynamoItem = this.convertToDynamoFormat(updatedItem);
      
      const params = {
        TableName: this.tableName,
        Item: dynamoItem
      };
      
      await this.client.send(new PutItemCommand(params));
      return updatedItem;
    }
  
    /**
     * Delete an item by ID
     * @param {String} id - Item ID
     * @param {String} idField - Name of the ID field (optional)
     * @returns {Promise<Boolean>} - Success status
     */
    async delete(id, idField = null) {
      const idKey = this.getIdKey(idField);
      
      const params = {
        TableName: this.tableName,
        Key: {
          [idKey]: { S: id }
        }
      };
      
      await this.client.send(new DeleteItemCommand(params));
      return true;
    }
  
    /**
     * Count total items in the table
     * @param {Object} filterExpression - Optional filter expression
     * @returns {Promise<Number>} - Count of items
     */
    async count(filterExpression = null) {
      const params = {
        TableName: this.tableName,
        Select: 'COUNT'
      };
      
      if (filterExpression) {
        params.FilterExpression = filterExpression.expression;
        params.ExpressionAttributeValues = filterExpression.values;
        
        if (filterExpression.names) {
          params.ExpressionAttributeNames = filterExpression.names;
        }
      }
      
      const result = await this.client.send(new ScanCommand(params));
      return result.Count;
    }
  
    /**
     * Query items with filter conditions
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Array>} - Array of matching items
     */
    async query(queryParams) {
      const params = {
        TableName: this.tableName,
        ...queryParams
      };
      
      const result = await this.client.send(new QueryCommand(params));
      
      return result.Items.map(item => this.convertFromDynamoFormat(item));
    }
  
    /**
     * Scan all items with optional filtering
     * @param {Object} filterExpression - Optional filter expression
     * @param {Number} limit - Maximum items to return
     * @returns {Promise<Array>} - Array of matching items
     */
    async findAll(filterExpression = null, limit = null) {
      const params = {
        TableName: this.tableName
      };
      
      if (filterExpression) {
        params.FilterExpression = filterExpression.expression;
        params.ExpressionAttributeValues = filterExpression.values;
        
        if (filterExpression.names) {
          params.ExpressionAttributeNames = filterExpression.names;
        }
      }
      
      if (limit) {
        throw 'findAll called with "limit" parameter'
      }
      
      const result = await this.client.send(new ScanCommand(params));
      
      return result.Items.map(item => this.convertFromDynamoFormat(item));
    }
  
    /**
     * Helper to convert JavaScript object to DynamoDB format
     * @param {Object} item - JavaScript object
     * @returns {Object} - DynamoDB formatted object
     */
    convertToDynamoFormat(item) {
      const dynamoItem = {};
      
      for (const key in item) {
        const value = item[key];
        
        if (value === undefined || value === null) {
          continue;
        }
        
        if (typeof value === 'string') {
          dynamoItem[key] = { S: value };
        } else if (typeof value === 'number') {
          dynamoItem[key] = { N: value.toString() };
        } else if (typeof value === 'boolean') {
          dynamoItem[key] = { BOOL: value };
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          
          if (typeof value[0] === 'string') {
            dynamoItem[key] = { SS: value };
          } else if (typeof value[0] === 'number') {
            dynamoItem[key] = { NS: value.map(n => n.toString()) };
          } else {
            dynamoItem[key] = { L: value.map(v => ({ S: JSON.stringify(v) })) };
          }
        } else if (typeof value === 'object') {
          dynamoItem[key] = { M: this.convertToDynamoFormat(value) };
        }
      }
      
      return dynamoItem;
    }
  
    /**
     * Helper to convert DynamoDB format to JavaScript object
     * @param {Object} dynamoItem - DynamoDB formatted object
     * @returns {Object} - JavaScript object
     */
    convertFromDynamoFormat(dynamoItem) {
      const item = {};
      
      for (const key in dynamoItem) {
        const attribute = dynamoItem[key];
        
        if (attribute.S) {
          item[key] = attribute.S;
        } else if (attribute.N) {
          item[key] = parseFloat(attribute.N);
        } else if (attribute.BOOL !== undefined) {
          item[key] = attribute.BOOL;
        } else if (attribute.SS) {
          item[key] = attribute.SS;
        } else if (attribute.NS) {
          item[key] = attribute.NS.map(n => parseFloat(n));
        } else if (attribute.L) {
          item[key] = attribute.L.map(v => {
            if (v.S) {
              try {
                return JSON.parse(v.S);
              } catch (e) {
                return v.S;
              }
            }
            return this.convertFromDynamoFormat(v);
          });
        } else if (attribute.M) {
          item[key] = this.convertFromDynamoFormat(attribute.M);
        }
      }
      
      return item;
    }
  
    /**
     * Get distinct values for a specific column/field
     * @param {String} columnName - The name of the column to get distinct values from
     * @param {String} tableName - Optional override for the table name
     * @returns {Promise<Array>} - Array of unique values, sorted alphabetically
     */
    async getDistinctValues(columnName, tableName = null) {
      // Check if the column name is a reserved word (simple check, you can expand this)
      const reservedWords = ['family', /* add more reserved words as needed */];
      let projectionExpression = columnName;
      let expressionAttributeNames = undefined;
    
      if (reservedWords.includes(columnName.toLowerCase())) {
        projectionExpression = `#${columnName}`;
        expressionAttributeNames = { [`#${columnName}`]: columnName };
      }
    
      const params = {
        TableName: tableName || this.tableName,
        ProjectionExpression: projectionExpression
      };
      if (expressionAttributeNames) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
    
      // Set for storing unique values
      const uniqueValues = new Set();
      let lastEvaluatedKey = null;
    
      // Use pagination to handle large datasets
      do {
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
    
        const result = await this.client.send(new ScanCommand(params));
    
        // Process this batch of results
        if (result.Items && result.Items.length > 0) {
          result.Items.forEach(item => {
            // Use the correct key if ExpressionAttributeNames was used
            const key = expressionAttributeNames ? `#${columnName}` : columnName;
            const attrKey = expressionAttributeNames ? Object.keys(expressionAttributeNames)[0] : columnName;
            const value = item[columnName] || item[attrKey];
            if (value) {
              const extracted = this.extractDynamoValue(value);
              if (extracted !== undefined && extracted !== null) {
                uniqueValues.add(extracted);
              }
            }
          });
        }
    
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);
    
      return Array.from(uniqueValues).sort();
    }
  
    /**
     * Helper to extract value from DynamoDB attribute based on its type
     * @param {Object} attribute - DynamoDB attribute
     * @returns {any} - Extracted JavaScript value
     */
    extractDynamoValue(attribute) {
      if (attribute.S) {
        return attribute.S;
      } else if (attribute.N) {
        return parseFloat(attribute.N);
      } else if (attribute.BOOL !== undefined) {
        return attribute.BOOL;
      } else if (attribute.SS) {
        return attribute.SS;
      } else if (attribute.NS) {
        return attribute.NS.map(n => parseFloat(n));
      } else if (attribute.L) {
        return attribute.L.map(v => this.extractDynamoValue(v));
      } else if (attribute.M) {
        const result = {};
        for (const key in attribute.M) {
          result[key] = this.extractDynamoValue(attribute.M[key]);
        }
        return result;
      }
      return null;
    }
  
    /**
     * Scans the table for items matching a filter and returns only their IDs 
     * Uses pagination to get ALL matching items without a limit
     * 
     * @param {Object} filterExpression - Filter expression to apply
     * @param {String} idField - Optional override for the ID field
     * @returns {Promise<Array<String>>} - Array of matching item IDs
     */
    async findAllIds(filterExpression = null) {
      const idKey = this.getIdKey();
      
      // Only project the ID field to minimize data transfer
      const params = {
        TableName: this.tableName,
        ProjectionExpression: idKey
      };
      
      if (filterExpression) {
        params.FilterExpression = filterExpression.expression;
        params.ExpressionAttributeValues = filterExpression.values;
        
        if (filterExpression.names) {
          params.ExpressionAttributeNames = filterExpression.names;
        }
      }
      
      const ids = [];
      let lastEvaluatedKey = null;
      
      // Use pagination to handle large datasets and get ALL results
      do {
        // Add the ExclusiveStartKey if we have a lastEvaluatedKey
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
        
        const result = await this.client.send(new ScanCommand(params));
        
        // Extract IDs from this batch
        if (result.Items && result.Items.length > 0) {
          result.Items.forEach(item => {
            if (item[idKey] && item[idKey].S) {
              ids.push(item[idKey].S);
            }
          });
        }
        
        // Update lastEvaluatedKey for pagination
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);
      
      return ids;
    }
  }