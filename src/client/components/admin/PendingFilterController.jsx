import React, { useState, useEffect } from 'react';

const PendingFilterController = ({ setFilterFn }) => {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pending) {
      setFilterFn(() => idiom => !idiom.assigned?.source);
    } else {
      setFilterFn(null);
    }
  }, [pending, setFilterFn]);

  return (
    <label className="block text-sm font-medium">
      Pending&nbsp;
      <input
        type="checkbox"
        checked={pending}
        onChange={() => setPending(p => !p)}
      />
    </label>
  );
};

export { PendingFilterController };