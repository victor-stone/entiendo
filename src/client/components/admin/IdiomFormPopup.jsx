// CSS class statics
const BUTTON_CLASS       = "px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none";
const OVERLAY_CLASS      = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";
const POPUP_CLASS        = "bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[700px] relative";
const CLOSE_BUTTON_CLASS = "absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white";

import { useState } from "react";
import IdiomForm from "./IdiomForm";
import debug from 'debug';
const debugIP = debug('app:idiom');

const IdiomFormPopup = ({context}) => {
  const [open, setOpen] = useState(false);

 const { onUpdateRow, getValueForFilter } = context;

  async function onSave(value) {
    onUpdateRow( obj, { 
      newRow: obj,
      action: 'addRow'
    } );
  }  

  function getSearchText() {
    const text = getValueForFilter('text');
    debugIP('using search text: %s', text);
    return text;
  }

  return (
    <>
      <button className={BUTTON_CLASS} onClick={() => setOpen(true)}>
        Create Idiom
      </button>
      {open && (
        <div className={OVERLAY_CLASS}>
          <div className={POPUP_CLASS}>
            <button className={CLOSE_BUTTON_CLASS} onClick={() => setOpen(false)} aria-label="Close">×</button>
            <IdiomForm onClose={() => setOpen(false)} wide text={getSearchText()} onSave={onSave} />
          </div>
        </div>
      )}
    </>
  );
};

export default IdiomFormPopup;
