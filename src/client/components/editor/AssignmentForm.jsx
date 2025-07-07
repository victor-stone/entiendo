import { useState } from "react";
import { Glyph, AudioPlayer } from "../ui";
import { useAssignmentFulfillStore, useUserStore } from "../../stores";
import { Card } from "../layout";

const ecss = "border rounded px-2 py-1 w-full dark:text-primary-900";

const S = ({ children }) => (
  <span className={ecss + " bg-secondary-100"}>{children}</span>
);
const E = (props) => <input type="text" className={ecss} {...props} />;

export function AssignmentForm({ idiom, show, onClose }) {
  if (!show || !idiom || !Object.hasOwn(idiom,'assigned')) return null;

  const [transcription, setTranscription] = useState(
    idiom.assigned.transcription || ''
  );
  const [conjugatedSnippet, setConjugatedSnippet] = useState(
    idiom.assigned.conjugatedSnippet || ''
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const { fulfill, error, loading } = useAssignmentFulfillStore();
  const { getToken, isAdmin } = useUserStore();

  async function onUpload() {
    const args = {
      idiomId: idiom.idiomId,
      transcription,
      conjugatedSnippet,
    };
    const result = await fulfill(args, selectedFile || "", getToken);
    setSelectedFile(null);
    onClose(result);
  }

  function onFileChange(e) {
    setSelectedFile(e.target.files[0] || null);
  }

  function handleUpload() {
    postFile(selectedFile);
  }

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
          {idiom.assigned.audio?.publicUrl && (
            <Card.Field>
              <AudioPlayer isAdmin url={idiom.assigned.audio.url} />
            </Card.Field>
          )}
          <Card.Field title="Audio File">
            <input
              className={ecss}
              type="file"
              accept="audio/*"
              onChange={onFileChange}
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

export function AssignmentAudio({ r }) {
  const hasAudio = r.assigned?.audio?.publicUrl;

  return <>{hasAudio && <Glyph name="SpeakerWaveIcon" />}</>;
}
