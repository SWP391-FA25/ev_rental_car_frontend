import { useEffect, useState } from 'react';
import { endpoints } from '../lib/endpoints';
import { useApi } from '../hooks/useApi';

export default function Health() {
  const { get, loading, error } = useApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    get(endpoints.health(''))
      .then((res) => { if (res?.success) setData(res.data); });
  }, [get]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Health check</h2>
      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error.message}</div>}
      {data && <pre className="bg-light p-3 rounded">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
