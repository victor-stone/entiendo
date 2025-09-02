import { useState, useRef } from "react";
import { AudioPlayer } from "../ui";
import { Card } from "../layout";
import debug from "debug";

const debugAudio = debug('app:audio');

function pickRecordingMime() {
	const tryList = [
		"audio/mp4;codecs=mp4a.40.2",
		"audio/mp4",
		"audio/webm;codecs=opus"
	];
	for (const t of tryList) {
		try {
			if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
				return t;
			}
		} catch (_) { /* ignore */ }
	}
	return undefined;
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

export default function AudioUploader({ selectedFile, onChange, existingUrl, isAdmin, loading }) {
	const [isDragActive, setIsDragActive] = useState(false);
	const [recording, setRecording] = useState(false);
	const mediaRecorderRef = useRef(null);
	const [recorderError, setRecorderError] = useState("");

	function onFileChange(e) {
		onChange(e.target.files[0] || null);
	}

	function onDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
		const file = e.dataTransfer.files && e.dataTransfer.files[0];
		if (file) onChange(file);
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
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			let localChunks = [];
			const mimeType = pickRecordingMime();
			const mr = mimeType ? new window.MediaRecorder(stream, { mimeType }) : new window.MediaRecorder(stream);
			mediaRecorderRef.current = mr;
			mr.ondataavailable = (e) => {
				if (e.data.size > 0) localChunks.push(e.data);
			};
			mr.onstop = () => {
				const fallback = mimeType || "audio/mp4";
				const finalMime = (mr.mimeType && mr.mimeType.trim()) ? mr.mimeType : fallback;
				const blob = new Blob(localChunks, { type: finalMime });
				const ext = extForMime(finalMime);
				const file = new File([blob], `recording.${ext}`, { type: finalMime });

				debugAudio("Recorder picked:", mr.mimeType, "| used:", finalMime);
				onChange(file);
				stream.getTracks().forEach((track) => track.stop());
			};
			mr.start();
			setRecording(true);
		} catch (err) {
			setRecorderError("Microphone access denied or not available.");
		}
	}

	function stopRecording() {
		const mr = mediaRecorderRef.current;
		if (mr && recording) {
			mr.stop();
			setRecording(false);
		}
	}

	const displayUrl = selectedFile ? URL.createObjectURL(selectedFile) : existingUrl;

	return (
		<>
			{displayUrl && (
				<Card.Field>
					<AudioPlayer isAdmin={isAdmin} url={displayUrl} />
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
					className={'hidden'}
					type="file"
					accept="audio/*"
					onChange={onFileChange}
					tabIndex={-1}
				/>
			</Card.Field>
		</>
	);
}
