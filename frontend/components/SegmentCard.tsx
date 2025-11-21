"use client";

import { useState } from "react";
import { Segment } from "@/lib/types";
import { secondsToTime } from "@/lib/youtube";

interface SegmentCardProps {
  segment: Segment;
  index: number;
  isActive: boolean;
  onUpdate: (segment: Segment) => void;
  onDelete: () => void;
  onClick: () => void;
  onSetTime: (type: "start" | "end", time: string) => void;
  dragHandleProps?: any;
}

export default function SegmentCard({
  segment,
  index,
  isActive,
  onUpdate,
  onDelete,
  onClick,
  onSetTime,
  dragHandleProps,
}: SegmentCardProps) {
  const [localStartTime, setLocalStartTime] = useState(segment.startTime);
  const [localEndTime, setLocalEndTime] = useState(segment.endTime);

  const handleStartTimeChange = (value: string) => {
    setLocalStartTime(value);
    onUpdate({ ...segment, startTime: value });
  };

  const handleEndTimeChange = (value: string) => {
    setLocalEndTime(value);
    onUpdate({ ...segment, endTime: value });
  };

  const hasErrors = segment.validationErrors && segment.validationErrors.length > 0;

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all ${
        isActive
          ? "border-blue-500 shadow-lg"
          : hasErrors
          ? "border-red-300"
          : "border-gray-200"
      } p-4 cursor-pointer hover:shadow-md`}
      onClick={onClick}
    >
      {/* Header with Drag Handle and Delete */}
      <div className="flex items-start gap-3 mb-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing pt-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={segment.thumbnail}
            alt={`Video ${index + 1}`}
            className="w-24 h-16 object-cover rounded"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Segment {index + 1}
            </span>
            {segment.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate" title={segment.url}>
            {segment.url}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
          title="Delete segment"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Start Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={localStartTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="00:00:00"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would be called from the player
                // For now, it's a placeholder
              }}
              className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Set from current playback time"
            >
              Set
            </button>
          </div>
        </div>

        {/* End Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            End Time
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={localEndTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="00:01:00"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This would be called from the player
              }}
              className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Set from current playback time"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
      >
        ▶ Play This Segment
      </button>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          {segment.validationErrors.map((error, i) => (
            <div key={i} className="text-xs text-red-700">
              • {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
