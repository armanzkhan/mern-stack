'use client';

import { useState } from 'react';
import axios from 'axios';
import { getBackendUrl } from '@/lib/getBackendUrl';

export default function DebugLoginPage() {
  const [email, setEmail] = useState('companyadmin@samplecompany.com');
  const [password, setPassword] = useState('companyadmin123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const apiUrl = getBackendUrl();
      console.log('Testing login with:', { apiUrl, email });

      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });

      setResult({
        success: true,
        status: response.status,
        data: response.data
      });
    } catch (err: any) {
      const errorData = {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        responseHeaders: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      };
      setError(errorData);
      console.error('Full error:', errorData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Login Debug Tool</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
        <div className="mb-4">
          <label className="block mb-2">Backend URL:</label>
          <code className="bg-gray-100 dark:bg-gray-700 p-2 rounded block">
            {getBackendUrl()}
          </code>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </div>

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-bold mb-2 text-green-800 dark:text-green-200">✅ Success</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 text-red-800 dark:text-red-200">❌ Error</h2>
          <div className="mb-4">
            <p><strong>Status:</strong> {error.status} {error.statusText}</p>
            <p><strong>Message:</strong> {error.message}</p>
            <p><strong>Code:</strong> {error.code}</p>
          </div>
          <h3 className="font-bold mb-2">Response Data:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(error.responseData, null, 2)}
          </pre>
          <h3 className="font-bold mb-2 mt-4">Full Error Object:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

