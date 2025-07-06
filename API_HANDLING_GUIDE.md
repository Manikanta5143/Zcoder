# API Handling Guide for Multiple Calls

This guide explains how to safely make multiple API calls in your application without encountering errors.

## Overview

The API handling system provides several features to prevent errors when making multiple API calls:

1. **Caching** - Prevents duplicate requests
2. **Request Deduplication** - Ensures only one request per URL at a time
3. **Retry Logic** - Automatically retries failed requests
4. **Request Cancellation** - Cancels ongoing requests when new ones are made
5. **Error Handling** - Comprehensive error handling with user-friendly messages
6. **CORS Handling** - Automatically handles cross-origin request issues

## Files Created/Modified

### New Files:
- `src/utils/apiUtils.js` - Core API utilities with CORS handling
- `src/hooks/useQuestionsApi.js` - Custom hook for questions API
- `src/hooks/useProblemStatementApi.js` - Custom hook for problem statement API
- `API_HANDLING_GUIDE.md` - This guide

### Modified Files:
- `src/pages/PracticePage/Questions.jsx` - Updated to use new API handling
- `src/pages/PracticePage/Questions.css` - Added styles for new UI elements
- `src/pages/PracticePage/ProblemStatement.jsx` - Updated to use new API handling
- `src/pages/PracticePage/ProblemStatement.module.css` - Added styles for new UI elements

## How It Works

### 1. Caching System
```javascript
// API responses are cached for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// If the same URL is requested within 5 minutes, 
// the cached response is returned instead of making a new request
```

### 2. Request Deduplication
```javascript
// If multiple components request the same URL simultaneously,
// only one request is made and all components receive the same response
const pendingRequests = new Map();
```

### 3. Retry Logic
```javascript
// Failed requests are automatically retried up to 3 times
// with exponential backoff (2s, 4s, 6s delays)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
```

### 4. Request Cancellation
```javascript
// When a new request is made, any ongoing request is cancelled
// This prevents race conditions and unnecessary network traffic
abortControllerRef.current.abort();
```

### 5. CORS Handling
```javascript
// Minimal headers for external APIs to avoid CORS issues
const headers = {
  'Accept': 'application/json',
};

// Only add Content-Type for non-GET requests
if (options.method && options.method.toUpperCase() !== 'GET') {
  headers['Content-Type'] = 'application/json';
}
```

## Usage Examples

### Basic Usage with Custom Hook

#### Questions Component
```javascript
import { useQuestionsApi } from '../../hooks/useQuestionsApi';

const MyComponent = () => {
  const {
    problems,
    loading,
    error,
    retryCount,
    maxRetries,
    fetchProblems,
    refreshData,
    retry
  } = useQuestionsApi();

  // The hook handles everything automatically
  // - Initial data fetching
  // - Error handling
  // - Retry logic
  // - Request cancellation

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {problems.map(problem => (
        <div key={problem.id}>{problem.title}</div>
      ))}
    </div>
  );
};
```

#### Problem Statement Component
```javascript
import { useProblemStatementApi } from '../../hooks/useProblemStatementApi';

const ProblemStatement = () => {
  const { titleSlug } = useParams();
  
  const {
    problem,
    loading,
    error,
    retryCount,
    maxRetries,
    fetchProblemStatement,
    refreshData,
    retry
  } = useProblemStatementApi(titleSlug);

  return (
    <div>
      {loading && <div>Loading problem...</div>}
      {error && <div>Error: {error}</div>}
      {problem && <div>{problem.questionTitle}</div>}
    </div>
  );
};
```

### Using the API Utilities Directly

```javascript
import { fetchWithRetry, fetchExternalApi, createApiClient } from '../utils/apiUtils';

// For internal APIs (with full headers)
const data = await fetchWithRetry('https://api.example.com/data');

// For external APIs (CORS-friendly, minimal headers)
const externalData = await fetchExternalApi('https://external-api.com/data');

// Create an API client
const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  maxRetries: 3,
  retryDelay: 2000
});

// Use the client
const users = await apiClient.get('/users');
const newUser = await apiClient.post('/users', { name: 'John' });
```

### Manual Cache Management

```javascript
import { clearApiCache, clearCacheEntry, getCacheStats } from '../utils/apiUtils';

// Clear all cache
clearApiCache();

// Clear specific URL
clearCacheEntry('https://api.example.com/users');

// Get cache statistics
const stats = getCacheStats();
console.log(stats); // { size: 5, pendingRequests: 2, cacheKeys: [...] }
```

## Error Handling

The system handles various types of errors:

- **429 (Too Many Requests)** - Rate limiting
- **503 (Service Unavailable)** - Server maintenance
- **404 (Not Found)** - Resource not found
- **5xx Errors** - Server errors
- **Network Errors** - Connection issues
- **Abort Errors** - Request cancellation
- **CORS Errors** - Cross-origin request issues (automatically handled)

## Configuration Options

### Cache Duration
```javascript
// Modify in apiUtils.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Retry Settings
```javascript
// Modify in apiUtils.js or pass to functions
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
```

### API Client Configuration
```javascript
const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  maxRetries: 5,
  retryDelay: 1000,
  cacheDuration: 10 * 60 * 1000 // 10 minutes
});
```

## Best Practices

1. **Use the Custom Hook** - For components that need API data, use the appropriate custom hook
2. **Handle Loading States** - Always show loading indicators during API calls
3. **Provide Retry Options** - Give users the ability to retry failed requests
4. **Clear Cache When Needed** - Clear cache when data becomes stale
5. **Monitor Cache Size** - Use `getCacheStats()` to monitor cache usage

## Troubleshooting

### Common Issues:

1. **Still getting rate limit errors**
   - Increase retry delay
   - Reduce request frequency
   - Use caching more aggressively

2. **Cache not working**
   - Check if cache duration is appropriate
   - Verify cache keys are consistent
   - Clear cache if needed

3. **Requests not being cancelled**
   - Ensure AbortController is properly set up
   - Check if signal is passed to fetch calls

4. **Multiple requests for same data**
   - Verify request deduplication is working
   - Check if cache is being bypassed

5. **CORS errors**
   - Use `fetchExternalApi` for external APIs
   - Ensure minimal headers are sent
   - Check if the API supports CORS

## Performance Benefits

- **Reduced Network Traffic** - Caching prevents duplicate requests
- **Faster Response Times** - Cached responses are instant
- **Better User Experience** - Loading states and error handling
- **Resource Efficiency** - Request cancellation prevents unnecessary work
- **CORS Compliance** - Automatic handling of cross-origin requests

## Future Enhancements

Potential improvements to consider:

1. **Persistent Cache** - Store cache in localStorage
2. **Background Refresh** - Refresh cache in background
3. **Request Queuing** - Queue requests when rate limited
4. **Metrics Collection** - Track API performance
5. **Offline Support** - Handle offline scenarios 