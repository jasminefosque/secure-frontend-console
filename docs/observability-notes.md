# Observability Notes

## Overview

This document describes the observability strategy for the Secure Frontend Console. While this is a client-side only application, it demonstrates production-ready logging and observability practices that would integrate with enterprise monitoring systems.

## Observability Principles

### The Three Pillars

1. **Logs**: Structured event records with context
2. **Metrics**: Quantitative measurements (not implemented in this reference)
3. **Traces**: Distributed request tracking (not applicable without backend)

This implementation focuses on **structured logging** as the foundation for observability.

## Structured Logging

### Why Structured Logs?

Traditional unstructured logs:
```javascript
console.log('User saved data at ' + new Date());
```

Structured logs:
```javascript
logger.info('user_action', {
  action: 'save',
  timestamp: new Date().toISOString(),
  itemCount: 5,
});
```

**Benefits**:
- Machine-parseable
- Queryable by fields
- Consistent format
- Easy to aggregate
- Better for analysis

### Log Schema

All logs follow this schema:

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: 'INFO' | 'WARN' | 'ERROR';
  event: string;          // Event identifier
  [key: string]: unknown; // Additional context
}
```

### Example Log Entries

```json
{
  "timestamp": "2026-02-10T12:34:56.789Z",
  "level": "INFO",
  "event": "user_action",
  "action": "save",
  "itemCount": 5,
  "storageSize": 1024
}

{
  "timestamp": "2026-02-10T12:35:01.123Z",
  "level": "ERROR",
  "event": "validation_failed",
  "field": "email",
  "error": "Invalid email format",
  "attemptedValue": "not-an-email"
}

{
  "timestamp": "2026-02-10T12:35:15.456Z",
  "level": "INFO",
  "event": "export",
  "format": "csv",
  "rowCount": 42,
  "fileSize": 2048
}
```

## Logger Implementation

### Core Logger Utility

```typescript
// src/utils/logger.ts

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  info(event: string, context?: LogContext): void {
    const entry = this.createLogEntry('INFO', event, context);
    
    if (this.isDevelopment) {
      console.log(`[INFO] ${event}`, context);
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  warn(event: string, context?: LogContext): void {
    const entry = this.createLogEntry('WARN', event, context);
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${event}`, context);
    } else {
      console.warn(JSON.stringify(entry));
    }
  }

  error(event: string, error: Error | string, context?: LogContext): void {
    const entry = this.createLogEntry('ERROR', event, {
      ...context,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${event}`, error, context);
    } else {
      console.error(JSON.stringify(entry));
    }
  }

  private createLogEntry(
    level: string,
    event: string,
    context?: LogContext
  ): LogContext {
    return {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...context,
    };
  }
}

export const logger = new Logger();
```

## What to Log

### User Actions

Log significant user interactions for understanding usage patterns:

```typescript
// User saves data
logger.info('user_action', {
  action: 'save',
  itemCount: items.length,
});

// User exports data
logger.info('user_action', {
  action: 'export',
  format: 'csv',
  rowCount: rows.length,
});

// User deletes data
logger.info('user_action', {
  action: 'delete',
  itemId: item.id,
});

// User applies filter/calculation
logger.info('user_action', {
  action: 'calculate',
  inputCount: inputs.length,
  resultCount: results.length,
});
```

### Validation Events

Log validation failures for security monitoring:

```typescript
// Validation failure
logger.warn('validation_failed', {
  schema: 'userInput',
  field: error.path.join('.'),
  error: error.message,
});

// Successful validation (only in debug mode)
if (import.meta.env.DEV) {
  logger.info('validation_success', {
    schema: 'userInput',
  });
}
```

### Error Conditions

Log all error conditions for debugging:

```typescript
// localStorage error
logger.error('storage_error', error, {
  operation: 'save',
  dataSize: serialized.length,
});

// State load error
logger.error('state_load_error', error, {
  source: 'localStorage',
});

// Component error boundary
logger.error('component_error', error, {
  component: componentName,
  props: sanitizeProps(props),
});
```

### Performance Events

Log performance-critical operations:

```typescript
// Large calculation
logger.info('calculation_complete', {
  operation: 'bulkUpdate',
  itemCount: items.length,
  duration: endTime - startTime,
});

// Export generation
logger.info('export_generated', {
  format: 'csv',
  rowCount: rows.length,
  fileSize: blob.size,
  duration: endTime - startTime,
});
```

## What NOT to Log

### Sensitive Data

Never log:
- ❌ User passwords (don't exist in this app)
- ❌ API keys or tokens (don't exist in this app)
- ❌ Personal Identifiable Information (PII)
- ❌ Full user inputs (log validation results instead)
- ❌ Complete state objects (may contain sensitive data)

### Example of Safe Logging

```typescript
// ❌ BAD: Logs full user input
logger.info('user_action', {
  action: 'save',
  data: formData, // May contain PII
});

// ✅ GOOD: Logs metadata only
logger.info('user_action', {
  action: 'save',
  itemCount: items.length,
  hasNotes: formData.notes !== undefined,
});
```

## Log Levels

### INFO
Use for normal operations that provide context:
- User actions
- State changes
- Successful operations
- Application lifecycle events

### WARN
Use for recoverable issues that need attention:
- Validation failures
- Deprecated feature usage
- Resource constraints (approaching localStorage quota)
- Fallback behaviors triggered

### ERROR
Use for failures that prevent operations:
- Unhandled exceptions
- Storage failures
- Data corruption
- Component errors

## Integration with Monitoring Systems

### Production Log Collection

In production, structured logs can be:

1. **Collected** via:
   - Browser console interception
   - Dedicated logging libraries (e.g., Winston, Pino)
   - Error reporting services (e.g., Sentry, LogRocket)

2. **Aggregated** in:
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - Datadog
   - New Relic
   - CloudWatch (AWS)

3. **Analyzed** for:
   - Error rates and patterns
   - User behavior trends
   - Performance bottlenecks
   - Security events

### Example Integration

```typescript
// src/utils/logger.ts (production enhancement)

class ProductionLogger extends Logger {
  constructor(private config: { endpoint?: string }) {
    super();
  }

  info(event: string, context?: LogContext): void {
    const entry = this.createLogEntry('INFO', event, context);
    
    // Send to monitoring service
    if (this.config.endpoint) {
      this.sendToMonitoring(entry);
    }
    
    // Still log to console
    console.log(JSON.stringify(entry));
  }

  private async sendToMonitoring(entry: LogContext): Promise<void> {
    try {
      await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to send log to monitoring', error);
    }
  }
}
```

## Alerting Strategy

### Metrics to Monitor

Based on structured logs, create alerts for:

1. **Error Rate**
   - Threshold: > 5% of requests
   - Action: Investigate and deploy fix

2. **Validation Failure Rate**
   - Threshold: Sudden spike (> 2x baseline)
   - Action: Check for malicious activity or UX issues

3. **Storage Errors**
   - Threshold: > 1% of save operations
   - Action: Check browser compatibility or data size

4. **User Activity Drop**
   - Threshold: < 50% of baseline
   - Action: Check for application errors or deployment issues

### Example Alert Queries

```
// Elasticsearch/Kibana
level:"ERROR" AND timestamp:[now-5m TO now]

// Splunk
index=frontend level=ERROR earliest=-5m

// Datadog
logs("level:ERROR timestamp:[now-5m TO now]")
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

Track these metrics derived from logs:

1. **User Actions per Session**
   - Query: Count of `user_action` events
   - Target: > 3 actions/session

2. **Validation Failure Rate**
   - Query: `validation_failed` / total validations
   - Target: < 5%

3. **Export Success Rate**
   - Query: Successful exports / total export attempts
   - Target: > 95%

4. **Average Export Duration**
   - Query: Avg `duration` from export events
   - Target: < 1000ms

5. **Storage Error Rate**
   - Query: `storage_error` / total saves
   - Target: < 1%

## Debugging with Logs

### Development Mode

In development, logs are formatted for readability:

```typescript
// Development log output
[INFO] user_action { action: 'save', itemCount: 5 }
[WARN] validation_failed { field: 'email', error: 'Invalid format' }
[ERROR] storage_error Error: QuotaExceededError { operation: 'save' }
```

### Production Mode

In production, logs are JSON for machine parsing:

```json
{"timestamp":"2026-02-10T12:34:56.789Z","level":"INFO","event":"user_action","action":"save","itemCount":5}
{"timestamp":"2026-02-10T12:35:01.123Z","level":"WARN","event":"validation_failed","field":"email","error":"Invalid format"}
{"timestamp":"2026-02-10T12:35:05.456Z","level":"ERROR","event":"storage_error","error":"QuotaExceededError","operation":"save"}
```

### Searching Logs

```bash
# Find all errors in last hour
grep '"level":"ERROR"' app.log | grep "$(date -u --date='1 hour ago' +%Y-%m-%dT%H)"

# Count validation failures by field
grep '"event":"validation_failed"' app.log | jq -r '.field' | sort | uniq -c

# Calculate average export duration
grep '"event":"export_generated"' app.log | jq '.duration' | awk '{sum+=$1; count++} END {print sum/count}'
```

## Privacy Considerations

### GDPR Compliance

If deploying in EU or handling EU users:

1. **Log Retention**: Define and enforce retention periods
2. **Right to Erasure**: Ability to delete user logs
3. **Minimization**: Only log necessary data
4. **Transparency**: Inform users about logging

### Log Sanitization

```typescript
// Sanitize potentially sensitive fields
function sanitizeForLog<T>(data: T): Partial<T> {
  const safe: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip sensitive fields
    if (['password', 'token', 'ssn', 'creditCard'].includes(key)) {
      continue;
    }
    
    // Truncate long strings
    if (typeof value === 'string' && value.length > 100) {
      safe[key] = value.substring(0, 100) + '...[truncated]';
    } else {
      safe[key] = value;
    }
  }
  
  return safe;
}
```

## Testing Observability

### Log Verification Tests

```typescript
describe('Logger', () => {
  let consoleLogSpy: vi.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log user actions with context', () => {
    logger.info('user_action', { action: 'save', itemCount: 5 });
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"user_action"')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"action":"save"')
    );
  });

  it('should not log sensitive data', () => {
    const sensitiveData = { password: 'secret123', email: 'user@example.com' };
    const sanitized = sanitizeForLog(sensitiveData);
    
    expect(sanitized).not.toHaveProperty('password');
    expect(sanitized).toHaveProperty('email');
  });
});
```

## Observability Roadmap

### Phase 1: Foundation (Current)
- ✅ Structured logging utility
- ✅ Log key user actions
- ✅ Error logging
- ✅ Development vs production formatting

### Phase 2: Enhancement (Future)
- ⬜ Client-side metrics (performance API)
- ⬜ User session tracking (anonymous)
- ⬜ Integration with monitoring service
- ⬜ Custom log aggregation dashboard

### Phase 3: Advanced (Future)
- ⬜ Real user monitoring (RUM)
- ⬜ Performance budgets and alerts
- ⬜ A/B test tracking
- ⬜ Funnel analysis

## Best Practices Summary

1. ✅ **Always use structured logs**: Machine-parseable JSON
2. ✅ **Log at boundaries**: User input, storage operations, errors
3. ✅ **Include context**: Timestamp, event type, relevant metadata
4. ✅ **Avoid sensitive data**: Never log PII, credentials, or full inputs
5. ✅ **Use consistent event names**: Standardize across application
6. ✅ **Test logging**: Verify logs in unit tests
7. ✅ **Plan for scale**: Design for aggregation and analysis
8. ✅ **Monitor in production**: Set up alerts for critical metrics

## Additional Resources

- [Structured Logging Best Practices](https://www.datadoghq.com/blog/log-management-best-practices/)
- [The Twelve-Factor App: Logs](https://12factor.net/logs)
- [OpenTelemetry](https://opentelemetry.io/)
- [ELK Stack Documentation](https://www.elastic.co/guide/index.html)

## Conclusion

While this reference implementation runs entirely in the browser, it demonstrates production-ready observability practices. The structured logging foundation enables:

- **Debugging**: Quick identification of issues
- **Monitoring**: Real-time visibility into application health
- **Analytics**: Understanding user behavior and patterns
- **Security**: Detection of malicious activity

By treating logs as a first-class concern from the start, you build a foundation for operational excellence.
