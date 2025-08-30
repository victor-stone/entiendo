import { useState } from "react";
import { Glyph, AudioPlayer } from "../ui";
import { useAssignmentFulfillStore, useUserStore } from "../../stores";
import { Card } from "../layout";
import debug from 'debug';

const debugAudio = debug('app:audio');

const ecss = "border rounded px-2 py-1 w-full dark:text-primary-900";

const S = ({ children }) => (
  <span className={ecss + " bg-secondary-100"}>{children}</span>
);
const E = (props) => <input type="text" className={ecss} {...props} />;

function pickRecordingMime() {
  const tryList = [
    "audio/mp4;codecs=mp4a.40.2", // AAC-LC in MP4 (preferred)
    "audio/mp4",                   // Generic MP4 container (M4A)
    "audio/webm;codecs=opus"      // Fallback for Chrome/Edge
  ];
  for (const t of tryList) {
    try {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    } catch (_) { /* ignore */ }
  }
  return undefined; // Final fallback: let the browser decide
}

function extForMime(mime) {
  if (!mime) return "webm";
  const m = String(mime).toLowerCase();
  if (m.startsWith("audio/mp4") || m.startsWith("audio/m4a")) return "m4a";
  if (m.startsWith("audio/webm")) return "webm";
  if (m.startsWith("audio/ogg")) return "ogg";
  if (m.startsWith("audio/mpeg")) return "mp3";
  if (m.startsWith("audio/wav")) return "wav";
  return "audio";
}

export function AssignmentAudio({ r }) {
  const hasAudio = r.assigned?.audio?.publicUrl;

  return <>{hasAudio && <Glyph name="SpeakerWaveIcon" />}</>;
}

export function AssignmentForm({ idiom, show, onClose }) {
  if (!show || !idiom || !Object.hasOwn(idiom,'assigned')) return null;

  const [transcription, setTranscription] = useState(
    idiom.assigned.transcription || ''
  );
  const [conjugatedSnippet, setConjugatedSnippet] = useState(
    idiom.assigned.conjugatedSnippet || ''
  );
  const [selectedFile, setSelectedFile]     = useState(null);
  const [isDragActive, setIsDragActive]     = useState(false);
  const [recording, setRecording]           = useState(false);
  const [mediaRecorder, setMediaRecorder]   = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recorderError, setRecorderError]   = useState("");

  const { fulfill, error, loading }         = useAssignmentFulfillStore();
  const { getToken, isAdmin }               = useUserStore();

  async function onUpload() {
    const args = {
      idiomId: idiom.idiomId,
      transcription,
      conjugatedSnippet,
      editor
    };
    const result = await fulfill(args, selectedFile || "", getToken);
    setSelectedFile(null);
    onClose(result);
  }

  function onFileChange(e) {
    setSelectedFile(e.target.files[0] || null);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      // Optionally, update the file input value (not always possible for security reasons)
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }

  async function startRecording() {
    setRecorderError("");
    try {
      const stream      = await navigator.mediaDevices.getUserMedia({ audio: true });
      let   localChunks = [];
      const mimeType    = pickRecordingMime();
      const mr          = mimeType ? new window.MediaRecorder(stream, { mimeType }) : new window.MediaRecorder(stream);
      setMediaRecorder(mr);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) localChunks.push(e.data);
      };
      mr.onstop = () => {
        // Prefer the recorder-reported type; if missing, use our chosen one; otherwise default to MP4
        const fallback  = mimeType || "audio/mp4";
        const finalMime = (mr.mimeType && mr.mimeType.trim()) ? mr.mimeType : fallback;
        const blob      = new Blob(localChunks, { type: finalMime });
        const ext       = extForMime(finalMime);
        const file      = new File([blob], `recording.${ext}`, { type: finalMime });
        
        debugAudio("Recorder picked:", mr.mimeType, "| used:", finalMime);
        setSelectedFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      setRecorderError("Microphone access denied or not available.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  }

  const editor = idiom.assigned.source || idiom.source;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <Card title="Edit Assignment">
        <Card.Body>
          <Card.Field>
            <S>{idiom.assigned?.sync}</S>
          </Card.Field>
          <Card.Field title="Idiom">
            <S>{idiom.text}</S>
          </Card.Field>
          <Card.Field title="Transcription">
            <E
              name="transcription"
              value={transcription || ""}
              onChange={(e) => setTranscription(e.target.value)}
            />
          </Card.Field>
          {(isAdmin || conjugatedSnippet) && (
            <Card.Field title="conjugatedSnippet">
              <E
                name="conjugatedSnippet"
                value={conjugatedSnippet || ""}
                onChange={(e) => setConjugatedSnippet(e.target.value)}
              />
            </Card.Field>
          )}
          {((selectedFile || idiom.assigned.audio?.publicUrl)) && (
            <Card.Field>
              <AudioPlayer
                isAdmin
                url={selectedFile ? URL.createObjectURL(selectedFile) : idiom.assigned.audio.url}
              />
            </Card.Field>
          )}
          <Card.Field title="Audio File">
            <div
              className={`border-2 border-dashed rounded p-4 mb-2 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white dark:bg-gray-800'}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => document.getElementById('audio-file-input')?.click()}
              tabIndex={0}
              role="button"
              aria-label="Drop audio file here or click to select"
            >
              {selectedFile ? (
                <span>{selectedFile.name}</span>
              ) : (
                <span>Drag & drop audio file here, click to select, or record below</span>
              )}
            </div>
            <div className="flex gap-2 items-center mb-2">
              <button
                type="button"
                className={`px-3 py-1 rounded ${recording ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={loading}
              >
                {recording ? 'Stop Recording' : 'Record Audio'}
              </button>
              {recording && <span className="text-red-600 animate-pulse">● Recording...</span>}
            </div>
            {recorderError && <div className="text-red-500 text-xs mb-2">{recorderError}</div>}
            <input
              id="audio-file-input"
              className={ecss + ' hidden'}
              type="file"
              accept="audio/*"
              onChange={onFileChange}
              tabIndex={-1}
            />
          </Card.Field>
          <Card.Field className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={onUpload}>
              Submit
            </button>
            <button className="px-4 py-2 rounded" onClick={onClose}>
              Cancel
            </button>
          </Card.Field>
        </Card.Body>
      </Card>
    </div>
  );
}

