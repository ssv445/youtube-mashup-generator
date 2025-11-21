"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Segment } from "@/lib/types";
import { getYouTubeId, getYouTubeThumbnail, isValidYouTubeUrl } from "@/lib/youtube";
import { validateSegment } from "@/lib/validation";
import SegmentCard from "./SegmentCard";

interface SegmentListProps {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  currentSegmentIndex: number;
  onSegmentClick: (index: number) => void;
}

function SortableSegmentCard({
  segment,
  index,
  isActive,
  onUpdate,
  onDelete,
  onClick,
  onSetTime,
}: {
  segment: Segment;
  index: number;
  isActive: boolean;
  onUpdate: (segment: Segment) => void;
  onDelete: () => void;
  onClick: () => void;
  onSetTime: (type: "start" | "end", time: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SegmentCard
        segment={segment}
        index={index}
        isActive={isActive}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClick={onClick}
        onSetTime={onSetTime}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function SegmentList({
  segments,
  onSegmentsChange,
  currentSegmentIndex,
  onSegmentClick,
}: SegmentListProps) {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = segments.findIndex((s) => s.id === active.id);
      const newIndex = segments.findIndex((s) => s.id === over.id);

      onSegmentsChange(arrayMove(segments, oldIndex, newIndex));
    }
  };

  const handleAddVideo = () => {
    setUrlError("");

    if (!urlInput.trim()) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(urlInput)) {
      setUrlError("Invalid YouTube URL format");
      return;
    }

    const videoId = getYouTubeId(urlInput);
    if (!videoId) {
      setUrlError("Could not extract video ID from URL");
      return;
    }

    const newSegment: Segment = {
      id: crypto.randomUUID(),
      url: urlInput,
      videoId,
      startTime: "00:00:00",
      endTime: "00:01:00",
      thumbnail: getYouTubeThumbnail(videoId),
      verified: false,
      validationErrors: [],
    };

    // Validate the new segment
    newSegment.validationErrors = validateSegment(newSegment);

    onSegmentsChange([...segments, newSegment]);
    setUrlInput("");
  };

  const handleUpdateSegment = (index: number, updatedSegment: Segment) => {
    const newSegments = [...segments];
    updatedSegment.validationErrors = validateSegment(updatedSegment);
    newSegments[index] = updatedSegment;
    onSegmentsChange(newSegments);
  };

  const handleDeleteSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    onSegmentsChange(newSegments);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddVideo();
    }
  };

  const totalDuration = segments.reduce((acc, segment) => {
    try {
      const start = segment.startTime.split(":").reduce((a, b) => a * 60 + parseInt(b), 0);
      const end = segment.endTime.split(":").reduce((a, b) => a * 60 + parseInt(b), 0);
      return acc + (end - start);
    } catch {
      return acc;
    }
  }, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Video Segments</h2>

      {/* Add Video Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add YouTube Video
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddVideo}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>
        {urlError && (
          <p className="mt-2 text-sm text-red-600">{urlError}</p>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Segments: <span className="font-semibold">{segments.length}/10</span>
          </span>
          <span className="text-gray-600">
            Total Duration:{" "}
            <span className="font-semibold">{formatDuration(totalDuration)}</span>
            {totalDuration > 1200 && (
              <span className="text-red-600 ml-2">(exceeds 20 min limit)</span>
            )}
          </span>
        </div>
      </div>

      {/* Segment List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {segments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">No segments yet. Add a YouTube video to get started!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={segments.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {segments.map((segment, index) => (
                <SortableSegmentCard
                  key={segment.id}
                  segment={segment}
                  index={index}
                  isActive={currentSegmentIndex === index}
                  onUpdate={(updated) => handleUpdateSegment(index, updated)}
                  onDelete={() => handleDeleteSegment(index)}
                  onClick={() => onSegmentClick(index)}
                  onSetTime={(type, time) => {
                    const updated = {
                      ...segment,
                      [type === "start" ? "startTime" : "endTime"]: time,
                    };
                    handleUpdateSegment(index, updated);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
