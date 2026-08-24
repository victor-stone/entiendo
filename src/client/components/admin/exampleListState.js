export function resolveAdminExampleList({
  data,
  error,
  expectedIdiomId,
  loading,
  responseIdiomId,
}) {
  if (responseIdiomId !== expectedIdiomId) {
    return { status: 'loading', examples: [] };
  }

  if (error) {
    return { status: 'error', error, examples: [] };
  }

  if (loading || data === null) {
    return { status: 'loading', examples: [] };
  }

  if (!data || !Array.isArray(data.examples)) {
    return {
      status: 'error',
      error: 'The admin examples response is invalid',
      examples: [],
    };
  }

  if (data.examples.length === 0) {
    return { status: 'empty', examples: [] };
  }

  return { status: 'ready', examples: data.examples };
}
